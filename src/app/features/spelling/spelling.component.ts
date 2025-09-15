import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { SpellingListsComponent } from './components/spelling-lists.component';
import { SpellingPracticeComponent } from './components/spelling-practice.component';
import { SpellingTestComponent } from './components/spelling-test.component';

@Component({
  selector: 'app-spelling',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    SpellingListsComponent,
    SpellingPracticeComponent,
    SpellingTestComponent,
  ],
  template: `
    <mat-tab-group [selectedIndex]="selectedTab()" (selectedTabChange)="selectedTab.set($event.index)">
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>list</mat-icon>
          Spelling Lists
        </ng-template>
        <app-spelling-lists />
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>play_circle</mat-icon>
          Practice
        </ng-template>
        <app-spelling-practice />
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>quiz</mat-icon>
          Test
        </ng-template>
        <app-spelling-test />
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
    }

    mat-tab-group {
      margin-top: 16px;
    }

    ::ng-deep .mat-mdc-tab-label {
      min-width: 120px !important;
    }

    ::ng-deep .mat-mdc-tab-label-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class SpellingComponent {
  selectedTab = signal(0);
}
