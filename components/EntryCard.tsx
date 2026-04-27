import { View, Text, TouchableOpacity, Image, StyleSheet, Linking } from 'react-native';
import { format } from 'date-fns';
import { Entry } from '../lib/types';
import { COLORS, getTravelerColor, getCategoryDisplay } from '../lib/constants';
import { useJournalStore } from '../lib/store';
import { formatYen } from '../lib/currency';
import AudioPlayer from './AudioPlayer';

interface Props {
  entry: Entry;
  onLongPress?: () => void;
  onPress?: () => void;
}

export default function EntryCard({ entry, onLongPress, onPress }: Props) {
  const config = useJournalStore((s) => s.config);
  const customCategories = useJournalStore((s) => s.customCategories);
  const catConfig = getCategoryDisplay(entry.category, entry.customCategoryId, customCategories);
  const time = format(new Date(entry.timestamp), 'h:mm a');
  const allNames = config ? [config.myName, ...config.partners] : [];
  const authorColor = getTravelerColor(entry.author, allNames);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
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
                {entry.participants && entry.participants.length > 1 && (
                  <View style={styles.participantsBadge}>
                    <Text style={styles.participantsText}>
                      {entry.participants.join(', ')}
                    </Text>
                  </View>
                )}
                {!entry.participants && entry.together && (
                  <View style={styles.participantsBadge}>
                    <Text style={styles.participantsText}>together</Text>
                  </View>
                )}
              </View>
              <Text style={styles.category}>{catConfig.label}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.text}>{entry.text}</Text>
        {entry.trainInfo && (
          <View style={styles.trainInfoRow}>
            <Text style={styles.trainRoute}>
              🚉 {entry.trainInfo.fromStation} → {entry.trainInfo.toStation}
            </Text>
            <View style={styles.trainTypeBadge}>
              <Text style={styles.trainTypeLabel}>{entry.trainInfo.type}</Text>
            </View>
          </View>
        )}
        {entry.dishes && entry.dishes.length > 0 && (
          <View style={styles.dishList}>
            {entry.dishes.map((dish, i) => (
              <View key={i} style={styles.dishRow}>
                <Text style={styles.dishName}>
                  🍽️ {dish.name}
                  {dish.rating ? ' ' + '★'.repeat(dish.rating) + '☆'.repeat(5 - dish.rating) : ''}
                </Text>
                {dish.comment ? <Text style={styles.dishComment}>{dish.comment}</Text> : null}
              </View>
            ))}
          </View>
        )}
        {entry.hadLiveMusic !== undefined && entry.category === 'bar' && (
          <View style={styles.barInfoRow}>
            {entry.barGenre && (
              <View style={styles.barGenreBadge}>
                <Text style={styles.barGenreLabel}>{entry.barGenre}</Text>
              </View>
            )}
            {entry.hadLiveMusic && (
              <Text style={styles.liveMusicTag}>🎤 Live!</Text>
            )}
          </View>
        )}
        {entry.songs && entry.songs.length > 0 && (
          <View style={styles.songList}>
            {entry.songs.map((song, i) => (
              <Text key={i} style={styles.songRow}>
                🎵 {song.name}{song.artist ? ` — ${song.artist}` : ''}
              </Text>
            ))}
          </View>
        )}
        {entry.stepsCount && (
          <Text style={styles.stepsText}>👣 {entry.stepsCount.toLocaleString()} steps</Text>
        )}
        {entry.hasGoshuin && (
          <Text style={styles.goshuinBadge}>⛩️ Goshuin collected</Text>
        )}
        {entry.location && (
          <View onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              onPress={() => {
                const query = encodeURIComponent(`${entry.location}, Japan`);
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.location}>📍 {entry.location}</Text>
            </TouchableOpacity>
          </View>
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
  participantsBadge: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  participantsText: {
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
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.blue,
    marginTop: 4,
    textDecorationLine: 'underline',
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
  trainInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  trainRoute: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.blue,
  },
  trainTypeBadge: {
    backgroundColor: COLORS.blue + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trainTypeLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: COLORS.blue,
    textTransform: 'capitalize',
  },
  dishList: {
    marginTop: 4,
    gap: 2,
  },
  dishRow: {
    gap: 1,
  },
  dishName: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.orange,
  },
  dishComment: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 24,
  },
  stepsText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.green,
    marginTop: 2,
  },
  barInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  barGenreBadge: {
    backgroundColor: COLORS.purple + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  barGenreLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: COLORS.purple,
    textTransform: 'capitalize',
  },
  liveMusicTag: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.purple,
  },
  songList: {
    marginTop: 4,
    gap: 2,
  },
  songRow: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.purple,
  },
  goshuinBadge: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.red,
    marginTop: 2,
  },
});
