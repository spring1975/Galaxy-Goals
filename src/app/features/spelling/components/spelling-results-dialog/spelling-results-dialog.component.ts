import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface SpellingResultsDialogData {
  score: number;
  correct: number;
  total: number;
  mistakes: string[];
  timeTaken: number;
  averageTime: number;
}

@Component({
  selector: 'app-spelling-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './spelling-results-dialog.component.html',
  styleUrls: ['./spelling-results-dialog.component.scss']
})
export class SpellingResultsDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<SpellingResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SpellingResultsDialogData
  ) {}

  getPerformanceMessage(): string {
    if (this.data.score >= 90) {
      return 'Excellent work! Outstanding spelling skills!';
    } else if (this.data.score >= 70) {
      return 'Good job! Keep practicing to improve further.';
    } else {
      return 'Keep practicing! You\'ll get better with time.';
    }
  }

  getPerformanceClass(): string {
    if (this.data.score >= 90) {
      return 'excellent';
    } else if (this.data.score >= 70) {
      return 'good';
    } else {
      return 'needs-improvement';
    }
  }

  getPerformanceIcon(): string {
    if (this.data.score >= 90) {
      return 'star';
    } else if (this.data.score >= 70) {
      return 'thumb_up';
    } else {
      return 'school';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onRetakeTest(): void {
    this.dialogRef.close('retake');
  }
}
