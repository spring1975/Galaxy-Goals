import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
  withHooks,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import {
  SpellingList,
  SpellingListSignalStore,
} from 'src/app/stores/spelling-list.signalstore';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export interface WordAttempt {
  word: string;
  attempts: string[]; // Array of submitted answers for this word
  correctOnFirstTry: boolean;
  totalAttempts: number;
  isComplete: boolean; // Word completed (correct or revealed)
  wasSkipped: boolean;
  wasRevealed: boolean;
}

export interface PracticeState {
  // Current practice session data
  currentList: SpellingList | null;
  wordIndex: number;

  // Sentence generation
  generatedSentence: string;
  generatedSentenceForDisplay: string;
  isGenerating: boolean;

  // UI state
  feedback: 'none' | 'correct' | 'incorrect';
  showConfetti: boolean;

  // Session tracking - enhanced for detailed attempts
  wordAttempts: WordAttempt[]; // One entry per word in the list
  currentWordAttemptCount: number; // Current attempts for the active word
  sessionStart: Dayjs;
  sessionEnd: Dayjs | undefined;
}

const initialState: PracticeState = {
  currentList: null,
  wordIndex: 0,
  generatedSentence: '',
  generatedSentenceForDisplay: '',
  isGenerating: false,
  feedback: 'none',
  showConfetti: false,
  wordAttempts: [],
  currentWordAttemptCount: 0,
  sessionStart: dayjs(),
  sessionEnd: undefined,
};

