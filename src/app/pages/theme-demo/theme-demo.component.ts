import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-theme-demo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './theme-demo.component.html',
  styleUrls: ['./theme-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeDemoComponent {
  chipInput = new FormControl('');
  chips: { label: string; color: 'primary' | 'accent' | 'warn' }[] = [
    { label: 'Primary', color: 'primary' },
    { label: 'Secondary', color: 'accent' },
    { label: 'Warn', color: 'warn' },
  ];

  addChip() {
    const value = this.chipInput.value?.trim();
    if (value) {
      const color =
        this.chips.length % 3 === 0
          ? 'primary'
          : this.chips.length % 3 === 1
          ? 'accent'
          : 'warn';
      this.chips.push({ label: value, color });
      this.chipInput.setValue('');
    }
  }

  removeChip(index: number) {
    this.chips.splice(index, 1);
  }
}
