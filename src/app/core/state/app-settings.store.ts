import { computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { withStorageSync } from '@angular-architects/ngrx-toolkit';

export interface AppSettingsState {
  theme: 'light' | 'dark';
  animations: boolean;
  _version: 1;
}

const initialState: AppSettingsState = {
  theme: 'light',
  animations: true,
  _version: 1,
};

export const AppSettingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withStorageSync({
    key: 'APP_SETTINGS_V1',
    select: (state: AppSettingsState) => state,
  }),
  withMethods((store) => ({
    toggleTheme(): void {
      const currentTheme = store.theme();
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      patchState(store, { theme: newTheme });
    },

    setTheme(theme: 'light' | 'dark'): void {
      patchState(store, { theme });
    },

    setAnimations(animations: boolean): void {
      patchState(store, { animations });
    },

    reset(): void {
      patchState(store, initialState);
    },

    exportData(): string {
      return JSON.stringify({
        theme: store.theme(),
        animations: store.animations(),
        _version: store._version(),
      });
    },

    importData(data: string): void {
      try {
        const parsed = JSON.parse(data) as Partial<AppSettingsState>;
        if (parsed && typeof parsed === 'object') {
          const validatedData: Partial<AppSettingsState> = {};

          if (parsed.theme === 'light' || parsed.theme === 'dark') {
            validatedData.theme = parsed.theme;
          }

          if (typeof parsed.animations === 'boolean') {
            validatedData.animations = parsed.animations;
          }

          if (parsed._version === 1) {
            validatedData._version = parsed._version;
          }

          if (Object.keys(validatedData).length > 0) {
            patchState(store, validatedData);
          }
        }
      } catch (error) {
        console.error('Failed to import settings data:', error);
      }
    },
  }))
);

export type AppSettingsStore = InstanceType<typeof AppSettingsStore>;
