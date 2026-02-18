# SmartPromts NFT Contracts

This directory contains smart contracts for the SmartPromts Lifetime Pass NFT on Base network.

## Contract: SmartPromtsLifetimePass

An ERC-721 NFT contract that grants holders unlimited prompt optimizations forever.

### Features
- **Limited Supply**: Maximum 1,000 NFTs
- **Tiered Pricing**:
  - Early Bird (0-100): 0.05 ETH (~$199)
  - Regular (101-600): 0.075 ETH (~$299)
  - Final (601-1000): 0.1 ETH (~$399)
- **One per wallet**: Each address can mint only once (enforced in both public and owner mints)
- **Owner mint**: Admin can mint for giveaways/airdrops
- **Pausable**: Minting can be enabled/disabled by owner
- **Withdrawable**: Owner can withdraw contract balance
- **Reentrancy protection**: Uses OpenZeppelin's ReentrancyGuard
- **Safe transfers**: Uses low-level call pattern for ETH transfers

### OpenZeppelin Compatibility

This contract is compatible with OpenZeppelin Contracts v5.x:
- Uses simple uint256 counter instead of deprecated Counters library
- Initializes Ownable with msg.sender in constructor
- Includes ReentrancyGuard for additional security

### Deployment (Foundry)

1. Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Install dependencies:
```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

3. Set up environment:
```bash
cp .env.example .env
# Edit .env with your private key and Base RPC URL
```

4. Deploy to Base:
```bash
forge create --rpc-url $BASE_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --etherscan-api-key $BASESCAN_API_KEY \
  --verify \
  contracts/nft/SmartPromtsLifetimePass.sol:SmartPromtsLifetimePass \
  --constructor-args "ipfs://YOUR_METADATA_CID/"
```

5. Enable minting:
```bash
cast send $CONTRACT_ADDRESS \
  "setMintingEnabled(bool)" true \
  --rpc-url $BASE_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Verification

After deployment, verify the contract on BaseScan:
```bash
forge verify-contract \
  --chain-id 8453 \
  --compiler-version v0.8.20 \
  $CONTRACT_ADDRESS \
  contracts/nft/SmartPromtsLifetimePass.sol:SmartPromtsLifetimePass \
  --constructor-args $(cast abi-encode "constructor(string)" "ipfs://YOUR_METADATA_CID/")
```

### Testing

Run tests:
```bash
forge test
```

Run with gas report:
```bash
forge test --gas-report
```

### Frontend Integration

Check if user has Lifetime Pass:
```typescript
import { ethers } from 'ethers'

const hasLifetimePass = async (userAddress: string) => {
  const contract = new ethers.Contract(
    process.env.NFT_CONTRACT_ADDRESS,
    ['function hasLifetimePass(address) view returns (bool)'],
    provider
  )
  return await contract.hasLifetimePass(userAddress)
}
```

Get current mint price:
```typescript
const getCurrentPrice = async () => {
  const contract = new ethers.Contract(
    process.env.NFT_CONTRACT_ADDRESS,
    ['function getCurrentPrice() view returns (uint256)'],
    provider
  )
  return await contract.getCurrentPrice()
}
```

Mint NFT:
```typescript
const mint = async () => {
  const price = await getCurrentPrice()
  const tx = await contract.mint({ value: price })
  await tx.wait()
}
```

### Security

This contract:
- Uses OpenZeppelin's audited contracts (ERC721, Ownable, ReentrancyGuard)
- Implements checks-effects-interactions pattern
- Protected against reentrancy attacks with nonReentrant modifier
- Uses low-level call() for ETH transfers (safer than transfer())
- Limits one mint per address (enforced for both public and owner mints)
- State updates before external calls to prevent reentrancy

**Security Improvements from Review:**
- Added ReentrancyGuard to mint function
- Replaced unsafe transfer() with low-level call() for refunds and withdrawals
- Fixed reentrancy vulnerability by setting hasMinted before _safeMint
- Updated ownerMint to also mark addresses as having minted
- Compatible with OpenZeppelin Contracts v5.x

### Metadata

NFT metadata should follow this structure:
```json
{
  "name": "SmartPromts Lifetime Pass #1",
  "description": "Unlimited prompt optimizations forever",
  "image": "ipfs://YOUR_IMAGE_CID",
  "attributes": [
    {
      "trait_type": "Tier",
      "value": "Lifetime"
    },
    {
      "trait_type": "Usage",
      "value": "Unlimited"
    }
  ]
}
```

Upload metadata to IPFS:
```bash
# Using Pinata, NFT.Storage, or your preferred IPFS provider
# Update baseTokenURI in constructor or via setBaseURI()
```

### Base Network Details

- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org
- **Test Network**: Base Sepolia (Chain ID: 84532)

### Mainnet Deployment Checklist

- [ ] Audit contract (optional but recommended)
- [ ] Test on Base Sepolia testnet
- [ ] Upload NFT metadata to IPFS
- [ ] Deploy contract with correct baseURI
- [ ] Verify contract on BaseScan
- [ ] Transfer ownership to multisig (recommended)
- [ ] Enable minting
- [ ] Test minting with small amount
- [ ] Update .env.example with contract address
- [ ] Update frontend with contract integration

### Support

For contract-related issues:
- Check [OpenZeppelin docs](https://docs.openzeppelin.com/)
- Review [Foundry book](https://book.getfoundry.sh/)
- Visit [Base docs](https://docs.base.org/)
