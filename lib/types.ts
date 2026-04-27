export type EntryCategory =
  | 'shrine'
  | 'food'
  | 'sound'
  | 'engrish'
  | 'purchase'
  | 'moment'
  | 'overheard'
  | 'walk'
  | 'surprise'
  | 'train'
  | 'bar'
  | 'gachapon'
  | 'vending';

export interface Dish {
  name: string;
  rating?: number;
  comment?: string;
}

export interface Song {
  name: string;
  artist?: string;
}

export type BarGenre = 'metal' | 'punk' | 'rock' | 'jazz' | 'electronic' | 'other';

export type TrainType = 'metro' | 'shinkansen' | 'local' | 'other';

export interface TrainInfo {
  fromStation: string;
  toStation: string;
  type: TrainType;
}

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
  stepsCount?: number;
  mood?: string;
  together?: boolean; // deprecated — use participants
  participants?: string[];
  photoUri?: string;
  audioUri?: string;
  hasGoshuin?: boolean;
  goshuinPhotoUri?: string;
  dishes?: Dish[];
  engrishContext?: string;
  trainInfo?: TrainInfo;
  hadLiveMusic?: boolean;
  barGenre?: BarGenre;
  songs?: Song[];
}

export interface DayLog {
  date: string;
  entries: Entry[];
  weather?: string;
  steps?: number;
  totalSpendYen?: number;
  narrative?: string;
  chapterNumber?: number;
  extraPhotos?: string[];
  extraMedia?: ExtraMediaItem[];
  ekiStampCount?: number;
}

export interface ExtraMediaItem {
  uri: string;
  type: 'photo' | 'video';
}

export interface EkiStamp {
  id: string;
  stationName: string;
  date: string;
  photoUri?: string;
  line?: string;
  notes?: string;
}
