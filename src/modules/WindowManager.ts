import path from 'path';
import { BrowserWindow, shell, dialog, app } from 'electron';
import type { CONFIG } from './config';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private _isQuitting = false;

  constructor(private config: typeof CONFIG) {}

  get window(): BrowserWindow | null {
    return this.mainWindow;
  }

  get isQuitting(): boolean {
    return this._isQuitting;
  }

  setQuitting(value: boolean): void {
    this._isQuitting = value;
  }

  async createWindow(): Promise<void> {
    try {
      this.mainWindow = new BrowserWindow({
        width: this.config.window.width,
        height: this.config.window.height,
        minWidth: this.config.window.minWidth,
        minHeight: this.config.window.minHeight,
        title: this.config.app.name,
        icon: this.getIconPath(),
        show: false,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          webSecurity: true,
          preload: path.join(__dirname, this.config.paths.preload),
          partition: 'persist:messenger',
        },
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      });

      this.mainWindow.webContents.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      this.setupWindowEvents();
      this.setupSecurityHandlers();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.mainWindow.loadURL(this.config.app.url);
      this.mainWindow.setMenuBarVisibility(false);

      if (process.env.NODE_ENV === 'development') {
        this.mainWindow.webContents.openDevTools();
      }
    } catch (error) {
      console.error('Failed to create window:', error);
      this.showErrorDialog('Failed to create application window.');
    }
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });

    this.mainWindow.on('close', (event) => {
      if (!this._isQuitting && process.platform !== 'darwin') {
        event.preventDefault();
        this.hideWindow();
      }
    });


    this.mainWindow.on('page-title-updated', (event) => {
      event.preventDefault();
    });
  }

  private setupSecurityHandlers(): void {
    if (!this.mainWindow) return;

    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (this.isAllowedDomain(url)) {
        return { action: 'allow' };
      }
      shell.openExternal(url);
      return { action: 'deny' };
    });

    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      if (!this.isAllowedDomain(url)) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });
  }

  private isAllowedDomain(url: string): boolean {
    return url.includes('messenger.com') || url.includes('facebook.com');
  }

  showWindow(): void {
    if (!this.mainWindow) {
      this.createWindow();
      return;
    }

    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }
    
    this.mainWindow.show();
    this.mainWindow.focus();

    if (process.platform === 'darwin') {
      app.dock?.show();
    }
  }

  hideWindow(): void {
    if (!this.mainWindow) return;
    
    this.mainWindow.hide();
    
    if (process.platform === 'darwin') {
      app.dock?.hide();
    }
  }

  toggleWindow(): void {
    if (!this.mainWindow) {
      this.showWindow();
      return;
    }

    if (this.mainWindow.isVisible() && this.mainWindow.isFocused()) {
      this.hideWindow();
    } else {
      this.showWindow();
    }
  }

  private getIconPath(): string {
    return path.join(__dirname, this.config.paths.icon);
  }

  private showErrorDialog(message: string): void {
    dialog.showErrorBox(`${this.config.app.name} Error`, message);
  }

  showAboutDialog(): void {
    dialog.showMessageBox({
      type: 'info',
      title: `About ${this.config.app.name}`,
      message: this.config.app.name,
      detail: `A desktop wrapper for Facebook Messenger\nVersion: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}`,
      buttons: ['OK'],
    });
  }
}