# 🌸 Japan Journal

A two-player travel journal app for Android, built with Expo (React Native). Log your daily adventures across Japan with your travel partner, sync entries at night, and generate a Ghibli-style book chapter for each day using GPT-4o.

## Features

- **10 entry categories** — shrines, food, sounds, Engrish, purchases, moments, phrases, overheard, walks, and surprises
- **Two travelers** — each person logs on their own phone, entries are color-coded by author
- **Chronological timeline** — entries sorted by timestamp with "together" and "solo" indicators
- **Partner sync** — share your day's entries via Android Share or clipboard, no cloud needed
- **Ghibli narrator** — generates a third-person book chapter each night with both travelers as characters
- **Book view** — read your trip as a novel, one chapter per day
- **Trip stats** — entries by category, spending in yen/USD, per-traveler breakdowns
- **Kawaii aesthetic** — pastel colors, rounded UI, cute icons, sakura pink theme

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) app on your Android phone
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Install & Run

```bash
# Install dependencies
npm install

# Add your OpenAI API key
cp .env.example .env
# Edit .env and add your key

# Start the dev server
npx expo start
```

Scan the QR code with Expo Go on your phone.

### Build APK (for sideloading)

```bash
npx eas build --platform android --profile preview
```

## How It Works

1. **Setup** — On first launch, enter both travelers' names, trip start date, and trip length
2. **Log entries** — Throughout the day, tap the pencil button to log moments in any category. Set the time, location, and whether you were together
3. **Sync at night** — Tap "Partner Sync" to share your entries with your partner via text/share. They import yours, you import theirs
4. **Write the chapter** — Once synced, tap "Write Tonight's Chapter" to generate a Ghibli-style narrative from both travelers' combined entries
5. **Read your book** — The Book tab shows all chapters in order, like a novel table of contents

## Tech Stack

| | |
|---|---|
| Framework | Expo SDK 54 (React Native) |
| Navigation | expo-router |
| State | Zustand + AsyncStorage |
| AI | OpenAI GPT-4o |
| Fonts | Nunito (Google Fonts) |
| Sync | Native Share API + Clipboard |

## Project Structure

```
app/
  setup.tsx              # First-launch setup
  (tabs)/
    index.tsx            # Today view
    book.tsx             # Book table of contents
    stats.tsx            # Trip stats
  chapter/[date].tsx     # Chapter detail + narrative
components/
  AddEntrySheet.tsx      # Bottom sheet for new entries
  ChapterCard.tsx        # Notebook-styled narrative card
  DayHeader.tsx          # Chapter badge + date + weather
  EntryCard.tsx          # Single entry with author colors
  FAB.tsx                # Floating action button
  SyncPanel.tsx          # Partner sync modal
lib/
  store.ts               # Zustand store + persistence
  types.ts               # TypeScript types
  openai.ts              # GPT-4o chapter generation
  sync.ts                # Entry export/import
  constants.ts           # Colors, categories, config
  currency.ts            # Yen/USD conversion
```

## Cost

OpenAI API usage is roughly **$0.08–0.15 per chapter**. A full 21-day trip costs about **$2–3 total**. Load $5 on your OpenAI account and you're set.

## License

Personal project. Have fun in Japan! 🗾
