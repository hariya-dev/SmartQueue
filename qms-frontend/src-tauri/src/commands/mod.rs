use tauri::{AppHandle, Manager, Window};
use log::info;

#[derive(serde::Serialize)]
pub struct WindowState {
    pub is_minimized: bool,
    pub is_maximized: bool,
    pub is_visible: bool,
}

/// Minimize the main window to system tray or taskbar
#[tauri::command]
pub async fn minimize_window(window: Window) -> Result<(), String> {
    info!("Minimizing window");
    window.minimize().map_err(|e| e.to_string())
}

/// Maximize the window
#[tauri::command]
pub async fn maximize_window(window: Window) -> Result<(), String> {
    info!("Maximizing window");
    window.maximize().map_err(|e| e.to_string())
}

/// Restore the window from minimized state
#[tauri::command]
pub async fn restore_window(window: Window) -> Result<(), String> {
    info!("Restoring window");
    window.set_always_on_top(true).map_err(|e| e.to_string())?;
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

/// Set the window to always be on top of other windows
#[tauri::command]
pub async fn set_always_on_top(window: Window, on_top: bool) -> Result<(), String> {
    info!("Setting always on top: {}", on_top);
    window.set_always_on_top(on_top).map_err(|e| e.to_string())
}

/// Close the window
#[tauri::command]
pub async fn close_window(window: Window) -> Result<(), String> {
    info!("Closing window");
    window.close().map_err(|e| e.to_string())
}

/// Show the window if it's hidden
#[tauri::command]
pub async fn show_window(window: Window) -> Result<(), String> {
    info!("Showing window");
    window.show().map_err(|e| e.to_string())
}

/// Hide the window
#[tauri::command]
pub async fn hide_window(window: Window) -> Result<(), String> {
    info!("Hiding window");
    window.hide().map_err(|e| e.to_string())
}

/// Get the current window state
#[tauri::command]
pub async fn get_window_state(window: Window) -> Result<WindowState, String> {
    Ok(WindowState {
        is_minimized: window.is_minimized().map_err(|e| e.to_string())?,
        is_maximized: window.is_maximized().map_err(|e| e.to_string())?,
        is_visible: window.is_visible().map_err(|e| e.to_string())?,
    })
}

/// Minimize to tray - hide window but keep app running
#[tauri::command]
pub async fn minimize_to_tray(app_handle: AppHandle) -> Result<(), String> {
    info!("Minimizing to tray");
    if let Some(window) = app_handle.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Bring app back from tray
#[tauri::command]
pub async fn restore_from_tray(app_handle: AppHandle) -> Result<(), String> {
    info!("Restoring from tray");
    if let Some(window) = app_handle.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_always_on_top(true).map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}
