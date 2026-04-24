import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { useJournalStore } from '../../lib/store';
import { COLORS } from '../../lib/constants';
import { buildPostcardHtml } from '../../lib/postcards';

export default function PostcardScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);
  const [generating, setGenerating] = useState<string | null>(null);

  if (!config) return null;

  const travelers = [config.myName, ...config.partners];

  const daysWithEntries = Object.entries(days)
    .filter(([_, d]) => d.entries.length > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));

  const handleGenerate = async (dateStr: string) => {
    setGenerating(dateStr);
    try {
      const dayLog = days[dateStr];
      const start = new Date(config.startDate).getTime();
      const chapterNum =
        Math.floor(
          (new Date(dateStr).getTime() - start) / (1000 * 60 * 60 * 24)
        ) + 1;
      const dateLabel = format(new Date(dateStr + 'T12:00:00'), 'MMMM d, yyyy');

      const html = buildPostcardHtml(dayLog, chapterNum, dateLabel, travelers);
      const { uri } = await Print.printToFileAsync({ html, width: 1080, height: 1920 });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not generate postcard');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={daysWithEntries}
        keyExtractor={([date]) => date}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>📬 Postcards</Text>
            <Text style={styles.subtitle}>
              Share a beautiful day summary
            </Text>
          </View>
        }
        renderItem={({ item: [dateStr, dayLog] }) => {
          const dateObj = new Date(dateStr + 'T12:00:00');
          const hasPhotos = dayLog.entries.some((e) => e.photoUri);
          const hasNarrative = !!dayLog.narrative;
          return (
            <TouchableOpacity
              style={styles.dayRow}
              onPress={() => handleGenerate(dateStr)}
              disabled={generating === dateStr}
            >
              <View>
                <Text style={styles.dayTitle}>
                  {format(dateObj, 'EEEE, MMM d')}
                </Text>
                <Text style={styles.dayMeta}>
                  {dayLog.entries.length} entries
                  {hasPhotos ? ' · 📸' : ''}
                  {hasNarrative ? ' · 📖' : ''}
                </Text>
              </View>
              <Text style={styles.arrow}>
                {generating === dateStr ? '⏳' : '📬'}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Log some entries first, then come back here to share postcards!
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 20, paddingBottom: 16, alignItems: 'center' },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: COLORS.text, marginBottom: 4 },
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: COLORS.textLight },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  dayTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: COLORS.text },
  dayMeta: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  arrow: { fontSize: 24 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: COLORS.textLight, textAlign: 'center' },
});
