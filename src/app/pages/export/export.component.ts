import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpellingListSignalStore } from 'src/app/stores/spelling-list.signalstore';

@Component({
  selector: 'glxg-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportComponent {
  private readonly store = inject(SpellingListSignalStore);

  exportLists(): void {
    const lists = this.store.getLists();
    const json = JSON.stringify(lists, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spelling-lists.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
