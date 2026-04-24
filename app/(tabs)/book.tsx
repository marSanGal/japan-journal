import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { useJournalStore } from '../../lib/store';
import { COLORS } from '../../lib/constants';

interface ChapterItem {
  date: string;
  chapterNumber: number;
  entryCount: number;
  hasNarrative: boolean;
}

export default function BookScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);

  if (!config) return null;

  const today = startOfDay(new Date());
  const start = new Date(config.startDate + 'T12:00:00');
  const chapters: ChapterItem[] = [];

  for (let i = 0; i < config.totalDays; i++) {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 Our Story</Text>
        <Text style={styles.subtitle}>
          {config.partners.length > 0
            ? `${[config.myName, ...config.partners].join(' & ')} in Japan`
            : `${config.myName} in Japan`}
        </Text>
      </View>

      <FlatList
        data={chapters}
        keyExtractor={(item) => item.date}
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
    backgroundColor: COLORS.pink + '30',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.pink,
  },
  arrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: COLORS.textLight,
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
