import { Entry, DayLog } from './types';
import { CATEGORY_CONFIG } from './constants';

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

export const buildPostcardHtml = (
  dayLog: DayLog,
  chapterNumber: number,
  dateLabel: string,
  travelers: string[]
): string => {
  const quote = dayLog.narrative ? pickQuote(dayLog.narrative) : '';
  const photo = pickBestPhoto(dayLog.entries);
  const names = travelers.join(' & ');
  const entryHighlights = dayLog.entries
    .slice(0, 5)
    .map((e) => `${CATEGORY_CONFIG[e.category].icon} ${e.text.slice(0, 50)}`)
    .join(' · ');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Georgia', serif;
    background: #FFF0F5;
    width: 1080px;
    height: 1920px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .photo-section {
    flex: 1;
    background: ${photo ? `url('${photo}') center/cover` : '#F4A7BB'};
    position: relative;
  }
  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 60px 50px;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    color: white;
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
  .names {
    font-size: 24px;
    opacity: 0.7;
  }
  .quote-section {
    padding: 50px;
    background: #FFF8F0;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-top: 4px solid #F4A7BB;
  }
  .quote {
    font-style: italic;
    font-size: 36px;
    line-height: 1.6;
    color: #4A3728;
    margin-bottom: 30px;
  }
  .highlights {
    font-size: 20px;
    color: #8B7B6B;
    line-height: 1.8;
  }
  .brand {
    text-align: center;
    padding: 20px;
    font-size: 18px;
    color: #C5A8D8;
    letter-spacing: 2px;
  }
</style>
</head>
<body>
  <div class="photo-section">
    <div class="overlay">
      <div class="chapter">Chapter ${chapterNumber}</div>
      <div class="date-label">${dateLabel}</div>
      <div class="names">${names}</div>
    </div>
  </div>
  <div class="quote-section">
    ${quote ? `<div class="quote">"${quote}"</div>` : ''}
    <div class="highlights">${entryHighlights}</div>
  </div>
  <div class="brand">🌸 Japan Journal</div>
</body>
</html>`;
};
