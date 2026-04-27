import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { useJournalStore } from '../lib/store';
import { CATEGORY_CONFIG, COLORS, CUSTOM_COLOR_OPTIONS, getCategoryDisplay } from '../lib/constants';
import { Entry, EntryCategory, Dish, Song, TrainType, BarGenre, CustomCategory } from '../lib/types';
import { fetchNearbyPlaces } from '../lib/nearby';
import AudioRecorder from './AudioRecorder';
import { useShazam } from '../lib/useShazam';

const TRAIN_TYPES: { value: TrainType; label: string }[] = [
  { value: 'metro', label: 'Metro' },
  { value: 'shinkansen', label: 'Shinkansen' },
  { value: 'local', label: 'Local' },
  { value: 'other', label: 'Other' },
];

const BAR_GENRES: { value: BarGenre; label: string }[] = [
  { value: 'metal', label: 'Metal' },
  { value: 'punk', label: 'Punk' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'other', label: 'Other' },
];

interface Props {
  sheetRef: React.RefObject<BottomSheet | null>;
  editingEntry?: Entry | null;
  onEditDone?: () => void;
  forDate?: string;
}

export default function AddEntrySheet({ sheetRef, editingEntry, onEditDone, forDate }: Props) {
  const config = useJournalStore((s) => s.config);
  const addEntry = useJournalStore((s) => s.addEntry);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const addGoshuinStamp = useJournalStore((s) => s.addGoshuinStamp);
  const customCategories = useJournalStore((s) => s.customCategories);
  const addCustomCategory = useJournalStore((s) => s.addCustomCategory);
  const updateCustomCategory = useJournalStore((s) => s.updateCustomCategory);

  const allTravelers = useMemo(
    () => (config ? [config.myName, ...config.partners] : []),
    [config]
  );

  const [category, setCategory] = useState<EntryCategory | null>(null);
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [amountYen, setAmountYen] = useState('');
  const [participants, setParticipants] = useState<string[]>(allTravelers);
  const [timeOffset, setTimeOffset] = useState('0');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [audioUri, setAudioUri] = useState<string | undefined>(undefined);
  const [nearbySuggestions, setNearbySuggestions] = useState<string[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Walk-specific
  const [stepsCount, setStepsCount] = useState('');

  // Shrine-specific
  const [hasGoshuin, setHasGoshuin] = useState(false);
  const [goshuinPhotoUri, setGoshuinPhotoUri] = useState<string | undefined>(undefined);

  // Food-specific
  const [dishes, setDishes] = useState<Dish[]>([]);

  // Engrish-specific
  const [engrishContext, setEngrishContext] = useState('');

  // Train-specific
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [trainType, setTrainType] = useState<TrainType>('metro');

  // Bar-specific
  const [hadLiveMusic, setHadLiveMusic] = useState(false);
  const [barGenre, setBarGenre] = useState<BarGenre>('metal');
  const [songs, setSongs] = useState<Song[]>([]);
  const { isListening, startListening, stopListening } = useShazam();

  // Custom category
  const [customCategoryId, setCustomCategoryId] = useState<string | undefined>(undefined);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📌');
  const [newCatColor, setNewCatColor] = useState(CUSTOM_COLOR_OPTIONS[0]);
  const [newCatShowInStats, setNewCatShowInStats] = useState(false);

  const isEditing = !!editingEntry;

  useEffect(() => {
    if (editingEntry) {
      setCategory(editingEntry.category);
      setText(editingEntry.text);
      setLocation(editingEntry.location || '');
      setAmountYen(editingEntry.amountYen ? String(editingEntry.amountYen) : '');
      setParticipants(editingEntry.participants || allTravelers);
      setTimeOffset('0');
      setPhotoUri(editingEntry.photoUri);
      setAudioUri(editingEntry.audioUri);
      setStepsCount(editingEntry.stepsCount ? String(editingEntry.stepsCount) : '');
      setHasGoshuin(editingEntry.hasGoshuin || false);
      setGoshuinPhotoUri(editingEntry.goshuinPhotoUri);
      setDishes(editingEntry.dishes || []);
      setEngrishContext(editingEntry.engrishContext || '');
      if (editingEntry.trainInfo) {
        setFromStation(editingEntry.trainInfo.fromStation);
        setToStation(editingEntry.trainInfo.toStation);
        setTrainType(editingEntry.trainInfo.type);
      } else {
        setFromStation('');
        setToStation('');
        setTrainType('metro');
      }
      setHadLiveMusic(editingEntry.hadLiveMusic || false);
      setBarGenre(editingEntry.barGenre || 'metal');
      setSongs(editingEntry.songs || []);
      setCustomCategoryId(editingEntry.customCategoryId);
    }
  }, [editingEntry]);

  const snapPoints = useMemo(() => ['75%', '90%'], []);

  const toggleParticipant = useCallback((name: string) => {
    setParticipants((prev) => {
      if (prev.includes(name)) {
        if (prev.length <= 1) return prev;
        return prev.filter((n) => n !== name);
      }
      return [...prev, name];
    });
  }, []);

  const reset = () => {
    setCategory(null);
    setText('');
    setLocation('');
    setAmountYen('');
    setParticipants(allTravelers);
    setTimeOffset('0');
    setPhotoUri(undefined);
    setAudioUri(undefined);
    setNearbySuggestions([]);
    setGpsLoading(false);
    setStepsCount('');
    setHasGoshuin(false);
    setGoshuinPhotoUri(undefined);
    setDishes([]);
    setEngrishContext('');
    setFromStation('');
    setToStation('');
    setTrainType('metro');
    setHadLiveMusic(false);
    setBarGenre('metal');
    setSongs([]);
    setCustomCategoryId(undefined);
    setShowCreateCategory(false);
    setEditingCatId(null);
    setNewCatName('');
    setNewCatIcon('📌');
    setNewCatColor(CUSTOM_COLOR_OPTIONS[0]);
    setNewCatShowInStats(false);
  };

  const handleGpsLookup = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location access is required to find nearby places.');
        setGpsLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const places = await fetchNearbyPlaces(pos.coords.latitude, pos.coords.longitude);
      setNearbySuggestions(places);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      Alert.alert('Location error', 'Could not get your location. Check GPS settings.');
    } finally {
      setGpsLoading(false);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickGoshuinPhoto = async () => {
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
      setGoshuinPhotoUri(result.assets[0].uri);
    }
  };

  const addDish = () => {
    setDishes((prev) => [...prev, { name: '', rating: undefined, comment: '' }]);
  };

  const updateDish = (index: number, updates: Partial<Dish>) => {
    setDishes((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...updates } : d))
    );
  };

  const removeDish = (index: number) => {
    setDishes((prev) => prev.filter((_, i) => i !== index));
  };

  const addSong = () => {
    setSongs((prev) => [...prev, { name: '', artist: '' }]);
  };

  const updateSong = (index: number, updates: Partial<Song>) => {
    setSongs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  const removeSong = (index: number) => {
    setSongs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleShazam = async () => {
    if (isListening) {
      stopListening();
      return;
    }
    const song = await startListening();
    if (song) {
      setSongs((prev) => [...prev, song]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const buildAutoText = (): string => {
    if (!category) return '';
    if (category === 'walk' && stepsCount) return `Walked ${stepsCount} steps`;
    if (category === 'train' && fromStation && toStation) {
      const tt = TRAIN_TYPES.find((t) => t.value === trainType)?.label || trainType;
      return `${fromStation} → ${toStation} (${tt})`;
    }
    if (category === 'bar') {
      const genre = BAR_GENRES.find((g) => g.value === barGenre)?.label || '';
      return hadLiveMusic ? `Live ${genre} night` : `${genre} bar`;
    }
    if (category === 'gachapon') return 'Gachapon pull';
    if (category === 'vending') return 'Vending machine find';
    if (category === 'custom' && customCategoryId) {
      const cc = customCategories.find((c) => c.id === customCategoryId);
      return cc?.label || 'Custom entry';
    }
    return CATEGORY_CONFIG[category].label;
  };

  const handleSave = useCallback(() => {
    if (!category || !config) return;

    const finalText = text.trim() || buildAutoText();
    if (!finalText) return;

    const entryData: Partial<Entry> = {
      category,
      text: finalText,
      location: location.trim() || undefined,
      amountYen: amountYen ? (Number.isNaN(parseInt(amountYen, 10)) ? undefined : parseInt(amountYen, 10)) : undefined,
      stepsCount: stepsCount ? (Number.isNaN(parseInt(stepsCount, 10)) ? undefined : parseInt(stepsCount, 10)) : undefined,
      participants,
      photoUri,
      audioUri,
      hasGoshuin: category === 'shrine' ? hasGoshuin : undefined,
      goshuinPhotoUri: category === 'shrine' && hasGoshuin ? goshuinPhotoUri : undefined,
      dishes: category === 'food' && dishes.length > 0
        ? dishes.filter((d) => d.name.trim())
        : undefined,
      engrishContext: category === 'engrish' && engrishContext.trim()
        ? engrishContext.trim()
        : undefined,
      trainInfo: category === 'train' && fromStation.trim() && toStation.trim()
        ? { fromStation: fromStation.trim(), toStation: toStation.trim(), type: trainType }
        : undefined,
      hadLiveMusic: category === 'bar' ? hadLiveMusic : undefined,
      barGenre: category === 'bar' ? barGenre : undefined,
      songs: category === 'bar' && songs.length > 0
        ? songs.filter((s) => s.name.trim())
        : undefined,
      customCategoryId: category === 'custom' ? customCategoryId : undefined,
    };

    if (isEditing && editingEntry) {
      const date = format(new Date(editingEntry.timestamp), 'yyyy-MM-dd');
      updateEntry(date, editingEntry.id, entryData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      reset();
      onEditDone?.();
      sheetRef.current?.close();
      return;
    }

    let now: Date;
    if (forDate) {
      now = new Date(forDate + 'T12:00:00');
      const offset = parseInt(timeOffset, 10) || 0;
      now.setMinutes(now.getMinutes() - offset);
    } else {
      now = new Date();
      const offset = parseInt(timeOffset, 10) || 0;
      now.setMinutes(now.getMinutes() - offset);
    }

    const entryId = uuid();
    addEntry({
      id: entryId,
      author: config.myName,
      timestamp: now.toISOString(),
      ...entryData,
    } as Entry);

    if (category === 'shrine' && hasGoshuin) {
      addGoshuinStamp({
        id: uuid(),
        templeName: location.trim() || finalText,
        location: location.trim() || undefined,
        date: format(now, 'yyyy-MM-dd'),
        photoUri: goshuinPhotoUri,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    reset();
    sheetRef.current?.close();
  }, [category, text, location, amountYen, stepsCount, participants, timeOffset, config, addEntry, updateEntry, addGoshuinStamp, sheetRef, photoUri, audioUri, isEditing, editingEntry, onEditDone, forDate, hasGoshuin, goshuinPhotoUri, dishes, engrishContext, fromStation, toStation, trainType, hadLiveMusic, barGenre, songs, customCategoryId, customCategories]);

  const builtInCategories = (Object.entries(CATEGORY_CONFIG) as [
    EntryCategory,
    (typeof CATEGORY_CONFIG)[EntryCategory],
  ][]).filter(([key]) => key !== 'custom');

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    if (editingCatId) {
      updateCustomCategory(editingCatId, {
        label: newCatName.trim(),
        icon: newCatIcon || '📌',
        color: newCatColor,
        showInStats: newCatShowInStats,
      });
      setShowCreateCategory(false);
      setEditingCatId(null);
    } else {
      const id = newCatName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      const newCat: CustomCategory = {
        id,
        label: newCatName.trim(),
        icon: newCatIcon || '📌',
        color: newCatColor,
        showInStats: newCatShowInStats,
      };
      addCustomCategory(newCat);
      setShowCreateCategory(false);
      setCategory('custom');
      setCustomCategoryId(id);
    }
    setNewCatName('');
    setNewCatIcon('📌');
    setNewCatColor(CUSTOM_COLOR_OPTIONS[0]);
    setNewCatShowInStats(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleEditCategory = (cc: CustomCategory) => {
    setNewCatName(cc.label);
    setNewCatIcon(cc.icon);
    setNewCatColor(cc.color);
    setNewCatShowInStats(cc.showInStats);
    setEditingCatId(cc.id);
    setShowCreateCategory(true);
  };

  const getPlaceholder = (): string => {
    if (category === 'engrish') return 'The exact phrase you saw...';
    if (category === 'walk') return 'Notes about your walk (optional)';
    if (category === 'train') return 'Notes about the ride (optional)';
    if (category === 'bar') return 'Venue name or vibe (optional)';
    if (category === 'gachapon') return 'What did you get?';
    if (category === 'vending') return 'What drink/item?';
    if (category === 'custom') return 'What happened?';
    return 'What happened?';
  };

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
        if (index === -1) {
          reset();
          onEditDone?.();
        }
      }}
    >
      {!category && !showCreateCategory ? (
        <BottomSheetScrollView
          style={styles.form}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{isEditing ? 'Edit Entry' : 'New Entry'}</Text>
          <View style={styles.grid}>
            {builtInCategories.map(([key, cfg]) => (
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
            {customCategories.map((cc) => (
              <TouchableOpacity
                key={cc.id}
                style={[styles.catButton, { backgroundColor: cc.color + '30' }]}
                onPress={() => {
                  setCategory('custom');
                  setCustomCategoryId(cc.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                onLongPress={() => handleEditCategory(cc)}
                delayLongPress={500}
                activeOpacity={0.7}
              >
                <Text style={styles.catIcon}>{cc.icon}</Text>
                <Text style={styles.catLabel}>{cc.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addCatButton}
              onPress={() => setShowCreateCategory(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.addCatPlus}>+</Text>
              <Text style={styles.catLabel}>New</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      ) : !category && showCreateCategory ? (
        <BottomSheetScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{editingCatId ? 'Edit Category' : 'Create Category'}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setShowCreateCategory(false);
              setEditingCatId(null);
              setNewCatName('');
              setNewCatIcon('📌');
              setNewCatColor(CUSTOM_COLOR_OPTIONS[0]);
              setNewCatShowInStats(false);
            }}
          >
            <Text style={styles.backText}>← Back to categories</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={newCatName}
            onChangeText={setNewCatName}
            placeholder="Category name"
            placeholderTextColor={COLORS.textLight}
            autoFocus
          />

          <Text style={styles.rowLabel}>Icon (emoji)</Text>
          <TextInput
            style={[styles.input, { fontSize: 28, textAlign: 'center' }]}
            value={newCatIcon}
            onChangeText={(val) => setNewCatIcon(val.slice(-2))}
            placeholder="📌"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.rowLabel}>Color</Text>
          <View style={styles.colorRow}>
            {CUSTOM_COLOR_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  newCatColor === c && styles.colorSwatchSelected,
                ]}
                onPress={() => setNewCatColor(c)}
                activeOpacity={0.7}
              />
            ))}
          </View>

          <View style={styles.previewTile}>
            <View style={[styles.catButton, { backgroundColor: newCatColor + '30' }]}>
              <Text style={styles.catIcon}>{newCatIcon || '📌'}</Text>
              <Text style={styles.catLabel}>{newCatName || 'Preview'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.goshuinToggle, newCatShowInStats && styles.goshuinToggleActive]}
            onPress={() => setNewCatShowInStats(!newCatShowInStats)}
            activeOpacity={0.7}
          >
            <Text style={styles.goshuinToggleText}>
              {newCatShowInStats ? '✅' : '⬜'} Show total count in Trip Stats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !newCatName.trim() && { opacity: 0.4 }]}
            onPress={handleCreateCategory}
            disabled={!newCatName.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.saveText}>{editingCatId ? 'Save Changes' : 'Create & Use'}</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      ) : (
        <BottomSheetScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{isEditing ? 'Edit Entry' : 'New Entry'}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (isEditing) {
                reset();
                onEditDone?.();
                sheetRef.current?.close();
              } else {
                setCategory(null);
              }
            }}
          >
            <Text style={styles.backText}>
              ← {getCategoryDisplay(category, customCategoryId, customCategories).icon}{' '}
              {getCategoryDisplay(category, customCategoryId, customCategories).label}
            </Text>
          </TouchableOpacity>

          {/* Walk: steps input */}
          {category === 'walk' && (
            <View style={styles.stepsRow}>
              <Text style={styles.rowLabel}>👣 Steps today</Text>
              <TextInput
                style={styles.stepsInput}
                value={stepsCount}
                onChangeText={setStepsCount}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
                autoFocus
              />
            </View>
          )}

          {/* Train: from/to/type */}
          {category === 'train' && (
            <View style={styles.trainSection}>
              <TextInput
                style={styles.input}
                value={fromStation}
                onChangeText={setFromStation}
                placeholder="🚉 From station"
                placeholderTextColor={COLORS.textLight}
                autoFocus
              />
              <TextInput
                style={styles.input}
                value={toStation}
                onChangeText={setToStation}
                placeholder="🚉 To station"
                placeholderTextColor={COLORS.textLight}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trainTypeRow}>
                {TRAIN_TYPES.map((tt) => (
                  <TouchableOpacity
                    key={tt.value}
                    style={[styles.trainTypeChip, trainType === tt.value && styles.trainTypeChipSelected]}
                    onPress={() => setTrainType(tt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.trainTypeText, trainType === tt.value && styles.trainTypeTextSelected]}>
                      {tt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Bar: genre, live music, songs */}
          {category === 'bar' && (
            <View style={styles.barSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trainTypeRow}>
                {BAR_GENRES.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[styles.trainTypeChip, barGenre === g.value && styles.barGenreChipSelected]}
                    onPress={() => setBarGenre(g.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.trainTypeText, barGenre === g.value && styles.barGenreTextSelected]}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.goshuinToggle, hadLiveMusic && styles.liveMusicToggleActive]}
                onPress={() => setHadLiveMusic(!hadLiveMusic)}
                activeOpacity={0.7}
              >
                <Text style={styles.goshuinToggleText}>
                  {hadLiveMusic ? '🎤 Live music!' : '🎤 Live music?'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder={getPlaceholder()}
            placeholderTextColor={COLORS.textLight}
            multiline
            autoFocus={category !== 'walk' && category !== 'train' && category !== 'bar'}
          />

          {/* Engrish: context */}
          {category === 'engrish' && (
            <TextInput
              style={styles.input}
              value={engrishContext}
              onChangeText={setEngrishContext}
              placeholder="📍 Where did you see it? (optional)"
              placeholderTextColor={COLORS.textLight}
            />
          )}

          <View style={styles.locationRow}>
            <TextInput
              style={styles.locationInput}
              value={location}
              onChangeText={(val) => {
                setLocation(val);
                if (val.trim()) setNearbySuggestions([]);
              }}
              placeholder="📍 Location (optional)"
              placeholderTextColor={COLORS.textLight}
            />
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleGpsLookup}
              disabled={gpsLoading}
              activeOpacity={0.7}
            >
              {gpsLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.gpsButtonText}>GPS</Text>
              )}
            </TouchableOpacity>
          </View>
          {nearbySuggestions.length > 0 && (
            <View style={styles.suggestionsRow}>
              {nearbySuggestions.map((place) => (
                <TouchableOpacity
                  key={place}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setLocation(place);
                    setNearbySuggestions([]);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{place}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {(category === 'purchase' || category === 'gachapon' || category === 'vending') && (
            <TextInput
              style={styles.input}
              value={amountYen}
              onChangeText={setAmountYen}
              placeholder="💴 Amount in yen"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
            />
          )}

          {/* Shrine: goshuin */}
          {category === 'shrine' && (
            <View style={styles.goshuinSection}>
              <TouchableOpacity
                style={[styles.goshuinToggle, hasGoshuin && styles.goshuinToggleActive]}
                onPress={() => setHasGoshuin(!hasGoshuin)}
                activeOpacity={0.7}
              >
                <Text style={styles.goshuinToggleText}>
                  {hasGoshuin ? '✅' : '⬜'} Goshuin stamp?
                </Text>
              </TouchableOpacity>
              {hasGoshuin && (
                goshuinPhotoUri ? (
                  <View style={styles.goshuinPreview}>
                    <Image source={{ uri: goshuinPhotoUri }} style={styles.goshuinImage} />
                    <TouchableOpacity
                      style={styles.removePhoto}
                      onPress={() => setGoshuinPhotoUri(undefined)}
                    >
                      <Text style={styles.removePhotoText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.goshuinPhotoButton} onPress={pickGoshuinPhoto}>
                    <Text style={styles.photoButtonText}>📷 Photo of stamp</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}

          {/* Food: dishes */}
          {category === 'food' && (
            <View style={styles.dishesSection}>
              <Text style={styles.rowLabel}>🍽️ Rate your dishes</Text>
              {dishes.map((dish, index) => (
                <View key={index} style={styles.dishCard}>
                  <View style={styles.dishHeader}>
                    <TextInput
                      style={styles.dishNameInput}
                      value={dish.name}
                      onChangeText={(val) => updateDish(index, { name: val })}
                      placeholder="Dish name"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TouchableOpacity onPress={() => removeDish(index)}>
                      <Text style={styles.dishRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => updateDish(index, { rating: dish.rating === star ? undefined : star })}
                      >
                        <Text style={styles.star}>
                          {dish.rating && dish.rating >= star ? '★' : '☆'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.dishCommentInput}
                    value={dish.comment}
                    onChangeText={(val) => updateDish(index, { comment: val })}
                    placeholder="Comment (optional)"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.addDishButton} onPress={addDish}>
                <Text style={styles.addDishText}>+ Add Dish</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bar: songs */}
          {category === 'bar' && (
            <View style={styles.dishesSection}>
              <Text style={styles.rowLabel}>🎵 Songs that played</Text>
              {songs.map((song, index) => (
                <View key={index} style={styles.dishCard}>
                  <View style={styles.dishHeader}>
                    <TextInput
                      style={styles.dishNameInput}
                      value={song.name}
                      onChangeText={(val) => updateSong(index, { name: val })}
                      placeholder="Song name"
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TouchableOpacity onPress={() => removeSong(index)}>
                      <Text style={styles.dishRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.dishCommentInput}
                    value={song.artist}
                    onChangeText={(val) => updateSong(index, { artist: val })}
                    placeholder="Artist (optional)"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              ))}
              <View style={styles.songButtonsRow}>
                <TouchableOpacity style={styles.addSongButton} onPress={addSong}>
                  <Text style={styles.addSongText}>+ Add Song</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.shazamButton, isListening && styles.shazamButtonActive]}
                  onPress={handleShazam}
                  activeOpacity={0.7}
                >
                  {isListening ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.shazamButtonText}>🎧 Shazam It</Text>
                  )}
                  {isListening && (
                    <Text style={styles.shazamListeningText}>Listening...</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {category === 'sound' && (
            <AudioRecorder
              audioUri={audioUri}
              onRecorded={(uri) => setAudioUri(uri)}
              onClear={() => {
                Alert.alert('Remove recording?', 'This will delete the recorded audio.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => setAudioUri(undefined) },
                ]);
              }}
            />
          )}

          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => {
                  Alert.alert('Remove photo?', undefined, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => setPhotoUri(undefined) },
                  ]);
                }}
              >
                <Text style={styles.removePhotoText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Text style={styles.photoButtonText}>📷 Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
                <Text style={styles.photoButtonText}>🖼️ Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isEditing && (
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
          )}

          {allTravelers.length > 1 && (
            <View style={styles.participantsSection}>
              <Text style={styles.rowLabel}>👥 Who was there?</Text>
              <View style={styles.chipRow}>
                {allTravelers.map((name) => {
                  const selected = participants.includes(name);
                  return (
                    <TouchableOpacity
                      key={name}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleParticipant(name)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveText}>{isEditing ? 'Update ✨' : 'Save ✨'}</Text>
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
    paddingBottom: 120,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: COLORS.primary,
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
  locationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  locationInput: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gpsButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
  },
  gpsButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.white,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: COLORS.blue + '20',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.blue + '40',
  },
  suggestionText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.blue,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
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
  photoPreview: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
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
  participantsSection: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  chipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textLight,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  saveText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: COLORS.white,
  },
  // Walk
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  stepsInput: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    width: 120,
    textAlign: 'center',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Shrine goshuin
  goshuinSection: {
    marginBottom: 12,
  },
  goshuinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  goshuinToggleActive: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.green + '15',
  },
  goshuinToggleText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: COLORS.text,
  },
  goshuinPreview: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  goshuinImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  goshuinPhotoButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.red + '40',
    marginBottom: 8,
  },
  // Food dishes
  dishesSection: {
    marginBottom: 12,
  },
  dishCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dishNameInput: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: COLORS.text,
    padding: 4,
  },
  dishRemove: {
    fontSize: 16,
    color: COLORS.textLight,
    padding: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  star: {
    fontSize: 24,
    color: COLORS.orange,
  },
  dishCommentInput: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: COLORS.textLight,
    padding: 4,
  },
  addDishButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addDishText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.orange,
  },
  // Train
  trainSection: {
    marginBottom: 4,
  },
  trainTypeRow: {
    marginBottom: 12,
  },
  trainTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  trainTypeChipSelected: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  trainTypeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.textLight,
  },
  trainTypeTextSelected: {
    color: COLORS.white,
  },
  barSection: {
    marginBottom: 4,
  },
  barGenreChipSelected: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  barGenreTextSelected: {
    color: COLORS.white,
  },
  liveMusicToggleActive: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.purple + '15',
  },
  songButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addSongButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addSongText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.purple,
  },
  shazamButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
  },
  shazamButtonActive: {
    backgroundColor: COLORS.primary,
  },
  shazamButtonText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  shazamListeningText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  addCatButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addCatPlus: {
    fontSize: 28,
    color: COLORS.textLight,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: COLORS.text,
    borderWidth: 3,
  },
  previewTile: {
    alignItems: 'center',
    marginBottom: 16,
  },
});
