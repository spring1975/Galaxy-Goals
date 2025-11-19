import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { MAT_CARD_CONFIG } from '@angular/material/card';
import { SENTENCE_SERVICE_CONFIG } from 'src/app/shared/sentence/sentence.service';
import { environment } from '../environments/environment';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { SwActivationService } from './shared/mlc/sw-activation.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:3000'
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (swActivationService: SwActivationService) => () => {
        // Service instantiation triggers initialization
        return Promise.resolve(swActivationService);
      },
      deps: [SwActivationService],
      multi: true
    },
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
    { provide: MAT_CARD_CONFIG, useValue: {
        appearance: 'outlined',
        elevation: '0',
      }
    },
    { provide: SENTENCE_SERVICE_CONFIG, useValue: { autoInit: false } },
  ],
};
