import { useMemo } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useRef } from 'react';
import { COLORS } from '../lib/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 32;
const GAP = 4;
const GRID_WIDTH = SCREEN_WIDTH - PADDING;
const CELL_SIZE = (GRID_WIDTH - GAP) / 2;

interface Props {
  photos: string[];
  dayLabel: string;
}

export default function PhotoCollage({ photos, dayLabel }: Props) {
  const collageRef = useRef<View>(null);
  const displayPhotos = useMemo(() => photos.slice(0, 4), [photos]);

  if (displayPhotos.length === 0) return null;

  const handleShare = async () => {
    try {
      const uri = await captureRef(collageRef, {
        format: 'png',
        quality: 1,
      });
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Oops', 'Could not share collage');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 {dayLabel} Collage</Text>
      <View ref={collageRef} collapsable={false} style={styles.collage}>
        <View style={styles.grid}>
          {displayPhotos.map((uri, i) => (
            <Image
              key={`${uri}-${i}`}
              source={{ uri }}
              style={[
                styles.photo,
                displayPhotos.length === 1 && styles.photoFull,
                displayPhotos.length === 3 && i === 2 && styles.photoWide,
              ]}
            />
          ))}
        </View>
        <Text style={styles.watermark}>{dayLabel}</Text>
      </View>
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareText}>Share Collage</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  collage: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    padding: GAP,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  photo: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
  },
  photoFull: {
    width: GRID_WIDTH - GAP * 2,
    height: GRID_WIDTH - GAP * 2,
  },
  photoWide: {
    width: GRID_WIDTH - GAP * 2,
    height: CELL_SIZE / 2,
  },
  watermark: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingTop: 6,
    paddingBottom: 2,
  },
  shareButton: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: COLORS.pink,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  shareText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.white,
  },
});
