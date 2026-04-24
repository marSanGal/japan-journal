import { DayLog } from './types';
import { GoshuinStamp } from './goshuin';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  check: (ctx: BadgeContext) => boolean;
}

interface BadgeContext {
  totalEntries: number;
  totalDays: number;
  totalPhotos: number;
  totalPurchaseYen: number;
  categories: Record<string, number>;
  shrinesVisited: number;
  mealsLogged: number;
  chaptersWritten: number;
  goshuinCount: number;
  konbiniCount: number;
  totalSteps: number;
  partnersCount: number;
  manholeCount: number;
}

export const BADGES: Badge[] = [
  {
    id: 'first-entry',
    name: 'First Step',
    icon: '👣',
    description: 'Log your first entry',
    check: (ctx) => ctx.totalEntries >= 1,
  },
  {
    id: 'ten-entries',
    name: 'Getting Started',
    icon: '📝',
    description: 'Log 10 entries',
    check: (ctx) => ctx.totalEntries >= 10,
  },
  {
    id: 'fifty-entries',
    name: 'Chronicler',
    icon: '📚',
    description: 'Log 50 entries',
    check: (ctx) => ctx.totalEntries >= 50,
  },
  {
    id: 'hundred-entries',
    name: 'Master Storyteller',
    icon: '🏆',
    description: 'Log 100 entries',
    check: (ctx) => ctx.totalEntries >= 100,
  },
  {
    id: 'first-shrine',
    name: 'Pilgrim',
    icon: '⛩️',
    description: 'Visit your first shrine',
    check: (ctx) => ctx.shrinesVisited >= 1,
  },
  {
    id: 'five-shrines',
    name: 'Temple Runner',
    icon: '🏯',
    description: 'Visit 5 shrines',
    check: (ctx) => ctx.shrinesVisited >= 5,
  },
  {
    id: 'ten-shrines',
    name: 'Shrine Master',
    icon: '🙏',
    description: 'Visit 10 shrines',
    check: (ctx) => ctx.shrinesVisited >= 10,
  },
  {
    id: 'first-meal',
    name: 'Itadakimasu',
    icon: '🍙',
    description: 'Log your first meal',
    check: (ctx) => ctx.mealsLogged >= 1,
  },
  {
    id: 'ten-meals',
    name: 'Foodie',
    icon: '🍜',
    description: 'Log 10 meals',
    check: (ctx) => ctx.mealsLogged >= 10,
  },
  {
    id: 'twenty-meals',
    name: 'Gourmet Explorer',
    icon: '👨‍🍳',
    description: 'Log 20 meals',
    check: (ctx) => ctx.mealsLogged >= 20,
  },
  {
    id: 'big-spender',
    name: 'Big Spender',
    icon: '💸',
    description: 'Spend over ¥50,000',
    check: (ctx) => ctx.totalPurchaseYen >= 50000,
  },
  {
    id: 'mega-spender',
    name: 'Yen Whale',
    icon: '🐋',
    description: 'Spend over ¥200,000',
    check: (ctx) => ctx.totalPurchaseYen >= 200000,
  },
  {
    id: 'photographer',
    name: 'Photographer',
    icon: '📸',
    description: 'Take 10 photos',
    check: (ctx) => ctx.totalPhotos >= 10,
  },
  {
    id: 'photo-pro',
    name: 'Photo Pro',
    icon: '🖼️',
    description: 'Take 50 photos',
    check: (ctx) => ctx.totalPhotos >= 50,
  },
  {
    id: 'first-chapter',
    name: 'Author',
    icon: '✍️',
    description: 'Write your first chapter',
    check: (ctx) => ctx.chaptersWritten >= 1,
  },
  {
    id: 'full-book',
    name: 'Novelist',
    icon: '📖',
    description: 'Write 7+ chapters',
    check: (ctx) => ctx.chaptersWritten >= 7,
  },
  {
    id: 'full-trip',
    name: 'Epic Journey',
    icon: '🗾',
    description: 'Write 21 chapters',
    check: (ctx) => ctx.chaptersWritten >= 21,
  },
  {
    id: 'konbini-five',
    name: 'Konbini Regular',
    icon: '🏪',
    description: 'Check off 5 konbini items',
    check: (ctx) => ctx.konbiniCount >= 5,
  },
  {
    id: 'konbini-all',
    name: 'Konbini Master',
    icon: '🎯',
    description: 'Complete the full konbini bingo',
    check: (ctx) => ctx.konbiniCount >= 25,
  },
  {
    id: 'goshuin-one',
    name: 'Stamp Collector',
    icon: '📜',
    description: 'Collect your first goshuin',
    check: (ctx) => ctx.goshuinCount >= 1,
  },
  {
    id: 'goshuin-five',
    name: 'Goshuin Devotee',
    icon: '🎌',
    description: 'Collect 5 goshuin stamps',
    check: (ctx) => ctx.goshuinCount >= 5,
  },
  {
    id: 'engrish-five',
    name: 'Engrish Spotter',
    icon: '😂',
    description: 'Find 5 funny English signs',
    check: (ctx) => (ctx.categories['engrish'] || 0) >= 5,
  },
  {
    id: 'week-streak',
    name: 'One Week In',
    icon: '📅',
    description: 'Log entries for 7 days',
    check: (ctx) => ctx.totalDays >= 7,
  },
  {
    id: 'two-week-streak',
    name: 'Two Weeks Deep',
    icon: '🗓️',
    description: 'Log entries for 14 days',
    check: (ctx) => ctx.totalDays >= 14,
  },
  {
    id: 'travel-duo',
    name: 'Travel Duo',
    icon: '👫',
    description: 'Travel with a partner',
    check: (ctx) => ctx.partnersCount >= 1,
  },
  {
    id: 'squad',
    name: 'Squad Goals',
    icon: '👥',
    description: 'Travel with 3+ people',
    check: (ctx) => ctx.partnersCount >= 2,
  },
  {
    id: 'manhole-hunter',
    name: 'Manhole Hunter',
    icon: '🔵',
    description: 'Log 3 manhole covers',
    check: (ctx) => ctx.manholeCount >= 3,
  },
  {
    id: 'surprise-five',
    name: 'Wide-Eyed Wanderer',
    icon: '🤯',
    description: 'Log 5 surprises',
    check: (ctx) => (ctx.categories['surprise'] || 0) >= 5,
  },
];

