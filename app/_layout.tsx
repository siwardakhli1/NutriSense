// ==========================================
// ROOT LAYOUT
// Providers, Splash screen, Routes protégées
// ==========================================
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MealPlanProvider } from '@/contexts/MealPlanContext';
import { useTheme, useAuth } from '@/hooks/useAppContexts';
import { LoadingSpinner } from '@/components/ui';
import { View } from 'react-native';

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { colors, isDark } = useTheme();
  const { user, isLoading, isOnboarded } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Chargement..." />;
  }

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
        <Stack.Screen
          name="preferences"
          options={{ headerShown: true, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="change-password"
          options={{ headerShown: true, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="favorites"
          options={{ headerShown: true, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="my-recipes"
          options={{ headerShown: true, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="edit-recipe"
          options={{ headerShown: true, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>

      {/* Redirections basées sur l'état auth */}
      {!user && <Redirect href="/(auth)/login" />}
      {user && !isOnboarded && <Redirect href="/(onboarding)" />}
      {user && isOnboarded && <Redirect href="/(tabs)" />}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Ajouter des polices personnalisées ici si nécessaire
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

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
