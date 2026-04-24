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
import { COLORS } from '../lib/constants';

export default function SetupScreen() {
  const setConfig = useJournalStore((s) => s.setConfig);
  const existingConfig = useJournalStore((s) => s.config);

  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [totalDays, setTotalDays] = useState('21');

  if (existingConfig) {
    router.replace('/(tabs)');
    return null;
  }

  const canSave = myName.trim() && partnerName.trim() && startDate && totalDays;

  const handleSave = () => {
    if (!canSave) return;
    setConfig({
      traveler1: myName.trim(),
      traveler2: partnerName.trim(),
      myName: myName.trim(),
      startDate,
      totalDays: parseInt(totalDays, 10) || 21,
    });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.emoji}>🌸</Text>
        <Text style={styles.title}>Your Japan Story</Text>
        <Text style={styles.subtitle}>
          Set up your travel journal. Both travelers should enter the same names and
          dates on their own phones.
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
          <Text style={styles.label}>Partner's Name</Text>
          <TextInput
            style={styles.input}
            value={partnerName}
            onChangeText={setPartnerName}
            placeholder="Who are you traveling with?"
            placeholderTextColor={COLORS.textLight}
          />
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
          <Text style={styles.buttonText}>Begin Our Story ✨</Text>
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
