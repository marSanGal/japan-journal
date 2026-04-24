import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useJournalStore } from '../../lib/store';
import { COLORS, CATEGORY_CONFIG, getTravelerColor } from '../../lib/constants';
import { fuzzyMatchLocation } from '../../lib/locations';
import { Entry } from '../../lib/types';

interface MapEntry {
  entry: Entry;
  lat: number;
  lng: number;
}

export default function MapScreen() {
  const config = useJournalStore((s) => s.config);
  const days = useJournalStore((s) => s.days);

  const mapEntries = useMemo(() => {
    const results: MapEntry[] = [];
    for (const day of Object.values(days)) {
      for (const entry of day.entries) {
        if (!entry.location) continue;
        const match = fuzzyMatchLocation(entry.location);
        if (match) {
          results.push({
            entry,
            lat: match.lat + (Math.random() - 0.5) * 0.002,
            lng: match.lng + (Math.random() - 0.5) * 0.002,
          });
        }
      }
    }
    return results;
  }, [days]);

  if (!config) return null;

  const allNames = [config.myName, ...config.partners];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗾 Our Map</Text>
        <Text style={styles.subtitle}>
          {mapEntries.length} locations logged
        </Text>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 36.2,
          longitude: 138.2,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        {mapEntries.map((me, i) => {
          const cat = CATEGORY_CONFIG[me.entry.category];
          const color = getTravelerColor(me.entry.author, allNames);
          return (
            <Marker
              key={`${me.entry.id}-${i}`}
              coordinate={{ latitude: me.lat, longitude: me.lng }}
              title={`${cat.icon} ${me.entry.text.slice(0, 40)}`}
              description={`${me.entry.author} @ ${me.entry.location}`}
              pinColor={color}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 12,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: COLORS.textLight,
  },
  map: {
    flex: 1,
  },
});
