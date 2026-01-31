#[cfg_attr(mobile, tauri::mobile_entry_point)]
mod commands;

pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      // Window management
      commands::minimize_window,
      commands::maximize_window,
      commands::restore_window,
      commands::set_always_on_top,
      commands::close_window,
      commands::show_window,
      commands::hide_window,
      commands::get_window_state,
      commands::minimize_to_tray,
      commands::restore_from_tray,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}