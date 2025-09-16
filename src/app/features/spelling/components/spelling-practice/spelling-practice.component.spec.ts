import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SpellingPracticeComponent } from './spelling-practice.component';
import { SpellingStore } from '../../state/spelling.store';

describe('SpellingPracticeComponent', () => {
  let spectator: Spectator<SpellingPracticeComponent>;
  const createComponent = createComponentFactory({
    component: SpellingPracticeComponent,
    providers: [SpellingStore],
  });

  beforeEach(() => {
    spectator = createComponent();
    // Mocking SpeechSynthesis and SpeechSynthesisUtterance
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: jest.fn(),
        speak: jest.fn(),
      },
      writable: true,
    });

    // Mock SpeechSynthesisUtterance
    (global as any).SpeechSynthesisUtterance = jest.fn().mockImplementation((text: string) => ({
      text,
      rate: 1,
      volume: 1,
      pitch: 1,
      onstart: null,
      onend: null,
      onerror: null,
    }));
  });

  it('should initialize speech synthesis on init', () => {
    spectator.component.ngOnInit();
    expect(window.speechSynthesis).toBeDefined();
  });

  it('should cancel speech synthesis on destroy', () => {
    // ARRANGE
    spectator.component.ngOnInit(); // Initialize speechSynth
    const cancelSpy = jest.spyOn(window.speechSynthesis, 'cancel');

    // ACT
    spectator.component.ngOnDestroy();

    // ASSERT
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should select a unit and reset session', () => {
    // ARRANGE
    const resetSessionSpy = jest.spyOn(spectator.component, 'resetSession');
    const mockUnit = { id: '1', name: 'Unit 1', words: ['word1', 'word2'] };

    // ACT
    spectator.component.selectUnit(mockUnit);

    // ASSERT
    expect(spectator.component.selectedUnit()).toBe(mockUnit);
    expect(resetSessionSpy).toHaveBeenCalled();
  });

  it('should reset session state', () => {
    // ARRANGE
    const setupWordOrderSpy = jest.spyOn(spectator.component, 'setupWordOrder');

    // ACT
    spectator.component.resetSession();

    // ASSERT
    expect(spectator.component.currentWordIndex()).toBe(0);
    expect(spectator.component.showWord()).toBe(false);
    expect(setupWordOrderSpy).toHaveBeenCalled();
  });

  it('should exit session and reset all state', () => {
    // ARRANGE
    const mockUnit = { id: '1', name: 'Unit 1', words: ['word1', 'word2'] };
    spectator.component.selectedUnit.set(mockUnit);
    spectator.component.currentWordIndex.set(5);
    spectator.component.showWord.set(true);

    // ACT
    spectator.component.exitSession();

    // ASSERT
    expect(spectator.component.selectedUnit()).toBeNull();
    expect(spectator.component.currentWordIndex()).toBe(0);
    expect(spectator.component.showWord()).toBe(false);
  });

  it('should toggle shuffle and reset word order', () => {
    // ARRANGE
    const setupWordOrderSpy = jest.spyOn(spectator.component, 'setupWordOrder');
    const initialShuffleState = spectator.component.isShuffled();

    // ACT
    spectator.component.toggleShuffle();

    // ASSERT
    expect(spectator.component.isShuffled()).toBe(!initialShuffleState);
    expect(spectator.component.currentWordIndex()).toBe(0);
    expect(setupWordOrderSpy).toHaveBeenCalled();
  });

  it('should return the current word', () => {
    // ARRANGE
    const mockUnit = { id: '1', name: 'Unit 1', words: ['word1', 'word2'] };
    spectator.component.selectedUnit.set(mockUnit);
    spectator.component.setupWordOrder();

    // ACT
    const currentWord = spectator.component.currentWord();

    // ASSERT
    expect(currentWord).toBe('word1');
  });

  it('should return empty string when no unit is selected', () => {
    // ARRANGE
    spectator.component.selectedUnit.set(null);

    // ACT
    const currentWord = spectator.component.currentWord();

    // ASSERT
    expect(currentWord).toBe('');
  });

  it('should speak the current word', () => {
    // ARRANGE
    const mockUnit = { id: '1', name: 'Unit 1', words: ['word1'] };
    spectator.component.selectedUnit.set(mockUnit);
    spectator.component.setupWordOrder();
    spectator.component.ngOnInit(); // Initialize speechSynth
    const speakSpy = jest.spyOn(window.speechSynthesis, 'speak');

    // ACT
    spectator.component.speakWord();

    // ASSERT
    expect(speakSpy).toHaveBeenCalled();
  });

  it('should not speak when no word is available', () => {
    // ARRANGE
    spectator.component.selectedUnit.set(null);
    spectator.component.ngOnInit();
    const speakSpy = jest.spyOn(window.speechSynthesis, 'speak');

    // ACT
    spectator.component.speakWord();

    // ASSERT
    expect(speakSpy).not.toHaveBeenCalled();
  });

  it('should toggle word visibility', () => {
    // ARRANGE
    const initialVisibility = spectator.component.showWord();

    // ACT
    spectator.component.toggleWordVisibility();

    // ASSERT
    expect(spectator.component.showWord()).toBe(!initialVisibility);
  });

  it('should navigate to the previous word when not at first word', () => {
    // ARRANGE
    spectator.component.currentWordIndex.set(1);
    spectator.component.showWord.set(true);

    // ACT
    spectator.component.previousWord();

    // ASSERT
    expect(spectator.component.currentWordIndex()).toBe(0);
    expect(spectator.component.showWord()).toBe(false);
  });

  it('should not navigate to previous word when at first word', () => {
    // ARRANGE
    spectator.component.currentWordIndex.set(0);

    // ACT
    spectator.component.previousWord();

    // ASSERT
    expect(spectator.component.currentWordIndex()).toBe(0);
  });

  it('should navigate to the next word when not at last word', () => {
    // ARRANGE
    const mockUnit = { id: '1', name: 'Unit 1', words: ['word1', 'word2'] };
    spectator.component.selectedUnit.set(mockUnit);
    spectator.component.currentWordIndex.set(0);
    spectator.component.showWord.set(true);

    // ACT
    spectator.component.nextWord();

    // ASSERT
    expect(spectator.component.currentWordIndex()).toBe(1);
    expect(spectator.component.showWord()).toBe(false);
  });

  it('should not navigate to next word when at last word', () => {
    // ARRANGE
    const mockUnit = { id: '1', name: 'Unit 1', words: ['word1', 'word2'] };
    spectator.component.selectedUnit.set(mockUnit);
    spectator.component.currentWordIndex.set(1); // Last word

    // ACT
    spectator.component.nextWord();

    // ASSERT
    expect(spectator.component.currentWordIndex()).toBe(1);
  });

  it('should not navigate when no unit is selected', () => {
    // ARRANGE
    spectator.component.selectedUnit.set(null);

    // ACT
    spectator.component.nextWord();

    // ASSERT
    expect(spectator.component.currentWordIndex()).toBe(0);
  });

  describe('setupWordOrder', () => {
    it('should create sequential word order when not shuffled', () => {
      // ARRANGE
      const mockUnit = { id: '1', name: 'Unit 1', words: ['word1', 'word2', 'word3'] };
      spectator.component.selectedUnit.set(mockUnit);
      spectator.component.isShuffled.set(false);

      // ACT
      spectator.component.setupWordOrder();

      // ASSERT
      // Access private property for testing
      const wordOrder = (spectator.component as any).wordOrder;
      expect(wordOrder).toEqual([0, 1, 2]);
    });

    it('should handle empty unit', () => {
      // ARRANGE
      spectator.component.selectedUnit.set(null);

      // ACT
      spectator.component.setupWordOrder();

      // ASSERT
      // Should not throw error and wordOrder should remain empty
      const wordOrder = (spectator.component as any).wordOrder;
      expect(wordOrder).toEqual([]);
    });

    it('should shuffle word order when shuffled is enabled', () => {
      // ARRANGE
      const mockUnit = { id: '1', name: 'Unit 1', words: ['word1', 'word2', 'word3', 'word4', 'word5'] };
      spectator.component.selectedUnit.set(mockUnit);
      spectator.component.isShuffled.set(true);

      // Mock Math.random to ensure predictable shuffle for testing
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.8) // Will give j = 3
        .mockReturnValueOnce(0.5) // Will give j = 1
        .mockReturnValueOnce(0.2) // Will give j = 0
        .mockReturnValueOnce(0.9); // Will give j = 0

      // ACT
      spectator.component.setupWordOrder();

      // ASSERT
      const wordOrder = (spectator.component as any).wordOrder;
      expect(wordOrder).toHaveLength(5);
      expect(wordOrder).not.toEqual([0, 1, 2, 3, 4]); // Should be different from sequential

      // Restore Math.random
      Math.random = originalRandom;
    });
  });

  describe('speech rate form', () => {
    it('should initialize with default speech rate', () => {
      // ARRANGE & ACT
      const formValue = spectator.component.form.value;

      // ASSERT
      expect(formValue.speechRate).toBe(spectator.component.defaultSpeechRate);
    });

    it('should update speech rate in form', () => {
      // ARRANGE
      const newRate = 1.5;

      // ACT
      spectator.component.form.controls.speechRate.setValue(newRate);

      // ASSERT
      expect(spectator.component.form.controls.speechRate.value).toBe(newRate);
    });
  });
});
