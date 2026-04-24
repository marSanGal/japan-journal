import { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { COLORS } from '../lib/constants';

interface Props {
  uri: string;
}

export default function AudioPlayer({ uri }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const toggle = async () => {
    if (isPlaying) {
      await soundRef.current?.stopAsync();
      setIsPlaying(false);
      return;
    }

    try {
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri });
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

  return (
    <TouchableOpacity style={styles.button} onPress={toggle} activeOpacity={0.7}>
      <Text style={styles.text}>
        {isPlaying ? '⏸️ Playing...' : '🔊 Play sound'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.blue + '20',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: COLORS.text,
  },
});
