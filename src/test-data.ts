
import { SpellingList } from "@stores/spelling-list.signalstore";
import dayjs from "dayjs";

export const sampleLists: SpellingList[] = [
  {
    id: '1',
    name: 'double letters',
    words: ['apple', 'banana', 'cherry'],
    created: dayjs('2025-09-18T19:42:14Z'),
    lastPracticed: dayjs('2025-09-18T19:42:14Z')
  },
  {
    id: '2',
    name: 'silent e',
    words: ['cake', 'bike', 'like'],
    created: dayjs('2025-09-19T19:42:14Z')
  },
  {
    id: '3',
    name: 'Common Nouns',
    words: ['happiness', 'candidate', 'catholic', 'appetite', 'camera', 'example', 'fantasy', 'banana', 'cabinet', 'navigate'],
    created: dayjs('2025-09-20T19:42:14Z')
  }
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
