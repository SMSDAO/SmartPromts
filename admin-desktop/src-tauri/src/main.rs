// Prevents additional console window on Windows in release
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, State};
use tauri_plugin_store::StoreBuilder;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AuthSession {
    access_token: String,
    refresh_token: String,
    expires_at: i64,
    user_id: String,
}

struct AppState {
    store: Mutex<Option<tauri_plugin_store::Store<tauri::Wry>>>,
}

#[tauri::command]
async fn save_auth_session(
    session: AuthSession,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut store_lock = state.store.lock().map_err(|e| e.to_string())?;
    
    if let Some(store) = store_lock.as_mut() {
        store.insert("auth_session".to_string(), serde_json::to_value(&session).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
        store.save().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Store not initialized".to_string())
    }
}

#[tauri::command]
async fn get_auth_session(
    state: State<'_, AppState>,
) -> Result<Option<AuthSession>, String> {
    let store_lock = state.store.lock().map_err(|e| e.to_string())?;
    
    if let Some(store) = store_lock.as_ref() {
        if let Some(value) = store.get("auth_session") {
            let session: AuthSession = serde_json::from_value(value.clone()).map_err(|e| e.to_string())?;
            Ok(Some(session))
        } else {
            Ok(None)
        }
    } else {
        Err("Store not initialized".to_string())
    }
}

#[tauri::command]
async fn clear_auth_session(
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut store_lock = state.store.lock().map_err(|e| e.to_string())?;
    
    if let Some(store) = store_lock.as_mut() {
        store.delete("auth_session").map_err(|e| e.to_string())?;
        store.save().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Store not initialized".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize secure store
            let store = StoreBuilder::new(app.handle(), "auth.dat".parse()?).build();
            
            app.manage(AppState {
                store: Mutex::new(Some(store)),
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_auth_session,
            get_auth_session,
            clear_auth_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

