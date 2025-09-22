
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { MAT_CARD_CONFIG } from '@angular/material/card';
import { SENTENCE_SERVICE_CONFIG } from 'src/app/shared/sentence/sentence.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:3000'
    }),
    { provide: MAT_CARD_CONFIG, useValue: {
        appearance: 'outlined',
        elevation: '0',
      }
    },
    { provide: SENTENCE_SERVICE_CONFIG, useValue: {} }
  ]
};
