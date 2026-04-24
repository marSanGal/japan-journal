import { Entry, DayLog } from './types';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  day: number;
}

const generators: Record<string, (e: Entry, day: number) => Flashcard | null> = {
  shrine: (e, day) => ({
    id: e.id,
    question: `What shrine/temple did ${e.author} visit on Day ${day}?`,
    answer: e.text + (e.location ? ` (${e.location})` : ''),
    category: 'shrine',
    day,
  }),
  food: (e, day) => ({
    id: e.id,
    question: `What did ${e.author} eat on Day ${day}${e.location ? ` in ${e.location}` : ''}?`,
    answer: e.text,
    category: 'food',
    day,
  }),
  purchase: (e, day) => ({
    id: e.id,
    question: `What did ${e.author} buy on Day ${day}${e.amountYen ? ` for ¥${e.amountYen}` : ''}?`,
    answer: e.text + (e.location ? ` @ ${e.location}` : ''),
    category: 'purchase',
    day,
  }),
  surprise: (e, day) => ({
    id: e.id,
    question: `What surprised ${e.author} on Day ${day}?`,
    answer: e.text,
    category: 'surprise',
    day,
  }),
  moment: (e, day) => ({
    id: e.id,
    question: `What special moment happened on Day ${day}?`,
    answer: e.text + (e.location ? ` (${e.location})` : ''),
    category: 'moment',
    day,
  }),
  engrish: (e, day) => ({
    id: e.id,
    question: `What funny English did ${e.author} find on Day ${day}?`,
    answer: e.text + (e.location ? ` (${e.location})` : ''),
    category: 'engrish',
    day,
  }),
  walk: (e, day) => ({
    id: e.id,
    question: `Where did ${e.author} walk on Day ${day}?`,
    answer: e.text + (e.location ? ` (${e.location})` : ''),
    category: 'walk',
    day,
  }),
};

export const generateFlashcards = (
  days: Record<string, DayLog>,
  startDate: string
): Flashcard[] => {
  const cards: Flashcard[] = [];
  const start = new Date(startDate).getTime();

  for (const [dateStr, dayLog] of Object.entries(days)) {
    const day =
      Math.floor(
        (new Date(dateStr).getTime() - start) / (1000 * 60 * 60 * 24)
      ) + 1;

    for (const entry of dayLog.entries) {
      const gen = generators[entry.category];
      if (gen) {
        const card = gen(entry, day);
        if (card) cards.push(card);
      }
    }
  }

  return cards.sort(() => Math.random() - 0.5);
};

export const generatePhraseCards = (
  days: Record<string, DayLog>,
  startDate: string
): Flashcard[] => {
  const cards: Flashcard[] = [];
  const start = new Date(startDate).getTime();

  for (const [dateStr, dayLog] of Object.entries(days)) {
    const day =
      Math.floor(
        (new Date(dateStr).getTime() - start) / (1000 * 60 * 60 * 24)
      ) + 1;

    for (const entry of dayLog.entries) {
      if (entry.category === 'phrase') {
        cards.push({
          id: entry.id,
          question: `What does this mean / how do you say: "${entry.text}"?`,
          answer: entry.text + (entry.location ? ` — learned at ${entry.location}` : ''),
          category: 'phrase',
          day,
        });
      }
    }
  }

  return cards;
};

export const exportAnkiDeck = (cards: Flashcard[]): string => {
  const header = '#separator:tab\n#html:false\n#columns:front\tback\ttags\n';
  const rows = cards
    .map(
      (c) =>
        `${c.question}\t${c.answer}\tjapan-journal day${c.day} ${c.category}`
    )
    .join('\n');
  return header + rows;
};
