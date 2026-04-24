import { useRef, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import { useJournalStore } from '../../lib/store';
import { COLORS, WEATHER_OPTIONS } from '../../lib/constants';
import DayHeader from '../../components/DayHeader';
import EntryCard from '../../components/EntryCard';
import FAB from '../../components/FAB';
import AddEntrySheet from '../../components/AddEntrySheet';
import SyncPanel from '../../components/SyncPanel';

export default function TodayScreen() {
  const config = useJournalStore((s) => s.config);
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayLog = useJournalStore((s) => s.days[today]);
  const setWeather = useJournalStore((s) => s.setWeather);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const sheetRef = useRef<BottomSheet>(null);
  const [syncVisible, setSyncVisible] = useState(false);

  const entries = dayLog?.entries || [];

  const handleWeatherPress = useCallback(() => {
    Alert.alert(
      'Weather today?',
      undefined,
      WEATHER_OPTIONS.map((w) => ({
        text: `${w.icon} ${w.label}`,
        onPress: () => setWeather(today, w.label),
      }))
    );
  }, [today, setWeather]);

  const handleDeleteEntry = useCallback(
    (entryId: string) => {
      Alert.alert('Delete entry?', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEntry(today, entryId),
        },
      ]);
    },
    [today, deleteEntry]
  );

  if (!config) {
    router.replace('/setup');
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryCard
            entry={item}
            onLongPress={() => handleDeleteEntry(item.id)}
          />
        )}
        ListHeaderComponent={
          <DayHeader date={today} onWeatherPress={handleWeatherPress} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌸</Text>
            <Text style={styles.emptyText}>
              Your story begins here.{'\n'}Tap the pencil to log your first moment!
            </Text>
          </View>
        }
        ListFooterComponent={
          entries.length > 0 ? (
            <View style={styles.footer}>
              {config.partners.length > 0 && (
                <TouchableOpacity
                  style={styles.syncButton}
                  onPress={() => setSyncVisible(true)}
                >
                  <Text style={styles.syncText}>🔄 Partner Sync</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.chapterButton}
                onPress={() => router.push(`/chapter/${today}`)}
              >
                <Text style={styles.chapterButtonText}>
                  📝 Write Tonight's Chapter
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FAB onPress={() => sheetRef.current?.snapToIndex(0)} />
      <AddEntrySheet sheetRef={sheetRef} />
      <SyncPanel
        date={today}
        visible={syncVisible}
        onClose={() => setSyncVisible(false)}
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
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
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
  footer: {
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  syncButton: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  syncText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: COLORS.blue,
  },
  chapterButton: {
    backgroundColor: COLORS.pink,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  chapterButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.white,
  },
});
