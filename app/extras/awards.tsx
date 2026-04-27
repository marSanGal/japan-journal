import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useJournalStore } from '../../lib/store';
import { computeAwards } from '../../lib/awards';
import { COLORS } from '../../lib/constants';

export default function AwardsScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);

  const awards = useMemo(
    () => (config ? computeAwards(days, config) : []),
    [days, config]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>🏆 Trip Awards</Text>
      <Text style={styles.subtitle}>
        {awards.length > 0 ? 'Your trip highlights!' : 'Keep logging to earn awards!'}
      </Text>

      {awards.map((award) => (
        <View key={award.id} style={styles.card}>
          <Text style={styles.awardIcon}>{award.icon}</Text>
          <View style={styles.cardBody}>
            <Text style={styles.awardTitle}>{award.title}</Text>
            <Text style={styles.awardDetail}>{award.detail}</Text>
          </View>
          <View style={styles.valueBadge}>
            <Text style={styles.awardValue}>{award.value}</Text>
          </View>
        </View>
      ))}

      {awards.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎌</Text>
          <Text style={styles.emptyText}>
            Awards are computed from your entries.{'\n'}Start logging your adventure!
          </Text>
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
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  awardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  awardTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.text,
  },
  awardDetail: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  valueBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  awardValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.primary,
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
