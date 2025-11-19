import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SentenceService } from '../../shared/sentence/sentence.service';
import { MlcPreloadService } from '../../shared/mlc/mlc-preload.service';
import { MlcProgressComponent } from '../../shared/mlc/mlc-progress.component';
import { MlcConfigService } from '../../shared/mlc/mlc-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'glxg-mlc-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatSlideToggleModule,
    MlcProgressComponent
  ],
  template: `
    <div class="mlc-demo-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>psychology</mat-icon>
            WebLLM/MLC Integration Demo
          </mat-card-title>
          <mat-card-subtitle>Self-hosted AI models with service worker caching</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- MLC Configuration Status -->
          <div class="config-status">
            <h4>MLC Configuration</h4>
            <div class="status-row">
              <mat-slide-toggle
                [checked]="mlcConfigService.isEnabled()"
                (change)="toggleMLC($event)">
                MLC Feature
              </mat-slide-toggle>
              @if (mlcConfigService.isEnabled()) {
                <span class="status-badge enabled">
                  <mat-icon>check_circle</mat-icon>
                  Enabled
                </span>
              } @else {
                <span class="status-badge disabled">
                  <mat-icon>cancel</mat-icon>
                  Disabled
                </span>
              }
            </div>
            <p class="info-text">
              @if (mlcConfigService.isEnabled()) {
                MLC models are enabled. This may impact performance on mobile devices.
              } @else {
                MLC is disabled to optimize for mobile devices. Add <code>?mlc=true</code> to the URL to enable.
              }
            </p>
          </div>

          @if (mlcConfigService.isEnabled()) {
            <!-- Preload Progress -->
            @if (!mlcPreloadService.isPreloadComplete()) {
              <glxg-mlc-progress [progress]="mlcPreloadService.preloadProgress" />
            }

            <!-- Model Info -->
            @if (mlcPreloadService.selectedModel(); as selectedModel) {
              <div class="model-info">
                <h4>Selected Model</h4>
                <p><strong>Model:</strong> {{ selectedModel.manifest.model_id }}</p>
                <p><strong>Size:</strong> {{ selectedModel.manifest.total_size }}</p>
                <p><strong>Memory:</strong> {{ selectedModel.manifest.memory_requirements }}</p>
                <p><strong>Optimized for:</strong> {{ selectedModel.manifest.recommended_for }}</p>
              </div>
            }

            <!-- Sentence Service Progress -->
            @if (sentenceService.initProgress() > 0 && !sentenceService.isInitialized()) {
              <div class="init-progress">
                <h4>Engine Initialization</h4>
                <mat-progress-bar
                  mode="determinate"
                  [value]="sentenceService.initProgress()">
                </mat-progress-bar>
                <p class="progress-message">{{ sentenceService.initMessage() }}</p>
              </div>
            }

            <!-- Demo Controls -->
            <div class="demo-controls">
              <button
                mat-raised-button
                color="primary"
                [disabled]="!mlcPreloadService.isPreloadComplete() || sentenceService.isBusy()"
                (click)="initializeLLM()">
                @if (sentenceService.isInitialized()) {
                  <ng-container>
                    <mat-icon>check_circle</mat-icon>
                    Engine Ready
                  </ng-container>
                } @else {
                  <ng-container>
                    <mat-icon>play_arrow</mat-icon>
                    Initialize LLM Engine
                  </ng-container>
                }
              </button>

              <button
                mat-raised-button
                color="accent"
                [disabled]="!sentenceService.isInitialized() || sentenceService.isBusy()"
                (click)="generateSample()">
                @if (sentenceService.isBusy()) {
                  <ng-container>
                    <mat-icon class="spinning">hourglass_empty</mat-icon>
                    Generating...
                  </ng-container>
                } @else {
                  <ng-container>
                    <mat-icon>auto_awesome</mat-icon>
                    Generate Sample
                  </ng-container>
                }
              </button>
            </div>

          <!-- Sample Output -->
          @if (sampleSentence()) {
            <div class="sample-output">
              <h4>Generated Sentence:</h4>
              <p class="sentence">"{{ sampleSentence() }}"</p>
            </div>
          }

          <!-- Performance Metrics -->
          @if (performanceMetrics()) {
            <div class="metrics">
              <h4>Performance</h4>
              <p>Generation time: {{ performanceMetrics()?.generationTime }}ms</p>
              <p>Tokens generated: ~{{ performanceMetrics()?.estimatedTokens }}</p>
              <p>Cache status: {{ performanceMetrics()?.cacheStatus }}</p>
            </div>
          }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .mlc-demo-container {
      max-width: 800px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .config-status, .model-info, .init-progress, .sample-output, .metrics {
      margin: 16px 0;
      padding: 16px;
      background: var(--mat-sys-surface-variant);
      border-radius: 8px;
    }

    .status-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 12px 0;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.875rem;
      font-weight: 500;

      &.enabled {
        background: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
      }

      &.disabled {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .info-text {
      margin-top: 8px;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);

      code {
        background: var(--mat-sys-surface);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
      }
    }

    .demo-controls {
      display: flex;
      gap: 12px;
      margin: 24px 0;
      flex-wrap: wrap;
    }

    .demo-controls button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-message {
      margin-top: 8px;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .sentence {
      font-style: italic;
      font-size: 1.1rem;
      color: var(--mat-sys-primary);
      margin: 8px 0;
    }

    .spinning {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .metrics p {
      margin: 4px 0;
      font-family: monospace;
    }
  `]
})
export class MlcDemoComponent {
  sentenceService = inject(SentenceService);
  mlcPreloadService = inject(MlcPreloadService);
  mlcConfigService = inject(MlcConfigService);
  router = inject(Router);

  sampleSentence = signal<string>('');
  performanceMetrics = signal<{
    generationTime: number;
    estimatedTokens: number;
    cacheStatus: string;
  } | null>(null);

  toggleMLC(event: any): void {
    const enabled = event.checked;
    this.mlcConfigService.setEnabled(enabled);

    if (enabled) {
      // Reload the page to trigger MLC initialization
      window.location.reload();
    }
  }

  async initializeLLM(): Promise<void> {
    try {
      await this.sentenceService.initializeEngine();
    } catch (error) {
      console.error('Failed to initialize LLM:', error);
    }
  }

  async generateSample(): Promise<void> {
    if (!this.sentenceService.isInitialized()) {
      return;
    }

    const startTime = performance.now();
    const sampleWords = ['galaxy', 'rocket', 'adventure', 'exploration', 'discovery'];
    const randomWord = sampleWords[Math.floor(Math.random() * sampleWords.length)] || 'adventure';

    try {
      const sentence = await this.sentenceService.generateSentenceWithBlank(randomWord);
      const endTime = performance.now();
      const generationTime = Math.round(endTime - startTime);

      this.sampleSentence.set(sentence);

      // Estimate tokens (rough approximation)
      const estimatedTokens = Math.ceil(sentence.split(' ').length * 1.3);

      // Check if response came from cache (simplified check)
      const cacheStatus = generationTime < 1000 ? 'Fast (likely cached)' : 'Normal (fresh generation)';

      this.performanceMetrics.set({
        generationTime,
        estimatedTokens,
        cacheStatus
      });

    } catch (error) {
      console.error('Failed to generate sentence:', error);
      this.sampleSentence.set('Error generating sentence');
    }
  }
}
