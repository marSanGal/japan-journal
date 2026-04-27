import { Entry, DayLog, CustomCategory, PostcardStyle } from './types';
import { CATEGORY_CONFIG, getCategoryDisplay, WEATHER_OPTIONS } from './constants';

// ─── Utilities ───────────────────────────────────────────────

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const safeUri = (uri: string): string =>
  uri.replace(/'/g, "\\'").replace(/\)/g, '\\)');

const pickQuote = (narrative: string): string => {
  const sentences = narrative
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 150);
  if (sentences.length === 0) return narrative.slice(0, 120) + '…';
  return sentences[Math.floor(Math.random() * sentences.length)] + '.';
};

const pickBestPhoto = (entries: Entry[]): string | null => {
  const withPhotos = entries.filter((e) => e.photoUri);
  if (withPhotos.length === 0) return null;
  const shrine = withPhotos.find((e) => e.category === 'shrine');
  const food = withPhotos.find((e) => e.category === 'food');
  const moment = withPhotos.find((e) => e.category === 'moment');
  return (shrine || food || moment || withPhotos[0]).photoUri!;
};

const weatherIcon = (weather: string): string => {
  const found = WEATHER_OPTIONS.find((w) => w.label === weather);
  return found ? found.icon : '🌤';
};

// ─── Shared Enrichment Helpers ───────────────────────────────

