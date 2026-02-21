// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SmartPromtsLifetimePass
 * @dev NFT contract for SmartPromts Lifetime Pass on Base network
 * Holders get unlimited prompt optimizations forever
 * 
 * Token IDs: Start from 1 (not 0). Uses pre-increment (++_tokenIdCounter).
 * First minted token has ID 1, last has ID 1000.
 * 
 * Note: This contract uses a simple counter instead of the deprecated Counters library.
 * Compatible with OpenZeppelin Contracts v5.x
 */
contract SmartPromtsLifetimePass is ERC721, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;

    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant PRICE_EARLY_BIRD = 0.05 ether; // ~$199 at $4k ETH
    uint256 public constant PRICE_REGULAR = 0.075 ether;   // ~$299 at $4k ETH
    uint256 public constant PRICE_FINAL = 0.1 ether;       // ~$399 at $4k ETH
    
    uint256 public constant EARLY_BIRD_SUPPLY = 100;
    uint256 public constant REGULAR_SUPPLY = 500;

    string private _baseTokenURI;
    bool public mintingEnabled = false;

    mapping(address => bool) public hasMinted;

    event LifetimePassMinted(address indexed to, uint256 indexed tokenId, uint256 price);

    constructor(string memory baseTokenURI) ERC721("SmartPromts Lifetime Pass", "SPLP") Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI;
    }

    /**
     * @dev Get current mint price based on supply
     */
    function getCurrentPrice() public view returns (uint256) {
        uint256 supply = _tokenIdCounter;
        if (supply < EARLY_BIRD_SUPPLY) {
            return PRICE_EARLY_BIRD;
        } else if (supply < EARLY_BIRD_SUPPLY + REGULAR_SUPPLY) {
            return PRICE_REGULAR;
        } else {
            return PRICE_FINAL;
        }
    }

    /**
     * @dev Mint a Lifetime Pass NFT
     * Protected against reentrancy attacks
     */
    function mint() external payable nonReentrant {
        require(mintingEnabled, "Minting is not enabled");
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(!hasMinted[msg.sender], "Already minted");
        
        uint256 price = getCurrentPrice();
        require(msg.value >= price, "Insufficient payment");

        // Update state before external calls (checks-effects-interactions)
        uint256 newTokenId = ++_tokenIdCounter;
        hasMinted[msg.sender] = true;

        _safeMint(msg.sender, newTokenId);

        emit LifetimePassMinted(msg.sender, newTokenId, price);

        // Refund excess payment using low-level call for safety
        if (msg.value > price) {
            uint256 refundAmount = msg.value - price;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @dev Owner mint for giveaways/airdrops
     * Also marks the address as having minted to preserve one-per-wallet rule
     */
    function ownerMint(address to) external onlyOwner {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        require(!hasMinted[to], "Address has already minted");

        uint256 newTokenId = ++_tokenIdCounter;
        hasMinted[to] = true;

        _safeMint(to, newTokenId);
        emit LifetimePassMinted(to, newTokenId, 0);
    }

    /**
     * @dev Toggle minting on/off
     */
    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
    }

    /**
     * @dev Update base URI for metadata
     */
    function setBaseURI(string memory baseTokenURI) external onlyOwner {
        _baseTokenURI = baseTokenURI;
    }

    /**
     * @dev Withdraw contract balance to owner
     * Uses low-level call for safety with contract wallets
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev Get total minted supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Override base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Check if an address has a Lifetime Pass
     */
    function hasLifetimePass(address account) external view returns (bool) {
        return balanceOf(account) > 0;
    }
}

