import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MlcPreloadService } from './mlc-preload.service';
import { MlcConfigService } from './mlc-config.service';

@Injectable({
  providedIn: 'root'
})
export class SwActivationService {
  constructor(
    private swUpdate: SwUpdate,
    private mlcPreloadService: MlcPreloadService,
    private mlcConfigService: MlcConfigService
  ) {
    if (swUpdate.isEnabled) {
      this.initializeServiceWorker();
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    try {
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker is ready');

      // Check for updates
      this.swUpdate.checkForUpdate();

      // Listen for updates
      this.swUpdate.versionUpdates.subscribe(event => {
        switch (event.type) {
          case 'VERSION_DETECTED':
            console.log('New version detected');
            break;
          case 'VERSION_READY':
            console.log('New version ready');
            // Optionally notify user about update
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.error('Version installation failed');
            break;
        }
      });

      // Start MLC preload after SW is active (if enabled)
      if (this.mlcConfigService.isEnabled()) {
        this.startMlcPrewarm();
      } else {
        console.log('MLC is disabled. Use ?mlc=true to enable.');
      }

    } catch (error) {
      console.error('Service Worker initialization failed:', error);
      // Start MLC preload anyway, even without SW (if enabled)
      if (this.mlcConfigService.isEnabled()) {
        this.startMlcPrewarm();
      }
    }
  }

  private async startMlcPrewarm(): Promise<void> {
    try {
      // Small delay to let the app settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Starting MLC pre-warm...');
      await this.mlcPreloadService.startPreload();
      console.log('MLC pre-warm completed');
    } catch (error) {
      console.error('MLC pre-warm failed:', error);
    }
  }

  // Method to manually trigger update check
  async checkForUpdate(): Promise<boolean> {
    if (this.swUpdate.isEnabled) {
      return await this.swUpdate.checkForUpdate();
    }
    return false;
  }

  // Method to activate pending update
  async activateUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      await this.swUpdate.activateUpdate();
      // Reload the page to use new version
      window.location.reload();
    }
  }
}
