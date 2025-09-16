import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { SpellingStore, SpellingUnit } from '../../state/spelling.store';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-spelling-practice',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSliderModule,
    MatDividerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './spelling-practice.component.html',
  styleUrls: ['./spelling-practice.component.scss'],
})
export class SpellingPracticeComponent implements OnInit, OnDestroy {
  store = inject(SpellingStore);
  fb = inject(FormBuilder);

  defaultSpeechRate = 1;
  form = this.fb.group({
      speechRate: this.fb.nonNullable.control(this.defaultSpeechRate)
    });

  selectedUnit = signal<SpellingUnit | null>(null);
  currentWordIndex = signal(0);
  showWord = signal(false);
  isSpeaking = signal(false);
  isShuffled = signal(false);


  private wordOrder: number[] = [];
  private speechSynth: SpeechSynthesis | null = null;

  ngOnInit(): void {
    this.speechSynth = window.speechSynthesis;
  }

  ngOnDestroy(): void {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  selectUnit(unit: SpellingUnit): void {
    this.selectedUnit.set(unit);
    this.resetSession();
  }

  resetSession(): void {
    this.currentWordIndex.set(0);
    this.showWord.set(false);
    this.setupWordOrder();
  }

  exitSession(): void {
    this.selectedUnit.set(null);
    this.currentWordIndex.set(0);
    this.showWord.set(false);
  }

  setupWordOrder(): void {
    const unit = this.selectedUnit();
    if (!unit) return;

    this.wordOrder = Array.from({ length: unit.words.length }, (_, i) => i);

    if (this.isShuffled()) {
      // Fisher-Yates shuffle
      for (let i = this.wordOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.wordOrder[i], this.wordOrder[j]] = [this.wordOrder[j], this.wordOrder[i]];
      }
    }
  }

  toggleShuffle(): void {
    this.isShuffled.set(!this.isShuffled());
    this.setupWordOrder();
    this.currentWordIndex.set(0);
  }

  currentWord(): string {
    const unit = this.selectedUnit();
    if (!unit) return '';

    const actualIndex = this.wordOrder[this.currentWordIndex()];
    return unit.words[actualIndex] || '';
  }

  speakWord(): void {
    const word = this.currentWord();
    if (!word || !this.speechSynth) return;

    this.speechSynth.cancel(); // Stop any current speech

    const utterance = new SpeechSynthesisUtterance(`Spell... ${word}`);
    utterance.rate = this.form.controls.speechRate.value;
    utterance.volume = 1;
    utterance.pitch = 1;

    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    this.speechSynth.speak(utterance);
  }

  toggleWordVisibility(): void {
    this.showWord.set(!this.showWord());
  }

  previousWord(): void {
    const current = this.currentWordIndex();
    if (current > 0) {
      this.currentWordIndex.set(current - 1);
      this.showWord.set(false);
    }
  }

  nextWord(): void {
    const unit = this.selectedUnit();
    if (!unit) return;

    const current = this.currentWordIndex();
    if (current < unit.words.length - 1) {
      this.currentWordIndex.set(current + 1);
      this.showWord.set(false);
    }
  }
}
