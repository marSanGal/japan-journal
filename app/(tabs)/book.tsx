import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useJournalStore } from '../../lib/store';
import { COLORS, getTripDays } from '../../lib/constants';
import { generateEpilogue } from '../../lib/openai';
import { exportPdf } from '../../lib/export-pdf';
import ChapterCard from '../../components/ChapterCard';
import SeigaihaBackground from '../../components/SeigaihaBackground';

interface ChapterItem {
  date: string;
  chapterNumber: number;
  entryCount: number;
  hasNarrative: boolean;
}

export default function BookScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);
  const epilogue = useJournalStore((s) => s.epilogue);
  const setEpilogue = useJournalStore((s) => s.setEpilogue);
  const customCategories = useJournalStore((s) => s.customCategories);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!config) return null;

  const today = startOfDay(new Date());
  const start = new Date(config.startDate + 'T12:00:00');
  const chapters: ChapterItem[] = [];

  for (let i = 0; i < getTripDays(config); i++) {
    const date = addDays(start, i);
    if (isBefore(today, startOfDay(date)) && i > 0) break;
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLog = days[dateStr];
    chapters.push({
      date: dateStr,
      chapterNumber: i + 1,
      entryCount: dayLog?.entries.length || 0,
      hasNarrative: !!dayLog?.narrative,
    });
  }

  const writtenChapters = chapters.filter((c) => {
    const day = days[c.date];
    return day?.narrative;
  });

  const handleEpilogue = async () => {
    if (writtenChapters.length < 2) {
      Alert.alert(
        'Not enough chapters',
        'Write at least 2 chapters before generating the epilogue.'
      );
      return;
    }

    setLoading(true);
    try {
      const chaptersData = writtenChapters.map((c) => ({
        chapterNumber: c.chapterNumber,
        narrative: days[c.date]!.narrative!,
      }));
      const allTravelers = [config.myName, ...config.partners];
      const result = await generateEpilogue(chaptersData, allTravelers);
      setEpilogue(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert(
        'Generation failed',
        err?.message || 'Check your OpenAI API key and internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPdf(config, days, epilogue, customCategories);
    } catch (err: any) {
      Alert.alert('Export failed', err?.message || 'Could not generate PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <SeigaihaBackground />
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.date}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>📖 Our Story</Text>
            <Text style={styles.subtitle}>
              {config.partners.length > 0
                ? `${[config.myName, ...config.partners].join(' & ')} in Japan`
                : `${config.myName} in Japan`}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const dateObj = new Date(item.date + 'T12:00:00');
          return (
            <TouchableOpacity
              style={styles.chapterRow}
              onPress={() => router.push(`/chapter/${item.date}`)}
              activeOpacity={0.7}
            >
              <View style={styles.chapterLeft}>
                <View
                  style={[
                    styles.chapterDot,
                    item.hasNarrative && styles.chapterDotDone,
                  ]}
                >
                  <Text style={styles.dotText}>
                    {item.hasNarrative ? '📖' : '✏️'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.chapterName}>
                    Chapter {item.chapterNumber}
                  </Text>
                  <Text style={styles.chapterDate}>
                    {format(dateObj, 'EEEE, MMM d')}
                  </Text>
                </View>
              </View>
              <View style={styles.chapterRight}>
                {item.entryCount > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.entryCount}</Text>
                  </View>
                )}
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            {epilogue && <ChapterCard narrative={epilogue} />}
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingIcon}>📝</Text>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Writing your epilogue...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={epilogue ? styles.rewriteButton : styles.epilogueButton}
                onPress={handleEpilogue}
              >
                <Text
                  style={
                    epilogue ? styles.rewriteText : styles.epilogueButtonText
                  }
                >
                  {epilogue
                    ? '🔄 Rewrite Epilogue'
                    : '✨ Write Trip Epilogue'}
                </Text>
              </TouchableOpacity>
            )}

            {writtenChapters.length > 0 && (
              <TouchableOpacity
                style={styles.exportButton}
                onPress={handleExport}
                disabled={exporting}
              >
                <Text style={styles.exportText}>
                  {exporting ? '📄 Generating PDF...' : '📄 Export as PDF Scrapbook'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Your story hasn't started yet.{'\n'}Start logging entries on the
              Today tab!
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chapterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chapterDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterDotDone: {
    backgroundColor: COLORS.green + '40',
  },
  dotText: {
    fontSize: 18,
  },
  chapterName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.text,
  },
  chapterDate: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textLight,
  },
  chapterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: COLORS.primary + '30',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.primary,
  },
  arrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: COLORS.textLight,
  },
  footer: {
    marginTop: 16,
    gap: 12,
  },
  epilogueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  epilogueButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: COLORS.white,
  },
  rewriteButton: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rewriteText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: COLORS.textLight,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  loadingIcon: {
    fontSize: 32,
  },
  loadingText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: COLORS.textLight,
  },
  exportButton: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  exportText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: COLORS.green,
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
});
