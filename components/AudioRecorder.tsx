import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { COLORS } from '../lib/constants';

interface Props {
  audioUri?: string;
  onRecorded: (uri: string) => void;
  onClear: () => void;
}

export default function AudioRecorder({ audioUri, onRecorded, onClear }: Props) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      soundRef.current?.unloadAsync();
    };
  }, []);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) onRecorded(uri);
    } catch {
      setRecording(null);
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;
    try {
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      await sound.playAsync();
    } catch {
      setIsPlaying(false);
    }
  };

  if (audioUri) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.playButton} onPress={playAudio}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
          <Text style={styles.playText}>
            {isPlaying ? 'Playing...' : 'Play recording'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingActive]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.recordIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
        <Text style={styles.recordText}>
          {isRecording ? `Recording... ${seconds}s` : 'Record sound'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  recordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recordingActive: {
    backgroundColor: '#FFE0E0',
    borderColor: COLORS.red,
  },
  recordIcon: {
    fontSize: 18,
  },
  recordText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.blue + '20',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  playIcon: {
    fontSize: 18,
  },
  playText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: 'Nunito_600SemiBold',
  },
});
