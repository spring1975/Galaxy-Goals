import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MlcConfigService {
  private readonly MLC_STORAGE_KEY = 'mlc-enabled';
  private readonly _isEnabled = signal(false);

  public readonly isEnabled = this._isEnabled.asReadonly();

  constructor(private router: Router) {
    this.initializeFromStorage();
    this.listenToRouteChanges();
  }

  private initializeFromStorage(): void {
    const stored = localStorage.getItem(this.MLC_STORAGE_KEY);
    if (stored !== null) {
      this._isEnabled.set(stored === 'true');
    }
  }

  private listenToRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkQueryParams();
    });

    // Check immediately on initialization
    this.checkQueryParams();
  }

  private checkQueryParams(): void {
    const urlTree = this.router.parseUrl(this.router.url);
    const mlcParam = urlTree.queryParams['mlc'];

    if (mlcParam !== undefined) {
      const enabled = mlcParam === 'true' || mlcParam === '1' || mlcParam === '';
      this.setEnabled(enabled);
    }
  }

  public setEnabled(enabled: boolean): void {
    this._isEnabled.set(enabled);
    localStorage.setItem(this.MLC_STORAGE_KEY, enabled.toString());
    console.log(`MLC feature ${enabled ? 'enabled' : 'disabled'}`);
  }

  public toggle(): void {
    this.setEnabled(!this._isEnabled());
  }
}
