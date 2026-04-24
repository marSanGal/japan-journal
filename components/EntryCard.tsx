import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Entry } from '../lib/types';
import { CATEGORY_CONFIG, COLORS, getTravelerColor } from '../lib/constants';
import { useJournalStore } from '../lib/store';
import { formatYen } from '../lib/currency';
import AudioPlayer from './AudioPlayer';

interface Props {
  entry: Entry;
  onLongPress?: () => void;
}

export default function EntryCard({ entry, onLongPress }: Props) {
  const config = useJournalStore((s) => s.config);
  const catConfig = CATEGORY_CONFIG[entry.category];
  const time = format(new Date(entry.timestamp), 'h:mm a');
  const allNames = config ? [config.myName, ...config.partners] : [];
  const authorColor = getTravelerColor(entry.author, allNames);

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      delayLongPress={500}
    >
      <View style={[styles.colorBar, { backgroundColor: catConfig.color }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.left}>
            <Text style={styles.icon}>{catConfig.icon}</Text>
            <View>
              <View style={styles.metaRow}>
                <Text style={styles.time}>{time}</Text>
                <View style={[styles.authorDot, { backgroundColor: authorColor }]} />
                <Text style={[styles.author, { color: authorColor }]}>
                  {entry.author}
                </Text>
                {entry.together && (
                  <View style={styles.togetherBadge}>
                    <Text style={styles.togetherText}>together</Text>
                  </View>
                )}
              </View>
              <Text style={styles.category}>{catConfig.label}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.text}>{entry.text}</Text>
        {entry.location && (
          <Text style={styles.location}>📍 {entry.location}</Text>
        )}
        {entry.amountYen && (
          <Text style={styles.amount}>{formatYen(entry.amountYen)}</Text>
        )}
        {entry.photoUri && (
          <Image
            source={{ uri: entry.photoUri }}
            style={styles.photo}
            resizeMode="cover"
          />
        )}
        {entry.audioUri && <AudioPlayer uri={entry.audioUri} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  colorBar: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: COLORS.textLight,
  },
  authorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  author: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
  },
  togetherBadge: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  togetherText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 10,
    color: COLORS.white,
  },
  category: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: COLORS.textLight,
  },
  text: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 21,
    marginTop: 4,
  },
  location: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  amount: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.orange,
    marginTop: 2,
  },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginTop: 8,
  },
});
