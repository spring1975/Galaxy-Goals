export interface ModelManifest {
  model_id: string;
  model_lib_url: string;
  model_url: string;
  shards: string[];
  total_size: string;
  memory_requirements: string;
  recommended_for: string;
}

export interface ModelConfig {
  manifest: ModelManifest;
  base_url: string;
}

export interface DeviceCapabilities {
  memory: number; // in GB
  isChromebook: boolean;
  isLowEnd: boolean;
}

export class ModelSelector {
  static async detectCapabilities(): Promise<DeviceCapabilities> {
    // Basic device detection
    const memory = (navigator as any).deviceMemory || 4; // Default to 4GB if not available
    const isChromebook = /CrOS/.test(navigator.userAgent);
    const isLowEnd = memory <= 4;

    return {
      memory,
      isChromebook,
      isLowEnd
    };
  }

  static async selectOptimalModel(): Promise<ModelConfig> {
    const capabilities = await this.detectCapabilities();

    // Model selection logic
    let modelPath: string;

    if (capabilities.isChromebook || capabilities.isLowEnd) {
      if (capabilities.memory <= 2) {
        modelPath = './assets/mlc/1b-q4f32_1/manifest.json';
      } else {
        modelPath = './assets/mlc/3b-q4f32_1/manifest.json';
      }
    } else {
      modelPath = './assets/mlc/8b-q4f32_1/manifest.json';
    }

    try {
      const response = await fetch(modelPath);
      const manifest: ModelManifest = await response.json();

      return {
        manifest,
        base_url: new URL(modelPath, window.location.origin).href.replace('/manifest.json', '')
      };
    } catch (error) {
      console.warn(`Failed to load model manifest from ${modelPath}, falling back to 1B model`);
      // Fallback to smallest model
      const response = await fetch('./assets/mlc/1b-q4f32_1/manifest.json');
      const manifest: ModelManifest = await response.json();

      return {
        manifest,
        base_url: new URL('./assets/mlc/1b-q4f32_1/', window.location.origin).href
      };
    }
  }
}
