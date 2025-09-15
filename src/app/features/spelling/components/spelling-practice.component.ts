import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { SpellingStore, SpellingUnit } from '../state/spelling.store';

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
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Spelling Practice</mat-card-title>
        <mat-card-subtitle>Practice your spelling words with audio</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        @if (!selectedUnit()) {
          <div class="unit-selection">
            <h3>Select a Spelling List</h3>
            @if (store.units().length === 0) {
              <div class="empty-state">
                <mat-icon class="large-icon">spell_check</mat-icon>
                <p>No spelling lists available. Create a list first!</p>
              </div>
            } @else {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Choose a spelling list</mat-label>
                <mat-select (selectionChange)="selectUnit($event.value)">
                  @for (unit of store.units(); track unit.id) {
                    <mat-option [value]="unit">
                      {{ unit.name }} ({{ unit.words.length }} words)
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
          </div>
        } @else {
          <div class="practice-session">
            <!-- Header with list info and controls -->
            <div class="session-header">
              <div class="list-info">
                <h3>{{ selectedUnit()!.name }}</h3>
                <p>{{ currentWordIndex() + 1 }} of {{ selectedUnit()!.words.length }} words</p>
              </div>
              <div class="session-controls">
                <button mat-icon-button (click)="toggleShuffle()" [color]="isShuffled() ? 'primary' : ''">
                  <mat-icon>shuffle</mat-icon>
                </button>
                <button mat-stroked-button (click)="resetSession()">
                  <mat-icon>restart_alt</mat-icon>
                  Reset
                </button>
                <button mat-button (click)="exitSession()">
                  <mat-icon>close</mat-icon>
                  Exit
                </button>
              </div>
            </div>

            <mat-progress-bar
              [value]="(currentWordIndex() / selectedUnit()!.words.length) * 100"
              class="progress-bar">
            </mat-progress-bar>

            <!-- Current word display -->
            <div class="word-display">
              <div class="word-card">
                @if (showWord()) {
                  <div class="word-text">{{ currentWord() }}</div>
                } @else {
                  <div class="word-placeholder">
                    <mat-icon class="speak-icon">volume_up</mat-icon>
                    <p>Listen and try to spell the word</p>
                  </div>
                }

                <div class="word-controls">
                  <button mat-raised-button color="primary" (click)="speakWord()" [disabled]="isSpeaking()">
                    <mat-icon>{{isSpeaking() ? 'volume_up' : 'play_arrow'}}</mat-icon>
                    {{ isSpeaking() ? 'Speaking...' : 'Speak Word' }}
                  </button>

                  <button mat-stroked-button (click)="toggleWordVisibility()">
                    <mat-icon>{{ showWord() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    {{ showWord() ? 'Hide' : 'Show' }} Word
                  </button>
                </div>
              </div>
            </div>

            <!-- Speech rate control -->
            <div class="speech-controls">
              <mat-form-field appearance="outline">
                <mat-label>Speech Rate</mat-label>
                <mat-select [value]="speechRate()" (selectionChange)="setSpeechRate($event.value)">
                  <mat-option value="0.5">Very Slow</mat-option>
                  <mat-option value="0.75">Slow</mat-option>
                  <mat-option value="1">Normal</mat-option>
                  <mat-option value="1.25">Fast</mat-option>
                  <mat-option value="1.5">Very Fast</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-divider></mat-divider>

            <!-- Navigation -->
            <div class="navigation">
              <button mat-raised-button
                      (click)="previousWord()"
                      [disabled]="currentWordIndex() === 0">
                <mat-icon>navigate_before</mat-icon>
                Previous
              </button>

              <div class="nav-info">
                Word {{ currentWordIndex() + 1 }} of {{ selectedUnit()!.words.length }}
              </div>

              <button mat-raised-button
                      (click)="nextWord()"
                      [disabled]="currentWordIndex() === selectedUnit()!.words.length - 1">
                Next
                <mat-icon>navigate_next</mat-icon>
              </button>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .unit-selection {
      padding: 24px 0;
    }

    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: rgba(0, 0, 0, 0.6);
    }

    .large-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.3);
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .practice-session {
      padding: 16px 0;
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .list-info h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
    }

    .list-info p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .session-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .progress-bar {
      margin-bottom: 32px;
    }

    .word-display {
      display: flex;
      justify-content: center;
      margin: 32px 0;
    }

    .word-card {
      text-align: center;
      padding: 32px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      min-width: 300px;
      background: #fafafa;
    }

    .word-text {
      font-size: 32px;
      font-weight: 500;
      margin-bottom: 24px;
      color: #1976d2;
      font-family: 'Courier New', monospace;
    }

    .word-placeholder {
      padding: 24px 0;
    }

    .speak-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: rgba(0, 0, 0, 0.3);
      margin-bottom: 16px;
    }

    .word-controls {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .speech-controls {
      display: flex;
      justify-content: center;
      margin: 24px 0;
    }

    .speech-controls mat-form-field {
      width: 200px;
    }

    .navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
    }

    .nav-info {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 600px) {
      .session-header {
        flex-direction: column;
        gap: 16px;
      }

      .session-controls {
        width: 100%;
        justify-content: center;
      }

      .word-card {
        min-width: auto;
        width: 100%;
      }

      .word-controls {
        flex-direction: column;
      }

      .navigation {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
})
export class SpellingPracticeComponent implements OnInit, OnDestroy {
  store = inject(SpellingStore);

  selectedUnit = signal<SpellingUnit | null>(null);
  currentWordIndex = signal(0);
  showWord = signal(false);
  isSpeaking = signal(false);
  isShuffled = signal(false);
  speechRate = signal(1);

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

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = this.speechRate();
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

  setSpeechRate(rate: number): void {
    this.speechRate.set(rate);
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
