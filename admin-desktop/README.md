# SmartPromts Admin Desktop

**Standalone desktop application** for the SmartPromts admin panel using Tauri.

This is an **independent project** with its own build process, separate from the main Next.js web application.

## Project Structure

```
admin-desktop/
├── package.json       # Standalone package (independent of root)
├── tsconfig.json      # TypeScript config for this project only
├── src/               # Frontend TypeScript helpers
│   └── tauri-auth.ts  # Authentication helpers
└── src-tauri/         # Rust backend
    ├── Cargo.toml     # Rust dependencies
    └── src/main.rs    # Tauri app entry point
```

## Quick Start

**Note:** This project is isolated from the root project. It has its own dependencies and build process.

1. Install dependencies (in this directory):
```bash
cd admin-desktop
npm install
```

2. Build the desktop app:
```bash
npm run tauri build
```

Output: `src-tauri/target/release/smartpromts-admin.exe` (Windows)

## Documentation

See [docs/admin-desktop.md](../docs/admin-desktop.md) for comprehensive documentation including:
- Requirements (Node 20+, Rust, system dependencies)
- Development setup
- Secure storage integration
- Troubleshooting

## Development

```bash
cd admin-desktop
npm run dev  # Starts Tauri in dev mode
```

## Type Checking

```bash
npm run typecheck
```
