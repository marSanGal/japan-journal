import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useJournalStore } from '../../lib/store';
import { COLORS } from '../../lib/constants';
import { KONBINI_ITEMS } from '../../lib/konbini';

export default function KonbiniScreen() {
  const checked = useJournalStore((s) => s.konbiniChecked);
  const toggle = useJournalStore((s) => s.toggleKonbini);

  const total = KONBINI_ITEMS.length;
  const done = checked.length;
  const pct = Math.round((done / total) * 100);

  return (
    <View style={styles.container}>
      <FlatList
        data={KONBINI_ITEMS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>🏪 Konbini Bingo</Text>
            <Text style={styles.subtitle}>
              {done} / {total} — {pct}% complete
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${Math.max(pct, 2)}%` }]}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isDone = checked.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.item, isDone && styles.itemDone]}
              onPress={() => {
                toggle(item.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={[styles.itemName, isDone && styles.itemNameDone]}>
                {item.name}
              </Text>
              <Text style={styles.check}>{isDone ? '✅' : '⬜'}</Text>
            </TouchableOpacity>
          );
        }}
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
  header: {
    paddingTop: 20,
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
    marginBottom: 12,
  },
  progressBar: {
    width: '80%',
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 5,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    gap: 12,
  },
  itemDone: {
    backgroundColor: COLORS.green + '15',
  },
  itemIcon: {
    fontSize: 24,
    width: 32,
  },
  itemName: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: COLORS.text,
  },
  itemNameDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  check: {
    fontSize: 20,
  },
});
