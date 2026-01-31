import { invoke } from '@tauri-apps/api/core';

export interface WindowState {
  is_minimized: boolean;
  is_maximized: boolean;
  is_visible: boolean;
}

/**
 * Minimize the window to taskbar/tray
 */
export async function minimizeWindow(): Promise<void> {
  return await invoke('minimize_window');
}

/**
 * Maximize the window
 */
export async function maximizeWindow(): Promise<void> {
  return await invoke('maximize_window');
}

/**
 * Restore window from minimized state
 */
export async function restoreWindow(): Promise<void> {
  return await invoke('restore_window');
}

/**
 * Set window always on top
 * @param onTop - Whether to keep window always on top
 */
export async function setAlwaysOnTop(onTop: boolean): Promise<void> {
  return await invoke('set_always_on_top', { onTop });
}

/**
 * Close the window
 */
export async function closeWindow(): Promise<void> {
  return await invoke('close_window');
}

/**
 * Show the window if hidden
 */
export async function showWindow(): Promise<void> {
  return await invoke('show_window');
}

/**
 * Hide the window
 */
export async function hideWindow(): Promise<void> {
  return await invoke('hide_window');
}

/**
 * Get current window state
 */
export async function getWindowState(): Promise<WindowState> {
  return await invoke('get_window_state');
}

/**
 * Minimize to tray (hide window but keep app running)
 */
export async function minimizeToTray(): Promise<void> {
  return await invoke('minimize_to_tray');
}

/**
 * Restore from tray
 */
export async function restoreFromTray(): Promise<void> {
  return await invoke('restore_from_tray');
}

/**
 * Auto-minimize after call next action
 * Minimizes window and shows a notification if on top
 */
export async function autoMinimizeAfterCallNext(): Promise<void> {
  await minimizeWindow();
}
