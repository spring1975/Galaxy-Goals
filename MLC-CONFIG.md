# MLC Configuration Guide

## Overview

The MLC (Machine Learning Compilation) integration is now configurable and disabled by default to optimize performance on mobile devices. This feature can be enabled on-demand using URL query parameters.

## Enabling MLC

### Method 1: URL Query Parameter
Add `?mlc=true` to any URL in the application:

```
https://your-app.com/?mlc=true
https://your-app.com/home?mlc=true
https://your-app.com/mlc-demo?mlc=true
```

The following values also work:
- `?mlc=1` - Enables MLC
- `?mlc` - Enables MLC (empty value)

### Method 2: Using the MLC Demo Page
Navigate to `/mlc-demo` and use the toggle switch to enable/disable MLC. The setting persists in localStorage.

### Method 3: Programmatic Control
```typescript
import { inject } from '@angular/core';
import { MlcConfigService } from './shared/mlc/mlc-config.service';

// In your component
mlcConfigService = inject(MlcConfigService);

// Enable MLC
this.mlcConfigService.setEnabled(true);

// Disable MLC
this.mlcConfigService.setEnabled(false);

// Toggle MLC
this.mlcConfigService.toggle();

// Check status
const isEnabled = this.mlcConfigService.isEnabled();
```

## How It Works

1. **MlcConfigService**: Manages the MLC feature flag
   - Stores the setting in `localStorage` (key: `mlc-enabled`)
   - Listens to route changes for query parameter updates
   - Provides a reactive signal for the enabled state

2. **SwActivationService**: Conditionally initializes MLC
   - Checks the config service before starting MLC preload
   - Only loads models when MLC is enabled
   - Logs helpful messages to the console

3. **Persistence**: The MLC setting persists across sessions
   - Once enabled, it remains enabled until explicitly disabled
   - Stored in browser localStorage
   - Independent of query parameters after initial set

## Disabling MLC

### Method 1: URL Query Parameter
Add `?mlc=false` to any URL:

```
https://your-app.com/?mlc=false
```

### Method 2: Toggle in MLC Demo
Use the toggle switch on the `/mlc-demo` page.

### Method 3: Clear localStorage
```javascript
localStorage.removeItem('mlc-enabled');
```

## Performance Impact

### With MLC Disabled (Default)
- ✅ Faster initial load
- ✅ Lower memory usage
- ✅ Better mobile device performance
- ✅ No background model downloads
- ✅ **~800KB-1MB smaller JavaScript bundle** (MLC libraries not loaded)
- ❌ No AI-powered sentence generation

### With MLC Enabled
- ✅ AI-powered sentence generation
- ✅ Offline LLM capabilities
- ✅ MLC libraries lazy-loaded only when needed
- ❌ Additional ~800KB-1MB JavaScript loaded when initializing
- ❌ Slower initial load (~500MB+ model download)
- ❌ Higher memory usage (2-4GB RAM recommended)
- ❌ May struggle on budget mobile devices

## Recommendations

- **Desktop/High-end devices**: Enable MLC for full AI features
- **Mobile/Budget devices**: Keep MLC disabled for optimal performance
- **Testing/Development**: Enable MLC only when testing AI features
- **Production**: Let users opt-in via the demo page or URL parameter

## Console Messages

When MLC is disabled, you'll see:
```
MLC is disabled. Use ?mlc=true to enable.
```

When MLC is enabled, you'll see:
```
MLC feature enabled
Starting MLC pre-warm...
MLC pre-warm completed
```

## Technical Details

### Bundle Size Optimization

The MLC integration uses **lazy loading** to prevent bloating the main JavaScript bundle:

- **Eager-loaded code** (~5KB): Configuration service, feature flags, and type definitions
- **Lazy-loaded code** (~800KB-1MB): MLC libraries (`@mlc-ai/web-llm`, `@mlc-ai/web-runtime`, `@mlc-ai/web-tokenizers`)
- **Model assets** (~500MB+): Downloaded only when MLC is enabled and initialized

When MLC is **disabled**, the lazy-loaded code is never downloaded, keeping your initial bundle size minimal.

### Files Modified
- `src/app/shared/mlc/mlc-config.service.ts` - New service for MLC configuration
- `src/app/shared/mlc/sw-activation.service.ts` - Updated to check config before initializing
- `src/app/pages/mlc-demo/mlc-demo.component.ts` - Added configuration UI

### Architecture
```
User Action
    ↓
Query Parameter / Toggle
    ↓
MlcConfigService (updates signal + localStorage)
    ↓
SwActivationService (checks config)
    ↓
MlcPreloadService (only runs if enabled)
    ↓
Model Download & Initialization
```

## Troubleshooting

**Q: I enabled MLC but it's not working**
- Reload the page after enabling
- Check browser console for errors
- Verify you have sufficient memory (4GB+ RAM recommended)
- Clear browser cache and try again

**Q: MLC keeps auto-enabling**
- Check localStorage: `localStorage.getItem('mlc-enabled')`
- Remove the item: `localStorage.removeItem('mlc-enabled')`

**Q: How do I check current status?**
- Visit `/mlc-demo` page
- Open console and check for MLC messages
- Check localStorage: `localStorage.getItem('mlc-enabled')`
