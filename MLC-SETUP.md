# WebLLM/MLC Service Worker Integration

This document describes the complete setup for self-hosting WebLLM/MLC models with Angular service worker caching, optimized for Chromebooks and low-end devices.

## 🚀 Quick Start

### 1. Install Model Artifacts

Choose the appropriate model for your target devices:

```bash
# For Chromebooks (recommended)
npm run mlc:setup:3b

# For low-end Chromebooks  
npm run mlc:setup:1b

# For desktop/high-end devices
npm run mlc:setup:8b

# Download all models (requires ~7GB)
npm run mlc:setup:all
```

### 2. Build and Test

```bash
# Build with service worker enabled
npm run build:local

# Test PWA with caching
npm run start:pwa
```

### 3. Test the Integration

Navigate to `/mlc-demo` to test the WebLLM integration with service worker caching.

## 📁 Project Structure

```
src/
├── app/
│   ├── shared/
│   │   └── mlc/
│   │       ├── model-config.ts          # Device detection & model selection
│   │       ├── mlc-preload.service.ts   # Service worker preload manager
│   │       ├── mlc-progress.component.ts # Progress UI component
│   │       └── sw-activation.service.ts  # SW lifecycle management
│   └── pages/
│       └── mlc-demo/                    # Demo component
├── assets/
│   └── mlc/
│       ├── 1b-q4f32_1/                 # Llama-3.2-1B model artifacts
│       ├── 3b-q4f32_1/                 # Llama-3.2-3B model artifacts
│       └── 8b-q4f32_1/                 # Llama-3.1-8B model artifacts
└── scripts/
    └── setup-mlc.ps1                   # Model download script
```

## 🛠️ Technical Implementation

### Service Worker Configuration

The `ngsw-config.json` is configured to cache model artifacts with:

- **Performance strategy**: Cache-first for maximum speed
- **30-day expiration**: Long-term caching for large models  
- **10-minute timeout**: Handles large model downloads
- **Separate groups**: Different cache configurations per model size

### Device-Adaptive Model Selection

The system automatically selects the optimal model based on:

```typescript
// Device capability detection
const capabilities = await ModelSelector.detectCapabilities();

// Automatic model selection
if (capabilities.isChromebook || capabilities.isLowEnd) {
  if (capabilities.memory <= 2) {
    // Use 1B model for very low-end devices
    model = "Llama-3.2-1B-Instruct";
  } else {
    // Use 3B model for typical Chromebooks
    model = "Llama-3.2-3B-Instruct";
  }
} else {
  // Use 8B model for desktop/high-end devices
  model = "Llama-3.1-8B-Instruct";
}
```

### Pre-warming Strategy

The service worker pre-warms models after activation:

1. **Device Detection** (10% progress)
2. **Model Selection** (20% progress)  
3. **Manifest Loading** (30% progress)
4. **Shard Pre-caching** (30-90% progress)
5. **Engine Initialization** (90-100% progress)

### Optimizations for Speed

- **Token Limits**: Responses capped at 50 tokens for speed
- **Cache-First Strategy**: Models served from cache after first load
- **Lazy Initialization**: Engine only loads when needed
- **Progress Feedback**: Real-time progress during long operations

## 🔧 Configuration Options

### Model Selection Override

Force a specific model regardless of device detection:

```typescript
// In sentence.service.ts configuration
const modelConfig = await ModelSelector.selectOptimalModel();
// Override with: modelConfig.manifest.model_id = "Llama-3.2-1B-Instruct-q4f32_1-MLC";
```

### Service Worker Tuning  

Adjust cache settings in `ngsw-config.json`:

```json
{
  "dataGroups": [
    {
      "name": "mlc-models-3b",
      "cacheConfig": {
        "maxSize": 30,        // Increase for more models
        "maxAge": "30d",      // Extend for longer caching
        "timeout": "10m"      // Increase for slow connections
      }
    }
  ]
}
```

### Generation Parameters

Tune model generation in `sentence.service.ts`:

```typescript
const reply = await this.engine!.chat.completions.create({ 
  messages,
  max_tokens: 50,         // Increase for longer responses
  temperature: 0.7,       // Adjust creativity (0.0 - 1.0)
  top_p: 0.9             // Add for nucleus sampling
});
```

