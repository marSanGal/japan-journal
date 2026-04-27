import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useJournalStore } from '../../lib/store';
import { generateChapter } from '../../lib/openai';
import { COLORS } from '../../lib/constants';
import EntryCard from '../../components/EntryCard';
import ChapterCard from '../../components/ChapterCard';
import DayHeader from '../../components/DayHeader';
import PhotoCollage from '../../components/PhotoCollage';
import { format, parseISO } from 'date-fns';

export default function ChapterScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const config = useJournalStore((s) => s.config);
  const dayLog = useJournalStore((s) => s.days[date!]);
  const setNarrative = useJournalStore((s) => s.setNarrative);
  const chapterNum = useJournalStore((s) => s.getChapterNumber(date!));

  const persona = useJournalStore((s) => s.narratorPersona);
  const [loading, setLoading] = useState(false);

  if (!date || !config) return null;

  const entries = dayLog?.entries || [];
  const narrative = dayLog?.narrative;
  const dayPhotos = entries
    .filter((e) => e.photoUri)
    .map((e) => e.photoUri!);

  const handleGenerate = async () => {
    if (entries.length === 0) {
      Alert.alert('No entries yet', 'Add some entries before writing the chapter!');
      return;
    }

    setLoading(true);
    try {
      const allTravelers = [config.myName, ...config.partners];
      const chapter = await generateChapter(
        entries,
        allTravelers,
        chapterNum,
        dayLog?.weather,
        persona
      );
      setNarrative(date, chapter);
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

  const handleRegenerate = () => {
    Alert.alert(
      'Rewrite this chapter?',
      'This will replace the current narrative with a new one.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rewrite', onPress: handleGenerate },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EntryCard entry={item} />}
        ListHeaderComponent={
          <View>
            <DayHeader date={date} />
            {narrative && <ChapterCard narrative={narrative} />}
            {dayPhotos.length > 0 && (
              <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
                <PhotoCollage
                  photos={dayPhotos}
                  dayLabel={`Day ${chapterNum} — ${format(parseISO(date), 'MMM d')}`}
                />
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingIcon}>📝</Text>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>
                  Writing your chapter...
                </Text>
              </View>
            ) : narrative ? (
              <TouchableOpacity
                style={styles.rewriteButton}
                onPress={handleRegenerate}
              >
                <Text style={styles.rewriteText}>🔄 Rewrite Chapter</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerate}
              >
                <Text style={styles.generateText}>
                  ✨ Write This Chapter
                </Text>
              </TouchableOpacity>
            )}
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
  list: {
    paddingBottom: 40,
  },
  footer: {
    padding: 16,
    marginTop: 8,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  generateText: {
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
});