export const PracticeSignalStore = signalStore(
  withState<PracticeState>(initialState),
  withComputed(({ currentList, wordIndex, wordAttempts, currentWordAttemptCount }) => ({
    currentWord: computed(() => {
      const list = currentList();
      const index = wordIndex();
      return list?.words[index] || '';
    }),
    progress: computed(() => {
      const list = currentList();
      const index = wordIndex();
      return {
        current: index + 1,
        total: list?.words.length || 0,
      };
    }),
    accuracyPercent: computed(() => {
      const attempts = wordAttempts();
      if (attempts.length === 0) return 0;
      const completedWords = attempts.slice(0, wordIndex() + 1);
      const correctOnFirstTry = completedWords.filter(a => a.correctOnFirstTry).length;
      return Math.round((correctOnFirstTry / completedWords.length) * 100);
    }),
    isComplete: computed(() => {
      const list = currentList();
      const index = wordIndex();
      return list ? index >= list.words.length : false;
    }),
    currentWordAttempt: computed(() => {
      const attempts = wordAttempts();
      const index = wordIndex();
      return attempts[index];
    }),
    shouldShowHint: computed(() => {
      return currentWordAttemptCount() >= 2;
    }),
    shouldShowReveal: computed(() => {
      return currentWordAttemptCount() >= 3;
    }),
    sessionStats: computed(() => {
      const attempts = wordAttempts();
      const completed = attempts.filter(a => a.isComplete);
      const firstTryCorrect = completed.filter(a => a.correctOnFirstTry).length;
      const retried = completed.filter(a => !a.correctOnFirstTry && !a.wasSkipped && !a.wasRevealed).length;
      const missed = completed.filter(a => a.wasSkipped || a.wasRevealed).length;

      return {
        firstTryCorrect,
        retried,
        missed,
        total: completed.length,
        accuracy: completed.length > 0 ? Math.round((firstTryCorrect / completed.length) * 100) : 0
      };
    }),
  })),
  withMethods((store) => {
    // Inject SpellingListStore at the top of the methods scope
    const spellingListStore = inject(SpellingListSignalStore);

    return {
      /**
       * Helper function to create initial word attempts array
       */
      createWordAttemptsArray(words: string[]): WordAttempt[] {
        return words.map(word => ({
          word,
          attempts: [],
          correctOnFirstTry: false,
          totalAttempts: 0,
          isComplete: false,
          wasSkipped: false,
          wasRevealed: false,
        }));
      },

      /**
       * Initialize session with a list
       */
      initializeSession(list: SpellingList): void {
        patchState(store, {
          currentList: list,
          wordIndex: 0,
          generatedSentence: '',
          generatedSentenceForDisplay: '',
          isGenerating: false,
          feedback: 'none',
          showConfetti: false,
          wordAttempts: this.createWordAttemptsArray(list.words),
          currentWordAttemptCount: 0,
          sessionStart: dayjs(),
          sessionEnd: undefined,
        });
      },

      // Sentence generation methods
      setGeneratedSentenceForDisplay(sentence: string): void {
        patchState(store, { generatedSentenceForDisplay: sentence });
      },

      setGeneratedSentence(sentence: string): void {
        patchState(store, { generatedSentence: sentence });
      },

      setIsGenerating(isGenerating: boolean): void {
        patchState(store, { isGenerating });
      },

      // UI state methods
      setFeedback(feedback: 'none' | 'correct' | 'incorrect'): void {
        patchState(store, { feedback });
      },

      setShowConfetti(show: boolean): void {
        patchState(store, { showConfetti: show });
      },

      /**
       * Handles advancing to the next word, including session completion logic.
       */
      advanceToNextWord(): void {
        const nextIdx = store.wordIndex() + 1;
        const currentList = store.currentList();
        if (currentList && nextIdx < currentList.words.length) {
          patchState(store, {
            wordIndex: nextIdx,
            feedback: 'none',
            generatedSentence: '',
            generatedSentenceForDisplay: '',
            currentWordAttemptCount: 0,
          });
        } else {
          // Session complete
          patchState(store, {
            sessionEnd: dayjs(),
          });
          // Save last session accuracy to SpellingList
          const attempts = store.wordAttempts();
          const completed = attempts.filter(a => a.isComplete);
          const firstTryCorrect = completed.filter(a => a.correctOnFirstTry).length;
          const accuracy = completed.length > 0 ? Math.round((firstTryCorrect / completed.length) * 100) : 0;
          if (currentList) {
            spellingListStore.updateList({ ...currentList, lastSessionAccuracy: accuracy });
          }
        }
      },

      /**
       * Handles answer submission with enhanced retry logic
       */
      submitAnswer(answer: string): { correct: boolean; word: string } | null {
        const idx = store.wordIndex();
        const wordAttempts = [...store.wordAttempts()];
        const currentWord = store.currentWord();

        if (idx < 0 || idx >= wordAttempts.length || !currentWord) {
          patchState(store, { feedback: 'none' });
          return null;
        }

        const wordAttempt = wordAttempts[idx];
        if (!wordAttempt || wordAttempt.isComplete) {
          return null; // Word already completed
        }

        const correct = answer.toLowerCase() === currentWord.toLowerCase();
        const newAttemptCount = store.currentWordAttemptCount() + 1;

        // Update the word attempt
        wordAttempt.attempts.push(answer);
        wordAttempt.totalAttempts = newAttemptCount;

        if (correct) {
          wordAttempt.isComplete = true;
          wordAttempt.correctOnFirstTry = newAttemptCount === 1;
          patchState(store, {
            wordAttempts,
            feedback: 'correct',
            currentWordAttemptCount: 0,
          });
        } else {
          patchState(store, {
            wordAttempts,
            feedback: 'incorrect',
            currentWordAttemptCount: newAttemptCount,
          });
        }

        return { correct, word: currentWord };
      },

      /**
       * Skip the current word (mark as missed)
       */
      skipCurrentWord(): void {
        const idx = store.wordIndex();
        const wordAttempts = [...store.wordAttempts()];
        const currentWord = store.currentWord();

        if (idx >= 0 && idx < wordAttempts.length && currentWord) {
          const wordAttempt = wordAttempts[idx];
          if (wordAttempt && !wordAttempt.isComplete) {
            wordAttempt.isComplete = true;
            wordAttempt.wasSkipped = true;
            patchState(store, {
              wordAttempts,
              feedback: 'none',
              currentWordAttemptCount: 0,
            });
          }
        }
      },

      /**
       * Reveal the current word (show answer)
       */
      revealAnswer(): void {
        const idx = store.wordIndex();
        const wordAttempts = [...store.wordAttempts()];
        const currentWord = store.currentWord();

        if (idx >= 0 && idx < wordAttempts.length && currentWord) {
          const wordAttempt = wordAttempts[idx];
          if (wordAttempt && !wordAttempt.isComplete) {
            wordAttempt.isComplete = true;
            wordAttempt.wasRevealed = true;
            patchState(store, {
              wordAttempts,
              feedback: 'none',
              currentWordAttemptCount: 0,
            });
          }
        }
      },

      /**
       * Reset the session to start fresh
       */
      resetSession(newList?: SpellingList): void {
        if (newList) {
          this.initializeSession(newList);
        } else {
          const currentList = store.currentList();
          if (currentList) {
            this.initializeSession(currentList);
          }
        }
      },

      resetWordState(): void {
        patchState(store, {
          feedback: 'none',
          generatedSentence: '',
          generatedSentenceForDisplay: '',
          currentWordAttemptCount: 0,
        });
      },

      /**
       * Get words that were missed (skipped or revealed)
       */
      getMissedWords(): string[] {
        return store.wordAttempts()
          .filter(attempt => attempt.wasSkipped || attempt.wasRevealed)
          .map(attempt => attempt.word);
      },

      /**
       * Get words that required retries but were eventually correct
       */
      getRetriedWords(): string[] {
        return store.wordAttempts()
          .filter(attempt => attempt.isComplete && !attempt.correctOnFirstTry && !attempt.wasSkipped && !attempt.wasRevealed)
          .map(attempt => attempt.word);
      },
    };
  }),
  withHooks({
    onInit(store) {
      // Get SpellingListSignalStore instance
      const spellingListStore = inject(SpellingListSignalStore);
      // Fallback: try globalThis or inject manually if needed

      const currentList = spellingListStore.getCurrentList() ?? {
        id: 'demo',
        name: 'Demo List',
        words: ['bake', 'grape', 'shape'],
        created: dayjs(),
      };
      store.initializeSession(currentList);
    },
    onDestroy: (store) => {
      patchState(store, initialState);
    },
  })
);
