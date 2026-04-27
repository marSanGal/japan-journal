import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { documentDirectory, moveAsync } from 'expo-file-system/legacy';
import { DayLog, TripConfig, Entry } from './types';
import { CATEGORY_CONFIG, getTripDays } from './constants';
import { format, addDays } from 'date-fns';

const entryToHtml = (entry: Entry): string => {
  const cat = CATEGORY_CONFIG[entry.category];
  const time = format(new Date(entry.timestamp), 'h:mm a');
  const location = entry.location ? `<span class="location">📍 ${entry.location}</span>` : '';
  const amount = entry.amountYen ? `<span class="amount">¥${entry.amountYen.toLocaleString()}</span>` : '';
  const photo = entry.photoUri
    ? `<img src="${entry.photoUri}" class="entry-photo" />`
    : '';
  const together = entry.together ? '<span class="badge">together</span>' : '';

  return `
    <div class="entry">
      <div class="entry-header">
        <span class="cat-icon">${cat.icon}</span>
        <span class="time">${time}</span>
        <span class="author">${entry.author}</span>
        ${together}
      </div>
      <p class="entry-text">${entry.text}</p>
      ${location}${amount}${photo}
    </div>`;
};

export const generateScrapbookHtml = (
  config: TripConfig,
  days: Record<string, DayLog>,
  epilogue: string | null
): string => {
  const allNames = [config.myName, ...config.partners];
  const title = config.partners.length > 0
    ? `${allNames.join(' & ')} in Japan`
    : `${config.myName} in Japan`;

  const start = new Date(config.startDate + 'T12:00:00');
  let chaptersHtml = '';

  for (let i = 0; i < getTripDays(config); i++) {
    const date = addDays(start, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const day = days[dateStr];
    if (!day || (day.entries.length === 0 && !day.narrative)) continue;

    const chapterNum = i + 1;
    const dateFormatted = format(date, 'EEEE, MMMM d, yyyy');
    const weather = day.weather ? `<span class="weather">${day.weather}</span>` : '';

    const narrativeHtml = day.narrative
      ? `<div class="narrative">${day.narrative.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('')}</div>`
      : '';

    const entriesHtml = day.entries.map(entryToHtml).join('');

    chaptersHtml += `
      <div class="chapter">
        <h2>Chapter ${chapterNum}</h2>
        <p class="chapter-date">${dateFormatted} ${weather}</p>
        ${narrativeHtml}
        <div class="entries">${entriesHtml}</div>
      </div>
      <div class="page-break"></div>`;
  }

  const epilogueHtml = epilogue
    ? `<div class="chapter epilogue">
        ${epilogue.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('')}
       </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 20mm; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      color: #4A3728;
      background: #FFFEF5;
      line-height: 1.6;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
    }
    .cover {
      text-align: center;
      padding: 80px 0;
      page-break-after: always;
    }
    .cover h1 {
      font-size: 36px;
      margin-bottom: 8px;
      color: #4A3728;
    }
    .cover .subtitle {
      font-size: 18px;
      color: #8B7B6B;
    }
    .cover .flower { font-size: 48px; margin-bottom: 20px; }
    .chapter {
      margin-bottom: 40px;
    }
    .chapter h2 {
      font-size: 24px;
      margin-bottom: 4px;
      color: #4A3728;
    }
    .chapter-date {
      font-size: 14px;
      color: #8B7B6B;
      margin-bottom: 20px;
    }
    .narrative {
      background: #FFFEF5;
      border-left: 3px solid #F4A7BB;
      padding: 16px 20px;
      margin-bottom: 24px;
      border-radius: 4px;
    }
    .narrative p {
      margin: 0 0 12px 0;
      font-size: 15px;
    }
    .entries { margin-top: 16px; }
    .entry {
      background: #fff;
      border: 1px solid #F0E0D6;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
    }
    .entry-header {
      font-size: 13px;
      color: #8B7B6B;
      margin-bottom: 4px;
    }
    .cat-icon { margin-right: 4px; }
    .time { margin-right: 8px; }
    .author { font-weight: bold; margin-right: 8px; }
    .badge {
      background: #A8D8A8;
      color: #fff;
      padding: 1px 6px;
      border-radius: 8px;
      font-size: 11px;
    }
    .entry-text {
      margin: 4px 0;
      font-size: 14px;
    }
    .location, .amount {
      font-size: 12px;
      color: #8B7B6B;
      display: block;
    }
    .entry-photo {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: 6px;
      margin-top: 8px;
    }
    .page-break { page-break-after: always; }
    .epilogue {
      border-top: 2px solid #F4A7BB;
      padding-top: 20px;
    }
    .weather { margin-left: 8px; }
  </style>
</head>
<body>
  <div class="cover">
    <div class="flower">🌸</div>
    <h1>${title}</h1>
    <p class="subtitle">A Travel Journal</p>
  </div>
  ${chaptersHtml}
  ${epilogueHtml}
</body>
</html>`;
};

export const exportPdf = async (
  config: TripConfig,
  days: Record<string, DayLog>,
  epilogue: string | null
) => {
  const html = generateScrapbookHtml(config, days, epilogue);
  const { uri } = await Print.printToFileAsync({ html });

  const newUri = `${documentDirectory}japan-journal.pdf`;
  await moveAsync({ from: uri, to: newUri });

  await Sharing.shareAsync(newUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Save your Japan Journal',
    UTI: 'com.adobe.pdf',
  });
};
