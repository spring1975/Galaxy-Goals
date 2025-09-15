import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { SpellingStore, SpellingUnit } from '../state/spelling.store';
import { SpellingResultsDialogComponent } from './spelling-results-dialog.component';

type TestMode = 'RANDOM10' | 'ALL20' | 'FORM';

@Component({
  selector: 'app-spelling-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDividerModule,
    MatStepperModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Spelling Test</mat-card-title>
        <mat-card-subtitle>Test your spelling skills</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        @if (testState() === 'setup') {
          <!-- Test Setup -->
          <div class="test-setup">
            <h3>Setup Your Test</h3>

            <!-- Unit Selection -->
            @if (store.units().length === 0) {
              <div class="empty-state">
                <mat-icon class="large-icon">quiz</mat-icon>
                <p>No spelling lists available. Create a list first!</p>
              </div>
            } @else {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Choose a spelling list</mat-label>
                <mat-select [(value)]="selectedUnitId" (selectionChange)="updateAvailableModes()">
                  @for (unit of store.units(); track unit.id) {
                    <mat-option [value]="unit.id">
                      {{ unit.name }} ({{ unit.words.length }} words)
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              @if (selectedUnitId) {
                <!-- Mode Selection -->
                <div class="mode-selection">
                  <h4>Test Mode</h4>
                  <mat-radio-group [(ngModel)]="selectedMode" class="mode-options">
                    @for (mode of availableModes(); track mode.value) {
                      <mat-radio-button [value]="mode.value" [disabled]="mode.disabled">
                        <div class="mode-option">
                          <strong>{{ mode.label }}</strong>
                          <span class="mode-description">{{ mode.description }}</span>
                        </div>
                      </mat-radio-button>
                    }
                  </mat-radio-group>
                </div>

                <div class="start-section">
                  <button mat-raised-button
                          color="primary"
                          (click)="startTest()"
                          [disabled]="!selectedUnitId || !selectedMode"
                          class="start-button">
                    <mat-icon>play_arrow</mat-icon>
                    Start Test
                  </button>
                </div>
              }
            }
          </div>
        }

        @if (testState() === 'testing') {
          <!-- Active Test -->
          <div class="active-test">
            <!-- Test Header -->
            <div class="test-header">
              <div class="test-info">
                <h3>{{ selectedUnit()?.name }}</h3>
                <p>{{ selectedMode }} Mode - Question {{ store.index() + 1 }} of {{ testWords().length }}</p>
              </div>
              <button mat-stroked-button (click)="stopTest()" color="warn">
                <mat-icon>stop</mat-icon>
                Stop Test
              </button>
            </div>

            <mat-progress-bar
              [value]="(store.index() / testWords().length) * 100"
              class="progress-bar">
            </mat-progress-bar>

            <!-- Current Question -->
            <div class="question-area">
              <div class="question-card">
                <div class="word-audio">
                  <button mat-fab color="primary" (click)="speakCurrentWord()" [disabled]="isSpeaking()">
                    <mat-icon>{{isSpeaking() ? 'volume_up' : 'play_arrow'}}</mat-icon>
                  </button>
                  <p>Listen and spell the word</p>
                </div>

                <form [formGroup]="answerForm" (ngSubmit)="submitAnswer()">
                  <mat-form-field appearance="outline" class="answer-field">
                    <mat-label>Your Answer</mat-label>
                    <input matInput
                           formControlName="answer"
                           placeholder="Type the word you heard"
                           autocomplete="off"
                           spellcheck="false">
                  </mat-form-field>

                  <div class="question-actions">
                    <button mat-stroked-button type="button" (click)="speakCurrentWord()">
                      <mat-icon>replay</mat-icon>
                      Repeat
                    </button>
                    <button mat-raised-button color="primary" type="submit" [disabled]="!answerForm.value.answer?.trim()">
                      <mat-icon>check</mat-icon>
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Progress Info -->
            <div class="progress-info">
              <div class="score-display">
                <span class="correct">Correct: {{ store.correct() }}</span>
                <span class="incorrect">Incorrect: {{ store.mistakes().length }}</span>
              </div>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .test-setup {
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
      margin-bottom: 24px;
    }

    .mode-selection {
      margin: 32px 0;
    }

    .mode-selection h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .mode-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mode-option {
      display: flex;
      flex-direction: column;
    }

    .mode-description {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }

    .start-section {
      text-align: center;
      margin-top: 32px;
    }

    .start-button {
      padding: 12px 32px;
      font-size: 16px;
    }

    .active-test {
      padding: 16px 0;
    }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .test-info h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
    }

    .test-info p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .progress-bar {
      margin-bottom: 32px;
    }

    .question-area {
      display: flex;
      justify-content: center;
      margin: 32px 0;
    }

    .question-card {
      text-align: center;
      padding: 32px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      min-width: 400px;
      background: #fafafa;
    }

    .word-audio {
      margin-bottom: 32px;
    }

    .word-audio p {
      margin: 16px 0 0 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .answer-field {
      width: 100%;
      margin-bottom: 24px;
    }

    .answer-field input {
      text-align: center;
      font-size: 18px;
    }

    .question-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .progress-info {
      text-align: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .score-display {
      display: flex;
      gap: 32px;
      justify-content: center;
      font-weight: 500;
    }

    .correct {
      color: #2e7d32;
    }

    .incorrect {
      color: #c62828;
    }

    @media (max-width: 600px) {
      .test-header {
        flex-direction: column;
        gap: 16px;
      }

      .question-card {
        min-width: auto;
        width: 100%;
        padding: 24px 16px;
      }

      .question-actions {
        flex-direction: column;
      }

      .score-display {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class SpellingTestComponent implements OnInit, OnDestroy {
  store = inject(SpellingStore);
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);

  testState = signal<'setup' | 'testing'>('setup');
  selectedUnitId: string = '';
  selectedMode: TestMode = 'RANDOM10';
  isSpeaking = signal(false);

  answerForm: FormGroup;

  private speechSynth: SpeechSynthesis | null = null;
  testWords = signal<string[]>([]);

  selectedUnit = computed(() =>
    this.store.units().find(unit => unit.id === this.selectedUnitId) || null
  );

  availableModes = computed(() => {
    const unit = this.selectedUnit();
    if (!unit) return [];

    const wordCount = unit.words.length;

    return [
      {
        value: 'RANDOM10' as TestMode,
        label: 'Random 10',
        description: '10 random words from the list',
        disabled: wordCount < 10
      },
      {
        value: 'ALL20' as TestMode,
        label: 'All Words (Max 20)',
        description: `All ${Math.min(wordCount, 20)} words from the list`,
        disabled: wordCount === 0
      },
      {
        value: 'FORM' as TestMode,
        label: 'Formal Test',
        description: 'Structured test format with all words',
        disabled: wordCount === 0
      }
    ];
  });

  constructor() {
    this.answerForm = this.fb.group({
      answer: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.speechSynth = window.speechSynthesis;
  }

  ngOnDestroy(): void {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  updateAvailableModes(): void {
    // Reset mode selection when unit changes
    const modes = this.availableModes();
    const validMode = modes.find(m => !m.disabled);
    if (validMode) {
      this.selectedMode = validMode.value;
    }
  }

  startTest(): void {
    const unit = this.selectedUnit();
    if (!unit || !this.selectedMode) return;

    // Generate test words based on mode
    let words: string[] = [];
    switch (this.selectedMode) {
      case 'RANDOM10':
        words = this.getRandomWords(unit.words, 10);
        break;
      case 'ALL20':
        words = unit.words.slice(0, 20);
        break;
      case 'FORM':
        words = [...unit.words];
        break;
    }

    this.testWords.set(words);
    this.store.startTest(unit.id, this.selectedMode);
    this.testState.set('testing');

    // Speak first word
    setTimeout(() => this.speakCurrentWord(), 500);
  }

  stopTest(): void {
    if (confirm('Are you sure you want to stop the test? Your progress will be lost.')) {
      this.testState.set('setup');
      this.answerForm.reset();
    }
  }

  submitAnswer(): void {
    const answer = this.answerForm.value.answer?.trim().toLowerCase();
    const currentWord = this.getCurrentWord().toLowerCase();

    if (!answer) return;

    const isCorrect = answer === currentWord;
    this.store.submitAnswer(currentWord, isCorrect);

    // Check if test is complete
    if (this.store.index() >= this.testWords().length) {
      this.finishTest();
    } else {
      // Move to next word
      this.answerForm.reset();
      setTimeout(() => this.speakCurrentWord(), 500);
    }
  }

  finishTest(): void {
    this.store.finishTest();

    // Show results dialog
    const dialogRef = this.dialog.open(SpellingResultsDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        score: Math.round((this.store.correct() / this.testWords().length) * 100),
        correct: this.store.correct(),
        total: this.testWords().length,
        mistakes: this.store.mistakes(),
        unitName: this.selectedUnit()?.name
      }
    });

    dialogRef.afterClosed().subscribe(action => {
      if (action === 'retry') {
        this.startTest();
      } else {
        this.testState.set('setup');
        this.answerForm.reset();
      }
    });
  }

  speakCurrentWord(): void {
    const word = this.getCurrentWord();
    if (!word || !this.speechSynth) return;

    this.speechSynth.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8;
    utterance.volume = 1;
    utterance.pitch = 1;

    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    this.speechSynth.speak(utterance);
  }

  private getCurrentWord(): string {
    const words = this.testWords();
    const index = this.store.index();
    return words[index] || '';
  }

  private getRandomWords(words: string[], count: number): string[] {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, words.length));
  }
}
