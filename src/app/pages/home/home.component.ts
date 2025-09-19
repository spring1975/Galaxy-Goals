import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FromNowPipe } from 'src/app/shared/pipes/from-now.pipe';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { SpellingListSignalStore, SpellingList } from 'src/app/stores/spelling-list.signalstore';
import dayjs from 'dayjs';
import { SpellingListDialogComponent } from './spelling-list-dialog/spelling-list-dialog.component';

@Component({
  selector: 'glxg-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, FromNowPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private readonly store = inject(SpellingListSignalStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  spellingLists = this.store.getLists;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (this.router.url.startsWith('/home/spellinglist/') && this.router.url.endsWith('/edit')) {
        this.openEditDialog(id);
      }
    });
  }

  openEditDialog(id: string | null): void {
    let list: SpellingList | undefined;
    if (id) {
      list = this.store.getLists().find(l => l.id === id);
      this.store.setCurrentList(id);
    }
    const dialogRef = this.dialog.open(SpellingListDialogComponent, {
      data: { list },
      width: '400px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['/home']);
      if (result) {
        if (id && list) {
          this.store.updateList({ ...list, name: result.name, words: result.words });
        } else {
          this.store.addList({
            id: Math.random().toString(36).slice(2),
            name: result.name,
            words: result.words,
            created: dayjs()
          });
        }
      }
    });
  }

  practiceList(id: string): void {
    this.store.setCurrentList(id);
    // TODO: Navigate to practice page
  }

  editList(id: string): void {
    this.router.navigate(['/home/spellinglist', id, 'edit']);
  }

  deleteList(id: string): void {
    this.store.deleteList(id);
  }

  addList(): void {
    this.router.navigate(['/home/spellinglist', 'new', 'edit']);
  }
}

