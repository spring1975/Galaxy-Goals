import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SpellingUnit } from '../../state/spelling.store';

export interface SpellingUnitDialogData {
  unit: SpellingUnit | null;
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-spelling-unit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './spelling-unit-dialog.component.html',
  styleUrls: ['./spelling-unit-dialog.component.scss']
})
export class SpellingUnitDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SpellingUnitDialogComponent>);

  unitForm: FormGroup;
  words: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: SpellingUnitDialogData) {
    this.unitForm = this.fb.group({
      name: [data.unit?.name || '', [Validators.required, Validators.minLength(1)]]
    });

    if (data.unit?.words) {
      this.words = [...data.unit.words];
    }
  }

  addWord(word: string): void {
    const trimmedWord = word.trim().toLowerCase();
    if (trimmedWord && !this.words.includes(trimmedWord)) {
      this.words.push(trimmedWord);
    }
  }

  removeWord(word: string): void {
    this.words = this.words.filter(w => w !== word);
  }

  addBulkWords(input: string): void {
    if (!input.trim()) return;

    // Split by commas or line breaks and clean up
    const newWords = input
      .split(/[,\n\r]+/)
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0)
      .filter(word => !this.words.includes(word)); // Avoid duplicates

    this.words.push(...newWords);
  }

  onSubmit(): void {
    if (this.unitForm.valid && this.words.length > 0) {
      const result = {
        name: this.unitForm.value.name.trim(),
        words: [...this.words]
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
