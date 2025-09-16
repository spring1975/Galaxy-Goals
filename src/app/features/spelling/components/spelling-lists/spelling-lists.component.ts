import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SpellingStore, SpellingUnit } from '../../state/spelling.store';
import { SpellingUnitDialogComponent } from '../spelling-unit-dialog/spelling-unit-dialog.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-spelling-lists',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatToolbarModule,
    RouterLink
  ],
  templateUrl: './spelling-lists.component.html',
  styleUrls: ['./spelling-lists.component.scss']
})
export class SpellingListsComponent {
  store = inject(SpellingStore);
  dialog = inject(MatDialog);

  displayedColumns = ['name', 'wordCount', 'recentScore', 'actions'];

  addUnit(): void {
    const dialogRef = this.dialog.open(SpellingUnitDialogComponent, {
      width: '600px',
      data: { unit: null, mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.addUnit(result);
      }
    });
  }

  editUnit(unit: SpellingUnit): void {
    const dialogRef = this.dialog.open(SpellingUnitDialogComponent, {
      width: '600px',
      data: { unit, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // For edit, we need to update the existing unit
        const units = this.store.units().map(u =>
          u.id === unit.id ? { ...result, id: unit.id } : u
        );
        this.store.importData(JSON.stringify({
          units,
          attempts: this.store.attempts(),
          _version: 1
        }));
      }
    });
  }

  deleteUnit(unit: SpellingUnit): void {
    if (confirm(`Are you sure you want to delete "${unit.name}"? This will also remove all test attempts for this list.`)) {
      this.store.deleteUnit(unit.id);
    }
  }

  getRecentScore(unitId: string): number | null {
    const attempts = this.store.attempts().filter(a => a.unitId === unitId);
    if (attempts.length === 0) return null;

    // Get the most recent attempt
    const recent = attempts.reduce((latest, current) =>
      new Date(current.date) > new Date(latest.date) ? current : latest
    );

    return recent.score;
  }
}
