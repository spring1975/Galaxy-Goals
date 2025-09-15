import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

export interface SpellingResultsData {
  score: number;
  correct: number;
  total: number;
  mistakes: string[];
  unitName?: string;
}

@Component({
  selector: 'app-spelling-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
  ],
  template: `
    <div class="results-container">
      <div class="results-header">
        <div class="score-circle" [class.excellent]="data.score >= 90" [class.good]="data.score >= 70" [class.needs-improvement]="data.score < 70">
          <span class="score-number">{{ data.score }}%</span>
        </div>
        <h2 mat-dialog-title>Test Complete!</h2>
        @if (data.unitName) {
          <p class="unit-name">{{ data.unitName }}</p>
        }
      </div>

      <mat-dialog-content>
        <div class="results-summary">
          <div class="stat-card correct-card">
            <mat-icon>check_circle</mat-icon>
            <div class="stat-info">
              <span class="stat-number">{{ data.correct }}</span>
              <span class="stat-label">Correct</span>
            </div>
          </div>

          <div class="stat-card incorrect-card">
            <mat-icon>cancel</mat-icon>
            <div class="stat-info">
              <span class="stat-number">{{ data.total - data.correct }}</span>
              <span class="stat-label">Incorrect</span>
            </div>
          </div>

          <div class="stat-card total-card">
            <mat-icon>quiz</mat-icon>
            <div class="stat-info">
              <span class="stat-number">{{ data.total }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
        </div>

        @if (data.mistakes.length > 0) {
          <mat-divider></mat-divider>

          <div class="mistakes-section">
            <h3>
              <mat-icon>error_outline</mat-icon>
              Words to Practice
            </h3>
            <p class="mistakes-note">Review these words for better performance:</p>

            <div class="mistakes-chips">
              @for (mistake of data.mistakes; track mistake) {
                <mat-chip class="mistake-chip">
                  <mat-icon matChipAvatar>spell_check</mat-icon>
                  {{ mistake }}
                </mat-chip>
              }
            </div>
          </div>
        } @else {
          <div class="perfect-score">
            <mat-icon class="perfect-icon">emoji_events</mat-icon>
            <h3>Perfect Score!</h3>
            <p>Congratulations! You got every word correct!</p>
          </div>
        }

        <div class="performance-message">
          @if (data.score >= 90) {
            <div class="message excellent">
              <mat-icon>star</mat-icon>
              <span>Excellent work! Your spelling skills are outstanding!</span>
            </div>
          } @else if (data.score >= 70) {
            <div class="message good">
              <mat-icon>thumb_up</mat-icon>
              <span>Good job! Keep practicing to improve further.</span>
            </div>
          } @else {
            <div class="message needs-improvement">
              <mat-icon>school</mat-icon>
              <span>Keep practicing! Review the missed words and try again.</span>
            </div>
          }
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onReturn()">
          <mat-icon>home</mat-icon>
          Return to Lists
        </button>
        <button mat-stroked-button (click)="onRetry()">
          <mat-icon>refresh</mat-icon>
          Try Again
        </button>
        <button mat-raised-button color="primary" (click)="onReturn()">
          <mat-icon>done</mat-icon>
          Done
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .results-container {
      text-align: center;
      padding: 16px;
    }

    .results-header {
      margin-bottom: 32px;
    }

    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      border: 4px solid #ddd;
      background: #f5f5f5;
    }

    .score-circle.excellent {
      border-color: #4caf50;
      background: #e8f5e8;
      color: #2e7d32;
    }

    .score-circle.good {
      border-color: #ff9800;
      background: #fff3e0;
      color: #f57c00;
    }

    .score-circle.needs-improvement {
      border-color: #f44336;
      background: #ffebee;
      color: #c62828;
    }

    .score-number {
      font-size: 32px;
      font-weight: bold;
    }

    .unit-name {
      color: rgba(0, 0, 0, 0.6);
      margin: 0;
      font-style: italic;
    }

    .results-summary {
      display: flex;
      justify-content: space-around;
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      min-width: 80px;
    }

    .correct-card {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .incorrect-card {
      background: #ffebee;
      color: #c62828;
    }

    .total-card {
      background: #e3f2fd;
      color: #1976d2;
    }

    .stat-card mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      margin-bottom: 8px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-number {
      font-size: 24px;
      font-weight: bold;
    }

    .stat-label {
      font-size: 12px;
      text-transform: uppercase;
      opacity: 0.8;
    }

    .mistakes-section {
      margin: 24px 0;
      text-align: left;
    }

    .mistakes-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      color: #c62828;
    }

    .mistakes-note {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .mistakes-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .mistake-chip {
      background: #ffebee !important;
      color: #c62828;
    }

    .perfect-score {
      margin: 24px 0;
      color: #4caf50;
    }

    .perfect-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .performance-message {
      margin: 24px 0;
    }

    .message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      border-radius: 8px;
      font-weight: 500;
    }

    .message.excellent {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .message.good {
      background: #fff3e0;
      color: #f57c00;
    }

    .message.needs-improvement {
      background: #e3f2fd;
      color: #1976d2;
    }

    mat-dialog-actions {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    @media (max-width: 600px) {
      .results-summary {
        flex-direction: column;
        align-items: center;
      }

      .stat-card {
        width: 100%;
        max-width: 200px;
      }

      .score-circle {
        width: 100px;
        height: 100px;
      }

      .score-number {
        font-size: 24px;
      }

      mat-dialog-actions {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class SpellingResultsDialogComponent {
  private dialogRef = inject(MatDialogRef<SpellingResultsDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: SpellingResultsData) {}

  onRetry(): void {
    this.dialogRef.close('retry');
  }

  onReturn(): void {
    this.dialogRef.close('return');
  }
}
