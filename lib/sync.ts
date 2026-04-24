import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Entry } from './types';

export const exportEntries = (entries: Entry[], authorName: string): string => {
  const myEntries = entries.filter((e) => e.author === authorName);
  return JSON.stringify({ v: 1, author: authorName, entries: myEntries });
};

export const shareEntries = async (entries: Entry[], authorName: string) => {
  const json = exportEntries(entries, authorName);
  await Share.share({
    message: json,
    title: `${authorName}'s Journal Entries`,
  });
};

export const copyEntriesToClipboard = async (
  entries: Entry[],
  authorName: string
) => {
  const json = exportEntries(entries, authorName);
  await Clipboard.setStringAsync(json);
};

export const parseImportedEntries = (
  jsonString: string
): { author: string; entries: Entry[] } | null => {
  try {
    const data = JSON.parse(jsonString.trim());
    if (data.v !== 1 || !Array.isArray(data.entries)) return null;
    return { author: data.author, entries: data.entries };
  } catch {
    return null;
  }
};
