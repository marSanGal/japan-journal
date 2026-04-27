import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Video, ResizeMode } from 'expo-av';
import { useJournalStore } from '../lib/store';
import { ExtraMediaItem } from '../lib/types';
import { COLORS } from '../lib/constants';

const EMPTY: ExtraMediaItem[] = [];

interface Props {
  date: string;
}

export default function ExtraMedia({ date }: Props) {
  const media = useJournalStore((s) => s.days[date]?.extraMedia ?? EMPTY);
  const photos = useJournalStore((s) => s.days[date]?.extraPhotos);
  const favoritePhotoUri = useJournalStore((s) => s.days[date]?.favoritePhotoUri);
  const addExtraMedia = useJournalStore((s) => s.addExtraMedia);
  const removeExtraMedia = useJournalStore((s) => s.removeExtraMedia);
  const addExtraPhoto = useJournalStore((s) => s.addExtraPhoto);
  const removeExtraPhoto = useJournalStore((s) => s.removeExtraPhoto);
  const setFavoritePhoto = useJournalStore((s) => s.setFavoritePhoto);

  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  const allItems: ExtraMediaItem[] = [
    ...(photos || []).map((uri) => ({ uri, type: 'photo' as const })),
    ...media,
  ];

  const handleAddFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      for (const asset of result.assets) {
        const type = asset.type === 'video' ? 'video' : 'photo';
        addExtraMedia(date, { uri: asset.uri, type });
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      addExtraMedia(date, { uri: result.assets[0].uri, type: 'photo' });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemove = (item: ExtraMediaItem, isLegacy: boolean) => {
    Alert.alert(`Remove ${item.type}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (isLegacy) {
            removeExtraPhoto(date, item.uri);
          } else {
            removeExtraMedia(date, item.uri);
          }
        },
      },
    ]);
  };

  const legacyCount = photos?.length || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📸 Extra Photos / Videos</Text>
      {allItems.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {allItems.map((item, i) => {
            const isLegacy = i < legacyCount;
            return (
              <View key={`${item.uri}-${i}`} style={styles.thumbWrapper}>
                {item.type === 'video' ? (
                  <TouchableOpacity onPress={() => setVideoModal(item.uri)} activeOpacity={0.8}>
                    <View style={styles.videoThumb}>
                      <Text style={styles.playIcon}>▶</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => setPhotoModal(item.uri)}
                    onLongPress={() => {
                      const next = favoritePhotoUri === item.uri ? undefined : item.uri;
                      setFavoritePhoto(date, next);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.uri }} style={[styles.thumb, favoritePhotoUri === item.uri && styles.thumbFavorite]} />
                    {favoritePhotoUri === item.uri && (
                      <View style={styles.starBadge}>
                        <Text style={styles.starText}>★</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(item, isLegacy)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.addButton} onPress={handleCamera}>
          <Text style={styles.addText}>📷 Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFromGallery}>
          <Text style={styles.addText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!photoModal} transparent animationType="fade" onRequestClose={() => setPhotoModal(null)}>
        <Pressable style={styles.videoOverlay} onPress={() => setPhotoModal(null)}>
          {photoModal && (
            <Image
              source={{ uri: photoModal }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>

      <Modal visible={!!videoModal} transparent animationType="fade" onRequestClose={() => setVideoModal(null)}>
        <Pressable style={styles.videoOverlay} onPress={() => setVideoModal(null)}>
          <View style={styles.videoContainer}>
            {videoModal && (
              <Video
                source={{ uri: videoModal }}
                style={styles.videoPlayer}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  scroll: {
    marginBottom: 8,
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  videoThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.text + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 28,
    color: COLORS.white,
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  thumbFavorite: {
    borderWidth: 2,
    borderColor: '#C4A84A',
  },
  starBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starText: {
    color: '#C4A84A',
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.text,
  },
  videoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '90%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoPlayer: {
    flex: 1,
  },
  fullImage: {
    width: '90%',
    height: '80%',
    borderRadius: 12,
  },
});
