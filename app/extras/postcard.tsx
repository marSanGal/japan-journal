import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { useJournalStore } from '../../lib/store';
import { COLORS } from '../../lib/constants';
import { buildPostcardHtml, buildPostcardPreviewHtml } from '../../lib/postcards';

export default function PostcardScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  if (!config) return null;

  const travelers = [config.myName, ...config.partners];
  const previewWidth = screenWidth - 64;
  const previewHeight = Math.round((previewWidth / 1080) * 1920);

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

  const getPreviewHtml = (dateStr: string) => {
    const dayLog = days[dateStr];
    const start = new Date(config.startDate).getTime();
    const chapterNum =
      Math.floor(
        (new Date(dateStr).getTime() - start) / (1000 * 60 * 60 * 24)
      ) + 1;
    const dateLabel = format(new Date(dateStr + 'T12:00:00'), 'MMMM d, yyyy');
    return buildPostcardPreviewHtml(dayLog, chapterNum, dateLabel, travelers, previewWidth);
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
              Tap a day to preview, then share
            </Text>
          </View>
        }
        renderItem={({ item: [dateStr, dayLog] }) => {
          const dateObj = new Date(dateStr + 'T12:00:00');
          const hasPhotos = dayLog.entries.some((e) => e.photoUri);
          const hasNarrative = !!dayLog.narrative;
          const isSelected = selectedDate === dateStr;
          return (
            <View>
              <TouchableOpacity
                style={[styles.dayRow, isSelected && styles.dayRowSelected]}
                onPress={() => setSelectedDate(isSelected ? null : dateStr)}
                activeOpacity={0.7}
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
                <Text style={styles.arrow}>{isSelected ? '▾' : '▸'}</Text>
              </TouchableOpacity>

              {isSelected && (
                <View style={styles.previewContainer}>
                  <View
                    style={[
                      styles.previewWebView,
                      { width: previewWidth, height: previewHeight },
                    ]}
                  >
                    <WebView
                      source={{ html: getPreviewHtml(dateStr) }}
                      style={{ width: previewWidth, height: previewHeight }}
                      scrollEnabled={false}
                      scalesPageToFit={false}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
                      originWhitelist={['*']}
                      allowFileAccess
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => handleGenerate(dateStr)}
                    disabled={generating === dateStr}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.shareButtonText}>
                      {generating === dateStr ? '⏳ Generating...' : '📬 Share Postcard'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
  dayRowSelected: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: COLORS.text },
  dayMeta: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  arrow: { fontSize: 20, color: COLORS.textLight },
  previewContainer: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  previewWebView: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  shareButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.white,
  },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: COLORS.textLight, textAlign: 'center' },
});
