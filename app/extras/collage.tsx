import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';
import { useJournalStore } from '../../lib/store';
import { COLORS } from '../../lib/constants';

export default function CollageScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);
  const { width: screenWidth } = useWindowDimensions();

  const loggedDays = useMemo(() => {
    if (!config) return [];
    return Object.entries(days)
      .filter(([, d]) => d.entries.length > 0)
      .map(([dateStr, d]) => {
        const start = new Date(config.startDate);
        const current = new Date(dateStr);
        const dayNum = Math.floor(
          (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        const entryPhotos = d.entries
          .filter((e) => e.photoUri)
          .map((e) => e.photoUri!);
        const extraPhotos = d.extraPhotos || [];
        const extraMedia = (d.extraMedia || [])
          .filter((m) => m.type === 'photo')
          .map((m) => m.uri);
        return {
          date: dateStr,
          dayNum,
          photos: [...entryPhotos, ...extraPhotos, ...extraMedia],
        };
      })
      .filter((d) => d.photos.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [days, config]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedDay = loggedDays.find((d) => d.date === selectedDate);
  const photos = selectedDay?.photos || [];
  const tileSize = (screenWidth - 48 - 8) / 3;

  const handleShare = async () => {
    if (photos.length === 0) return;

    try {
      const imageRows: string[] = [];
      for (let i = 0; i < photos.length; i += 3) {
        const row = photos.slice(i, i + 3);
        const cells = await Promise.all(
          row.map(async (uri) => {
            try {
              const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              return `<img src="data:image/jpeg;base64,${base64}" style="width:200px;height:200px;object-fit:cover;border-radius:8px;" />`;
            } catch {
              return '<div style="width:200px;height:200px;background:#eee;border-radius:8px;"></div>';
            }
          })
        );
        imageRows.push(`<div style="display:flex;gap:8px;margin-bottom:8px;">${cells.join('')}</div>`);
      }

      const dayLabel = selectedDay
        ? `Day ${selectedDay.dayNum} — ${format(new Date(selectedDay.date), 'MMM d')}`
        : '';

      const html = `
        <html>
        <body style="margin:0;padding:24px;background:#FFF0F5;font-family:sans-serif;">
          <h2 style="text-align:center;color:#4A3728;margin-bottom:16px;">${dayLabel}</h2>
          ${imageRows.join('')}
          <p style="text-align:center;color:#8B7B6B;font-size:12px;margin-top:16px;">
            ${config?.myName}'s Japan Journal
          </p>
        </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Error', 'Could not generate collage.');
    }
  };

  if (!config) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>🖼️ Photo Collage</Text>
      <Text style={styles.subtitle}>Pick a day to see its photos</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPicker}>
        {loggedDays.map((d) => (
          <TouchableOpacity
            key={d.date}
            style={[styles.dayChip, selectedDate === d.date && styles.dayChipSelected]}
            onPress={() => setSelectedDate(d.date)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayChipText, selectedDate === d.date && styles.dayChipTextSelected]}>
              Day {d.dayNum}
            </Text>
            <Text style={[styles.dayChipCount, selectedDate === d.date && styles.dayChipTextSelected]}>
              {d.photos.length} 📸
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {photos.length > 0 ? (
        <>
          <View style={styles.grid}>
            {photos.map((uri, i) => (
              <Image
                key={`${uri}-${i}`}
                source={{ uri }}
                style={[styles.gridImage, { width: tileSize, height: tileSize }]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareText}>📤 Share Collage as PDF</Text>
          </TouchableOpacity>
        </>
      ) : selectedDate ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No photos for this day.</Text>
        </View>
      ) : loggedDays.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyText}>
            No photos yet!{'\n'}Add photos to your entries to create collages.
          </Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Select a day above to preview its photos.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  dayPicker: {
    marginBottom: 16,
  },
  dayChip: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayChipSelected: {
    backgroundColor: COLORS.pink,
    borderColor: COLORS.pink,
  },
  dayChipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.text,
  },
  dayChipCount: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  dayChipTextSelected: {
    color: COLORS.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridImage: {
    borderRadius: 8,
  },
  shareButton: {
    backgroundColor: COLORS.pink,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  shareText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
});
