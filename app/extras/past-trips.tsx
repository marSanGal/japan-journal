import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useJournalStore } from '../../lib/store';
import { COLORS, getTripDays, toDisplayDate } from '../../lib/constants';

export default function PastTripsScreen() {
  const config = useJournalStore((s) => s.config);
  const pastTrips = useJournalStore((s) => s.pastTrips);
  const archiveTrip = useJournalStore((s) => s.archiveTrip);
  const days = useJournalStore((s) => s.days);

  const currentEntryCount = Object.values(days).reduce(
    (sum, d) => sum + d.entries.length,
    0
  );
  const currentChapterCount = Object.values(days).filter(
    (d) => d.narrative
  ).length;

  const handleArchive = () => {
    if (!config) return;
    Alert.alert(
      'Archive this trip?',
      'Your current trip will be saved and a new trip can begin. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive & Reset',
          style: 'destructive',
          onPress: archiveTrip,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={pastTrips}
        keyExtractor={(_, i) => `past-${i}`}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>🗾 Trip History</Text>
              <Text style={styles.subtitle}>
                {pastTrips.length} past trip{pastTrips.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {config && (
              <View style={styles.currentTrip}>
                <Text style={styles.sectionTitle}>Current Trip</Text>
                <View style={styles.tripCard}>
                  <Text style={styles.tripName}>
                    {[config.myName, ...config.partners].join(' & ')}
                  </Text>
                  <Text style={styles.tripMeta}>
                    Started {toDisplayDate(config.startDate)} · {getTripDays(config)} days
                  </Text>
                  <Text style={styles.tripStats}>
                    {currentEntryCount} entries · {currentChapterCount} chapters
                  </Text>
                  <TouchableOpacity
                    style={styles.archiveButton}
                    onPress={handleArchive}
                  >
                    <Text style={styles.archiveText}>
                      📦 Archive & Start New Trip
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {pastTrips.length > 0 && (
              <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>
                Past Trips
              </Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const entryCount = Object.values(item.days).reduce(
            (sum, d) => sum + d.entries.length,
            0
          );
          const chapterCount = Object.values(item.days).filter(
            (d) => d.narrative
          ).length;

          return (
            <View style={styles.pastCard}>
              <Text style={styles.pastName}>
                🗾 {[item.config.myName, ...item.config.partners].join(' & ')}
              </Text>
              <Text style={styles.pastMeta}>
                {toDisplayDate(item.config.startDate)} · {getTripDays(item.config)} days
              </Text>
              <Text style={styles.pastStats}>
                {entryCount} entries · {chapterCount} chapters
                {item.epilogue ? ' · Has epilogue' : ''}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          !config ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No trips yet! Set up your first trip on the Today tab.
              </Text>
            </View>
          ) : null
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
  list: { paddingBottom: 100 },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  currentTrip: { paddingHorizontal: 16, marginBottom: 24 },
  tripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  tripName: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: COLORS.text, marginBottom: 4 },
  tripMeta: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: COLORS.textLight, marginBottom: 4 },
  tripStats: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: COLORS.text, marginBottom: 12 },
  archiveButton: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  archiveText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: COLORS.textLight },
  pastCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  pastName: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: COLORS.text, marginBottom: 4 },
  pastMeta: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: COLORS.textLight, marginBottom: 2 },
  pastStats: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: COLORS.textLight },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
