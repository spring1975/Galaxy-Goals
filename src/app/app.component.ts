import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StarComponent } from './shared/star/star.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'galaxy-goals';

  stars: Array<{ size: number; color: string; left: string; top: string }> = [];

  private readonly STAR_COLORS: string[] = [
    '#FFD700', // gold
    '#FFFFFF', // white
    '#FFB6FF', // pink
    '#AEEFFF', // blue
    '#FFFACD', // lemon
    '#B0E57C', // green
    '#E1C16E', // bronze
  ];

  constructor() {
    this.generateStars();
    //window.addEventListener('resize', () => this.generateStars());
  }

  generateStars() {
    const starCount = this.getStarCount();
    this.stars = Array.from({ length: starCount }, () => this.randomStar());
  }

  getStarCount(): number {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // More stars for larger screens
    return Math.floor((w * h) / 12000) + 20;
  }

  randomStar() {
    const size = Math.floor(Math.random() * 18) + 12; // 12-30px
    const color = this.STAR_COLORS[Math.floor(Math.random() * this.STAR_COLORS.length)] ?? '#FFD700';
    const left = `${Math.random() * 100}%`;
    const top = `${Math.random() * 100}%`;
    return { size, color, left, top };
  }
}
