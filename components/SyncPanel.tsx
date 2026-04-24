import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useJournalStore } from '../lib/store';
import { shareEntries, copyEntriesToClipboard, parseImportedEntries } from '../lib/sync';
import { COLORS } from '../lib/constants';

interface Props {
  date: string;
  visible: boolean;
  onClose: () => void;
}

export default function SyncPanel({ date, visible, onClose }: Props) {
  const config = useJournalStore((s) => s.config);
  const dayLog = useJournalStore((s) => s.days[date]);
  const importPartnerEntries = useJournalStore((s) => s.importPartnerEntries);
  const [importText, setImportText] = useState('');

  if (!config) return null;

  const entries = dayLog?.entries || [];

  const handleShare = async () => {
    await shareEntries(entries, config.myName);
  };

  const handleCopy = async () => {
    await copyEntriesToClipboard(entries, config.myName);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', 'Your entries are on the clipboard. Send them to your partner!');
  };

  const handleImport = () => {
    const result = parseImportedEntries(importText);
    if (!result) {
      Alert.alert('Invalid data', 'Could not parse the entries. Make sure you pasted the full text.');
      return;
    }
    const count = importPartnerEntries(result.entries);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Imported!',
      `Added ${count} entries from ${result.author} to your timeline.`
    );
    setImportText('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.spacer} />
          <View style={styles.sheet}>
            <Text style={styles.title}>Partner Sync</Text>
            <Text style={styles.subtitle}>
              Share your entries, then import your partner's
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📤 Share My Entries</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={handleShare}>
                  <Text style={styles.buttonText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonAlt} onPress={handleCopy}>
                  <Text style={styles.buttonAltText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📥 Import Partner's Entries</Text>
              <TextInput
                style={styles.importInput}
                value={importText}
                onChangeText={setImportText}
                placeholder="Paste your partner's entries here..."
                placeholderTextColor={COLORS.textLight}
                multiline
              />
              <TouchableOpacity
                style={[styles.button, !importText.trim() && styles.disabled]}
                onPress={handleImport}
                disabled={!importText.trim()}
              >
                <Text style={styles.buttonText}>Import</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  sheet: {
    backgroundColor: COLORS.backgroundAlt,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.pink,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  buttonAlt: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.pink,
  },
  buttonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  buttonAltText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.pink,
  },
  disabled: {
    opacity: 0.5,
  },
  importInput: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  closeButton: {
    alignItems: 'center',
    padding: 12,
  },
  closeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: COLORS.textLight,
  },
});
