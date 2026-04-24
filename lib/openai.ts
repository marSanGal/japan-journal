import OpenAI from 'openai';
import Constants from 'expo-constants';
import { Entry } from './types';
import { CATEGORY_CONFIG } from './constants';

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
      const together = e.together ? ' [together]' : ' [solo]';
      const location = e.location ? ` @ ${e.location}` : '';
      const yen = e.amountYen ? ` (¥${e.amountYen})` : '';
      return `[${time}] ${e.author} — ${cat}${together}${location}${yen}: ${e.text}`;
    })
    .join('\n');
};

const buildPrompt = (
  travelers: string[],
  chapterNumber: number
): string => {
  if (travelers.length === 1) {
    const name = travelers[0];
    return `You are writing a book — a travel story about someone exploring Japan.
Their name is ${name}. This is Chapter ${chapterNumber} of their journey.

Write in the style of a Studio Ghibli film narrator — warm, gentle, full of wonder
at small things. You notice the way light falls on old wood, the sound of wind
through bamboo, the quiet kindness of strangers. You find magic in the ordinary.

You will receive a chronological list of log entries from the traveler's day. Each
entry has a timestamp and what they experienced.

Write a single chapter (3-5 paragraphs) in third person, like a chapter of a novel:

- Follow the chronological flow of the day — morning to night
- Narrate ${name} as the protagonist on a quiet adventure
- Give them personality through what they notice and do
- Weave in sounds, food, purchases, phrases, and tiny moments naturally as part of
  the story, never as a list
- End the chapter with an image — the last moment of the day, a quiet scene, a
  feeling — not a summary or conclusion
- Title the chapter on the first line: "Chapter ${chapterNumber} — {a short evocative title based on the day}"`;
  }

  const nameList = travelers.join(', ');
  const nameExamples = travelers.slice(0, 2);

  return `You are writing a book — a travel story about ${travelers.length} people exploring Japan together.
Their names are ${nameList}. This is Chapter ${chapterNumber} of their journey.

Write in the style of a Studio Ghibli film narrator — warm, gentle, full of wonder
at small things. You notice the way light falls on old wood, the sound of wind
through bamboo, the quiet kindness of strangers. You find magic in the ordinary.

You will receive a chronological list of log entries from all travelers' day. Each
entry has a timestamp, the author's name, and what they experienced. Some entries
are marked "together" (they were side by side) and some are "solo" (they split up
and explored alone).

Write a single chapter (3-5 paragraphs) in third person, like a chapter of a novel:

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
- Title the chapter on the first line: "Chapter ${chapterNumber} — {a short evocative title based on the day}"`;
};

export const generateChapter = async (
  entries: Entry[],
  travelers: string[],
  chapterNumber: number,
  weather?: string
): Promise<string> => {
  const client = getClient();
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const entriesText = formatEntries(sorted);
  const weatherNote = weather ? `\nToday's weather: ${weather}` : '';
  const systemPrompt = buildPrompt(travelers, chapterNumber);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Here are today's entries:${weatherNote}\n\n${entriesText}` },
    ],
    temperature: 0.85,
    max_tokens: 1500,
  });

  return response.choices[0]?.message?.content || 'Could not generate chapter.';
};
