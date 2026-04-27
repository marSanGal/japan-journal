import { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import { useJournalStore } from '../../lib/store';
import { Entry } from '../../lib/types';
import { COLORS, WEATHER_OPTIONS } from '../../lib/constants';
import DayHeader from '../../components/DayHeader';
import EntryCard from '../../components/EntryCard';
import FAB from '../../components/FAB';
import AddEntrySheet from '../../components/AddEntrySheet';
import SyncPanel from '../../components/SyncPanel';
import ExtraPhotos from '../../components/ExtraPhotos';
import EkiStampCounter from '../../components/EkiStampCounter';
import { fetchWeatherForDate } from '../../lib/weather';
import { fetchLiveRate } from '../../lib/currency';

export default function TodayScreen() {
  const config = useJournalStore((s) => s.config);
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayLog = useJournalStore((s) => s.days[today]);
  const setWeather = useJournalStore((s) => s.setWeather);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const sheetRef = useRef<BottomSheet>(null);
  const [syncVisible, setSyncVisible] = useState(false);
  const [weatherModalVisible, setWeatherModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const entries = dayLog?.entries || [];

  const handleWeatherPress = useCallback(() => {
    setWeatherModalVisible(true);
  }, []);

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

  useEffect(() => {
    if (!config) {
      router.replace('/setup');
    }
  }, [config]);

  useEffect(() => {
    if (!dayLog?.weather) {
      fetchWeatherForDate(today).then((w) => {
        if (w) setWeather(today, w);
      });
    }
    fetchLiveRate();
  }, [today]);

  if (!config) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryCard
            entry={item}
            onPress={() => {
              setEditingEntry(item);
              sheetRef.current?.snapToIndex(1);
            }}
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
          <View>
            <ExtraPhotos date={today} />
            <EkiStampCounter date={today} />
            {entries.length > 0 && (
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
            )}
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FAB onPress={() => sheetRef.current?.snapToIndex(0)} />
      <AddEntrySheet
        sheetRef={sheetRef}
        editingEntry={editingEntry}
        onEditDone={() => setEditingEntry(null)}
      />
      <SyncPanel
        date={today}
        visible={syncVisible}
        onClose={() => setSyncVisible(false)}
      />

      <Modal
        visible={weatherModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWeatherModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setWeatherModalVisible(false)}>
          <View style={styles.weatherModal}>
            <Text style={styles.weatherModalTitle}>Weather today?</Text>
            {WEATHER_OPTIONS.map((w) => (
              <TouchableOpacity
                key={w.label}
                style={styles.weatherOption}
                onPress={() => {
                  setWeather(today, w.label);
                  setWeatherModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.weatherOptionText}>{w.icon} {w.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  weatherModalTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  weatherOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 8,
  },
  weatherOptionText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
});
