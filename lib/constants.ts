import { EntryCategory, CustomCategory } from './types';

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
};

export const TRAVELER_COLORS = [
  '#F4A7BB',
  '#A8D4E6',
  '#A8D8A8',
  '#C5A8D8',
  '#F4C28C',
  '#E89090',
  '#B8C8A8',
  '#D4A8D8',
];

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
  overheard: { label: 'Overheard', icon: '👂', color: '#D4A8D8' },
  walk: { label: 'Walk', icon: '👣', color: '#B8C8A8' },
  surprise: { label: 'Surprise', icon: '😲', color: '#F4B88C' },
  train: { label: 'Train', icon: '🚆', color: '#A8B8D8' },
  bar: { label: 'Bar', icon: '🎸', color: '#8B6F8E' },
  gachapon: { label: 'Gachapon', icon: '🎰', color: '#E8A0B8' },
  vending: { label: 'Vending', icon: '🥤', color: '#7EBFA8' },
  custom: { label: 'Custom', icon: '📌', color: '#B8C8A8' },
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

export const CUSTOM_COLOR_OPTIONS = [
  '#F4A7BB', '#A8D4E6', '#A8D8A8', '#C5A8D8',
  '#F4C28C', '#E89090', '#B8C8A8', '#7EBFA8',
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
