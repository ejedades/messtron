import { app, shell, dialog } from 'electron';

export class SecurityManager {
  setupSecurity(): void {
    this.setupNavigationProtection();
    this.setupCertificateErrorHandling();
  }

  private setupNavigationProtection(): void {
    app.on('web-contents-created', (_, contents) => {
      contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (!this.isAllowedDomain(parsedUrl.hostname)) {
          event.preventDefault();
          shell.openExternal(navigationUrl);
        }
      });
    });
  }

  private setupCertificateErrorHandling(): void {
    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
      if (this.isAllowedDomain(url)) {
        event.preventDefault();
        dialog.showMessageBox({
          type: 'warning',
          title: 'Certificate Error',
          message: 'There is a certificate error. Do you want to proceed anyway?',
          buttons: ['Proceed', 'Cancel'],
          defaultId: 1,
        }).then((result) => {
          callback(result.response === 0);
        });
      } else {
        callback(false);
      }
    });
  }

  private isAllowedDomain(urlOrHostname: string): boolean {
    const allowedDomains = ['messenger.com', 'facebook.com'];
    return allowedDomains.some(domain => urlOrHostname.includes(domain));
  }
}