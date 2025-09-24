import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  SentenceService,
  SENTENCE_SERVICE_CONFIG,
} from 'src/app/shared/sentence/sentence.service';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { SpellingListSignalStore } from 'src/app/stores/spelling-list.signalstore';
import { PracticeSignalStore, WordAttempt } from './practice.signalstore';
import { WordResultDialogComponent, WordResultDialogData } from './word-result-dialog/word-result-dialog.component';

@Component({
  selector: 'glxg-practice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
  ],
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: SENTENCE_SERVICE_CONFIG, useValue: { autoInit: false } },
    { provide: PracticeSignalStore },
  ],
})
export class PracticeComponent {
  public sentenceService = inject(SentenceService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  spellingListStore = inject(SpellingListSignalStore);
  practiceStore = inject(PracticeSignalStore);

  // Computed signals from the store
  currentList = this.practiceStore.currentList;
  wordIndex = this.practiceStore.wordIndex;
  currentWord = this.practiceStore.currentWord;
  progress = this.practiceStore.progress;
  feedback = this.practiceStore.feedback;
  accuracyPercent = this.practiceStore.accuracyPercent;
  generatedSentenceForDisplay = this.practiceStore.generatedSentenceForDisplay;
  generatedSentence = this.practiceStore.generatedSentence;
  isGenerating = this.practiceStore.isGenerating;
  shouldShowHint = this.practiceStore.shouldShowHint;
  shouldShowReveal = this.practiceStore.shouldShowReveal;
  currentWordAttempt = this.practiceStore.currentWordAttempt;
  sessionStats = this.practiceStore.sessionStats;
  isComplete = this.practiceStore.isComplete;

  // Form and other component state
  practiceForm = new FormGroup({
    answer: new FormControl(''),
  });

  goHome() {
    this.router.navigate(['/home']);
  }

  private correctAnswer$ = new Subject<void>();
  private cancel$ = new Subject<void>();
  isSlow = signal(false);
  voices: SpeechSynthesisVoice[] = [];
  selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {

    // Speech synthesis setup
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = window.speechSynthesis.getVoices();
        this.selectedVoice = this.voices[0] || null;
      };
      this.voices = window.speechSynthesis.getVoices();
      this.selectedVoice = this.voices[0] || null;
    }
  }

  async generateSentence() {
  this.practiceStore.setGeneratedSentenceForDisplay('');
  this.practiceStore.setGeneratedSentence('');
  this.practiceStore.setIsGenerating(true);
  const word = this.currentWord() ?? '';
  const sentence = await this.sentenceService.generateSentenceWithBlank(word);
  const sentenceForDisplay = this.replaceWordWithBlank(sentence, word);
  this.practiceStore.setGeneratedSentenceForDisplay(sentenceForDisplay);
  this.practiceStore.setGeneratedSentence(sentence);
  this.practiceStore.setIsGenerating(false);
  this.speakSentence(sentence);
  }

  playSentence() {
  const sentence = this.generatedSentence();
    if (sentence) {
      this.speakSentence(sentence);
    }
  }

  speakSentence(sentence: string) {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(`OK: ${sentence}`);
    utter.voice = this.selectedVoice;
    utter.rate = 0.75;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  speakWord(slow = false) {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(`Spell ${this.currentWord()}`);
    utter.voice = this.selectedVoice;
    utter.rate = slow ? 0.25 : 0.75;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  onSubmit() {
    if (this.practiceForm.invalid) {
      this.practiceStore.setFeedback('none');
      return;
    }
    const answer = this.practiceForm.value.answer?.trim() ?? '';
    if (!answer) {
      this.practiceStore.setFeedback('none');
      return;
    }

    const result = this.practiceStore.submitAnswer(answer);
    if (!result) return;

    if (result.correct) {
      this.cancel$.next();
      this.correctAnswer$.next();
      // Clear the form for correct answers
      this.practiceForm.patchValue({ answer: '' });
      // Show success dialog
      this.showWordResultDialog(true, this.currentWord() || '');
    } else {
      // Show toast message for incorrect answer
      this.snackBar.open('Almost! Try again.', '', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['incorrect-toast']
      });

      this.speakWord();
      // Hint/reveal visibility is now handled automatically by computed properties
      // Clear the form so user can try again
      this.practiceForm.patchValue({ answer: '' });
    }
  }

  skip() {
    this.practiceStore.skipCurrentWord();
    this.practiceForm.reset();
  }

  nextWord() {
    this.cancel$.next();

    // Check if this is the last word
    const currentProgress = this.progress();
    if (currentProgress.current >= currentProgress.total) {
      // Session complete - show results
      this.showResults();
    } else {
      this.practiceStore.advanceToNextWord();
      this.practiceForm.reset();
    }
  }

  showResults() {
    // Mark session as complete
    this.practiceStore.advanceToNextWord();
    // Results will be shown via template when isComplete is true
  }

  practiceMissedWords() {
    const missedWords = this.practiceStore.getMissedWords();
    const retriedWords = this.practiceStore.getRetriedWords();
    const wordsToRetry = [...missedWords, ...retriedWords];

    if (wordsToRetry.length > 0 && this.currentList()) {
      const practiceList = {
        ...this.currentList()!,
        name: `${this.currentList()!.name} - Missed Words`,
        words: wordsToRetry
      };
      this.practiceStore.resetSession(practiceList);
    }
  }

  practiceWholeListAgain() {
    if (this.currentList()) {
      this.practiceStore.resetSession(this.currentList()!);
    }
  }

  getWordChipClass(attempt: WordAttempt): string {
    if (attempt.correctOnFirstTry) {
      return 'correct-chip';
    } else if (attempt.isComplete && !attempt.wasSkipped && !attempt.wasRevealed) {
      return 'retried-chip';
    } else {
      return 'missed-chip';
    }
  }

  revealAnswer() {
    this.practiceStore.revealAnswer();
    // Show the answer in the input field
    this.practiceForm.patchValue({ answer: this.currentWord() });
    // Show reveal dialog
    this.showWordResultDialog(false, this.currentWord() || '', true);
  }

  private replaceWordWithBlank(sentence: string, targetWord: string): string {
    // Replace all forms of the target word with blank
    const wordRegex = new RegExp(
      `${this.escapeRegex(targetWord)}(s|es|ed|ing)?`,
      'gi'
    );
    return sentence.replace(wordRegex, '______');
  }

  private escapeRegex(word: string): string {
    return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private showWordResultDialog(isCorrect: boolean, word: string, wasRevealed: boolean = false) {
    const dialogRef = this.dialog.open(WordResultDialogComponent, {
      data: {
        isCorrect,
        word,
        wasRevealed,
        showConfetti: isCorrect && !wasRevealed
      } as WordResultDialogData,
      disableClose: true,
      panelClass: 'word-result-dialog'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.nextWord();
    });
  }
}
