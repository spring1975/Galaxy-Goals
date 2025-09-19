import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpellingList, SpellingListSignalStore } from 'src/app/stores/spelling-list.signalstore';

@Component({
  selector: 'glxg-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportComponent {
  private readonly store = inject(SpellingListSignalStore);
  error: string | null = null;
  success: boolean = false;

  onFileChange(event: Event): void {
    this.error = null;
    this.success = false;
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const lists: SpellingList[] = JSON.parse(reader.result as string);
        if (!Array.isArray(lists)) throw new Error('Invalid format');
        lists.forEach(list => {
          this.store.addList(list);
        });
        this.success = true;
      } catch (e) {
        this.error = 'Invalid JSON file.';
      }
    };
    reader.readAsText(file);
  }
}
