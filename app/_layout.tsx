// ==========================================
// ROOT LAYOUT
// Providers, Splash screen, Routes protégées
// ==========================================
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { useTheme, useAuth } from '@/hooks/useAppContexts';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { colors, isDark } = useTheme();
  const { user, isLoading, isOnboarded } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // On ne montre le spinner GLOBAL qu'au tout premier chargement
  // (restauration de session). Les login/logout suivants ne doivent PAS
  // démonter l'écran courant, sinon les messages d'erreur disparaissent.
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  useEffect(() => {
    if (!isLoading && !firstLoadDone) {
      setFirstLoadDone(true);
    }
  }, [isLoading, firstLoadDone]);

  useEffect(() => {
    if (isLoading) return;

    const first = segments[0];
    const inAuth = first === '(auth)';
    const inOnboarding = first === '(onboarding)';

    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && !isOnboarded && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (user && isOnboarded && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [user, isOnboarded, isLoading, segments]);

  // Le navigateur (Stack) reste TOUJOURS monté (sinon la redirection
  // échoue). Tant que la redirection initiale n'est pas résolue, on
  // pose un simple cache neutre PAR-DESSUS, pour éviter le flash de la
  // page « Commencer » au démarrage.
  const showOverlay =
    (isLoading && !firstLoadDone) ||
    (!isLoading && !user && segments[0] !== '(auth)');

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="preferences" options={{ headerShown: true }} />
        <Stack.Screen name="change-password" options={{ headerShown: true }} />
        <Stack.Screen name="favorites" options={{ headerShown: true }} />
        <Stack.Screen name="my-recipes" options={{ headerShown: true }} />
        <Stack.Screen name="edit-recipe" options={{ headerShown: true, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="recipe/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      {showOverlay && (
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: colors.background,
          }}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <MealPlanProvider>
              <RootNavigation />
            </MealPlanProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
