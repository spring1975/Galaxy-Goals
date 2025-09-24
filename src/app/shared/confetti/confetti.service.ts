import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ConfettiBurstComponent } from '../confetti-burst/confetti-burst.component';

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {
  private overlay = inject(Overlay);
  private activeConfettiRef: OverlayRef | undefined;

  /**
   * Triggers a confetti burst at the center of the viewport
   * This appears above all other overlays including dialogs
   */
  triggerBurst(): void {
    // Dispose any existing confetti first
    this.clearBurst();

    // Create overlay positioned at the center of the viewport
    const strategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();

    this.activeConfettiRef = this.overlay.create({
      positionStrategy: strategy,
      hasBackdrop: false,
      panelClass: 'global-confetti-overlay',
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });

    // Attach confetti component to the overlay
    const confettiPortal = new ComponentPortal(ConfettiBurstComponent);
    this.activeConfettiRef.attach(confettiPortal);

    // Auto-dispose after confetti animation completes
    setTimeout(() => {
      this.clearBurst();
    }, 2000);
  }

  /**
   * Manually clear any active confetti
   */
  clearBurst(): void {
    if (this.activeConfettiRef) {
      this.activeConfettiRef.dispose();
      this.activeConfettiRef = undefined;
    }
  }
}
