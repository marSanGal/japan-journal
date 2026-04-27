import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { TripConfig, Entry, DayLog, EkiStamp, ExtraMediaItem, CustomCategory } from './types';
import { GoshuinStamp } from './goshuin';
import { ManholeEntry } from './manholes';

interface JournalState {
  config: TripConfig | null;
  days: Record<string, DayLog>;
  epilogue: string | null;
  goshuinStamps: GoshuinStamp[];
  konbiniChecked: string[];
  manholeCovers: ManholeEntry[];
  ekiStamps: EkiStamp[];
  customCategories: CustomCategory[];
  showGbp: boolean;
  narratorPersona: string;
  pastTrips: { name: string; config: TripConfig; days: Record<string, DayLog>; epilogue: string | null }[];

  setConfig: (config: TripConfig) => void;
  updateConfig: (updates: Partial<TripConfig>) => void;
  addEntry: (entry: Entry) => void;
  updateEntry: (date: string, entryId: string, updates: Partial<Entry>) => void;
  deleteEntry: (date: string, entryId: string) => void;
  importPartnerEntries: (entries: Entry[]) => number;
  setWeather: (date: string, weather: string) => void;
  setSteps: (date: string, steps: number) => void;
  setNarrative: (date: string, narrative: string) => void;
  setEpilogue: (epilogue: string) => void;
  addGoshuinStamp: (stamp: GoshuinStamp) => void;
  deleteGoshuinStamp: (id: string) => void;
  toggleKonbini: (item: string) => void;
  addManhole: (entry: ManholeEntry) => void;
  deleteManhole: (id: string) => void;
  addEkiStamp: (stamp: EkiStamp) => void;
  deleteEkiStamp: (id: string) => void;
  setEkiStampCount: (date: string, count: number) => void;
  addExtraPhoto: (date: string, uri: string) => void;
  removeExtraPhoto: (date: string, uri: string) => void;
  addExtraMedia: (date: string, item: ExtraMediaItem) => void;
  removeExtraMedia: (date: string, uri: string) => void;
  addCustomCategory: (cat: CustomCategory) => void;
  updateCustomCategory: (id: string, updates: Partial<CustomCategory>) => void;
  deleteCustomCategory: (id: string) => void;
  setShowGbp: (val: boolean) => void;
  setNarratorPersona: (persona: string) => void;
  archiveTrip: () => void;
  getDayLog: (date: string) => DayLog;
  getChapterNumber: (date: string) => number;
  getTodayDate: () => string;

  lastBackupTimestamp: string | null;
  exportData: () => string;
  importData: (json: string) => void;
}

