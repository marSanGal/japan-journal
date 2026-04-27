import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { COLORS, WEATHER_OPTIONS } from '../lib/constants';
import { useJournalStore } from '../lib/store';
import InkDivider from './InkDivider';

interface Props {
  date: string;
  onWeatherPress?: () => void;
}

export default function DayHeader({ date, onWeatherPress }: Props) {
  const config = useJournalStore((s) => s.config);
  const day = useJournalStore((s) => s.days[date]);
  const chapterNum = useJournalStore((s) => s.getChapterNumber(date));

  const dateObj = new Date(date + 'T12:00:00');
  const formattedDate = format(dateObj, 'EEEE, MMMM d');
  const weatherIcon = WEATHER_OPTIONS.find((w) => w.label === day?.weather)?.icon;

  return (
    <View style={styles.container}>
      <View style={styles.chapterBadge}>
        <Text style={styles.chapterText}>Chapter {chapterNum}</Text>
      </View>
      <Text style={styles.date}>{formattedDate}</Text>
      {config && (
        <Text style={styles.travelers}>
          {config.partners.length > 0
            ? [config.myName, ...config.partners].join(' & ')
            : config.myName}
        </Text>
      )}
      <TouchableOpacity onPress={onWeatherPress} style={styles.weatherRow}>
        <Text style={styles.weather}>
          {weatherIcon ? `${weatherIcon} ${day?.weather}` : '🌤️ Tap to set weather'}
        </Text>
        {day?.steps ? (
          <Text style={styles.steps}>👣 {day.steps.toLocaleString()} steps</Text>
        ) : null}
      </TouchableOpacity>
      <InkDivider />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  chapterBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  chapterText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.white,
  },
  date: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
  },
  travelers: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  weatherRow: {
    flexDirection: 'row',
    gap: 16,
  },
  weather: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textLight,
  },
  steps: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textLight,
  },
});
