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


export const exportSample = [
  {
    "id": "0gcxyb2x4dsc",
    "name": "silent 'e'",
    "words": [
      "amaze",
      "invite",
      "decide",
      "confuse",
      "include",
      "excuse",
      "combine",
      "suppose",
      "survive",
      "compete"
    ],
    "created": "2025-09-19T23:40:34.264Z"
  },
  {
    "id": "6fv318sytlf",
    "name": "Words Ending in -tion",
    "words": [
      "action",
      "nation",
      "motion",
      "vacation",
      "attention",
      "question",
      "invention",
      "education",
      "location",
      "direction"
    ],
    "created": "2025-09-19T23:42:29.695Z"
  },
  {
    "id": "0nsgt3zkbf9c",
    "name": "Words Ending in -sion",
    "words": [
      "division",
      "decision",
      "collision",
      "television",
      "confusion",
      "explosion",
      "invasion",
      "persuasion",
      "extension",
      "discussion"
    ],
    "created": "2025-09-19T23:42:46.938Z"
  }
];
