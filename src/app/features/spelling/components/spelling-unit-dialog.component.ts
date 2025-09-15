import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SpellingUnit } from '../state/spelling.store';

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
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add New' : 'Edit' }} Spelling List</h2>

    <form [formGroup]="unitForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>List Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter list name">
          @if (unitForm.get('name')?.invalid && unitForm.get('name')?.touched) {
            <mat-error>List name is required</mat-error>
          }
        </mat-form-field>

        <div class="words-section">
          <h3>Words</h3>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Add Word</mat-label>
            <input matInput
                   #wordInput
                   (keyup.enter)="addWord(wordInput.value); wordInput.value=''"
                   placeholder="Type a word and press Enter">
            <button matSuffix
                    mat-icon-button
                    type="button"
                    (click)="addWord(wordInput.value); wordInput.value=''"
                    [disabled]="!wordInput.value.trim()">
              <mat-icon>add</mat-icon>
            </button>
          </mat-form-field>

          @if (words.length === 0) {
            <div class="empty-words">
              <mat-icon>spell_check</mat-icon>
              <p>No words added yet. Type words above and press Enter to add them.</p>
            </div>
          } @else {
            <div class="words-chips">
              @for (word of words; track word) {
                <mat-chip-row (removed)="removeWord(word)">
                  {{ word }}
                  <button matChipRemove>
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip-row>
              }
            </div>
            <p class="word-count">{{ words.length }} words</p>
          }
        </div>

        <div class="bulk-input-section">
          <h4>Bulk Add Words</h4>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Paste Words (one per line or comma-separated)</mat-label>
            <textarea matInput
                      #bulkInput
                      rows="4"
                      placeholder="cat, dog, fish&#10;or one word per line"></textarea>
          </mat-form-field>
          <button mat-stroked-button
                  type="button"
                  (click)="addBulkWords(bulkInput.value); bulkInput.value=''"
                  [disabled]="!bulkInput.value.trim()">
            <mat-icon>add_circle</mat-icon>
            Add Words
          </button>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button
                color="primary"
                type="submit"
                [disabled]="unitForm.invalid || words.length === 0">
          {{ data.mode === 'add' ? 'Add List' : 'Save Changes' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .words-section {
      margin: 24px 0;
    }

    .words-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .empty-words {
      text-align: center;
      padding: 24px;
      color: rgba(0, 0, 0, 0.6);
      border: 2px dashed #ddd;
      border-radius: 8px;
      margin: 16px 0;
    }

    .empty-words mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: rgba(0, 0, 0, 0.3);
      margin-bottom: 8px;
    }

    .words-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 16px 0;
      min-height: 40px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px;
    }

    .word-count {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }

    .bulk-input-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .bulk-input-section h4 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 500;
    }

    mat-dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }
  `]
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
