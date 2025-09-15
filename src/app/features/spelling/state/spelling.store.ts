import { computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { withStorageSync } from '@angular-architects/ngrx-toolkit';

export interface SpellingUnit {
  id: string;
  name: string;
  words: string[];
}

export interface SpellingAttempt {
  unitId: string;
  date: string;
  mode: 'RANDOM10' | 'ALL20' | 'FORM';
  score: number;
  mistakes: string[];
}

export interface SpellingState {
  // Persisted state
  units: SpellingUnit[];
  attempts: SpellingAttempt[];
  _version: 1;

  // Ephemeral state (not persisted)
  activeUnitId: string | undefined;
  mode: 'RANDOM10' | 'ALL20' | 'FORM' | undefined;
  index: number;
  correct: number;
  mistakes: string[];
  startedAt: number | undefined;
}

const initialState: SpellingState = {
  units: [],
  attempts: [],
  _version: 1,
  activeUnitId: undefined,
  mode: undefined,
  index: 0,
  correct: 0,
  mistakes: [],
  startedAt: undefined,
};

export const SpellingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withStorageSync({
    key: 'SPELLING_V1',
    select: (state: SpellingState) => ({
      units: state.units,
      attempts: state.attempts,
      _version: state._version,
    }),
  }),
  withComputed((store) => ({
    activeUnit: computed(() => {
      const activeId = store.activeUnitId();
      if (!activeId) return null;
      return store.units().find(unit => unit.id === activeId) || null;
    }),

    totalWords: computed(() => {
      const activeId = store.activeUnitId();
      if (!activeId) return 0;
      const activeUnit = store.units().find(unit => unit.id === activeId);
      return activeUnit?.words.length || 0;
    }),

    progressPct: computed(() => {
      const activeId = store.activeUnitId();
      if (!activeId) return 0;
      const total = store.units().find(unit => unit.id === activeId)?.words.length || 0;
      if (total === 0) return 0;
      return Math.round((store.index() / total) * 100);
    }),
  })),
  withMethods((store) => ({
    addUnit(unit: Omit<SpellingUnit, 'id'>): void {
      const newUnit: SpellingUnit = {
        ...unit,
        id: crypto.randomUUID(),
      };
      patchState(store, {
        units: [...store.units(), newUnit],
      });
    },

    deleteUnit(unitId: string): void {
      const currentActiveUnitId = store.activeUnitId();
      patchState(store, {
        units: store.units().filter(unit => unit.id !== unitId),
        attempts: store.attempts().filter(attempt => attempt.unitId !== unitId),
        // Clear active unit if it's being deleted
        activeUnitId: currentActiveUnitId === unitId ? undefined : currentActiveUnitId,
      });
    },

    startTest(unitId: string, mode: 'RANDOM10' | 'ALL20' | 'FORM'): void {
      patchState(store, {
        activeUnitId: unitId,
        mode,
        index: 0,
        correct: 0,
        mistakes: [],
        startedAt: Date.now(),
      });
    },

    submitAnswer(word: string, isCorrect: boolean): void {
      const currentMistakes = store.mistakes();
      const newMistakes = isCorrect ? currentMistakes : [...currentMistakes, word];

      patchState(store, {
        index: store.index() + 1,
        correct: isCorrect ? store.correct() + 1 : store.correct(),
        mistakes: newMistakes,
      });
    },

    finishTest(): void {
      const activeUnitId = store.activeUnitId();
      const mode = store.mode();

      if (!activeUnitId || !mode) {
        console.warn('Cannot finish test: no active unit or mode');
        return;
      }

      const activeUnit = store.units().find(unit => unit.id === activeUnitId);
      if (!activeUnit) {
        console.warn('Cannot finish test: active unit not found');
        return;
      }

      const totalWords = activeUnit.words.length;
      const score = Math.round((store.correct() / totalWords) * 100);

      const attempt: SpellingAttempt = {
        unitId: activeUnit.id,
        date: new Date().toISOString(),
        mode,
        score,
        mistakes: [...store.mistakes()],
      };

      patchState(store, {
        attempts: [...store.attempts(), attempt],
        // Clear ephemeral state
        activeUnitId: undefined,
        mode: undefined,
        index: 0,
        correct: 0,
        mistakes: [],
        startedAt: undefined,
      });
    },

    reset(): void {
      patchState(store, initialState);
    },

    exportData(): string {
      return JSON.stringify({
        units: store.units(),
        attempts: store.attempts(),
        _version: store._version(),
      });
    },

    importData(data: string): void {
      try {
        const parsed = JSON.parse(data) as Partial<SpellingState>;
        if (parsed && typeof parsed === 'object') {
          const validatedData: Partial<SpellingState> = {};

          if (Array.isArray(parsed.units)) {
            // Validate units structure
            const validUnits = parsed.units.filter((unit: any) =>
              unit &&
              typeof unit.id === 'string' &&
              typeof unit.name === 'string' &&
              Array.isArray(unit.words) &&
              unit.words.every((word: any) => typeof word === 'string')
            );
            validatedData.units = validUnits;
          }

          if (Array.isArray(parsed.attempts)) {
            // Validate attempts structure
            const validAttempts = parsed.attempts.filter((attempt: any) =>
              attempt &&
              typeof attempt.unitId === 'string' &&
              typeof attempt.date === 'string' &&
              ['RANDOM10', 'ALL20', 'FORM'].includes(attempt.mode) &&
              typeof attempt.score === 'number' &&
              Array.isArray(attempt.mistakes) &&
              attempt.mistakes.every((mistake: any) => typeof mistake === 'string')
            );
            validatedData.attempts = validAttempts;
          }

          if (parsed._version === 1) {
            validatedData._version = parsed._version;
          }

          if (Object.keys(validatedData).length > 0) {
            patchState(store, validatedData);
          }
        }
      } catch (error) {
        console.error('Failed to import spelling data:', error);
      }
    },
  }))
);

export type SpellingStore = InstanceType<typeof SpellingStore>;
