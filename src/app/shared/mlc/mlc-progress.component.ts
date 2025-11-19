import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PreloadProgress } from '../mlc/mlc-preload.service';

@Component({
  selector: 'glxg-mlc-progress',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="mlc-progress-card" [class.error]="progress().stage === 'error'" [class.complete]="progress().stage === 'complete'">
      <mat-card-content>
        <div class="progress-header">
          <mat-icon [class.spinning]="progress().stage !== 'complete' && progress().stage !== 'error'">
            @switch (progress().stage) {
              @case ('detecting') { psychology }
              @case ('manifest') { download }
              @case ('shards') { cached }
              @case ('complete') { check_circle }
              @case ('error') { error }
              @default { hourglass_empty }
            }
          </mat-icon>
          <span class="progress-message">{{ progress().message }}</span>
        </div>

        <mat-progress-bar
          mode="determinate"
          [value]="progress().progress"
          [class.error-bar]="progress().stage === 'error'"
          [class.complete-bar]="progress().stage === 'complete'">
        </mat-progress-bar>

        @if (progress().total && progress().loaded) {
          <div class="file-progress">
            {{ progress().loaded }} / {{ progress().total }} files cached
          </div>
        }

        <div class="progress-percentage">
          {{ progress().progress | number:'1.0-0' }}%
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .mlc-progress-card {
      margin: 16px;
      min-width: 300px;
    }

    .progress-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .progress-message {
      font-weight: 500;
      flex: 1;
    }

    .spinning {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .file-progress {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 8px;
    }

    .progress-percentage {
      text-align: right;
      font-size: 0.875rem;
      font-weight: 500;
      margin-top: 4px;
    }

    .error {
      border-left: 4px solid var(--mat-sys-error);
    }

    .complete {
      border-left: 4px solid var(--mat-sys-primary);
    }

    .error-bar {
      --mdc-linear-progress-active-indicator-color: var(--mat-sys-error);
    }

    .complete-bar {
      --mdc-linear-progress-active-indicator-color: var(--mat-sys-primary);
    }

    mat-icon {
      color: var(--mat-sys-primary);
    }

    .error mat-icon {
      color: var(--mat-sys-error);
    }

    .complete mat-icon {
      color: var(--mat-sys-primary);
    }
  `]
})
export class MlcProgressComponent {
  @Input() progress!: () => PreloadProgress;
}