export const computeBadgeContext = (
  days: Record<string, DayLog>,
  goshuinCount: number,
  konbiniCount: number,
  partnersCount: number,
  manholeCount: number
): BadgeContext => {
  let totalEntries = 0;
  let totalPhotos = 0;
  let totalPurchaseYen = 0;
  let chaptersWritten = 0;
  let totalSteps = 0;
  const categories: Record<string, number> = {};

  const daysWithEntries = new Set<string>();

  for (const [dateStr, dayLog] of Object.entries(days)) {
    if (dayLog.entries.length > 0) daysWithEntries.add(dateStr);
    if (dayLog.narrative) chaptersWritten++;
    totalSteps += dayLog.steps || 0;

    for (const entry of dayLog.entries) {
      totalEntries++;
      categories[entry.category] = (categories[entry.category] || 0) + 1;
      if (entry.photoUri) totalPhotos++;
      if (entry.category === 'purchase' && entry.amountYen) {
        totalPurchaseYen += entry.amountYen;
      }
    }
  }

  return {
    totalEntries,
    totalDays: daysWithEntries.size,
    totalPhotos,
    totalPurchaseYen,
    categories,
    shrinesVisited: categories['shrine'] || 0,
    mealsLogged: categories['food'] || 0,
    chaptersWritten,
    goshuinCount,
    konbiniCount,
    totalSteps,
    partnersCount,
    manholeCount,
  };
};

export const getEarnedBadges = (ctx: BadgeContext): Badge[] => {
  return BADGES.filter((b) => b.check(ctx));
};

export const getNextBadges = (ctx: BadgeContext): Badge[] => {
  return BADGES.filter((b) => !b.check(ctx)).slice(0, 5);
};
