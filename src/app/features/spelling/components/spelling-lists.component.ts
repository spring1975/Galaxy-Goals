import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SpellingStore, SpellingUnit } from '../state/spelling.store';
import { SpellingUnitDialogComponent } from './spelling-unit-dialog.component';
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
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Spelling Lists</mat-card-title>
        <mat-card-subtitle>Manage your spelling word lists</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="toolbar">
          <button mat-raised-button color="primary" (click)="addUnit()">
            <mat-icon>add</mat-icon>
            Add New List
          </button>
        </div>

        @if (store.units().length === 0) {
          <div class="empty-state">
            <mat-icon class="large-icon">spell_check</mat-icon>
            <h3>No spelling lists yet</h3>
            <p>Create your first spelling list to get started!</p>
          </div>
        } @else {
          <mat-table [dataSource]="store.units()" class="spelling-table">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef>List Name</mat-header-cell>
              <mat-cell *matCellDef="let unit">{{ unit.name }}</mat-cell>
            </ng-container>

            <!-- Word Count Column -->
            <ng-container matColumnDef="wordCount">
              <mat-header-cell *matHeaderCellDef>Words</mat-header-cell>
              <mat-cell *matCellDef="let unit">{{ unit.words.length }} words</mat-cell>
            </ng-container>

            <!-- Recent Score Column -->
            <ng-container matColumnDef="recentScore">
              <mat-header-cell *matHeaderCellDef>Recent Score</mat-header-cell>
              <mat-cell *matCellDef="let unit">
                @if (getRecentScore(unit.id); as score) {
                  <span class="score" [class.good-score]="score >= 80" [class.poor-score]="score < 60">
                    {{ score }}%
                  </span>
                } @else {
                  <span class="no-score">Not attempted</span>
                }
              </mat-cell>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
              <mat-cell *matCellDef="let unit">
                <button mat-icon-button [routerLink]="['/spelling/practice', unit.id]" matTooltip="Practice">
                  <mat-icon>play_circle</mat-icon>
                </button>
                <button mat-icon-button [routerLink]="['/spelling/test', unit.id]" matTooltip="Test">
                  <mat-icon>quiz</mat-icon>
                </button>
                <button mat-icon-button (click)="editUnit(unit)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteUnit(unit)" matTooltip="Delete" color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-cell>
            </ng-container>

            <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
          </mat-table>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .toolbar {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: rgba(0, 0, 0, 0.6);
    }

    .large-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.3);
      margin-bottom: 16px;
    }

    .spelling-table {
      width: 100%;
    }

    .score {
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
      background-color: #f5f5f5;
    }

    .good-score {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .poor-score {
      background-color: #ffebee;
      color: #c62828;
    }

    .no-score {
      color: rgba(0, 0, 0, 0.6);
      font-style: italic;
    }

    mat-card-content {
      padding-top: 16px;
    }
  `]
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
