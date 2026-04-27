import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useJournalStore } from '../../lib/store';
import { COLORS, TRAVELER_COLORS } from '../../lib/constants';
import { getPersona } from '../../lib/personas';

export default function SettingsScreen() {
  const router = useRouter();
  const config = useJournalStore((s) => s.config);
  const updateConfig = useJournalStore((s) => s.updateConfig);
  const persona = useJournalStore((s) => s.narratorPersona);
  const showGbp = useJournalStore((s) => s.showGbp);
  const setShowGbp = useJournalStore((s) => s.setShowGbp);
  const archiveTrip = useJournalStore((s) => s.archiveTrip);
  const customCategories = useJournalStore((s) => s.customCategories);
  const deleteCustomCategory = useJournalStore((s) => s.deleteCustomCategory);
  const pastTripsCount = useJournalStore((s) => s.pastTrips.length);

  const [myName, setMyName] = useState(config?.myName || '');
  const [partners, setPartners] = useState<string[]>(config?.partners || []);
  const [startDate, setStartDate] = useState(config?.startDate || '');
  const [totalDays, setTotalDays] = useState(config?.totalDays?.toString() || '21');

  useEffect(() => {
    if (config) {
      setMyName(config.myName);
      setPartners(config.partners);
      setStartDate(config.startDate);
      setTotalDays(config.totalDays.toString());
    }
  }, [config]);

  if (!config) return null;

  const saveField = (field: string, value: string | string[] | number) => {
    updateConfig({ [field]: value });
  };

  const updatePartner = (index: number, value: string) => {
    const updated = [...partners];
    updated[index] = value;
    setPartners(updated);
  };

  const addPartner = () => {
    setPartners([...partners, '']);
  };

  const removePartner = (index: number) => {
    const updated = partners.filter((_, i) => i !== index);
    setPartners(updated);
    saveField('partners', updated.map((p) => p.trim()).filter(Boolean));
  };

  const savePartners = () => {
    const valid = partners.map((p) => p.trim()).filter(Boolean);
    saveField('partners', valid);
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive this trip?',
      'Your trip will be saved to Trip History and a new trip can be started. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive & Reset',
          style: 'destructive',
          onPress: () => {
            archiveTrip();
            router.replace('/setup');
          },
        },
      ]
    );
  };

  const handleDeleteCategory = (id: string, label: string) => {
    Alert.alert(`Delete "${label}"?`, 'Existing entries will keep their data but show a generic label.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCustomCategory(id) },
    ]);
  };

  const personaInfo = getPersona(persona);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Settings</Text>

      {/* Trip Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Details</Text>

        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={myName}
          onChangeText={setMyName}
          onBlur={() => myName.trim() && saveField('myName', myName.trim())}
          placeholder="Your name"
          placeholderTextColor={COLORS.textLight}
        />

        <Text style={styles.label}>Travel Partners</Text>
        {partners.map((partner, index) => (
          <View key={index} style={styles.partnerRow}>
            <View
              style={[
                styles.partnerDot,
                { backgroundColor: TRAVELER_COLORS[(index + 1) % TRAVELER_COLORS.length] },
              ]}
            />
            <TextInput
              style={styles.partnerInput}
              value={partner}
              onChangeText={(val) => updatePartner(index, val)}
              onBlur={savePartners}
              placeholder={`Partner ${index + 1}`}
              placeholderTextColor={COLORS.textLight}
            />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removePartner(index)}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={addPartner}>
          <Text style={styles.addBtnText}>+ Add partner</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Start Date</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          onBlur={() => startDate.trim() && saveField('startDate', startDate.trim())}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textLight}
        />

        <Text style={styles.label}>Trip Length (days)</Text>
        <TextInput
          style={styles.input}
          value={totalDays}
          onChangeText={setTotalDays}
          onBlur={() => {
            const parsed = parseInt(totalDays, 10);
            if (parsed > 0) saveField('totalDays', parsed);
          }}
          keyboardType="number-pad"
          placeholder="21"
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => router.push('/extras/persona')}
          activeOpacity={0.7}
        >
          <View>
            <Text style={styles.navLabel}>Narrator Persona</Text>
            <Text style={styles.navValue}>{personaInfo.icon} {personaInfo.label}</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.navLabel}>Show GBP Conversion</Text>
            <Text style={styles.navValue}>Display yen + £ on purchases</Text>
          </View>
          <Switch
            value={showGbp}
            onValueChange={setShowGbp}
            trackColor={{ false: COLORS.border, true: COLORS.pink }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => router.push('/extras/past-trips')}
          activeOpacity={0.7}
        >
          <View>
            <Text style={styles.navLabel}>Past Trips</Text>
            <Text style={styles.navValue}>{pastTripsCount} archived</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.archiveBtn} onPress={handleArchive} activeOpacity={0.7}>
          <Text style={styles.archiveBtnText}>Archive This Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Categories */}
      {customCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Categories</Text>
          {customCategories.map((cc) => (
            <View key={cc.id} style={styles.catRow}>
              <View style={[styles.catSwatch, { backgroundColor: cc.color }]} />
              <Text style={styles.catIcon}>{cc.icon}</Text>
              <Text style={styles.catLabel}>{cc.label}</Text>
              {cc.showInStats && <Text style={styles.catStatsBadge}>stats</Text>}
              <View style={styles.catSpacer} />
              <TouchableOpacity onPress={() => handleDeleteCategory(cc.id, cc.label)}>
                <Text style={styles.catDelete}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
    marginTop: 12,
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
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  partnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  partnerInput: {
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
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: 'Nunito_600SemiBold',
  },
  addBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addBtnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.pink,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  navLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: COLORS.text,
  },
  navValue: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  navArrow: {
    fontSize: 22,
    color: COLORS.textLight,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  archiveBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  archiveBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.white,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  catSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  catIcon: {
    fontSize: 18,
  },
  catLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  catStatsBadge: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 10,
    color: COLORS.white,
    backgroundColor: COLORS.green,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  catSpacer: {
    flex: 1,
  },
  catDelete: {
    fontSize: 16,
    color: COLORS.textLight,
    padding: 4,
  },
  bottomPad: {
    height: 40,
  },
});
