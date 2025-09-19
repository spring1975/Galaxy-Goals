import dayjs from "dayjs";

export interface SpellingListState {
  week: number;
  title: string;
  words: string[];
  lastPracticed: dayjs.Dayjs | undefined;
  lastNumberCorrect: number | undefined;
}

export const sampleLists: SpellingListState[] = [
    { week: 1, title: 'double letters', words: ['apple', 'banana', 'cherry'], lastPracticed: dayjs('2023-09-18T19:42:14Z'), lastNumberCorrect: 3 },
    { week: 2, title: 'silent e', words: ['cake', 'bike', 'like'], lastPracticed: undefined, lastNumberCorrect: undefined },
    { week: 3, title: 'Common Nouns', words: ['happiness', 'candidate', 'catholic', 'appetite', 'camera', 'example', 'fantasy', 'banana', 'cabinet', 'navigate'], lastPracticed: undefined, lastNumberCorrect: undefined },
  ];
