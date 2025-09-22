import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'glxg-star',
  templateUrl: './star.component.html',
  standalone: true,
  styleUrls: ['./star.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarComponent {
  @Input() size = 10;
  @Input() color = '#FFD700';
  @Input() left = '0%';
  @Input() top = '0%';
}