## 📊 Performance Characteristics

### Model Comparison

| Model | Size | Memory | Speed | Quality | Best For |
|-------|------|--------|-------|---------|----------|
| 1B | 800MB | 1.5GB | Fast | Good | Low-end Chromebooks |
| 3B | 1.8GB | 3GB | Medium | Better | Standard Chromebooks |
| 8B | 4.7GB | 6GB | Slow | Best | Desktop/High-end |

### Chromebook Considerations

- **Storage Quota**: Chrome limits to ~500MB per origin
- **Memory Pressure**: 3B+ models may cause slowdowns on 4GB devices  
- **Range Requests**: Not supported; use discrete shards
- **Network Conditions**: Pre-cache during WiFi, serve offline

## 🚨 Troubleshooting

### Model Loading Issues

```typescript
// Check if files exist
fetch('./assets/mlc/3b-q4f32_1/params_shard_0.bin', { method: 'HEAD' })
  .then(response => console.log('Shard available:', response.ok));

// Check service worker cache
caches.open('ngsw:1:data:dynamic:mlc-models-3b:cache')
  .then(cache => cache.keys())
  .then(keys => console.log('Cached files:', keys.length));
```

### Memory Issues

```typescript
// Check available memory
navigator.storage.estimate().then(estimate => {
  console.log('Available:', estimate.quota - estimate.usage, 'bytes');
});

// Force garbage collection (Chrome DevTools)
// DevTools > Memory > Collect garbage
```

### Service Worker Problems

```typescript
// Check SW registration
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registered:', !!reg);
  console.log('SW active:', !!reg?.active);
});

// Force SW update
swUpdate.checkForUpdate().then(hasUpdate => {
  console.log('Update available:', hasUpdate);
});
```

## 🔄 Development Workflow

### Local Development

```bash
# Development with hot reload (no SW)
npm start

# Production preview with SW
npm run start:pwa
```

### Adding New Models

1. Add model config to `model-config.ts`
2. Create manifest file in `src/assets/mlc/[model]/`
3. Add dataGroup to `ngsw-config.json`
4. Update download script `scripts/setup-mlc.ps1`

### Testing Service Worker

```bash
# Build with SW
npm run build:local

# Test in private browsing (clean slate) 
npm run start:pwa
```

## 📈 Monitoring & Analytics

### Performance Metrics

The MLC demo component tracks:

- **Generation Time**: Time to generate response  
- **Cache Hit Rate**: Whether response came from cache
- **Model Loading Time**: Initial model load duration
- **Memory Usage**: Peak memory during generation

### User Experience Metrics

Track these for optimization:

- **Time to Interactive**: When user can first interact
- **Model Ready Time**: When AI features become available  
- **Generation Success Rate**: Failed vs successful generations
- **Perceived Performance**: User satisfaction with speed

## 🌐 Production Deployment

### GitHub Pages

```bash
# Deploy with model artifacts
npm run pwa:publish
```

### Custom Domain

Update `angular.json` base href:

```json
{
  "configurations": {
    "production": {
      "baseHref": "https://yourdomain.com/"
    }
  }
}
```

### CDN Considerations

If using a CDN for model files:

1. Update `ngsw-config.json` with CDN URLs
2. Ensure CORS headers are set
3. Consider opaque response quota limits
4. Prefer self-hosting for better cache control

## 🔐 Security & Privacy

### Self-Hosting Benefits

- **Data Privacy**: All inference happens locally
- **No API Keys**: No external service dependencies
- **Offline Capable**: Works without internet after initial load
- **GDPR Friendly**: No data leaves user's device

### Security Considerations

- Model files are cached but not encrypted
- Content Security Policy may need adjustment for WASM
- Large files may impact page load if not properly cached

---

## 📞 Support

For issues with this integration:

1. Check browser console for errors
2. Verify service worker registration  
3. Confirm model files downloaded correctly
4. Test in private browsing mode
5. Check Chrome's storage quota usage

For WebLLM/MLC specific issues, refer to the [official documentation](https://llm.mlc.ai/docs/).
