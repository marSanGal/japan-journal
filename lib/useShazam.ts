import { useState, useCallback, useRef } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Song } from './types';

let ShazamKit: typeof import('react-native-apple-shazamkit') | null = null;
try {
  ShazamKit = require('react-native-apple-shazamkit');
} catch {
  // Native module not available (e.g. Expo Go or web)
}

const LISTEN_TIMEOUT_MS = 15_000;

interface ShazamState {
  isListening: boolean;
  result: Song | null;
  error: string | null;
}

export function useShazam() {
  const [state, setState] = useState<ShazamState>({
    isListening: false,
    result: null,
    error: null,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const requestMicPermission = async (): Promise<boolean> => {
    const { status, canAskAgain } = await Audio.requestPermissionsAsync();
    if (status === 'granted') return true;

    if (!canAskAgain) {
      Alert.alert(
        'Microphone Access',
        'Microphone permission is needed to identify songs. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    }
    return false;
  };

  const startListening = useCallback(async (): Promise<Song | null> => {
    if (!ShazamKit) {
      Alert.alert('Not Available', 'Shazam is not available in this build. A development build is required.');
      return null;
    }

    if (!ShazamKit.isAvailable()) {
      Alert.alert(
        'Shazam Unavailable',
        Platform.OS === 'android'
          ? 'Please install the Shazam app to enable song recognition.'
          : 'Song recognition is not available on this device.',
      );
      return null;
    }

    const hasPermission = await requestMicPermission();
    if (!hasPermission) return null;

    setState({ isListening: true, result: null, error: null });

    try {
      const matchPromise = ShazamKit.startListening();

      const timeoutPromise = new Promise<null>((resolve) => {
        timeoutRef.current = setTimeout(() => {
          ShazamKit?.stopListening();
          resolve(null);
        }, LISTEN_TIMEOUT_MS);
      });

      const matches = await Promise.race([matchPromise, timeoutPromise]);
      clearTimer();

      if (!matches || matches.length === 0) {
        setState({ isListening: false, result: null, error: 'timeout' });
        return null;
      }

      const match = matches[0];
      const song: Song = {
        name: match.title ?? 'Unknown',
        artist: match.artist,
      };

      setState({ isListening: false, result: song, error: null });
      return song;
    } catch (err) {
      clearTimer();
      const message = err instanceof Error ? err.message : 'Recognition failed';
      setState({ isListening: false, result: null, error: message });
      return null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearTimer();
    ShazamKit?.stopListening();
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
  };
}