const collectAllPhotos = (dayLog: DayLog): string[] => {
  const photos: string[] = [];
  const priority = ['shrine', 'food', 'moment'];
  const sorted = [...dayLog.entries].sort((a, b) => {
    const ai = priority.indexOf(a.category);
    const bi = priority.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  for (const e of sorted) {
    if (e.photoUri) photos.push(e.photoUri);
    if (e.goshuinPhotoUri) photos.push(e.goshuinPhotoUri);
  }
  if (dayLog.extraPhotos) photos.push(...dayLog.extraPhotos);
  if (dayLog.extraMedia) {
    for (const m of dayLog.extraMedia) {
      if (m.type === 'photo') photos.push(m.uri);
    }
  }
  return [...new Set(photos)];
};

const buildStatsStrip = (dayLog: DayLog): string => {
  const parts: string[] = [];
  if (dayLog.weather) parts.push(`${weatherIcon(dayLog.weather)} ${dayLog.weather}`);
  if (dayLog.steps) parts.push(`🚶 ${dayLog.steps.toLocaleString()} steps`);
  if (dayLog.totalSpendYen) parts.push(`💴 ¥${dayLog.totalSpendYen.toLocaleString()}`);
  const cats: Record<string, number> = {};
  for (const e of dayLog.entries) cats[e.category] = (cats[e.category] || 0) + 1;
  if (cats.shrine) parts.push(`⛩️ ${cats.shrine} shrine${cats.shrine > 1 ? 's' : ''}`);
  if (cats.food) parts.push(`🍙 ${cats.food} meal${cats.food > 1 ? 's' : ''}`);
  if (dayLog.ekiStampCount) parts.push(`🎫 ${dayLog.ekiStampCount} eki stamp${dayLog.ekiStampCount > 1 ? 's' : ''}`);
  if (parts.length === 0) return '';
  return `<div class="stats-strip">${parts.join('<span class="stat-sep"> · </span>')}</div>`;
};

const buildLocationTags = (dayLog: DayLog): string => {
  const locs = [...new Set(
    dayLog.entries.map((e) => e.location).filter((l): l is string => !!l && l.trim().length > 0),
  )];
  if (locs.length === 0) return '';
  return `<div class="location-tags">📍 ${locs.map((l) => `<span class="loc-pill">${escapeHtml(l)}</span>`).join('')}</div>`;
};

const buildTrainRoute = (dayLog: DayLog): string => {
  const trains = dayLog.entries.filter((e) => e.trainInfo);
  if (trains.length === 0) return '';
  const icons: Record<string, string> = { shinkansen: '🚅', metro: '🚇', local: '🚃', other: '🚆' };
  let html = '';
  let last = '';
  for (const e of trains) {
    const t = e.trainInfo!;
    if (t.fromStation !== last) {
      if (html) html += ' ';
      html += `<span class="rt-station">${escapeHtml(t.fromStation)}</span>`;
    }
    html += ` <span class="rt-arrow">──${icons[t.type] || '🚆'}──▸</span> `;
    html += `<span class="rt-station">${escapeHtml(t.toStation)}</span>`;
    last = t.toStation;
  }
  return `<div class="train-route">${html}</div>`;
};

const buildFoodHighlights = (dayLog: DayLog): string => {
  const dishes = dayLog.entries
    .filter((e) => e.category === 'food' && e.dishes?.length)
    .flatMap((e) => e.dishes!);
  if (dishes.length === 0) return '';
  const html = dishes.slice(0, 5).map((d) => {
    const stars = d.rating
      ? '★'.repeat(d.rating) + '☆'.repeat(Math.max(0, 5 - d.rating))
      : '';
    const comment = d.comment
      ? `<span class="fd-comment"> — "${escapeHtml(d.comment)}"</span>`
      : '';
    return `<div class="fd-item"><span class="fd-name">${escapeHtml(d.name)}</span>${stars ? `<span class="fd-stars">${stars}</span>` : ''}${comment}</div>`;
  }).join('');
  return `<div class="food-section">${html}</div>`;
};

const buildSoundtrack = (dayLog: DayLog): string => {
  const songs = dayLog.entries.flatMap((e) => e.songs || []);
  if (songs.length === 0) return '';
  const list = songs.slice(0, 4).map((s) =>
    s.artist ? `"${escapeHtml(s.name)}" by ${escapeHtml(s.artist)}` : `"${escapeHtml(s.name)}"`,
  ).join(' · ');
  return `<div class="soundtrack">🎵 ${list}</div>`;
};

// ─── Base CSS (shared across all styles) ─────────────────────

const BASE_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Georgia', serif;
  background: #F5F0E8;
  width: 1080px;
  height: 1920px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.brand {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #7A6B8A;
  letter-spacing: 2px;
}
.stats-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
  padding: 18px 40px;
  background: #2C4A5A;
  justify-content: center;
  align-items: center;
  color: #E8E0D0;
  font-size: 20px;
}
.stat-sep { opacity: 0.4; }
.location-tags {
  padding: 14px 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 18px;
  color: #7A756A;
}
.loc-pill {
  background: #D4C9B8;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 17px;
  color: #2B2B2B;
}
.train-route {
  padding: 18px 40px;
  text-align: center;
  font-size: 20px;
  color: #2B2B2B;
  background: #E8E0D0;
  line-height: 2;
}
.rt-station { font-weight: bold; color: #2C4A5A; }
.rt-arrow { color: #7A756A; font-size: 16px; }
.food-section { padding: 16px 40px; }
.fd-item {
  padding: 8px 0;
  border-bottom: 1px solid #D4C9B8;
  font-size: 22px;
  color: #2B2B2B;
}
.fd-item:last-child { border-bottom: none; }
.fd-name { font-weight: bold; margin-right: 10px; }
.fd-stars { color: #C4A84A; font-size: 20px; }
.fd-comment { font-size: 18px; color: #7A756A; font-style: italic; }
.soundtrack {
  padding: 14px 40px;
  font-size: 20px;
  color: #7A756A;
  font-style: italic;
  text-align: center;
  background: #E8E0D0;
}
.chapter {
  font-size: 28px;
  opacity: 0.8;
  margin-bottom: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
}
.date-label {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 8px;
}
.names { font-size: 24px; opacity: 0.7; }
.quote-section {
  padding: 40px 50px;
  background: #EBE4D8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top: 4px solid #2C4A5A;
}
.quote {
  font-style: italic;
  font-size: 34px;
  line-height: 1.6;
  color: #2B2B2B;
  margin-bottom: 20px;
}
.highlights {
  font-size: 20px;
  color: #7A756A;
  line-height: 1.8;
}
`;

// ─── Classic Style ───────────────────────────────────────────

const CLASSIC_CSS = `
.photo-hero {
  flex: 1;
  position: relative;
  background-size: cover;
  background-position: center;
}
.photo-hero.no-photo { background: #2C4A5A; }
.hero-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 60px 50px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}
`;

function buildClassicBody(
  dayLog: DayLog, chapterNumber: number, dateLabel: string,
  travelers: string[], customCategories?: CustomCategory[],
): string {
  const photo = pickBestPhoto(dayLog.entries);
  const quote = dayLog.narrative ? pickQuote(dayLog.narrative) : '';
  const names = travelers.join(' & ');
  const entryHighlights = dayLog.entries
    .slice(0, 5)
    .map((e) => `${getCategoryDisplay(e.category, e.customCategoryId, customCategories).icon} ${e.text.slice(0, 50)}`)
    .join(' · ');
  const photoBg = photo ? `background-image: url('${safeUri(photo)}');` : '';

  return `
  <div class="photo-hero${photo ? '' : ' no-photo'}" style="${photoBg}">
    <div class="hero-overlay">
      <div class="chapter">Chapter ${chapterNumber}</div>
      <div class="date-label">${dateLabel}</div>
      <div class="names">${escapeHtml(names)}</div>
    </div>
  </div>
  ${buildStatsStrip(dayLog)}
  <div class="quote-section">
    ${quote ? `<div class="quote">"${escapeHtml(quote)}"</div>` : ''}
    <div class="highlights">${escapeHtml(entryHighlights)}</div>
  </div>
  ${buildTrainRoute(dayLog)}
  ${buildFoodHighlights(dayLog)}
  ${buildSoundtrack(dayLog)}
  ${buildLocationTags(dayLog)}
  <div class="brand">🖌️ Japan Journal</div>`;
}

// ─── Collage Style ───────────────────────────────────────────

const COLLAGE_CSS = `
.collage-hero {
  height: 900px;
  position: relative;
}
.collage-grid {
  display: grid;
  width: 100%;
  height: 100%;
  gap: 4px;
}
.collage-grid.g1 { grid-template-columns: 1fr; }
.collage-grid.g2 { grid-template-columns: 1fr 1fr; }
.collage-grid.g3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.collage-grid.g3 .c-cell:first-child { grid-row: 1 / 3; }
.collage-grid.g4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.c-cell {
  background-size: cover;
  background-position: center;
  position: relative;
}
.c-badge {
  position: absolute;
  bottom: 12px; right: 12px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 18px;
}
.collage-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 50px;
  background: linear-gradient(transparent 0%, rgba(0,0,0,0.65) 100%);
  color: white;
}
.collage-quote { flex: 1; }
`;

function buildCollageBody(
  dayLog: DayLog, chapterNumber: number, dateLabel: string,
  travelers: string[], customCategories?: CustomCategory[],
): string {
  const photos = collectAllPhotos(dayLog);
  const quote = dayLog.narrative ? pickQuote(dayLog.narrative) : '';
  const names = travelers.join(' & ');
  const displayCount = Math.min(photos.length, 4);
  const gridClass = `g${Math.max(displayCount, 1)}`;
  const extra = photos.length - 4;

  let gridHtml = '';
  if (photos.length === 0) {
    gridHtml = '<div class="c-cell" style="background: #2C4A5A;"></div>';
  } else {
    for (let i = 0; i < displayCount; i++) {
      const badge = (i === displayCount - 1 && extra > 0)
        ? `<div class="c-badge">+${extra}</div>` : '';
      gridHtml += `<div class="c-cell" style="background-image: url('${safeUri(photos[i])}');">${badge}</div>`;
    }
  }

  const entryHighlights = dayLog.entries
    .slice(0, 5)
    .map((e) => `${getCategoryDisplay(e.category, e.customCategoryId, customCategories).icon} ${e.text.slice(0, 50)}`)
    .join(' · ');

  return `
  <div class="collage-hero">
    <div class="collage-grid ${gridClass}">
      ${gridHtml}
    </div>
    <div class="collage-overlay">
      <div class="chapter">Chapter ${chapterNumber}</div>
      <div class="date-label">${dateLabel}</div>
      <div class="names">${escapeHtml(names)}</div>
    </div>
  </div>
  ${buildStatsStrip(dayLog)}
  <div class="quote-section collage-quote">
    ${quote ? `<div class="quote">"${escapeHtml(quote)}"</div>` : ''}
    <div class="highlights">${escapeHtml(entryHighlights)}</div>
  </div>
  ${buildLocationTags(dayLog)}
  <div class="brand">🖌️ Japan Journal</div>`;
}

// ─── Timeline Style ──────────────────────────────────────────

const TIMELINE_CSS = `
.tl-header {
  padding: 40px 50px 30px;
  background: #2C4A5A;
  color: white;
}
.tl-header .chapter {
  font-size: 22px;
  opacity: 0.8;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.tl-header .date-label {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 4px;
}
.tl-header .names {
  font-size: 20px;
  opacity: 0.7;
}
.tl-body {
  flex: 1;
  padding: 30px 40px 10px;
  position: relative;
  overflow: hidden;
}
.tl-line {
  position: absolute;
  left: 122px;
  top: 30px;
  bottom: 0;
  width: 3px;
  background: #D4C9B8;
}
.tl-entry {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
}
.tl-time {
  width: 80px;
  text-align: right;
  font-size: 19px;
  color: #7A756A;
  padding-top: 6px;
  flex-shrink: 0;
}
.tl-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #EBE4D8;
  border: 3px solid #2C4A5A;
  flex-shrink: 0;
  margin: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  z-index: 1;
}
.tl-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.tl-text-wrap { flex: 1; }
.tl-cat {
  font-size: 14px;
  color: #7A756A;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.tl-text {
  font-size: 19px;
  color: #2B2B2B;
  line-height: 1.4;
}
.tl-thumb {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
`;

function buildTimelineBody(
  dayLog: DayLog, chapterNumber: number, dateLabel: string,
  travelers: string[], customCategories?: CustomCategory[],
): string {
  const names = travelers.join(' & ');
  const sorted = [...dayLog.entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const entries = sorted.slice(0, 8);

  const entriesHtml = entries.map((e) => {
    const timePart = e.timestamp.includes('T') ? e.timestamp.split('T')[1] : '';
    const timeStr = timePart ? timePart.slice(0, 5) : '';
    const { icon, label } = getCategoryDisplay(e.category, e.customCategoryId, customCategories);
    const thumb = e.photoUri
      ? `<div class="tl-thumb" style="background-image: url('${safeUri(e.photoUri)}');"></div>`
      : '';
    return `
    <div class="tl-entry">
      <div class="tl-time">${timeStr}</div>
      <div class="tl-dot">${icon}</div>
      <div class="tl-content">
        <div class="tl-text-wrap">
          <div class="tl-cat">${escapeHtml(label)}</div>
          <div class="tl-text">${escapeHtml(e.text.slice(0, 80))}</div>
        </div>
        ${thumb}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="tl-header">
    <div class="chapter">Chapter ${chapterNumber}</div>
    <div class="date-label">${dateLabel}</div>
    <div class="names">${escapeHtml(names)}</div>
  </div>
  <div class="tl-body">
    <div class="tl-line"></div>
    ${entriesHtml}
  </div>
  ${buildStatsStrip(dayLog)}
  ${buildLocationTags(dayLog)}
  <div class="brand">🖌️ Japan Journal</div>`;
}

// ─── Foodie Style ────────────────────────────────────────────

const FOODIE_CSS = `
.foodie-hero {
  height: 600px;
  position: relative;
}
.foodie-grid {
  display: grid;
  width: 100%;
  height: 100%;
  gap: 4px;
}
.foodie-grid.fg1 { grid-template-columns: 1fr; }
.foodie-grid.fg2 { grid-template-columns: 1fr 1fr; }
.foodie-grid.fg3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.foodie-grid.fg3 .f-cell:first-child { grid-row: 1 / 3; }
.foodie-grid.fg4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.f-cell {
  background-size: cover;
  background-position: center;
}
.foodie-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 40px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}
.foodie-title {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 4px;
}
.foodie-sub {
  font-size: 20px;
  opacity: 0.8;
}
.best-meal {
  padding: 30px 40px;
  background: #2C4A5A;
  color: white;
  text-align: center;
}
.best-meal-label {
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 3px;
  opacity: 0.7;
  margin-bottom: 8px;
}
.best-meal-name {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 6px;
}
.best-meal-stars { font-size: 28px; color: #C4A84A; }
.food-spend {
  text-align: center;
  padding: 14px;
  font-size: 22px;
  color: #7A756A;
  background: #EBE4D8;
}
.other-highlights {
  padding: 14px 40px;
  font-size: 18px;
  color: #7A756A;
  line-height: 1.8;
}
.foodie-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
`;

function buildFoodieBody(
  dayLog: DayLog, chapterNumber: number, dateLabel: string,
  travelers: string[], customCategories?: CustomCategory[],
): string {
  const names = travelers.join(' & ');
  const foodPhotos = dayLog.entries
    .filter((e) => e.category === 'food' && e.photoUri)
    .map((e) => e.photoUri!);
  const displayPhotos = (foodPhotos.length > 0 ? foodPhotos : collectAllPhotos(dayLog)).slice(0, 4);
  const gridClass = `fg${Math.max(displayPhotos.length, 1)}`;

  let gridHtml = '';
  if (displayPhotos.length === 0) {
    gridHtml = '<div class="f-cell" style="background: #C4956A;"></div>';
  } else {
    gridHtml = displayPhotos.map((p) =>
      `<div class="f-cell" style="background-image: url('${safeUri(p)}');"></div>`,
    ).join('');
  }

  const allDishes = dayLog.entries
    .filter((e) => e.category === 'food' && e.dishes?.length)
    .flatMap((e) => e.dishes!);
  const bestDish = [...allDishes].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

  let bestMealHtml = '';
  if (bestDish) {
    const stars = bestDish.rating
      ? '★'.repeat(bestDish.rating) + '☆'.repeat(Math.max(0, 5 - bestDish.rating))
      : '';
    bestMealHtml = `
    <div class="best-meal">
      <div class="best-meal-label">Best Meal</div>
      <div class="best-meal-name">${escapeHtml(bestDish.name)}</div>
      ${stars ? `<div class="best-meal-stars">${stars}</div>` : ''}
    </div>`;
  }

  const foodSpend = dayLog.entries
    .filter((e) => e.category === 'food' && e.amountYen)
    .reduce((sum, e) => sum + (e.amountYen || 0), 0);
  const spendHtml = foodSpend > 0
    ? `<div class="food-spend">💴 Today's food: ¥${foodSpend.toLocaleString()}</div>`
    : '';

  const otherEntries = dayLog.entries.filter((e) => e.category !== 'food');
  const otherHighlights = otherEntries.slice(0, 3).map((e) =>
    `${getCategoryDisplay(e.category, e.customCategoryId, customCategories).icon} ${e.text.slice(0, 40)}`,
  ).join(' · ');

  const mealCount = dayLog.entries.filter((e) => e.category === 'food').length;

  return `
  <div class="foodie-hero">
    <div class="foodie-grid ${gridClass}">
      ${gridHtml}
    </div>
    <div class="foodie-overlay">
      <div class="foodie-title">${dateLabel}</div>
      <div class="foodie-sub">Chapter ${chapterNumber} · ${escapeHtml(names)} · ${mealCount} meal${mealCount !== 1 ? 's' : ''}</div>
    </div>
  </div>
  <div class="foodie-body">
    ${bestMealHtml}
    ${buildFoodHighlights(dayLog)}
    ${spendHtml}
    ${otherHighlights ? `<div class="other-highlights">${escapeHtml(otherHighlights)}</div>` : ''}
    ${buildSoundtrack(dayLog)}
  </div>
  <div class="brand">🖌️ Japan Journal</div>`;
}

// ─── Explorer Style ──────────────────────────────────────────

const EXPLORER_CSS = `
.exp-header {
  padding: 40px 50px;
  background: #2C4A5A;
  color: white;
}
.exp-header .chapter {
  font-size: 22px;
  opacity: 0.8;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.exp-header .date-label {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 4px;
}
.exp-header .names {
  font-size: 20px;
  opacity: 0.7;
}
.exp-big-stats {
  display: flex;
  padding: 30px 40px;
  background: #EBE4D8;
  justify-content: space-around;
  border-bottom: 3px solid #D4C9B8;
}
.exp-stat { text-align: center; }
.exp-stat-num {
  font-size: 48px;
  font-weight: bold;
  color: #2C4A5A;
}
.exp-stat-label {
  font-size: 16px;
  color: #7A756A;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 4px;
}
.exp-photos {
  display: flex;
  height: 280px;
  gap: 4px;
  overflow: hidden;
}
.exp-photo {
  flex: 1;
  background-size: cover;
  background-position: center;
}
.exp-highlights {
  flex: 1;
  padding: 20px 40px;
  overflow: hidden;
}
.exp-entry {
  padding: 8px 0;
  border-bottom: 1px solid #D4C9B8;
  font-size: 20px;
  color: #2B2B2B;
}
.exp-entry:last-child { border-bottom: none; }
.exp-entry-loc {
  font-size: 14px;
  color: #7A756A;
  margin-left: 8px;
}
`;

function buildExplorerBody(
  dayLog: DayLog, chapterNumber: number, dateLabel: string,
  travelers: string[], customCategories?: CustomCategory[],
): string {
  const names = travelers.join(' & ');
  const photos = collectAllPhotos(dayLog);

  const stats: { num: string; label: string }[] = [];
  if (dayLog.steps) stats.push({ num: dayLog.steps.toLocaleString(), label: 'Steps' });
  const shrineCount = dayLog.entries.filter((e) => e.category === 'shrine').length;
  if (shrineCount) stats.push({ num: String(shrineCount), label: shrineCount > 1 ? 'Shrines' : 'Shrine' });
  const trainCount = dayLog.entries.filter((e) => e.trainInfo).length;
  if (trainCount) stats.push({ num: String(trainCount), label: trainCount > 1 ? 'Trains' : 'Train' });
  const locations = [...new Set(dayLog.entries.map((e) => e.location).filter(Boolean))];
  if (locations.length) stats.push({ num: String(locations.length), label: 'Places' });
  if (dayLog.totalSpendYen) stats.push({ num: `¥${dayLog.totalSpendYen.toLocaleString()}`, label: 'Spent' });
  if (stats.length === 0) stats.push({ num: String(dayLog.entries.length), label: 'Entries' });

  const statsHtml = stats.slice(0, 4).map((s) =>
    `<div class="exp-stat"><div class="exp-stat-num">${s.num}</div><div class="exp-stat-label">${s.label}</div></div>`,
  ).join('');

  const stripPhotos = photos.slice(0, 4);
  const photoStripHtml = stripPhotos.length > 0
    ? `<div class="exp-photos">${stripPhotos.map((p) => `<div class="exp-photo" style="background-image: url('${safeUri(p)}');"></div>`).join('')}</div>`
    : '';

  const entryHtml = dayLog.entries.slice(0, 6).map((e) => {
    const { icon } = getCategoryDisplay(e.category, e.customCategoryId, customCategories);
    const loc = e.location ? `<span class="exp-entry-loc">${escapeHtml(e.location)}</span>` : '';
    return `<div class="exp-entry">${icon} ${escapeHtml(e.text.slice(0, 60))} ${loc}</div>`;
  }).join('');

  return `
  <div class="exp-header">
    <div class="chapter">Chapter ${chapterNumber}</div>
    <div class="date-label">${dateLabel}</div>
    <div class="names">${escapeHtml(names)}</div>
  </div>
  ${buildTrainRoute(dayLog)}
  <div class="exp-big-stats">${statsHtml}</div>
  ${photoStripHtml}
  ${buildLocationTags(dayLog)}
  <div class="exp-highlights">${entryHtml}</div>
  <div class="brand">🖌️ Japan Journal</div>`;
}

// ─── Style Dispatch ──────────────────────────────────────────

const STYLE_CSS: Record<PostcardStyle, string> = {
  classic: CLASSIC_CSS,
  collage: COLLAGE_CSS,
  timeline: TIMELINE_CSS,
  foodie: FOODIE_CSS,
  explorer: EXPLORER_CSS,
};

type BuilderFn = (
  dayLog: DayLog, chapterNumber: number, dateLabel: string,
  travelers: string[], customCategories?: CustomCategory[],
) => string;

const STYLE_BUILDERS: Record<PostcardStyle, BuilderFn> = {
  classic: buildClassicBody,
  collage: buildCollageBody,
  timeline: buildTimelineBody,
  foodie: buildFoodieBody,
  explorer: buildExplorerBody,
};

// ─── Public API ──────────────────────────────────────────────

export const buildPostcardHtml = (
  dayLog: DayLog,
  chapterNumber: number,
  dateLabel: string,
  travelers: string[],
  style: PostcardStyle = 'classic',
  customCategories?: CustomCategory[],
): string => {
  const bodyHtml = STYLE_BUILDERS[style](dayLog, chapterNumber, dateLabel, travelers, customCategories);
  const css = BASE_CSS + STYLE_CSS[style];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${css}</style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
};

export const buildPostcardPreviewHtml = (
  dayLog: DayLog,
  chapterNumber: number,
  dateLabel: string,
  travelers: string[],
  previewWidth: number,
  style: PostcardStyle = 'classic',
  customCategories?: CustomCategory[],
): string => {
  const bodyHtml = STYLE_BUILDERS[style](dayLog, chapterNumber, dateLabel, travelers, customCategories);
  const css = BASE_CSS + STYLE_CSS[style];
  const scale = previewWidth / 1080;
  const previewHeight = Math.round(1920 * scale);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${previewWidth}, initial-scale=1, user-scalable=no">
<style>
  ${css}
  html, body {
    margin: 0; padding: 0;
    width: ${previewWidth}px;
    height: ${previewHeight}px;
    overflow: hidden;
    background: #F5F0E8;
    display: block;
  }
  .scale-wrapper {
    width: 1080px;
    height: 1920px;
    transform: scale(${scale.toFixed(4)});
    transform-origin: top left;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Georgia', serif;
    flex-shrink: 0;
  }
</style>
</head>
<body>
  <div class="scale-wrapper">
    ${bodyHtml}
  </div>
</body>
</html>`;
};

export const suggestStyle = (dayLog: DayLog): PostcardStyle => {
  const foodEntries = dayLog.entries.filter((e) => e.category === 'food');
  const trainEntries = dayLog.entries.filter((e) => e.trainInfo);
  const photos = collectAllPhotos(dayLog);
  if (foodEntries.length >= 3 && foodEntries.some((e) => e.dishes?.length)) return 'foodie';
  if (trainEntries.length >= 2) return 'explorer';
  if (photos.length >= 3) return 'collage';
  return 'classic';
};
