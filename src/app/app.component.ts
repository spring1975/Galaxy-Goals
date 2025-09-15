import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsStore } from './core/state/app-settings.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  host: {
    '[class.theme-light]': 'theme() === "light"',
    '[class.theme-dark]': 'theme() === "dark"'
  }
})
export class AppComponent {
  title = 'galaxy-goals';

  private appSettingsStore = inject(AppSettingsStore);

  theme = this.appSettingsStore.theme;
}
