import { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { useJournalStore } from '../../lib/store';
import { Entry } from '../../lib/types';
import { COLORS } from '../../lib/constants';
import DayHeader from '../../components/DayHeader';
import EntryCard from '../../components/EntryCard';
import FAB from '../../components/FAB';
import AddEntrySheet from '../../components/AddEntrySheet';
import ExtraPhotos from '../../components/ExtraPhotos';
import EkiStampCounter from '../../components/EkiStampCounter';

export default function DayEditorScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const config = useJournalStore((s) => s.config);
  const dayLog = useJournalStore((s) => s.days[date!]);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const sheetRef = useRef<BottomSheet>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!sheetOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      sheetRef.current?.close();
      return true;
    });
    return () => sub.remove();
  }, [sheetOpen]);

  if (!date || !config) return null;

  const entries = dayLog?.entries || [];

  const handleDeleteEntry = useCallback(
    (entryId: string) => {
      Alert.alert('Delete entry?', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEntry(date, entryId),
        },
      ]);
    },
    [date, deleteEntry]
  );

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
        ListHeaderComponent={<DayHeader date={date} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No entries for this day yet.{'\n'}Tap the pencil to add one!
            </Text>
          </View>
        }
        ListFooterComponent={
          <View>
            <ExtraPhotos date={date} />
            <EkiStampCounter date={date} />
            {entries.length > 0 && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.chapterButton}
                  onPress={() => router.push(`/chapter/${date}`)}
                >
                  <Text style={styles.chapterButtonText}>
                    📖 View Chapter
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
        forDate={date}
        onSheetChange={(index) => setSheetOpen(index >= 0)}
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
  chapterButton: {
    backgroundColor: COLORS.primary,
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
