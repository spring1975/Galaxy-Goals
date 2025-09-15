# AppSettingsStore Usage Example

Here's how to use the AppSettingsStore in your components:

```typescript
import { Component, inject } from '@angular/core';
import { AppSettingsStore } from './core/state/app-settings.store';

@Component({
  selector: 'app-settings',
  template: `
    <div>
      <h2>App Settings</h2>
      
      <!-- Theme Control -->
      <div>
        <label>Current Theme: {{ store.theme() }}</label>
        <button (click)="store.toggleTheme()">Toggle Theme</button>
        <button (click)="store.setTheme('light')">Set Light</button>
        <button (click)="store.setTheme('dark')">Set Dark</button>
      </div>
      
      <!-- Animations Control -->
      <div>
        <label>
          <input 
            type="checkbox" 
            [checked]="store.animations()" 
            (change)="store.setAnimations($event.target.checked)"
          />
          Enable Animations
        </label>
      </div>
      
      <!-- Data Management -->
      <div>
        <button (click)="exportSettings()">Export Settings</button>
        <button (click)="importSettings()">Import Settings</button>
        <button (click)="store.reset()">Reset to Defaults</button>
      </div>
      
      <!-- Current State -->
      <div>
        <h3>Current State:</h3>
        <pre>{{ currentState() | json }}</pre>
      </div>
    </div>
  `
})
export class SettingsComponent {
  store = inject(AppSettingsStore);
  
  currentState = () => ({
    theme: this.store.theme(),
    animations: this.store.animations(),
    _version: this.store._version()
  });
  
  exportSettings() {
    const data = this.store.exportData();
    console.log('Exported settings:', data);
    navigator.clipboard?.writeText(data);
  }
  
  importSettings() {
    const data = prompt('Paste settings JSON:');
    if (data) {
      this.store.importData(data);
    }
  }
}
```

## Features Implemented:

✅ **State Structure**: 
- `theme: 'light' | 'dark'`
- `animations: boolean`
- `_version: 1`

✅ **Storage Sync**: 
- Uses `withStorageSync` with key `'APP_SETTINGS_V1'`
- Automatically syncs with localStorage
- Full state synchronization with `select: s => s`

✅ **Methods**:
- `toggleTheme()` - Switches between light and dark
- `setTheme(theme)` - Sets specific theme
- `setAnimations(boolean)` - Controls animations setting
- `reset()` - Resets to initial state
- `exportData()` - Returns JSON string of current state
- `importData(data)` - Imports and validates JSON data

✅ **Host Class Binding**:
- `app.component.ts` automatically applies theme classes
- `.theme-light` for light theme
- `.theme-dark` for dark theme

## Storage Persistence:
Settings are automatically saved to localStorage under the key `APP_SETTINGS_V1` and restored on app initialization.
