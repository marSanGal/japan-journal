import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useJournalStore } from '../lib/store';
import { COLORS } from '../lib/constants';

export default function EkiStampCounter({ date }: { date: string }) {
  const stored = useJournalStore((s) => s.days[date]?.ekiStampCount ?? 0);
  const setEkiStampCount = useJournalStore((s) => s.setEkiStampCount);
  const [draft, setDraft] = useState(stored > 0 ? stored.toString() : '');

  const handleSubmit = () => {
    const parsed = parseInt(draft, 10);
    const value = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setEkiStampCount(date, value);
    setDraft(value > 0 ? value.toString() : '');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🔖 Eki Stamps today</Text>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        onBlur={handleSubmit}
        onSubmitEditing={handleSubmit}
        keyboardType="number-pad"
        returnKeyType="done"
        placeholder="0"
        placeholderTextColor={COLORS.textLight}
        selectTextOnFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  input: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 56,
    textAlign: 'center',
  },
});
