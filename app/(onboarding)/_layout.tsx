// ==========================================
// ONBOARDING LAYOUT
// ==========================================
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';

export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="budget" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
