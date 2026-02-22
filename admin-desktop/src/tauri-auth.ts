/**
 * Tauri Authentication Helper
 * Provides secure token storage using Tauri's plugin-store
 */

import { invoke } from '@tauri-apps/api/tauri'

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user_id: string
}

/**
 * Check if running in Tauri desktop environment
 */
export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

/**
 * Save authentication session to secure storage
 */
export async function saveAuthSession(session: AuthSession): Promise<void> {
  if (!isTauriApp()) {
    console.warn('Not running in Tauri app, session not saved to secure storage')
    return
  }
  
  try {
    await invoke('save_auth_session', { session })
  } catch (error) {
    console.error('Failed to save auth session:', error)
    throw error
  }
}

/**
 * Retrieve authentication session from secure storage
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  if (!isTauriApp()) {
    return null
  }
  
  try {
    const session = await invoke<AuthSession | null>('get_auth_session')
    return session
  } catch (error) {
    console.error('Failed to get auth session:', error)
    return null
  }
}

/**
 * Clear authentication session from secure storage
 */
export async function clearAuthSession(): Promise<void> {
  if (!isTauriApp()) {
    return
  }
  
  try {
    await invoke('clear_auth_session')
  } catch (error) {
    console.error('Failed to clear auth session:', error)
    throw error
  }
}

/**
 * Check if current session is still valid
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getAuthSession()
  if (!session) return false
  
  const now = Date.now()
  return session.expires_at > now
}

/**
 * Restore session on app startup
 * Call this when the Tauri app initializes to restore authentication state
 */
export async function restoreSession(): Promise<AuthSession | null> {
  const session = await getAuthSession()
  
  if (!session) {
    return null
  }
  
  // Check if session is expired
  if (!await isSessionValid()) {
    await clearAuthSession()
    return null
  }
  
  return session
}
