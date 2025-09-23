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
  showHint: boolean;
  showReveal: boolean;
  showConfetti: boolean;

  // Session tracking
  attempts: number[];
  correctOnFirstTry: number[];
  incorrectWords: string[];
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
  showHint: false,
  showReveal: false,
  showConfetti: false,
  attempts: [],
  correctOnFirstTry: [],
  incorrectWords: [],
  sessionStart: dayjs(),
  sessionEnd: undefined,
};

export const PracticeSignalStore = signalStore(
  withState<PracticeState>(initialState),
  withComputed(({ currentList, wordIndex, correctOnFirstTry }) => ({
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
      const total = wordIndex() + 1;
      if (total === 0) return 0;
      const correct = correctOnFirstTry()
        .slice(0, total)
        .reduce((sum, v) => sum + v, 0);
      return Math.round((correct / total) * 100);
    }),
    isComplete: computed(() => {
      const list = currentList();
      const index = wordIndex();
      return list ? index >= list.words.length : false;
    }),
  })),
  withMethods((store) => ({
    /**
     * Hook to initialize session with current list or demo list
     */
    withInit(spellingListStore: { getCurrentList: () => any }): void {
      const currentList = spellingListStore.getCurrentList() ?? {
        id: 'demo',
        name: 'Demo List',
        words: ['bake', 'grape', 'shape'],
        created: dayjs(),
      };
      // Call initializeSession from methods object
      (store as any).initializeSession(currentList);
    },
    // Initialize session with a list
    initializeSession(list: SpellingList): void {
      patchState(store, {
        currentList: list,
        wordIndex: 0,
        generatedSentence: '',
        generatedSentenceForDisplay: '',
        isGenerating: false,
        feedback: 'none',
        showHint: false,
        showReveal: false,
        showConfetti: false,
        attempts: Array(list.words.length).fill(0),
        correctOnFirstTry: Array(list.words.length).fill(0),
        incorrectWords: [],
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
    setShowHint(show: boolean): void {
      patchState(store, { showHint: show });
    },
    setShowReveal(show: boolean): void {
      patchState(store, { showReveal: show });
    },
    setShowConfetti(show: boolean): void {
      patchState(store, { showConfetti: show });
    },

    // Progress methods
    nextWord(): void {
      const currentIndex = store.wordIndex();
      const currentList = store.currentList();

      if (currentList && currentIndex + 1 < currentList.words.length) {
        patchState(store, {
          wordIndex: currentIndex + 1,
          feedback: 'none',
          showHint: false,
          showReveal: false,
          generatedSentence: '',
          generatedSentenceForDisplay: '',
        });
      } else {
        // Session complete
        patchState(store, {
          sessionEnd: dayjs(),
        });
      }
    },

    // Answer handling methods
    recordAttempt(isCorrect: boolean): void {
      const index = store.wordIndex();
      const currentAttempts = [...store.attempts()];
      const currentCorrectOnFirstTry = [...store.correctOnFirstTry()];

      if (typeof currentAttempts[index] === 'number') {
        currentAttempts[index]!++;
      } else {
        currentAttempts[index] = 1;
      }

      if (isCorrect && currentAttempts[index] === 1) {
        currentCorrectOnFirstTry[index] = 1;
      }

      patchState(store, {
        attempts: currentAttempts,
        correctOnFirstTry: currentCorrectOnFirstTry,
      });
    },

    recordIncorrectWord(word: string): void {
      const currentIncorrectWords = store.incorrectWords();
      if (!currentIncorrectWords.includes(word)) {
        patchState(store, {
          incorrectWords: [...currentIncorrectWords, word],
        });
      }
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
          showHint: false,
          showReveal: false,
          generatedSentence: '',
          generatedSentenceForDisplay: '',
        });
      } else {
        // Session complete
        patchState(store, {
          sessionEnd: dayjs(),
        });
      }
    },

    // Reset methods
    resetSession(newList?: SpellingList): void {
      if (newList) {
        const resetState = {
          currentList: newList,
          wordIndex: 0,
          generatedSentence: '',
          generatedSentenceForDisplay: '',
          isGenerating: false,
          feedback: 'none' as const,
          showHint: false,
          showReveal: false,
          showConfetti: false,
          attempts: Array(newList.words.length).fill(0),
          correctOnFirstTry: Array(newList.words.length).fill(0),
          incorrectWords: [],
          sessionStart: dayjs(),
          sessionEnd: undefined,
        };
        patchState(store, resetState);
      } else {
        const currentList = store.currentList();
        if (currentList) {
          const resetState = {
            currentList,
            wordIndex: 0,
            generatedSentence: '',
            generatedSentenceForDisplay: '',
            isGenerating: false,
            feedback: 'none' as const,
            showHint: false,
            showReveal: false,
            showConfetti: false,
            attempts: Array(currentList.words.length).fill(0),
            correctOnFirstTry: Array(currentList.words.length).fill(0),
            incorrectWords: [],
            sessionStart: dayjs(),
            sessionEnd: undefined,
          };
          patchState(store, resetState);
        }
      }
    },

    resetWordState(): void {
      patchState(store, {
        feedback: 'none',
        showHint: false,
        showReveal: false,
        generatedSentence: '',
        generatedSentenceForDisplay: '',
      });
    },

    /**
     * Handles answer submission, correctness check, and stats update.
     */
    submitAnswer(answer: string): { correct: boolean; word: string } | null {
      const idx = store.wordIndex();
      const currentAttempts = store.attempts();
      if (typeof idx !== 'number' || idx < 0 || idx >= currentAttempts.length) {
        patchState(store, { feedback: 'none' });
        return null;
      }
      const word = store.currentWord();
      const correct = answer === word.toLowerCase();
      this.recordAttempt(correct);
      if (correct) {
        patchState(store, { feedback: 'correct' });
      } else {
        patchState(store, { feedback: 'incorrect' });
        if (word) {
          this.recordIncorrectWord(word);
        }
      }
      return { correct, word };
    },
    /**
     * Handles skipping the current word: records attempt, incorrect word, and advances to next word.
     */
    skipCurrentWord(): void {
      const idx = store.wordIndex();
      const currentAttempts = store.attempts();
      if (typeof idx !== 'number' || idx < 0 || idx >= currentAttempts.length) {
        this.nextWord();
        return;
      }
      this.recordAttempt(false);
      const word = store.currentWord();
      if (word) {
        this.recordIncorrectWord(word);
      }
      this.nextWord();
    },
  })),
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
