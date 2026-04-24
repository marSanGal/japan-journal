import { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useJournalStore } from '../../lib/store';
import { COLORS } from '../../lib/constants';
import { BADGES, computeBadgeContext, getEarnedBadges, getNextBadges } from '../../lib/gacha';

export default function BadgesScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);
  const goshuinCount = useJournalStore((s) => s.goshuinStamps.length);
  const konbiniCount = useJournalStore((s) => s.konbiniChecked.length);
  const manholeCount = useJournalStore((s) => s.manholeCovers.length);

  const ctx = useMemo(
    () =>
      computeBadgeContext(
        days,
        goshuinCount,
        konbiniCount,
        config?.partners.length || 0,
        manholeCount
      ),
    [days, goshuinCount, konbiniCount, config, manholeCount]
  );

  const earned = useMemo(() => getEarnedBadges(ctx), [ctx]);
  const upcoming = useMemo(() => getNextBadges(ctx), [ctx]);

  return (
    <View style={styles.container}>
      <FlatList
        data={[
          ...earned.map((b) => ({ ...b, earned: true })),
          ...upcoming.map((b) => ({ ...b, earned: false })),
        ]}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>🎰 Badges</Text>
            <Text style={styles.subtitle}>
              {earned.length} / {BADGES.length} earned
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(
                      (earned.length / BADGES.length) * 100,
                      2
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.badge, !item.earned && styles.badgeLocked]}
          >
            <Text style={[styles.badgeIcon, !item.earned && styles.iconLocked]}>
              {item.icon}
            </Text>
            <Text
              style={[styles.badgeName, !item.earned && styles.nameLocked]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text style={styles.badgeDesc} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        )}
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
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: COLORS.textLight, marginBottom: 12 },
  progressBar: {
    width: '80%',
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.yellow, borderRadius: 5 },
  list: { paddingHorizontal: 8, paddingBottom: 100 },
  row: { gap: 6 },
  badge: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeLocked: { opacity: 0.4 },
  badgeIcon: { fontSize: 32, marginBottom: 6 },
  iconLocked: { opacity: 0.3 },
  badgeName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  nameLocked: { color: COLORS.textLight },
  badgeDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
