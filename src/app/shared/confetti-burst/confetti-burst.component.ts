// confetti-burst.component.ts
import { Component, Input, signal} from '@angular/core';
import { timer, Subscription } from 'rxjs';

type Particle = {
  src: string;
  sizePx: number;
  // CSS custom props for animation
  style: { [k: string]: string | number };
};

@Component({
  selector: 'glxg-confetti-burst',
  standalone: true,
  templateUrl: './confetti-burst.component.html',
  styleUrls: ['./confetti-burst.component.scss'],
})
export class ConfettiBurstComponent {
  private confettiSub?: Subscription;
  /** Paths (or data URLs) to star svg */
  @Input() smallSrc = 'assets/star.svg';

  /** How many of each size to spawn on a burst */
  @Input() tinyCount = 22;
  @Input() smallCount = 14;

  /** Pixel sizes for each */
  @Input() tinySize = 7;
  @Input() smallSize = 17;

  /** Max throw distance in pixels (randomized per particle) */
  @Input() radiusPx = 200;

  /** Toggle this to create a one-shot burst (or call burst()) */
  active = signal(false);

  particles = signal<Particle[]>([]);

  /** Programmatic trigger */
  burst() {
    // flip off then on to restart animations
  this.active.update(() => false);
    // build particles
    const parts: Particle[] = [
      ...this.buildParticles(this.smallSrc, this.tinyCount, this.tinySize),
      ...this.buildParticles(this.smallSrc, this.smallCount, this.smallSize),
    ];
  this.particles.update(() => parts);

    // next frame turn on
  requestAnimationFrame(() => this.active.update(() => true));

    // auto-clear after the longest duration
    const longest = Math.max(...parts.map(p => Number(p.style['--dur'] || 1.1))) * 1000 + 200;
    this.confettiSub?.unsubscribe();
    this.confettiSub = timer(longest).subscribe(() => this.active.update(() => false));
  }

  /** If you prefer binding [active] from parent, watch and rebuild */
  constructor() {
    // optional: example autospawn on init
    timer(50).subscribe(() => this.burst());
  }

  private buildParticles(src: string, count: number, sizePx: number): Particle[] {
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;          // 0..360°
      // Bias a bit upward so it feels celebratory
      const upwardBias = -Math.PI / 8 + (Math.random() - 0.5) * (Math.PI / 6);
      const a = angle * 0.65 + upwardBias;

      const distance = (0.35 + Math.random() * 0.65) * this.radiusPx; // 35%..100%
      const tx = Math.cos(a) * distance;
      const ty = Math.sin(a) * distance;

      const rot = (Math.random() * 720 - 360);            // -360°..+360°
      const dur = 0.8 + Math.random() * 0.7;              // 0.8s..1.5s
      const delay = Math.random() * 0.05;                 // small staggering

      arr.push({
        src,
        sizePx,
        style: {
          '--tx': Math.round(tx),
          '--ty': Math.round(ty),
          '--rot': Math.round(rot),
          '--dur': +dur.toFixed(2),
          '--delay': +delay.toFixed(2),
        }
      });
    }
    return arr;
  }
}
