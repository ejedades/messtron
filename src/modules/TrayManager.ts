import path from 'path';
import { Tray, Menu, nativeImage, app } from 'electron';
import type { WindowManager } from './WindowManager';
import type { CONFIG } from './config';

export class TrayManager {
  private tray: Tray | null = null;

  constructor(
    private config: typeof CONFIG,
    private windowManager: WindowManager
  ) {}

  createTray(): void {
    try {
      const iconPath = this.getIconPath();
      const trayIcon = nativeImage.createFromPath(iconPath);
      
      const resizedIcon = trayIcon.resize({ 
        width: process.platform === 'darwin' ? 22 : 16,
        height: process.platform === 'darwin' ? 22 : 16 
      });
      
      this.tray = new Tray(resizedIcon);
      this.tray.setToolTip(this.config.tray.tooltip);

      this.setupTrayMenu();
      this.setupTrayEvents();

    } catch (error) {
      console.error('Failed to create tray:', error);
    }
  }

  private setupTrayMenu(): void {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: `Show ${this.config.app.name}`,
        click: () => this.windowManager.showWindow(),
      },
      { type: 'separator' },
      {
        label: 'About',
        click: () => this.windowManager.showAboutDialog(),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: this.quitApp.bind(this),
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private setupTrayEvents(): void {
    if (!this.tray) return;

    this.tray.on('click', () => {
      this.windowManager.toggleWindow();
    });

    if (process.platform === 'darwin') {
      this.tray.on('double-click', () => {
        this.windowManager.showWindow();
      });
    }
  }

  private quitApp(): void {
    this.windowManager.setQuitting(true);
    
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
    
    app.quit();
  }

  private getIconPath(): string {
    return path.join(__dirname, this.config.paths.icon);
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}