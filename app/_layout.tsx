import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useSegments, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Gaegu_400Regular, Gaegu_700Bold } from '@expo-google-fonts/gaegu';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { FredokaOne_400Regular } from '@expo-google-fonts/fredoka-one';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/src/stores/authStore';
import { XpToast } from '@/src/components/XpToast';
import { LevelUpOverlay } from '@/src/components/LevelUpOverlay';
import { AchievementUnlockOverlay } from '@/src/components/AchievementUnlockOverlay';
import { FEATURES } from '@/src/config/features';
import { useUserPreferences } from '@/src/hooks/useUserPreferences';
import 'react-native-reanimated';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const { data: prefs, isLoading: prefsLoading } = useUserPreferences();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (session && !inAuthGroup && !inOnboarding && !prefsLoading) {
      // Check if onboarding is completed — if no prefs row exists, redirect to onboarding
      if (prefs === null) {
        router.replace('/onboarding/categories');
      }
    }
  }, [session, initialized, segments, prefs, prefsLoading]);

  return <>{children}</>;
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  const [fontsLoaded, fontError] = useFonts({
    Gaegu_400Regular,
    Gaegu_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    FredokaOne_400Regular,
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen
              name="onboarding"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="log"
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="report"
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="category"
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </Stack>
          {FEATURES.GAMIFICATION && <XpToast />}
          {FEATURES.GAMIFICATION && <LevelUpOverlay />}
          {FEATURES.GAMIFICATION && <AchievementUnlockOverlay />}
        </View>
      </AuthGuard>
    </QueryClientProvider>
  );
}
