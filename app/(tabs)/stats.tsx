import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useJournalStore } from '../../lib/store';
import { COLORS, CATEGORY_CONFIG, getTravelerColor, getCategoryDisplay } from '../../lib/constants';
import { formatYenWithGbp } from '../../lib/currency';
import { EntryCategory, Entry } from '../../lib/types';

export default function StatsScreen() {
  const router = useRouter();
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);
  const goshuinCount = useJournalStore((s) => s.goshuinStamps.length);
  const konbiniCount = useJournalStore((s) => s.konbiniChecked.length);
  const manholeCount = useJournalStore((s) => s.manholeCovers.length);
  const customCategories = useJournalStore((s) => s.customCategories);

  const { width: screenWidth } = useWindowDimensions();
  const tileWidth = (screenWidth - 32 - 8) / 2;

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
  const totalSteps = allEntries
    .filter((e) => e.stepsCount)
    .reduce((sum, e) => sum + (e.stepsCount || 0), 0);
  const totalEkiStamps = Object.values(days).reduce(
    (sum, d) => sum + (d.ekiStampCount || 0), 0
  );

  const loggedDays = Object.entries(days)
    .filter(([, d]) => d.entries.length > 0)
    .map(([dateStr, d]) => {
      const start = new Date(config.startDate);
      const current = new Date(dateStr);
      const dayNum = Math.floor(
        (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      return {
        date: dateStr,
        dayNum,
        entryCount: d.entries.length,
        hasNarrative: !!d.narrative,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const categoryCounts: Record<string, number> = {};
  for (const entry of allEntries) {
    const key = entry.category === 'custom' && entry.customCategoryId
      ? `custom:${entry.customCategoryId}`
      : entry.category;
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  }
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const spendingData = (() => {
    if (!config) return [];
    const rows = Object.entries(days)
      .filter(([, d]) => (d.totalSpendYen || 0) > 0)
      .map(([dateStr, d]) => {
        const start = new Date(config.startDate);
        const current = new Date(dateStr);
        const dayNum = Math.floor(
          (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        return { date: dateStr, dayNum, amount: d.totalSpendYen || 0, pct: 0 };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    const max = Math.max(...rows.map((r) => r.amount), 1);
    for (const row of rows) {
      row.pct = Math.round((row.amount / max) * 100);
    }
    return rows;
  })();

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
        <StatBox label="Total Entries" value={totalEntries.toString()} icon="📝" width={tileWidth} />
        <StatBox label="Days Logged" value={daysLogged.toString()} icon="📅" width={tileWidth} />
        <StatBox label="Chapters" value={chaptersWritten.toString()} icon="📖" width={tileWidth} />
        <StatBox label="Total Spent" value={totalYen > 0 ? formatYenWithGbp(totalYen) : '¥0'} icon="💴" width={tileWidth} />
        <StatBox label="Total Steps" value={totalSteps > 0 ? totalSteps.toLocaleString() : '0'} icon="👣" width={tileWidth} />
        <StatBox label="Eki Stamps" value={totalEkiStamps.toString()} icon="🔖" width={tileWidth} />
        {customCategories
          .filter((cc) => cc.showInStats)
          .map((cc) => {
            const count = allEntries.filter(
              (e) => e.category === 'custom' && e.customCategoryId === cc.id
            ).length;
            return (
              <StatBox
                key={cc.id}
                label={cc.label}
                value={count.toString()}
                icon={cc.icon}
                width={tileWidth}
              />
            );
          })}
      </View>

      {spendingData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Spending</Text>
          {spendingData.map((d) => (
            <View key={d.date} style={styles.spendRow}>
              <Text style={styles.spendLabel}>Day {d.dayNum}</Text>
              <View style={styles.spendBarTrack}>
                <View
                  style={[
                    styles.spendBar,
                    { width: `${d.pct}%` },
                  ]}
                />
              </View>
              <Text style={styles.spendAmount}>
                ¥{d.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {loggedDays.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Days</Text>
          {loggedDays.map((day) => (
            <TouchableOpacity
              key={day.date}
              style={styles.dayRow}
              onPress={() => router.push(`/day/${day.date}`)}
              activeOpacity={0.7}
            >
              <View style={styles.dayLeft}>
                <Text style={styles.dayNum}>Day {day.dayNum}</Text>
                <Text style={styles.dayDate}>
                  {format(new Date(day.date + 'T12:00:00'), 'EEE, MMM d')}
                </Text>
              </View>
              <View style={styles.dayRight}>
                <View style={styles.dayCountBadge}>
                  <Text style={styles.dayCountText}>{day.entryCount}</Text>
                </View>
                {day.hasNarrative && <Text style={styles.dayChapterIcon}>📖</Text>}
                <Text style={styles.dayArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

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

      <View style={styles.extrasSection}>
        <Text style={styles.sectionTitle}>Collections</Text>
        <View style={styles.extrasRow}>
          <TouchableOpacity
            style={styles.extrasButton}
            onPress={() => router.push('/extras/goshuin')}
          >
            <Text style={styles.extrasIcon}>⛩️</Text>
            <Text style={styles.extrasLabel}>Goshuin</Text>
            <Text style={styles.extrasCount}>{goshuinCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.extrasButton}
            onPress={() => router.push('/extras/konbini')}
          >
            <Text style={styles.extrasIcon}>🏪</Text>
            <Text style={styles.extrasLabel}>Konbini</Text>
            <Text style={styles.extrasCount}>{konbiniCount}/25</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.extrasRow}>
          <TouchableOpacity
            style={styles.extrasButton}
            onPress={() => router.push('/extras/manholes')}
          >
            <Text style={styles.extrasIcon}>🔵</Text>
            <Text style={styles.extrasLabel}>Manholes</Text>
            <Text style={styles.extrasCount}>{manholeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.extrasButton}
            onPress={() => router.push('/extras/badges')}
          >
            <Text style={styles.extrasIcon}>🎰</Text>
            <Text style={styles.extrasLabel}>Badges</Text>
            <Text style={styles.extrasCount}>Gacha!</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.extrasSection}>
        <Text style={styles.sectionTitle}>Tools</Text>
        <View style={styles.extrasRow}>
          <TouchableOpacity
            style={styles.extrasButton}
            onPress={() => router.push('/extras/postcard')}
          >
            <Text style={styles.extrasIcon}>📬</Text>
            <Text style={styles.extrasLabel}>Postcards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.extrasButton}
            onPress={() => router.push('/extras/awards')}
          >
            <Text style={styles.extrasIcon}>🏆</Text>
            <Text style={styles.extrasLabel}>Awards</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.extrasRow}>
          <TouchableOpacity
            style={styles.extrasButton}
            onPress={() => router.push('/extras/collage')}
          >
            <Text style={styles.extrasIcon}>🖼️</Text>
            <Text style={styles.extrasLabel}>Collage</Text>
          </TouchableOpacity>
        </View>
      </View>

      {sortedCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          {sortedCategories.map(([cat, count]) => {
            let cfg: { label: string; icon: string; color: string };
            if (cat.startsWith('custom:')) {
              const ccId = cat.slice(7);
              cfg = getCategoryDisplay('custom', ccId, customCategories);
            } else {
              cfg = CATEGORY_CONFIG[cat as EntryCategory];
            }
            if (!cfg) return null;
            const pct =
              totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
            const displayValue = cat === 'walk' && totalSteps > 0
              ? totalSteps.toLocaleString()
              : String(count);
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
                <Text style={styles.catCount}>{displayValue}</Text>
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
  width,
}: {
  label: string;
  value: string;
  icon: string;
  width: number;
}) {
  return (
    <View style={[styles.statBox, { width }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
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
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 1,
  },
  statLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
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
    minWidth: 28,
    textAlign: 'right',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dayLeft: {
    gap: 2,
  },
  dayNum: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.text,
  },
  dayDate: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textLight,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayCountBadge: {
    backgroundColor: COLORS.pink + '30',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dayCountText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.pink,
  },
  dayChapterIcon: {
    fontSize: 16,
  },
  dayArrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: COLORS.textLight,
  },
  extrasSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 10,
  },
  extrasRow: {
    flexDirection: 'row',
    gap: 10,
  },
  extrasButton: {
    flex: 1,
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
  extrasIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  extrasLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.text,
  },
  extrasCount: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  spendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  spendLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.textLight,
    width: 44,
  },
  spendBarTrack: {
    flex: 1,
    height: 18,
    backgroundColor: COLORS.border,
    borderRadius: 9,
    overflow: 'hidden',
  },
  spendBar: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 9,
  },
  spendAmount: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.orange,
    width: 70,
    textAlign: 'right',
  },
});
