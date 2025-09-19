import { signalStore, withState, withMethods, patchState, getState } from '@ngrx/signals';
import { withStorageSync } from '@angular-architects/ngrx-toolkit';
import { DataKeys } from 'src/app/shared/storage/data-keys';

export interface StorageState {
  [key: string]: unknown;
}

export const StorageSignalStore = signalStore(
  { providedIn: 'root' },
  withState<StorageState>({}),
  withStorageSync({ key: DataKeys.SPELLING_LISTS }),
  withMethods((store) => ({
    get<T>(key: DataKeys): T | null {
      const value = getState(store)[key];
      return value !== undefined ? (value as T) : null;
    },
    set<T>(key: DataKeys, value: T): void {
      patchState(store, { [key]: value });
    },
    remove(key: DataKeys): void {
      patchState(store, { [key]: undefined });
    },
    clear(): void {
      patchState(store, {});
    }
  }))
);
