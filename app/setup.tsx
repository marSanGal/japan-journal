import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { useJournalStore } from '../lib/store';
import { COLORS, TRAVELER_COLORS } from '../lib/constants';

export default function SetupScreen() {
  const setConfig = useJournalStore((s) => s.setConfig);
  const existingConfig = useJournalStore((s) => s.config);

  const [myName, setMyName] = useState('');
  const [partners, setPartners] = useState<string[]>(['']);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [totalDays, setTotalDays] = useState('21');

  if (existingConfig) {
    router.replace('/(tabs)');
    return null;
  }

  const canSave = myName.trim() && startDate && totalDays;

  const handleSave = () => {
    if (!canSave) return;
    const validPartners = partners
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    setConfig({
      myName: myName.trim(),
      partners: validPartners,
      startDate,
      totalDays: parseInt(totalDays, 10) || 21,
    });
    router.replace('/(tabs)');
  };

  const updatePartner = (index: number, value: string) => {
    const updated = [...partners];
    updated[index] = value;
    setPartners(updated);
  };

  const addPartner = () => {
    setPartners([...partners, '']);
  };

  const removePartner = (index: number) => {
    setPartners(partners.filter((_, i) => i !== index));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emoji}>🌸</Text>
        <Text style={styles.title}>Your Japan Story</Text>
        <Text style={styles.subtitle}>
          Set up your travel journal. Traveling solo? Just skip the partners.
          {'\n'}With a group? Add everyone!
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={myName}
            onChangeText={setMyName}
            placeholder="Who are you?"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Travel Partners (optional)</Text>
          {partners.map((partner, index) => (
            <View key={index} style={styles.partnerRow}>
              <View
                style={[
                  styles.partnerDot,
                  { backgroundColor: TRAVELER_COLORS[(index + 1) % TRAVELER_COLORS.length] },
                ]}
              />
              <TextInput
                style={styles.partnerInput}
                value={partner}
                onChangeText={(val) => updatePartner(index, val)}
                placeholder={`Partner ${index + 1}`}
                placeholderTextColor={COLORS.textLight}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePartner(index)}
              >
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addPartner}>
            <Text style={styles.addText}>+ Add partner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Trip Start Date</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Trip Length (days)</Text>
          <TextInput
            style={styles.input}
            value={totalDays}
            onChangeText={setTotalDays}
            placeholder="21"
            keyboardType="number-pad"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !canSave && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {partners.some((p) => p.trim()) ? 'Begin Our Story ✨' : 'Begin My Story ✨'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  partnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  partnerInput: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: 'Nunito_600SemiBold',
  },
  addButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.pink,
  },
  button: {
    backgroundColor: COLORS.pink,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.white,
  },
});
