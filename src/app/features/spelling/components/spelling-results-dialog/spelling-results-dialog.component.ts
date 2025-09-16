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
  templateUrl: './spelling-results-dialog.component.html',
  styleUrls: ['./spelling-results-dialog.component.scss']
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
