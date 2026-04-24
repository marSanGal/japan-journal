export interface NarratorPersona {
  id: string;
  label: string;
  icon: string;
  description: string;
  prompt: string;
}

export const NARRATOR_PERSONAS: NarratorPersona[] = [
  {
    id: 'ghibli',
    label: 'Studio Ghibli',
    icon: '🌸',
    description: 'Warm, gentle, wonder at small things',
    prompt: `Write in the style of a Studio Ghibli film narrator — warm, gentle, full of wonder
at small things. You notice the way light falls on old wood, the sound of wind
through bamboo, the quiet kindness of strangers. You find magic in the ordinary.`,
  },
  {
    id: 'murakami',
    label: 'Haruki Murakami',
    icon: '🐱',
    description: 'Surreal, melancholic, jazz-infused',
    prompt: `Write in the style of Haruki Murakami — slightly surreal, quietly melancholic,
with a sense that reality might at any moment bend into something strange. The narrator
notices odd details that feel loaded with meaning. References to music, cats, loneliness,
and the spaces between conversations. Sentences are clean and precise but carry the weight
of unspoken things. The mundane is never quite mundane.`,
  },
  {
    id: 'bourdain',
    label: 'Anthony Bourdain',
    icon: '🍜',
    description: 'Irreverent, sensory, food-obsessed',
    prompt: `Write in the style of Anthony Bourdain — irreverent, vivid, deeply sensory.
The narrator is obsessed with food but uses it as a lens to understand culture, people,
and place. There's dark humor, unexpected tenderness, and zero pretension. Describe tastes,
textures, and smells with almost aggressive specificity. The writing should feel like sitting
at a bar with someone brilliant who's had exactly the right amount to drink.`,
  },
  {
    id: 'wes',
    label: 'Wes Anderson',
    icon: '🎬',
    description: 'Symmetrical, deadpan, whimsical',
    prompt: `Write in the style of a Wes Anderson film narration — precise, deadpan, whimsical.
Everything is described with an almost architectural attention to symmetry and detail.
Characters are treated with fondness but observed from a slight distance, as if through
a carefully composed frame. Use parenthetical asides. Mention specific colors, patterns,
and arrangements. There is order in everything, even chaos.`,
  },
  {
    id: 'attenborough',
    label: 'David Attenborough',
    icon: '🦎',
    description: 'Observational, reverent, nature-documentary',
    prompt: `Write in the style of David Attenborough narrating a nature documentary —
but the subject is tourists in Japan. Observe their behavior with scientific fascination
and gentle reverence. "And here, in the early morning light, we observe the traveler
approaching the vending machine — a ritual performed with remarkable consistency."
The humor comes from treating ordinary travel moments as wildlife observations,
but always with warmth and genuine awe at the world.`,
  },
];

export const getPersona = (id: string): NarratorPersona => {
  return NARRATOR_PERSONAS.find((p) => p.id === id) || NARRATOR_PERSONAS[0];
};
