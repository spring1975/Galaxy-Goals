import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SpellingList } from 'src/app/stores/spelling-list.signalstore';

export interface SpellingListDialogData {
  list?: SpellingList;
}

@Component({
  selector: 'glxg-spelling-list-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './spelling-list-dialog.component.html',
  styleUrl: './spelling-list-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpellingListDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SpellingListDialogComponent>);
  private readonly data = inject<SpellingListDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
        name: [this.data.list?.name ?? '', Validators.required],
        words: [this.data.list ? this.data.list.words.join('\n') : '', Validators.required]
      });


  save(): void {
    if (this.form.valid) {
      const { name, words } = this.form.value;
      const wordArr = (words ?? '').split(/\r?\n/).map((w: string) => w.trim()).filter(Boolean);
      this.dialogRef.close({ name, words: wordArr });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
