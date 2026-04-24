import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useJournalStore } from '../../lib/store';
import { COLORS, CATEGORY_CONFIG, getTravelerColor } from '../../lib/constants';
import { formatYenWithUsd } from '../../lib/currency';
import { EntryCategory, Entry } from '../../lib/types';

export default function StatsScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);

  if (!config) return null;

  const allNames = [config.myName, ...config.partners];
  const allEntries: Entry[] = Object.values(days).flatMap((d) => d.entries);
  const totalEntries = allEntries.length;
  const entriesByTraveler = allNames.map((name) => ({
    name,
    count: allEntries.filter((e) => e.author === name).length,
  }));
  const totalYen = allEntries
    .filter((e) => e.amountYen)
    .reduce((sum, e) => sum + (e.amountYen || 0), 0);
  const chaptersWritten = Object.values(days).filter((d) => d.narrative).length;
  const daysLogged = Object.values(days).filter((d) => d.entries.length > 0).length;

  const categoryCounts: Record<string, number> = {};
  for (const entry of allEntries) {
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
  }
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.title}>⭐ Trip Stats</Text>
        <Text style={styles.subtitle}>
          {config.partners.length > 0
            ? [config.myName, ...config.partners].join(' & ')
            : config.myName}
        </Text>
      </View>

      <View style={styles.grid}>
        <StatBox label="Total Entries" value={totalEntries.toString()} icon="📝" />
        <StatBox label="Days Logged" value={daysLogged.toString()} icon="📅" />
        <StatBox
          label="Chapters Written"
          value={chaptersWritten.toString()}
          icon="📖"
        />
        <StatBox
          label="Total Spent"
          value={totalYen > 0 ? formatYenWithUsd(totalYen) : '¥0'}
          icon="💴"
          wide
        />
      </View>

      {allNames.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Traveler</Text>
          {entriesByTraveler.map(({ name, count }) => (
            <View key={name} style={styles.travelerRow}>
              <View
                style={[
                  styles.travelerBar,
                  { backgroundColor: getTravelerColor(name, allNames) },
                ]}
              >
                <Text style={styles.travelerBarText}>
                  {name}: {count}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {sortedCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          {sortedCategories.map(([cat, count]) => {
            const cfg = CATEGORY_CONFIG[cat as EntryCategory];
            const pct =
              totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
            return (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catIcon}>{cfg.icon}</Text>
                <Text style={styles.catLabel}>{cfg.label}</Text>
                <View style={styles.catBarContainer}>
                  <View
                    style={[
                      styles.catBar,
                      { width: `${Math.max(pct, 5)}%`, backgroundColor: cfg.color },
                    ]}
                  />
                </View>
                <Text style={styles.catCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  icon,
  wide,
}: {
  label: string;
  value: string;
  icon: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.statBox, wide && styles.statBoxWide]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingBottom: 100,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statBoxWide: {
    minWidth: '95%',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: COLORS.textLight,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
  },
  travelerRow: {
    marginBottom: 8,
  },
  travelerBar: {
    borderRadius: 10,
    padding: 12,
  },
  travelerBarText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  catIcon: {
    fontSize: 20,
    width: 28,
  },
  catLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
    width: 72,
  },
  catBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  catBar: {
    height: '100%',
    borderRadius: 8,
  },
  catCount: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textLight,
    width: 28,
    textAlign: 'right',
  },
});
