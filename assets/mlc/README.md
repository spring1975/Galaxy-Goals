# MLC Model Artifacts Setup

This directory contains the self-hosted WebLLM/MLC model artifacts that are cached by the service worker for offline use.

## Directory Structure

```
src/assets/mlc/
├── 1b-q4f32_1/           # Llama-3.2-1B model (recommended for low-end Chromebooks)
├── 3b-q4f32_1/           # Llama-3.2-3B model (recommended for Chromebooks)
└── 8b-q4f32_1/           # Llama-3.1-8B model (recommended for desktop)
```

## Setting Up Model Artifacts

### Option 1: Download from MLC-AI Hub

1. Visit [MLC-LLM Model Library](https://llm.mlc.ai/docs/deploy/webllm.html#model-library)

2. Download the required model artifacts:

   **For 1B Model (Chromebook-lite):**
   ```bash
   # Download to src/assets/mlc/1b-q4f32_1/
   wget https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC/resolve/main/params_shard_0.bin
   wget https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC/resolve/main/params_shard_1.bin
   wget https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC/resolve/main/mlc-chat-config.json
   wget https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC/resolve/main/tokenizer.json
   wget https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC/resolve/main/Llama-3.2-1B-Instruct-q4f32_1-MLC-lib.wasm
   ```

   **For 3B Model (Chromebook):**
   ```bash
   # Download to src/assets/mlc/3b-q4f32_1/
   wget https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f32_1-MLC/resolve/main/params_shard_0.bin
   wget https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f32_1-MLC/resolve/main/params_shard_1.bin
   wget https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f32_1-MLC/resolve/main/params_shard_2.bin
   # ... (continue with other files)
   ```

   **For 8B Model (Desktop):**
   ```bash
   # Download to src/assets/mlc/8b-q4f32_1/
   wget https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f32_1-MLC/resolve/main/params_shard_0.bin
   # ... (all 8 shards plus config files)
   ```

### Option 2: Use Git LFS (if hosting on GitHub)

1. Install Git LFS: `git lfs install`
2. Track binary files: `git lfs track "*.bin"`
3. Track WASM files: `git lfs track "*.wasm"`
4. Add and commit files normally

### Option 3: Use a Download Script

Create a script to automate downloading:

```typescript
// scripts/download-models.ts
import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';

const models = [
  {
    name: '1b-q4f32_1',
    id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
    shards: ['params_shard_0.bin', 'params_shard_1.bin']
  },
  // ... other models
];

for (const model of models) {
  const dir = \`src/assets/mlc/\${model.name}\`;
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  // Download files...
}
```

## Important Notes

### Storage Considerations

- **1B Model**: ~800MB (good for low-end devices)
- **3B Model**: ~1.8GB (recommended for Chromebooks)  
- **8B Model**: ~4.7GB (desktop only, may exceed Chrome storage quota)

### Service Worker Caching

The `ngsw-config.json` is configured to cache these model files with:
- 30-day cache duration
- Performance strategy (cache first)
- 10-minute timeout for large downloads

### Chromebook Optimization

The app automatically selects the appropriate model based on:
- Available device memory
- User agent (Chromebook detection)
- Network conditions

### Range Requests

Chrome's service worker serves cached responses as complete files, not ranges. This is fine since we're hosting discrete shards rather than one large file.

## Verification

After setup, verify the files are accessible:

1. Start the dev server: `npm run start`
2. Open browser dev tools → Network tab
3. Navigate to a page that uses MLC
4. Check that model files load from cache (service worker)

## Troubleshooting

### Files Not Caching
- Check `ngsw-config.json` paths match your file structure
- Ensure service worker is enabled (`environment.production = true`)
- Clear browser cache and rebuild

### Model Loading Errors
- Verify all shard files are present and correctly named
- Check browser console for 404 errors
- Ensure WASM files are served with correct MIME type

### Storage Quota Exceeded
- Use smaller models (1B/3B instead of 8B)
- Clear other site data
- Check available storage with `navigator.storage.estimate()`
