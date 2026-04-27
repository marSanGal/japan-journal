import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../lib/constants';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="setup" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen
          name="day/[date]"
          options={{
            headerShown: true,
            headerTitle: 'Edit Day',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="chapter/[date]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="extras/goshuin"
          options={{
            headerShown: true,
            headerTitle: 'Goshuin Book',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="extras/konbini"
          options={{
            headerShown: true,
            headerTitle: 'Konbini Bingo',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="extras/postcard"
          options={{
            headerShown: true,
            headerTitle: 'Postcards',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="extras/flashcards"
          options={{
            headerShown: true,
            headerTitle: 'Flashcards',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="extras/manholes"
          options={{
            headerShown: true,
            headerTitle: 'Manhole Covers',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="extras/badges"
          options={{
            headerShown: true,
            headerTitle: 'Badges',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="extras/persona"
          options={{
            headerShown: true,
            headerTitle: 'Narrator Voice',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="extras/past-trips"
          options={{
            headerShown: true,
            headerTitle: 'Trip History',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            presentation: 'card',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
