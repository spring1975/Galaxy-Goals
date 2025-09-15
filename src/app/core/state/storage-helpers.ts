export type PersistTier = 'local' | 'indexeddb';

export const HEAVY_STORES: Record<string, PersistTier> = {
  APP_SETTINGS_V1: 'local',
  SPELLING_V1: 'local',
  MATHFACTS_V1: 'local',
  STATES_V1: 'local',
  READING_LOG: 'indexeddb',
  SCIENCE_LOG: 'indexeddb',
};

export function isHeavy(key: string): boolean {
  return HEAVY_STORES[key] === 'indexeddb';
}

export function omitEphemeral<T>(state: T, keys: (keyof T)[]): Partial<T> {
  const result = { ...state };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
