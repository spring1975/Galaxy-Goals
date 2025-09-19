import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import dayjs from 'dayjs';
import { FromNowPipe } from 'src/app/shared/pipes/from-now.pipe';

// export interface SpellingListState {
//   week: number;
//   title: string;
//   words: string[];
//   lastPracticed: dayjs.Dayjs | undefined;
//   lastNumberCorrect: number | undefined;
// }

// const sampleLists: SpellingListState[] = [
//     { week: 1, title: 'double letters', words: ['apple', 'banana', 'cherry'], lastPracticed: dayjs('2023-09-18T19:42:14Z'), lastNumberCorrect: 3 },
//     { week: 2, title: 'silent e', words: ['cake', 'bike', 'like'], lastPracticed: undefined, lastNumberCorrect: undefined },
//     { week: 3, title: 'Common Nouns', words: ['happiness', 'candidate', 'catholic', 'appetite', 'camera', 'example', 'fantasy', 'banana', 'cabinet', 'navigate'], lastPracticed: undefined, lastNumberCorrect: undefined },
//   ];

export interface SpellingList {
  week: number;
  title: string;
  wordCount: number;
  lastPracticed: dayjs.Dayjs | undefined;
  percent: number | undefined;
}

@Component({
  selector: 'glxg-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, FromNowPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  spellingLists: SpellingList[] = [
    { week: 1, title: 'double letters', wordCount: 15, lastPracticed: dayjs('2023-09-18T19:42:14Z'), percent: 70 },
    { week: 2, title: 'silent e', wordCount: 3, lastPracticed: undefined, percent: undefined },
    { week: 3, title: 'Common Nouns', wordCount: 10, lastPracticed: undefined, percent: undefined },
  ];
}

