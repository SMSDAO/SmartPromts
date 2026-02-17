# SmartPromts Admin Desktop App (Tauri)

This directory contains the Tauri-based desktop wrapper for the SmartPromts admin panel, producing `admin.exe` for Windows.

## Prerequisites

- **Node.js 24+**: Required for Tauri CLI and build tools
- **Rust**: Required for Tauri (install via [rustup](https://rustup.rs/))
- **Windows Build Tools**: Visual Studio 2019+ with C++ tools

## Setup

1. Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install Tauri CLI:
```bash
npm install -g @tauri-apps/cli
```

3. Install dependencies:
```bash
cd admin-desktop
npm install
```

## Development

Run the desktop app in development mode:
```bash
npm run tauri dev
```

This will:
1. Start the Next.js dev server on localhost:3000
2. Open the admin panel in a native desktop window
3. Enable hot reload for development

## Building for Production

Build the desktop app for Windows:
```bash
npm run tauri build
```

This generates:
- `admin-desktop/src-tauri/target/release/smartpromts-admin.exe`
- Windows installer in `admin-desktop/src-tauri/target/release/bundle/`

## Configuration

The Tauri app is configured to:
- Load the `/admin` route from the web app
- Use native system webview (Edge WebView2 on Windows)
- Include window controls (minimize, maximize, close)
- Support dark mode
- Auto-update capabilities (when configured)

## Distribution

### Windows
The built `.exe` file can be distributed directly or packaged as:
- MSI installer (recommended)
- NSIS installer
- Portable ZIP

### System Requirements
- Windows 10 1803+ (64-bit)
- WebView2 Runtime (auto-installed if missing)
- 100MB disk space

## Features

The desktop app includes:
- **Native window controls**: Drag, resize, minimize, maximize
- **System tray integration**: Run in background, quick access
- **Keyboard shortcuts**: 
  - `Ctrl+R`: Reload
  - `F11`: Toggle fullscreen
  - `Ctrl+Q`: Quit
- **Auto-updates**: Check for updates on startup (when configured)

## Development Notes

### Syncing with Web Admin
The desktop app loads the same `/admin` route as the web version, so:
- All features stay in sync automatically
- No separate codebase to maintain
- Updates to web admin apply to desktop immediately

### Navigation
The Tauri app uses the same navigation as the web admin:
- Dashboard link
- User management
- Settings
- Logout

### Authentication
Authentication persists between sessions using:
- Supabase client cookies
- Tauri secure storage for tokens

## Troubleshooting

### Build Fails
- Ensure Rust is installed: `rustc --version`
- Update Rust: `rustup update`
- Clean build: `npm run tauri build -- --clean`

### App Won't Start
- Check WebView2 is installed
- Verify Node.js 24+: `node --version`
- Check logs in `%APPDATA%/smartpromts-admin/logs/`

### Performance Issues
- The app uses native webview, performance should match Edge browser
- Check network connectivity for API calls
- Monitor memory usage in Task Manager

## Security

The desktop app:
- Runs in sandboxed webview environment
- Uses HTTPS for all API calls
- Stores credentials securely via Tauri APIs
- No direct filesystem access without user permission

## Support

For issues specific to the desktop app:
- Check [Tauri documentation](https://tauri.app)
- File issues on GitHub
- Contact support@smartpromts.com

## Future Enhancements

Planned features:
- [ ] System notifications for admin alerts
- [ ] Quick actions from system tray
- [ ] Offline mode with sync
- [ ] Multi-window support
- [ ] Custom keyboard shortcuts
