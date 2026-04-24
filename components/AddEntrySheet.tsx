import { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { v4 as uuid } from 'uuid';
import { useJournalStore } from '../lib/store';
import { CATEGORY_CONFIG, COLORS } from '../lib/constants';
import { EntryCategory } from '../lib/types';

interface Props {
  sheetRef: React.RefObject<BottomSheet | null>;
}

export default function AddEntrySheet({ sheetRef }: Props) {
  const config = useJournalStore((s) => s.config);
  const addEntry = useJournalStore((s) => s.addEntry);

  const [category, setCategory] = useState<EntryCategory | null>(null);
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [amountYen, setAmountYen] = useState('');
  const [together, setTogether] = useState(true);
  const [timeOffset, setTimeOffset] = useState('0');

  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const reset = () => {
    setCategory(null);
    setText('');
    setLocation('');
    setAmountYen('');
    setTogether(true);
    setTimeOffset('0');
  };

  const handleSave = useCallback(() => {
    if (!category || !text.trim() || !config) return;

    const now = new Date();
    const offset = parseInt(timeOffset, 10) || 0;
    now.setMinutes(now.getMinutes() - offset);

    addEntry({
      id: uuid(),
      author: config.myName,
      category,
      text: text.trim(),
      timestamp: now.toISOString(),
      location: location.trim() || undefined,
      amountYen: amountYen ? parseInt(amountYen, 10) : undefined,
      together,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    reset();
    sheetRef.current?.close();
  }, [category, text, location, amountYen, together, timeOffset, config, addEntry, sheetRef]);

  const categories = Object.entries(CATEGORY_CONFIG) as [
    EntryCategory,
    (typeof CATEGORY_CONFIG)[EntryCategory],
  ][];

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      onChange={(index) => {
        if (index === -1) reset();
      }}
    >
      {!category ? (
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>New Entry</Text>
          <View style={styles.grid}>
            {categories.map(([key, cfg]) => (
              <TouchableOpacity
                key={key}
                style={[styles.catButton, { backgroundColor: cfg.color + '30' }]}
                onPress={() => {
                  setCategory(key);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.catIcon}>{cfg.icon}</Text>
                <Text style={styles.catLabel}>{cfg.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      ) : (
        <BottomSheetScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>New Entry</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCategory(null)}
          >
            <Text style={styles.backText}>
              ← {CATEGORY_CONFIG[category].icon} {CATEGORY_CONFIG[category].label}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="What happened?"
            placeholderTextColor={COLORS.textLight}
            multiline
            autoFocus
          />

          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="📍 Location (optional)"
            placeholderTextColor={COLORS.textLight}
          />

          {category === 'purchase' && (
            <TextInput
              style={styles.input}
              value={amountYen}
              onChangeText={setAmountYen}
              placeholder="💴 Amount in yen"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
            />
          )}

          <View style={styles.row}>
            <Text style={styles.rowLabel}>⏱️ Minutes ago</Text>
            <TextInput
              style={styles.smallInput}
              value={timeOffset}
              onChangeText={setTimeOffset}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {config && config.partners.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>👫 Together?</Text>
              <Switch
                value={together}
                onValueChange={setTogether}
                trackColor={{ false: COLORS.border, true: COLORS.green }}
                thumbColor={COLORS.white}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, !text.trim() && styles.saveDisabled]}
            onPress={handleSave}
            disabled={!text.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.saveText}>Save ✨</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 24,
  },
  handle: {
    backgroundColor: COLORS.border,
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  catButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  catIcon: {
    fontSize: 28,
  },
  catLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.text,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: COLORS.pink,
  },
  textInput: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
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
  input: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rowLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: COLORS.text,
  },
  smallInput: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    width: 60,
    textAlign: 'center',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.pink,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: COLORS.white,
  },
});
