import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { TripConfig, Entry, DayLog } from './types';

interface JournalState {
  config: TripConfig | null;
  days: Record<string, DayLog>;
  epilogue: string | null;

  setConfig: (config: TripConfig) => void;
  addEntry: (entry: Entry) => void;
  deleteEntry: (date: string, entryId: string) => void;
  importPartnerEntries: (entries: Entry[]) => number;
  setWeather: (date: string, weather: string) => void;
  setSteps: (date: string, steps: number) => void;
  setNarrative: (date: string, narrative: string) => void;
  setEpilogue: (epilogue: string) => void;
  getDayLog: (date: string) => DayLog;
  getChapterNumber: (date: string) => number;
  getTodayDate: () => string;
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

      setConfig: (config) => set({ config }),

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
