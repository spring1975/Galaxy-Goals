import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfettiService } from 'src/app/shared/confetti/confetti.service';

export interface WordResultDialogData {
  isCorrect: boolean;
  word: string;
  wasRevealed: boolean;
  showConfetti?: boolean;
}

@Component({
  selector: 'word-result-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './word-result-dialog.component.html',
  styleUrls: ['./word-result-dialog.component.scss']
})
export class WordResultDialogComponent implements OnInit {
  data = inject<WordResultDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<WordResultDialogComponent>);
  private confettiService = inject(ConfettiService);

  ngOnInit() {
    if (this.data.showConfetti) {
      this.confettiService.triggerBurst();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