const ensureDay = (days: Record<string, DayLog>, date: string): DayLog => {
  if (days[date]) return days[date];
  return { date, entries: [] };
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      config: null,
      days: {},
      epilogue: null,
      goshuinStamps: [],
      konbiniChecked: [],
      manholeCovers: [],
      ekiStamps: [],
      customCategories: [],
      showGbp: true,
      narratorPersona: 'ghibli',
      pastTrips: [],
      lastBackupTimestamp: null,

      setConfig: (config) => set({ config }),

      updateConfig: (updates) =>
        set((state) => {
          if (!state.config) return {};
          return { config: { ...state.config, ...updates } };
        }),

      addEntry: (entry) =>
        set((state) => {
          const date = format(new Date(entry.timestamp), 'yyyy-MM-dd');
          const day = ensureDay(state.days, date);
          const entries = [...day.entries, entry].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          const totalSpendYen = entries
            .filter((e) => e.category === 'purchase' && e.amountYen)
            .reduce((sum, e) => sum + (e.amountYen || 0), 0);
          return {
            days: {
              ...state.days,
              [date]: { ...day, entries, totalSpendYen },
            },
          };
        }),

      updateEntry: (date, entryId, updates) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          const entries = day.entries.map((e) =>
            e.id === entryId ? { ...e, ...updates } : e
          );
          const totalSpendYen = entries
            .filter((e) => e.category === 'purchase' && e.amountYen)
            .reduce((sum, e) => sum + (e.amountYen || 0), 0);
          return {
            days: {
              ...state.days,
              [date]: { ...day, entries, totalSpendYen },
            },
          };
        }),

      deleteEntry: (date, entryId) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          const entries = day.entries.filter((e) => e.id !== entryId);
          const totalSpendYen = entries
            .filter((e) => e.category === 'purchase' && e.amountYen)
            .reduce((sum, e) => sum + (e.amountYen || 0), 0);
          return {
            days: {
              ...state.days,
              [date]: { ...day, entries, totalSpendYen },
            },
          };
        }),

      importPartnerEntries: (entries) => {
        let imported = 0;
        set((state) => {
          const newDays = { ...state.days };
          for (const entry of entries) {
            const date = format(new Date(entry.timestamp), 'yyyy-MM-dd');
            const day = ensureDay(newDays, date);
            const exists = day.entries.some((e) => e.id === entry.id);
            if (!exists) {
              day.entries = [...day.entries, entry].sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
              day.totalSpendYen = day.entries
                .filter((e) => e.category === 'purchase' && e.amountYen)
                .reduce((sum, e) => sum + (e.amountYen || 0), 0);
              newDays[date] = { ...day };
              imported++;
            }
          }
          return { days: newDays };
        });
        return imported;
      },

      setWeather: (date, weather) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          return { days: { ...state.days, [date]: { ...day, weather } } };
        }),

      setSteps: (date, steps) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          return { days: { ...state.days, [date]: { ...day, steps } } };
        }),

      setNarrative: (date, narrative) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          return { days: { ...state.days, [date]: { ...day, narrative } } };
        }),

      setEpilogue: (epilogue) => set({ epilogue }),

      addGoshuinStamp: (stamp) =>
        set((state) => ({
          goshuinStamps: [...state.goshuinStamps, stamp],
        })),

      deleteGoshuinStamp: (id) =>
        set((state) => ({
          goshuinStamps: state.goshuinStamps.filter((s) => s.id !== id),
        })),

      toggleKonbini: (item) =>
        set((state) => ({
          konbiniChecked: state.konbiniChecked.includes(item)
            ? state.konbiniChecked.filter((i) => i !== item)
            : [...state.konbiniChecked, item],
        })),

      addManhole: (entry) =>
        set((state) => ({
          manholeCovers: [...state.manholeCovers, entry],
        })),

      deleteManhole: (id) =>
        set((state) => ({
          manholeCovers: state.manholeCovers.filter((m) => m.id !== id),
        })),

      addEkiStamp: (stamp) =>
        set((state) => ({
          ekiStamps: [...state.ekiStamps, stamp],
        })),

      deleteEkiStamp: (id) =>
        set((state) => ({
          ekiStamps: state.ekiStamps.filter((s) => s.id !== id),
        })),

      setEkiStampCount: (date, count) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          return { days: { ...state.days, [date]: { ...day, ekiStampCount: count } } };
        }),

      addExtraPhoto: (date, uri) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          const photos = [...(day.extraPhotos || []), uri];
          return { days: { ...state.days, [date]: { ...day, extraPhotos: photos } } };
        }),

      removeExtraPhoto: (date, uri) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          const photos = (day.extraPhotos || []).filter((p) => p !== uri);
          return { days: { ...state.days, [date]: { ...day, extraPhotos: photos } } };
        }),

      addExtraMedia: (date, item) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          const media = [...(day.extraMedia || []), item];
          return { days: { ...state.days, [date]: { ...day, extraMedia: media } } };
        }),

      removeExtraMedia: (date, uri) =>
        set((state) => {
          const day = ensureDay(state.days, date);
          const media = (day.extraMedia || []).filter((m) => m.uri !== uri);
          return { days: { ...state.days, [date]: { ...day, extraMedia: media } } };
        }),

      addCustomCategory: (cat) =>
        set((state) => ({
          customCategories: [...state.customCategories, cat],
        })),

      updateCustomCategory: (id, updates) =>
        set((state) => ({
          customCategories: state.customCategories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCustomCategory: (id) =>
        set((state) => ({
          customCategories: state.customCategories.filter((c) => c.id !== id),
        })),

      setShowGbp: (val) => set({ showGbp: val }),

      setNarratorPersona: (persona) => set({ narratorPersona: persona }),

      archiveTrip: () =>
        set((state) => {
          if (!state.config) return {};
          const archived = {
            name: `${state.config.myName} — ${state.config.startDate}`,
            config: state.config,
            days: state.days,
            epilogue: state.epilogue,
          };
          return {
            pastTrips: [...state.pastTrips, archived],
            config: null,
            days: {},
            epilogue: null,
            goshuinStamps: [],
            konbiniChecked: [],
            manholeCovers: [],
            ekiStamps: [],
            customCategories: [],
          };
        }),


      exportData: () => {
        const state = get();
        return JSON.stringify({
          version: 1,
          exportedAt: new Date().toISOString(),
          config: state.config,
          days: state.days,
          epilogue: state.epilogue,
          goshuinStamps: state.goshuinStamps,
          konbiniChecked: state.konbiniChecked,
          manholeCovers: state.manholeCovers,
          ekiStamps: state.ekiStamps,
          customCategories: state.customCategories,
          showGbp: state.showGbp,
          narratorPersona: state.narratorPersona,
          pastTrips: state.pastTrips,
        });
      },

      importData: (json) => {
        const data = JSON.parse(json);
        if (!data || typeof data !== 'object' || !data.version) {
          throw new Error('Invalid backup file');
        }
        set({
          config: data.config ?? null,
          days: data.days ?? {},
          epilogue: data.epilogue ?? null,
          goshuinStamps: data.goshuinStamps ?? [],
          konbiniChecked: data.konbiniChecked ?? [],
          manholeCovers: data.manholeCovers ?? [],
          ekiStamps: data.ekiStamps ?? [],
          customCategories: data.customCategories ?? [],
          showGbp: data.showGbp ?? true,
          narratorPersona: data.narratorPersona ?? 'ghibli',
          pastTrips: data.pastTrips ?? [],
          lastBackupTimestamp: new Date().toISOString(),
        });
      },

      getDayLog: (date) => {
        const state = get();
        return ensureDay(state.days, date);
      },

      getChapterNumber: (date) => {
        const state = get();
        if (!state.config) return 1;
        const start = new Date(state.config.startDate);
        const current = new Date(date);
        const diff = Math.floor(
          (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diff + 1;
      },

      getTodayDate: () => format(new Date(), 'yyyy-MM-dd'),
    }),
    {
      name: 'japan-journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
