import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { useJournalStore } from '../../lib/store';
import { COLORS } from '../../lib/constants';

export default function EkiStampsScreen() {
  const stamps = useJournalStore((s) => s.ekiStamps);
  const addStamp = useJournalStore((s) => s.addEkiStamp);
  const deleteStamp = useJournalStore((s) => s.deleteEkiStamp);

  const [adding, setAdding] = useState(false);
  const [stationName, setStationName] = useState('');
  const [line, setLine] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  const reset = () => {
    setAdding(false);
    setStationName('');
    setLine('');
    setNotes('');
    setPhotoUri(undefined);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take stamp photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!stationName.trim()) return;
    addStamp({
      id: uuid(),
      stationName: stationName.trim(),
      date: format(new Date(), 'yyyy-MM-dd'),
      photoUri,
      line: line.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    reset();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={stamps}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>🔖 Eki Stamps</Text>
            <Text style={styles.subtitle}>
              {stamps.length} stamp{stamps.length !== 1 ? 's' : ''} collected
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.stampCard}
            onLongPress={() => {
              Alert.alert('Delete stamp?', item.stationName, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteStamp(item.id),
                },
              ]);
            }}
          >
            {item.photoUri ? (
              <Image source={{ uri: item.photoUri }} style={styles.stampPhoto} />
            ) : (
              <View style={styles.stampPlaceholder}>
                <Text style={styles.stampPlaceholderIcon}>🔖</Text>
              </View>
            )}
            <Text style={styles.stampName} numberOfLines={2}>
              {item.stationName}
            </Text>
            {item.line && (
              <Text style={styles.stampLine} numberOfLines={1}>
                🚆 {item.line}
              </Text>
            )}
            <Text style={styles.stampDate}>{item.date}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          adding ? (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                value={stationName}
                onChangeText={setStationName}
                placeholder="Station name"
                placeholderTextColor={COLORS.textLight}
                autoFocus
              />
              <TextInput
                style={styles.input}
                value={line}
                onChangeText={setLine}
                placeholder="🚆 Train line (optional)"
                placeholderTextColor={COLORS.textLight}
              />
              <TextInput
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes (optional)"
                placeholderTextColor={COLORS.textLight}
              />
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.photoRow}>
                  <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
                    <Text style={styles.photoButtonText}>📷 Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoButton} onPress={pickFromGallery}>
                    <Text style={styles.photoButtonText}>🖼️ Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={reset}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, !stationName.trim() && styles.disabled]}
                  onPress={handleSave}
                  disabled={!stationName.trim()}
                >
                  <Text style={styles.saveText}>Save 🔖</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAdding(true)}
            >
              <Text style={styles.addText}>+ Add Stamp</Text>
            </TouchableOpacity>
          )
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    gap: 10,
  },
  stampCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  stampPhoto: {
    width: '100%',
    height: 140,
  },
  stampPlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampPlaceholderIcon: {
    fontSize: 40,
  },
  stampName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.text,
    padding: 8,
    paddingBottom: 2,
  },
  stampLine: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: COLORS.textLight,
    paddingHorizontal: 8,
  },
  stampDate: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: COLORS.textLight,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  form: {
    marginTop: 16,
    gap: 10,
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
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoButtonText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: COLORS.textLight,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.pink,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  saveText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  addButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: COLORS.pink,
  },
});
