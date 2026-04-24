import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useJournalStore } from '../../lib/store';
import { COLORS } from '../../lib/constants';
import { NARRATOR_PERSONAS } from '../../lib/personas';

export default function PersonaScreen() {
  const current = useJournalStore((s) => s.narratorPersona);
  const setPersona = useJournalStore((s) => s.setNarratorPersona);

  return (
    <View style={styles.container}>
      <FlatList
        data={NARRATOR_PERSONAS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>🎭 Narrator Voice</Text>
            <Text style={styles.subtitle}>
              Choose who tells your story
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isActive = current === item.id;
          return (
            <TouchableOpacity
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => {
                setPersona(item.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.label}</Text>
                  <Text style={styles.cardDesc}>{item.description}</Text>
                </View>
                {isActive && <Text style={styles.check}>✅</Text>}
              </View>
              <Text style={styles.preview} numberOfLines={3}>
                "{item.prompt.split('\n')[0]}"
              </Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 20, paddingBottom: 16, alignItems: 'center' },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: COLORS.text, marginBottom: 4 },
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: COLORS.textLight },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: { borderColor: COLORS.pink },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  cardIcon: { fontSize: 36 },
  cardName: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: COLORS.text },
  cardDesc: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: COLORS.textLight },
  check: { fontSize: 20 },
  preview: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
