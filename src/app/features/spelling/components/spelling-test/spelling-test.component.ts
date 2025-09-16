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
import { SpellingStore, SpellingUnit } from '../../state/spelling.store';
import { SpellingResultsDialogComponent } from '../spelling-results-dialog/spelling-results-dialog.component';

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
  templateUrl: './spelling-test.component.html',
  styleUrls: ['./spelling-test.component.scss']
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

    const utterance = new SpeechSynthesisUtterance(`Spell... ${word}`);
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
