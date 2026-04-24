import { EntryCategory } from './types';

export const COLORS = {
  background: '#FFF0F5',
  backgroundAlt: '#FFF8F0',
  pink: '#F4A7BB',
  green: '#A8D8A8',
  blue: '#A8D4E6',
  orange: '#F4C28C',
  purple: '#C5A8D8',
  yellow: '#F4E08C',
  red: '#E89090',
  cream: '#FFF8F0',
  text: '#4A3728',
  textLight: '#8B7B6B',
  white: '#FFFFFF',
  border: '#F0E0D6',
  traveler1: '#F4A7BB',
  traveler2: '#A8D4E6',
};

export const CATEGORY_CONFIG: Record<
  EntryCategory,
  { label: string; icon: string; color: string }
> = {
  shrine: { label: 'Shrine', icon: '⛩️', color: '#E89090' },
  food: { label: 'Food', icon: '🍙', color: '#F4C28C' },
  sound: { label: 'Sound', icon: '🎵', color: '#A8D4E6' },
  engrish: { label: 'Engrish', icon: '💬', color: '#C5A8D8' },
  purchase: { label: 'Purchase', icon: '🛍️', color: '#F4E08C' },
  moment: { label: 'Moment', icon: '✨', color: '#F4A7BB' },
  phrase: { label: 'Phrase', icon: 'あ', color: '#A8D8A8' },
  overheard: { label: 'Overheard', icon: '👂', color: '#D4A8D8' },
  walk: { label: 'Walk', icon: '👣', color: '#B8C8A8' },
  surprise: { label: 'Surprise', icon: '😲', color: '#F4B88C' },
};

export const WEATHER_OPTIONS = [
  { label: 'Sunny', icon: '☀️' },
  { label: 'Cloudy', icon: '☁️' },
  { label: 'Rainy', icon: '🌧️' },
  { label: 'Snowy', icon: '❄️' },
  { label: 'Hot', icon: '🥵' },
  { label: 'Perfect', icon: '🌸' },
];

export const USD_PER_YEN = 0.0067;
