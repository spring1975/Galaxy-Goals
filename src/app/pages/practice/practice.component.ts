import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { signal, computed } from '@angular/core';
import { SpellingListSignalStore } from 'src/app/stores/spelling-list.signalstore';
import dayjs, { Dayjs } from 'dayjs';
import { ConfettiBurstComponent } from "src/app/shared/confetti-burst/confetti-burst.component";
@Component({
  selector: 'app-practice',
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
    ConfettiBurstComponent,
    RouterModule
],
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeComponent {
  private confettiTrigger$ = new Subject<void>();
  accuracyPercent = computed(() => {
    const total = this.wordIndex() + 1;
    if (total === 0) return 0;
    const correct = this.correctOnFirstTry.slice(0, total).reduce((sum, v) => sum + v, 0);
    return Math.round((correct / total) * 100);
  });
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/home']);
  }
  showConfetti = signal(false);
  private correctAnswer$ = new Subject<void>();
  private cancel$ = new Subject<void>();
  spellingListStore = inject(SpellingListSignalStore);
  practiceForm = new FormGroup({
    answer: new FormControl(''),
  });
  currentList = signal(this.spellingListStore.getCurrentList() ?? {
    id: 'demo',
    name: 'Demo List',
    words: ['bake', 'grape', 'shape'],
    created: dayjs(),
    lastPracticed: undefined
  });
  wordIndex = signal(0);
  currentWord = signal(this.currentList().words[0]);
  progress = signal({ current: 1, total: this.currentList().words.length });
  feedback = signal<'none' | 'correct' | 'incorrect'>('none');
  showHint = signal(false);
  showReveal = signal(false);
  isSlow = signal(false);
  voices: SpeechSynthesisVoice[] = [];
  selectedVoice: SpeechSynthesisVoice | null = null;
  // Session tracking
  attempts: number[] = Array(this.currentList().words.length).fill(0);
  correctOnFirstTry: number[] = Array(this.currentList().words.length).fill(0);
  incorrectWords: string[] = [];
  sessionStart: Dayjs = dayjs();
  sessionEnd?: Dayjs;

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
          this.showConfetti.set(true);
          return timer(1200);
        })
      )
      .subscribe(() => this.showConfetti.set(false));
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
      this.feedback.set('none');
      return;
    }
    const answer = this.practiceForm.value.answer?.trim().toLowerCase();
    const idx = this.wordIndex();
    if (typeof idx !== 'number' || idx < 0 || idx >= this.attempts.length) return;
    if (typeof this.attempts[idx] === 'number') {
      this.attempts[idx]!++;
    } else {
      this.attempts[idx] = 1;
    }
    const word = this.currentWord() ?? '';
    const correct = answer === word.toLowerCase();
    if (correct) {
      this.feedback.set('correct');
      if (this.attempts[idx] === 1) {
        this.correctOnFirstTry[idx] = 1;
      }
  this.confettiTrigger$.next();
      this.cancel$.next();
      this.correctAnswer$.next();
    } else {
      this.feedback.set('incorrect');
      this.speakWord();
      if (word && !this.incorrectWords.includes(word)) {
        this.incorrectWords.push(word);
      }
      // TODO: handle retries, show hint/reveal after attempts
    }
  }

  skip() {
    // Count as incorrect, update stats
    const idx = this.wordIndex();
    if (typeof idx !== 'number' || idx < 0 || idx >= this.attempts.length) {
      this.nextWord();
      return;
    }
    if (typeof this.attempts[idx] === 'number') {
      this.attempts[idx]!++;
    } else {
      this.attempts[idx] = 1;
    }
    const word = this.currentWord() ?? '';
    if (word && !this.incorrectWords.includes(word)) {
      this.incorrectWords.push(word);
    }
    this.nextWord();
  }

  nextWord() {
    this.cancel$.next();
    const nextIdx = this.wordIndex() + 1;
    if (nextIdx < this.currentList().words.length) {
      this.wordIndex.set(nextIdx);
      this.currentWord.set(this.currentList().words[nextIdx]);
      this.progress.set({ current: nextIdx + 1, total: this.currentList().words.length });
      this.practiceForm.reset();
      this.feedback.set('none');
    } else {
      // Session complete
      this.sessionEnd = dayjs();
      // TODO: Save session stats, show results screen
    }
  }

  showHintToggle() {
    this.showHint.set(true);
  }

  showRevealToggle() {
    this.showReveal.set(true);
  }
}
