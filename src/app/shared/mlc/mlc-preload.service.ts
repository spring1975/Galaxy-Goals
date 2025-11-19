import { Injectable, signal, WritableSignal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ModelConfig, ModelSelector } from './model-config';

export interface PreloadProgress {
  stage: 'detecting' | 'manifest' | 'shards' | 'complete' | 'error';
  progress: number;
  message: string;
  total?: number;
  loaded?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MlcPreloadService {
  private _preloadProgress: WritableSignal<PreloadProgress> = signal({
    stage: 'detecting',
    progress: 0,
    message: 'Initializing...'
  });

  public readonly preloadProgress = this._preloadProgress.asReadonly();
  public readonly isPreloadComplete = signal(false);
  public readonly selectedModel = signal<ModelConfig | null>(null);

  constructor(private swUpdate: SwUpdate) {}

  async startPreload(): Promise<ModelConfig> {
    try {
      this.updateProgress({
        stage: 'detecting',
        progress: 10,
        message: 'Detecting device capabilities...'
      });

      // Select optimal model based on device
      const modelConfig = await ModelSelector.selectOptimalModel();
      this.selectedModel.set(modelConfig);

      this.updateProgress({
        stage: 'manifest',
        progress: 20,
        message: `Selected ${modelConfig.manifest.model_id}`
      });

      // Check if service worker is ready
      if (this.swUpdate.isEnabled) {
        await this.waitForServiceWorker();
      }

      this.updateProgress({
        stage: 'shards',
        progress: 30,
        message: 'Pre-caching model shards...'
      });

      // Pre-cache all model files
      await this.precacheModelFiles(modelConfig);

      this.updateProgress({
        stage: 'complete',
        progress: 100,
        message: 'Model ready for use'
      });

      this.isPreloadComplete.set(true);
      return modelConfig;

    } catch (error) {
      console.error('Preload failed:', error);
      this.updateProgress({
        stage: 'error',
        progress: 0,
        message: `Preload failed: ${error}`
      });
      throw error;
    }
  }

  private async waitForServiceWorker(): Promise<void> {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(() => {
          resolve();
        });
      } else {
        resolve(); // No service worker support
      }
    });
  }

  private async precacheModelFiles(modelConfig: ModelConfig): Promise<void> {
    const { manifest, base_url } = modelConfig;
    const totalFiles = manifest.shards.length + 1; // +1 for the wasm lib
    let loadedFiles = 0;

    // Cache the WASM library
    try {
      await this.cacheFile(manifest.model_lib_url);
      loadedFiles++;
      this.updateProgress({
        stage: 'shards',
        progress: 30 + (loadedFiles / totalFiles) * 60,
        message: `Cached WASM library (${loadedFiles}/${totalFiles})`,
        total: totalFiles,
        loaded: loadedFiles
      });
    } catch (error) {
      console.warn('Failed to cache WASM library:', error);
    }

    // Cache each model shard
    for (const shard of manifest.shards) {
      try {
        const shardUrl = `${base_url}/${shard}`;
        await this.cacheFile(shardUrl);
        loadedFiles++;

        this.updateProgress({
          stage: 'shards',
          progress: 30 + (loadedFiles / totalFiles) * 60,
          message: `Cached ${shard} (${loadedFiles}/${totalFiles})`,
          total: totalFiles,
          loaded: loadedFiles
        });
      } catch (error) {
        console.warn(`Failed to cache shard ${shard}:`, error);
        // Continue with other shards even if one fails
      }
    }
  }

  private async cacheFile(url: string): Promise<void> {
    try {
      // Use fetch to trigger service worker caching
      const response = await fetch(url, {
        method: 'HEAD',  // Use HEAD to avoid downloading full content
        cache: 'force-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // If HEAD fails, try a range request for the first byte
      try {
        await fetch(url, {
          headers: { 'Range': 'bytes=0-0' },
          cache: 'force-cache'
        });
      } catch (rangeError) {
        throw error; // Re-throw original error
      }
    }
  }

  private updateProgress(progress: PreloadProgress): void {
    this._preloadProgress.set(progress);
  }

  // Method to get current model without triggering preload
  getCurrentModel(): ModelConfig | null {
    return this.selectedModel();
  }
}
