export type EntryCategory =
  | 'shrine'
  | 'food'
  | 'sound'
  | 'engrish'
  | 'purchase'
  | 'moment'
  | 'phrase'
  | 'overheard'
  | 'walk'
  | 'surprise';

export interface TripConfig {
  myName: string;
  partners: string[];
  startDate: string;
  totalDays: number;
}

export interface Entry {
  id: string;
  author: string;
  category: EntryCategory;
  text: string;
  timestamp: string;
  location?: string;
  amountYen?: number;
  mood?: string;
  together?: boolean; // deprecated — use participants
  participants?: string[];
  photoUri?: string;
  audioUri?: string;
}

export interface DayLog {
  date: string;
  entries: Entry[];
  weather?: string;
  steps?: number;
  totalSpendYen?: number;
  narrative?: string;
  chapterNumber?: number;
}
