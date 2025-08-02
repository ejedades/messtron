import path from 'path';
import { app, BrowserWindow } from 'electron';
import { WindowManager } from '../modules/WindowManager';
import { TrayManager } from '../modules/TrayManager';
import { SecurityManager } from '../modules/security';
import { CONFIG } from '../modules/config';

let windowManager: WindowManager | null = null;
let trayManager: TrayManager | null = null;
let securityManager: SecurityManager | null = null;

async function initializeApp(): Promise<void> {
  try {
    // Initialize managers
    windowManager = new WindowManager(CONFIG);
    trayManager = new TrayManager(CONFIG, windowManager);
    securityManager = new SecurityManager();

    // Create window and tray
    await windowManager.createWindow();
    trayManager.createTray();

    // Set up security
    securityManager.setupSecurity();

    // Set app user model ID for Windows notifications
    if (process.platform === 'win32') {
      app.setAppUserModelId(CONFIG.app.name);
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

// App event handlers
app.whenReady().then(initializeApp);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager?.createWindow();
  } else {
    windowManager?.showWindow();
  }
});

app.on('window-all-closed', () => {
  // Keep app running in background with tray
  if (process.platform === 'darwin' && !windowManager?.isQuitting) {
    app.dock?.hide();
  }
});

app.on('before-quit', () => {
  windowManager?.setQuitting(true);
});