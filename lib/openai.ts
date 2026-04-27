import OpenAI from 'openai';
import Constants from 'expo-constants';
import { Entry } from './types';
import { CATEGORY_CONFIG } from './constants';
import { getPersona } from './personas';

const getClient = () => {
  const apiKey =
    Constants.expoConfig?.extra?.openaiApiKey ||
    process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured');
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

const formatEntries = (entries: Entry[]): string => {
  return entries
    .map((e) => {
      const time = new Date(e.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const cat = CATEGORY_CONFIG[e.category].label;
      let withTag: string;
      if (e.participants && e.participants.length > 1) {
        withTag = ` [with: ${e.participants.join(', ')}]`;
      } else {
        withTag = ' [solo]';
      }
      const location = e.location ? ` @ ${e.location}` : '';
      const yen = e.amountYen ? ` (¥${e.amountYen})` : '';

      let line = `[${time}] ${e.author} — ${cat}${withTag}${location}${yen}: ${e.text}`;

      if (e.dishes && e.dishes.length > 0) {
        const dishLines = e.dishes.map((d) => {
          let s = `  - Dish: ${d.name}`;
          if (d.rating) s += ` (${'★'.repeat(d.rating)}${'☆'.repeat(5 - d.rating)})`;
          if (d.comment) s += ` — "${d.comment}"`;
          return s;
        });
        line += '\n' + dishLines.join('\n');
      }

      if (e.trainInfo) {
        line += `\n  - Train: ${e.trainInfo.fromStation} → ${e.trainInfo.toStation} (${e.trainInfo.type})`;
      }

      if (e.barGenre) {
        line += `\n  - Genre: ${e.barGenre}`;
      }
      if (e.hadLiveMusic) {
        line += '\n  - Live music!';
      }

      if (e.songs && e.songs.length > 0) {
        const songLines = e.songs.map((s) =>
          `  - Song: "${s.name}"${s.artist ? ` by ${s.artist}` : ''}`
        );
        line += '\n' + songLines.join('\n');
      }

      if (e.stepsCount) {
        line += `\n  - Steps: ${e.stepsCount.toLocaleString()}`;
      }

      if (e.hasGoshuin) {
        line += '\n  - Collected a goshuin (temple stamp)';
      }

      if (e.engrishContext) {
        line += `\n  - Context: "${e.engrishContext}"`;
      }

      return line;
    })
    .join('\n');
};

const getParagraphGuide = (entryCount: number): string => {
  if (entryCount <= 3) return '1-2 short paragraphs';
  if (entryCount <= 7) return '2-3 paragraphs';
  return '3-5 paragraphs';
};

const buildPrompt = (
  travelers: string[],
  chapterNumber: number,
  entryCount: number,
  personaId = 'ghibli'
): string => {
  const persona = getPersona(personaId);
  const paragraphs = getParagraphGuide(entryCount);

  if (travelers.length === 1) {
    const name = travelers[0];
    return `You are writing a book — a travel story about someone exploring Japan.
Their name is ${name}. This is Chapter ${chapterNumber} of their journey.

${persona.prompt}
Use the persona's tone, but stay faithful to what was logged — do not invent facts.

You will receive a chronological list of log entries from the traveler's day. Each
entry has a timestamp and what they experienced. This is the COMPLETE list — never
ask for more information, clarification, or additional entries. Work with whatever
entries you receive, even if there is only one.

Write a single chapter (${paragraphs}) in third person, like a chapter of a novel:

- You MUST include every single entry from the log — do not skip any
- Stay faithful to what was actually logged. Do not invent events, places, meals, or
  details that are not in the entries. A little atmospheric colour is fine, but the
  facts must come from the log
- Follow the chronological flow of the day — morning to night
- Narrate ${name} as the protagonist on a quiet adventure
- Give them personality through what they notice and do
- Weave in sounds, food, purchases, phrases, and tiny moments naturally as part of
  the story, never as a list
- End the chapter with an image — the last moment of the day, a quiet scene, a
  feeling — not a summary or conclusion
- Title the chapter on the first line: "Chapter ${chapterNumber} — {a short evocative title based on the day}"
- IMPORTANT: Never ask for more entries. Never say the list is incomplete. Just write the chapter.`;
  }

  const nameList = travelers.join(', ');
  const nameExamples = travelers.slice(0, 2);

  return `You are writing a book — a travel story about ${travelers.length} people exploring Japan together.
Their names are ${nameList}. This is Chapter ${chapterNumber} of their journey.

${persona.prompt}
Use the persona's tone, but stay faithful to what was logged — do not invent facts.

You will receive a chronological list of log entries from all travelers' day. Each
entry has a timestamp, the author's name, and what they experienced. Entries include
a list of participants (e.g. "[with: Mario, Carlos]" means they were together, while
"[solo]" means the author was alone).

This is the COMPLETE list — never ask for more information, clarification, or
additional entries. Work with whatever entries you receive, even if there is only one.

Write a single chapter (${paragraphs}) in third person, like a chapter of a novel:

- You MUST include every single entry from the log — do not skip any
- Stay faithful to what was actually logged. Do not invent events, places, meals, or
  details that are not in the entries. A little atmospheric colour is fine, but the
  facts must come from the log
- Follow the chronological flow of the day — morning to night
- When they are together, narrate them as a group: "They wandered through...",
  "${nameExamples[0]} pointed out... while ${nameExamples[1]} stopped to..."
- When they split up, follow each thread separately, then bring them back together
  when the timestamps converge again
- Give each character their own personality through what they notice and do — let
  the entries reveal who they are
- Weave in sounds, food, purchases, phrases, and tiny moments naturally as part of
  the story, never as a list
- End the chapter with an image — the last moment of the day, a quiet scene, a
  feeling — not a summary or conclusion
- Title the chapter on the first line: "Chapter ${chapterNumber} — {a short evocative title based on the day}"
- IMPORTANT: Never ask for more entries. Never say the list is incomplete. Just write the chapter.`;
  };

export const generateChapter = async (
  entries: Entry[],
  travelers: string[],
  chapterNumber: number,
  weather?: string,
  personaId = 'ghibli'
): Promise<string> => {
  const client = getClient();
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const entriesText = formatEntries(sorted);
  const weatherNote = weather ? `\nToday's weather: ${weather}` : '';
  const systemPrompt = buildPrompt(travelers, chapterNumber, sorted.length, personaId);
  const maxTokens = Math.min(600 + sorted.length * 150, 2500);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Here are ALL of today's log entries (this is the complete list):${weatherNote}\n\n${entriesText}` },
    ],
    temperature: 0.6,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content || 'Could not generate chapter.';
};

export const generateEpilogue = async (
  chapters: { chapterNumber: number; narrative: string }[],
  travelers: string[]
): Promise<string> => {
  const client = getClient();

  const nameList = travelers.join(' and ');
  const isSolo = travelers.length === 1;
  const pronoun = isSolo ? 'they' : 'they all';

  const chaptersText = chapters
    .map((c) => `--- Chapter ${c.chapterNumber} ---\n${c.narrative}`)
    .join('\n\n');

  const systemPrompt = `You are writing the epilogue of a travel book about ${nameList} exploring Japan.
You have been given all ${chapters.length} chapters of their journey.

Write a single-page epilogue (4-6 paragraphs) in the style of a Studio Ghibli film narrator:

- Reflect on the journey as a whole — the arc from arrival to departure
- Recall the most vivid moments, weaving them together into a tapestry
- Notice how ${pronoun} changed, what ${pronoun} learned, what surprised them
- Mention specific details from the chapters — a particular meal, a shrine, a sound, a phrase learned
- End with a final image: ${isSolo ? travelers[0] : nameList} leaving Japan, carrying something invisible but heavy with meaning
- The tone should be bittersweet and beautiful — the trip is over, but the story lives on
- Title it: "Epilogue — {an evocative closing title}"`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Here are all the chapters:\n\n${chaptersText}` },
    ],
    temperature: 0.85,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || 'Could not generate epilogue.';
};
