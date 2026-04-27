import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useJournalStore } from '../../lib/store';
import { COLORS } from '../../lib/constants';
import {
  generateFlashcards,
  generatePhraseCards,
  exportAnkiDeck,
} from '../../lib/flashcards';

export default function FlashcardsScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);

  const [mode, setMode] = useState<'memory' | 'phrase'>('memory');
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const memoryCards = useMemo(
    () => (config ? generateFlashcards(days, config.startDate) : []),
    [days, config]
  );
  const phraseCards = useMemo(
    () => (config ? generatePhraseCards(days, config.startDate) : []),
    [days, config]
  );

  const cards = mode === 'memory' ? memoryCards : phraseCards;
  const card = cards[index];

  const next = () => {
    setShowAnswer(false);
    setIndex((i) => (i + 1) % cards.length);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleExportAnki = async () => {
    try {
      const content = exportAnkiDeck(phraseCards);
      const path = `${FileSystem.documentDirectory}japan-phrases.txt`;
      await FileSystem.writeAsStringAsync(path, content);
      await Sharing.shareAsync(path, { mimeType: 'text/plain' });
    } catch (err: any) {
      Alert.alert('Export failed', err?.message || 'Could not export');
    }
  };

  if (!config) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Flashcards</Text>
        <Text style={styles.subtitle}>
          {cards.length} cards available
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === 'memory' && styles.tabActive]}
          onPress={() => {
            setMode('memory');
            setIndex(0);
            setShowAnswer(false);
          }}
        >
          <Text
            style={[
              styles.tabText,
              mode === 'memory' && styles.tabTextActive,
            ]}
          >
            🗾 Memory Quiz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'phrase' && styles.tabActive]}
          onPress={() => {
            setMode('phrase');
            setIndex(0);
            setShowAnswer(false);
          }}
        >
          <Text
            style={[
              styles.tabText,
              mode === 'phrase' && styles.tabTextActive,
            ]}
          >
            あ Phrases
          </Text>
        </TouchableOpacity>
      </View>

      {card ? (
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              {showAnswer ? 'Answer' : 'Question'} — {index + 1}/{cards.length}
            </Text>
            <Text style={styles.cardText}>
              {showAnswer ? card.answer : card.question}
            </Text>
          </View>

          <View style={styles.buttons}>
            {!showAnswer ? (
              <TouchableOpacity
                style={styles.revealButton}
                onPress={() => {
                  setShowAnswer(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Text style={styles.revealText}>Reveal Answer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.nextButton} onPress={next}>
                <Text style={styles.nextText}>Next Card →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {mode === 'phrase'
              ? 'Log some Japanese phrases to create study cards!'
              : 'Log more entries to generate quiz cards!'}
          </Text>
        </View>
      )}

      {mode === 'phrase' && phraseCards.length > 0 && (
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportAnki}
        >
          <Text style={styles.exportText}>📥 Export as Anki Deck</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  header: { paddingTop: 20, paddingBottom: 16, alignItems: 'center' },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: COLORS.text, marginBottom: 4 },
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: COLORS.textLight },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: COLORS.text },
  tabTextActive: { color: COLORS.white },
  cardContainer: { gap: 16 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 30,
  },
  buttons: { alignItems: 'center' },
  revealButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  revealText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: COLORS.white },
  nextButton: {
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  nextText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: COLORS.white },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  exportButton: {
    marginTop: 24,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  exportText: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: COLORS.purple },
});
