import { DayLog, TripConfig } from './types';

export interface Award {
  id: string;
  title: string;
  icon: string;
  detail: string;
  value: string;
}

export function computeAwards(
  days: Record<string, DayLog>,
  config: TripConfig
): Award[] {
  const awards: Award[] = [];
  const dayEntries = Object.entries(days).filter(([, d]) => d.entries.length > 0);

  if (dayEntries.length === 0) return awards;

  // Most Active Day
  let maxEntries = 0;
  let maxEntriesDate = '';
  for (const [date, d] of dayEntries) {
    if (d.entries.length > maxEntries) {
      maxEntries = d.entries.length;
      maxEntriesDate = date;
    }
  }
  if (maxEntriesDate) {
    awards.push({
      id: 'most-active-day',
      title: 'Most Active Day',
      icon: '🏃',
      detail: maxEntriesDate,
      value: `${maxEntries} entries`,
    });
  }

  // Best Meal (highest rated dish)
  let bestDish = '';
  let bestDishRating = 0;
  let bestDishLocation = '';
  for (const [, d] of dayEntries) {
    for (const entry of d.entries) {
      if (entry.dishes) {
        for (const dish of entry.dishes) {
          if (dish.rating && dish.rating > bestDishRating) {
            bestDishRating = dish.rating;
            bestDish = dish.name;
            bestDishLocation = entry.location || '';
          }
        }
      }
    }
  }
  if (bestDish) {
    awards.push({
      id: 'best-meal',
      title: 'Best Meal',
      icon: '🍽️',
      detail: bestDishLocation ? `${bestDish} @ ${bestDishLocation}` : bestDish,
      value: '★'.repeat(bestDishRating),
    });
  }

  // Biggest Splurge (single largest purchase)
  let biggestAmount = 0;
  let biggestText = '';
  for (const [, d] of dayEntries) {
    for (const entry of d.entries) {
      if (entry.amountYen && entry.amountYen > biggestAmount) {
        biggestAmount = entry.amountYen;
        biggestText = entry.text;
      }
    }
  }
  if (biggestAmount > 0) {
    awards.push({
      id: 'biggest-splurge',
      title: 'Biggest Splurge',
      icon: '💸',
      detail: biggestText.slice(0, 50),
      value: `¥${biggestAmount.toLocaleString()}`,
    });
  }

  // Top Spender Day
  let maxSpendDay = 0;
  let maxSpendDate = '';
  for (const [date, d] of dayEntries) {
    const spend = d.totalSpendYen || 0;
    if (spend > maxSpendDay) {
      maxSpendDay = spend;
      maxSpendDate = date;
    }
  }
  if (maxSpendDay > 0) {
    awards.push({
      id: 'top-spender-day',
      title: 'Top Spender Day',
      icon: '💴',
      detail: maxSpendDate,
      value: `¥${maxSpendDay.toLocaleString()}`,
    });
  }

  // Most Shrines in One Day
  let maxShrines = 0;
  let maxShrinesDate = '';
  for (const [date, d] of dayEntries) {
    const shrines = d.entries.filter((e) => e.category === 'shrine').length;
    if (shrines > maxShrines) {
      maxShrines = shrines;
      maxShrinesDate = date;
    }
  }
  if (maxShrines > 0) {
    awards.push({
      id: 'most-shrines',
      title: 'Most Shrines in a Day',
      icon: '⛩️',
      detail: maxShrinesDate,
      value: `${maxShrines} shrines`,
    });
  }

  // Most Steps in a Day
  let maxSteps = 0;
  let maxStepsDate = '';
  for (const [date, d] of dayEntries) {
    const daySteps = d.entries.reduce((sum, e) => sum + (e.stepsCount || 0), 0);
    if (daySteps > maxSteps) {
      maxSteps = daySteps;
      maxStepsDate = date;
    }
  }
  if (maxSteps > 0) {
    awards.push({
      id: 'most-steps',
      title: 'Most Steps in a Day',
      icon: '👣',
      detail: maxStepsDate,
      value: `${maxSteps.toLocaleString()} steps`,
    });
  }

  // Longest Chapter
  let longestNarrative = 0;
  let longestChapterDate = '';
  for (const [date, d] of dayEntries) {
    if (d.narrative) {
      const wordCount = d.narrative.split(/\s+/).length;
      if (wordCount > longestNarrative) {
        longestNarrative = wordCount;
        longestChapterDate = date;
      }
    }
  }
  if (longestNarrative > 0) {
    awards.push({
      id: 'longest-chapter',
      title: 'Longest Chapter',
      icon: '📖',
      detail: longestChapterDate,
      value: `${longestNarrative} words`,
    });
  }

  // Weather awards
  const weatherCounts: Record<string, number> = {};
  for (const [, d] of dayEntries) {
    if (d.weather) {
      weatherCounts[d.weather] = (weatherCounts[d.weather] || 0) + 1;
    }
  }
  if (weatherCounts['Rainy']) {
    awards.push({
      id: 'rainy-days',
      title: 'Rain Survivor',
      icon: '🌧️',
      detail: 'Days in the rain',
      value: `${weatherCounts['Rainy']} days`,
    });
  }
  if (weatherCounts['Perfect']) {
    awards.push({
      id: 'perfect-days',
      title: 'Perfect Weather',
      icon: '🌸',
      detail: 'Absolutely perfect days',
      value: `${weatherCounts['Perfect']} days`,
    });
  }

  // Most Photos in a Day
  let maxPhotos = 0;
  let maxPhotosDate = '';
  for (const [date, d] of dayEntries) {
    const photos = d.entries.filter((e) => e.photoUri).length + (d.extraPhotos?.length || 0);
    if (photos > maxPhotos) {
      maxPhotos = photos;
      maxPhotosDate = date;
    }
  }
  if (maxPhotos > 0) {
    awards.push({
      id: 'shutterbug',
      title: 'Shutterbug Day',
      icon: '📸',
      detail: maxPhotosDate,
      value: `${maxPhotos} photos`,
    });
  }

  return awards;
}
