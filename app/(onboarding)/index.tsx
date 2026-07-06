// ==========================================
// SCREEN - Onboarding Welcome
// ==========================================
import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLanguage } from '@/hooks/useAppContexts';
import { Button } from '@/components/ui';
import { Spacing, FontSize } from '@/constants/Colors';

export default function OnboardingWelcome() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, backgroundColor: colors.background }}>
      {/* Logo */}
      <View
        style={{
          width: 110,
          height: 110,
          borderRadius: 32,
          backgroundColor: colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.15,
          shadowRadius: 30,
          elevation: 10,
        }}
      >
        <Ionicons name="leaf" size={64} color="#FFFFFF" />
      </View>

      <Text style={{ fontSize: 36, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
        Nutri<Text style={{ color: colors.primary }}>Sense</Text>
      </Text>

      <Text
        style={{
          fontSize: FontSize.md,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 48,
        }}
      >
        {t.onboarding.subtitle}
      </Text>

      <Button
        title={`${t.onboarding.start} →`}
        onPress={() => router.push('/(onboarding)/budget')}
        style={{ width: '100%' }}
      />

      {/* Progress dots */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 40 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: i === 0 ? 28 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === 0 ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
