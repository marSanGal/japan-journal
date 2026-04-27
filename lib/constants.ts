import { differenceInDays, parseISO } from 'date-fns';
import { EntryCategory, CustomCategory, TripConfig } from './types';

export const COLORS = {
  background: '#F5F0E8',
  backgroundAlt: '#EBE4D8',
  primary: '#2C4A5A',
  green: '#8B9E5E',
  blue: '#4A7A8C',
  orange: '#C4956A',
  purple: '#7A6B8A',
  yellow: '#C4A84A',
  red: '#C53D43',
  cream: '#EBE4D8',
  text: '#2B2B2B',
  textLight: '#7A756A',
  white: '#FFFFFF',
  border: '#D4C9B8',
};

export const TRAVELER_COLORS = [
  '#2C4A5A',
  '#8B9E5E',
  '#C53D43',
  '#7A6B8A',
  '#C4956A',
  '#4A7A8C',
  '#A8926A',
  '#5A7A5A',
];

export const CATEGORY_CONFIG: Record<
  EntryCategory,
  { label: string; icon: string; color: string }
> = {
  shrine: { label: 'Shrine', icon: '⛩️', color: '#C53D43' },
  food: { label: 'Food', icon: '🍙', color: '#C4956A' },
  sound: { label: 'Sound', icon: '🎵', color: '#4A7A8C' },
  engrish: { label: 'Engrish', icon: '💬', color: '#7A6B8A' },
  purchase: { label: 'Purchase', icon: '🛍️', color: '#C4A84A' },
  moment: { label: 'Moment', icon: '✨', color: '#2C4A5A' },
  overheard: { label: 'Overheard', icon: '👂', color: '#8A7A9A' },
  walk: { label: 'Walk', icon: '👣', color: '#8B9E5E' },
  surprise: { label: 'Surprise', icon: '😲', color: '#B87A4A' },
  train: { label: 'Train', icon: '🚆', color: '#5A7A8A' },
  bar: { label: 'Bar', icon: '🎸', color: '#6A4A5A' },
  gachapon: { label: 'Gachapon', icon: '🎰', color: '#9A6A7A' },
  vending: { label: 'Vending', icon: '🥤', color: '#5A8A7A' },
  custom: { label: 'Custom', icon: '📌', color: '#8B9E5E' },
};

export const WEATHER_OPTIONS = [
  { label: 'Sunny', icon: '☀️' },
  { label: 'Cloudy', icon: '☁️' },
  { label: 'Rainy', icon: '🌧️' },
  { label: 'Snowy', icon: '❄️' },
  { label: 'Hot', icon: '🥵' },
  { label: 'Perfect', icon: '🌸' },
];

export const GBP_PER_YEN = 0.0050;

export const getTripDays = (config: TripConfig): number => {
  return differenceInDays(parseISO(config.endDate), parseISO(config.startDate)) + 1;
};

export const toDisplayDate = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};

export const toISODate = (display: string): string => {
  if (!display) return '';
  const [d, m, y] = display.split('-');
  return `${y}-${m}-${d}`;
};

export function isValidDisplayDate(str: string): boolean {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(str)) return false;
  const [d, m, y] = str.split('-').map(Number);
  if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return false;
  const test = new Date(y, m - 1, d);
  return test.getDate() === d && test.getMonth() === m - 1 && test.getFullYear() === y;
}

export const CUSTOM_COLOR_OPTIONS = [
  '#2C4A5A', '#8B9E5E', '#C53D43', '#7A6B8A',
  '#C4956A', '#4A7A8C', '#C4A84A', '#5A8A7A',
];

export function getCategoryDisplay(
  category: EntryCategory,
  customCategoryId?: string,
  customCategories?: CustomCategory[]
): { label: string; icon: string; color: string } {
  if (category === 'custom' && customCategoryId && customCategories) {
    const found = customCategories.find((c) => c.id === customCategoryId);
    if (found) return { label: found.label, icon: found.icon, color: found.color };
  }
  return CATEGORY_CONFIG[category];
}

export const getTravelerColor = (
  name: string,
  allNames: string[]
): string => {
  const index = allNames.indexOf(name);
  return TRAVELER_COLORS[index >= 0 ? index % TRAVELER_COLORS.length : 0];
};
