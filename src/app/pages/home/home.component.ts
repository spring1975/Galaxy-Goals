import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import dayjs from 'dayjs';
import { FromNowPipe } from 'src/app/shared/pipes/from-now.pipe';
@Component({
  selector: 'glxg-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, FromNowPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  spellingLists = [
    { week: 1, title: 'Introduction to Astronomy', words: 10, lastPracticed: dayjs('2023-09-018T19:42:14Z'), percent: 70 },
    { week: 2, title: 'The Solar System', words: 12, lastPracticed: undefined, percent: undefined },
    { week: 3, title: 'Stars and Galaxies', words: 15, lastPracticed: undefined, percent: undefined },
    { week: 4, title: 'Black Holes', words: 8, lastPracticed: undefined, percent: undefined }
  ]

}
