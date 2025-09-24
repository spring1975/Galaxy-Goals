import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';

export interface ResultsDialogData {
  accuracy: number;
  timeSpent: string;
  firstTryCorrect: number;
  retried: number;
  missed: number;
  wordAttempts: Array<{
    word: string;
    correctOnFirstTry: boolean;
    isComplete: boolean;
    wasSkipped: boolean;
    wasRevealed: boolean;
    attempts: number;
  }>;
}

@Component({
  selector: 'app-results-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule, MatDialogModule],
  templateUrl: './results-dialog.component.html',
  styleUrls: ['./results-dialog.component.scss']
})
export class ResultsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResultsDialogData
  ) {}

  getWordChipClass(attempt: ResultsDialogData['wordAttempts'][number]): string {
    if (attempt.correctOnFirstTry) return 'correct';
    if (attempt.isComplete && !attempt.wasSkipped && !attempt.wasRevealed) return 'retried';
    return 'missed';
  }

  close(): void {
    this.dialogRef.close();
  }
}
