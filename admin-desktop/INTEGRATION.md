# Tauri Secure Authentication Integration

This guide explains how to integrate the Tauri desktop app's secure authentication with your Next.js admin panel.

## Architecture

The Tauri app provides secure token storage using the `tauri-plugin-store`, which encrypts data using the OS keychain:

- **Windows**: Windows Credential Manager
- **macOS**: Keychain
- **Linux**: Secret Service API (gnome-keyring, kwallet)

## Installation

1. Install dependencies:
```bash
cd admin-desktop
npm install
```

2. Build Tauri app:
```bash
npm run tauri build
```

## Frontend Integration

### 1. Add Tauri Auth Helper to Your Admin Panel

Copy the `tauri-auth.ts` helper into your Next.js app:

```typescript
// lib/tauri-auth.ts or similar location
import { saveAuthSession, getAuthSession, clearAuthSession, restoreSession } from '@/admin-desktop/src/tauri-auth'
```

### 2. Update Login Component

Modify your login logic to save tokens when running in Tauri:

```typescript
// app/login/page.tsx or your login component
import { isTauriApp, saveAuthSession } from '@/lib/tauri-auth'
import { createClient } from '@/lib/supabase-client'

async function handleLogin(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    console.error('Login failed:', error)
    return
  }
  
  // If running in Tauri, save tokens securely
  if (isTauriApp() && data.session) {
    await saveAuthSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at * 1000, // Convert to milliseconds
      user_id: data.session.user.id
    })
  }
  
  // Redirect to admin panel
  router.push('/admin')
}
```

### 3. Add Session Restoration on App Startup

Create an initialization component that restores sessions:

```typescript
// app/tauri-init.tsx
'use client'

import { useEffect } from 'react'
import { isTauriApp, restoreSession } from '@/lib/tauri-auth'
import { createClient } from '@/lib/supabase-client'

export function TauriInit() {
  useEffect(() => {
    async function initTauri() {
      if (!isTauriApp()) return
      
      const session = await restoreSession()
      if (session) {
        // Restore Supabase session
        const supabase = createClient()
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })
        
        console.log('Session restored from secure storage')
      }
    }
    
    initTauri()
  }, [])
  
  return null
}
```

Add to your layout:

```typescript
// app/layout.tsx
import { TauriInit } from './tauri-init'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TauriInit />
        {children}
      </body>
    </html>
  )
}
```

### 4. Update Logout Handler

Clear tokens on logout:

```typescript
// Your logout component
import { isTauriApp, clearAuthSession } from '@/lib/tauri-auth'
import { createClient } from '@/lib/supabase-client'

async function handleLogout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  
  // Clear Tauri secure storage
  if (isTauriApp()) {
    await clearAuthSession()
  }
  
  router.push('/login')
}
```

## Backend Commands

The Tauri app exposes three commands:

### save_auth_session
Saves authentication session to encrypted storage.

```typescript
await invoke('save_auth_session', {
  session: {
    access_token: string,
    refresh_token: string,
    expires_at: number,  // Unix timestamp in milliseconds
    user_id: string
  }
})
```

### get_auth_session
Retrieves authentication session from storage.

```typescript
const session = await invoke<AuthSession | null>('get_auth_session')
```

### clear_auth_session
Removes authentication session from storage.

```typescript
await invoke('clear_auth_session')
```

## Security Considerations

1. **Encryption**: All tokens are encrypted at rest using OS-level encryption
2. **Isolation**: Each OS user has separate encrypted storage
3. **No Network**: Tokens never transmitted over network from Tauri side
4. **Automatic Expiration**: Helper functions check token expiration
5. **Clean Logout**: Always clear tokens on logout

## Troubleshooting

### Session Not Restoring
- Check that `TauriInit` component is mounted
- Verify tokens haven't expired
- Check browser console for errors

### Tokens Not Saving
- Ensure running in Tauri app (check `isTauriApp()`)
- Verify invoke permissions in `tauri.conf.json`
- Check Rust console output for errors

### Build Errors
- Ensure Rust is installed: `rustc --version`
- Update Cargo dependencies: `cd src-tauri && cargo update`
- Clean build: `npm run tauri build -- --clean`

## Development vs Production

### Development
- Uses cookie-based auth alongside secure storage
- Hot reload works normally
- Debug console shows storage operations

### Production
- Secure storage is primary authentication method
- Cookies used as fallback for web compatibility
- Release builds strip debug logging

## API Reference

See `src/tauri-auth.ts` for complete TypeScript API documentation.

## Example Application

Check the main admin panel implementation for a complete working example of the integration.
