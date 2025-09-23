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
import { Subject, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpellingListSignalStore } from 'src/app/stores/spelling-list.signalstore';
import { ConfettiBurstComponent } from 'src/app/shared/confetti-burst/confetti-burst.component';
import { PracticeSignalStore } from './practice.signalstore';

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
    ConfettiBurstComponent,
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
  spellingListStore = inject(SpellingListSignalStore);
  private practiceStore = inject(PracticeSignalStore);

  // Computed signals from the store
  currentList = this.practiceStore.currentList;
  wordIndex = this.practiceStore.wordIndex;
  currentWord = this.practiceStore.currentWord;
  progress = this.practiceStore.progress;
  feedback = this.practiceStore.feedback;
  showHint = this.practiceStore.showHint;
  showReveal = this.practiceStore.showReveal;
  showConfetti = this.practiceStore.showConfetti;
  accuracyPercent = this.practiceStore.accuracyPercent;
  generatedSentenceForDisplay = this.practiceStore.generatedSentenceForDisplay;
  generatedSentence = this.practiceStore.generatedSentence;
  isGenerating = this.practiceStore.isGenerating;

  // Form and other component state
  practiceForm = new FormGroup({
    answer: new FormControl(''),
  });

  goHome() {
    this.router.navigate(['/home']);
  }

  private confettiTrigger$ = new Subject<void>();
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
    // Confetti observable setup
    this.confettiTrigger$
      .pipe(
        switchMap(() => {
          this.practiceStore.setShowConfetti(true);
          return timer(1200);
        })
      )
      .subscribe(() => {
        this.practiceStore.setShowConfetti(false);
      });
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
    const answer = this.practiceForm.value.answer?.trim().toLowerCase() ?? '';
    const result = this.practiceStore.submitAnswer(answer);
    if (!result) return;
    if (result.correct) {
      this.confettiTrigger$.next();
      this.cancel$.next();
      this.correctAnswer$.next();
    } else {
      this.speakWord();
      // TODO: handle retries, show hint/reveal after attempts
    }
  }

  skip() {
    this.practiceStore.skipCurrentWord();
  }

  nextWord() {
    this.cancel$.next();
    this.practiceStore.advanceToNextWord();
    this.practiceForm.reset();
  }

  showHintToggle() {
    this.practiceStore.setShowHint(true);
  }

  showRevealToggle() {
    this.practiceStore.setShowReveal(true);
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
}
