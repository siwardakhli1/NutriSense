// ==========================================
// SCREEN - Onboarding Budget
// ==========================================
import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useTheme, useLanguage, useMealPlan } from '@/hooks/useAppContexts';
import { useVibration } from '@/hooks/useNativeAPIs';
import { Button } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

export default function OnboardingBudget() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { preferences, updateBudget } = useMealPlan();
  const { vibrate } = useVibration();
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: Spacing.lg, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: 60, marginBottom: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text }}>
          {t.onboarding.budgetTitle}
        </Text>
      </View>

      {/* Budget display */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: colors.accentLight,
            borderRadius: BorderRadius.xl,
            padding: 36,
            alignItems: 'center',
            marginBottom: 40,
            width: '100%',
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 5,
          }}
        >
          <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
            {t.onboarding.budgetLabel}
          </Text>
          <Text style={{ fontSize: 64, fontWeight: '800', color: colors.accent }}>
            {preferences.budget}€
          </Text>
          <Text style={{ fontSize: FontSize.sm, color: colors.textMuted }}>
            {t.onboarding.budgetUnit}
          </Text>
        </View>

        {/* Slider */}
        <View style={{ width: '100%', paddingHorizontal: 8 }}>
          <Slider
            value={preferences.budget}
            onValueChange={(val) => {
              const rounded = Math.round(val);
              if (rounded !== preferences.budget) {
                vibrate(10);
              }
              updateBudget(rounded);
            }}
            minimumValue={15}
            maximumValue={300}
            step={5}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.accent}
            style={{ width: '100%', height: 40 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>15€</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>150</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>300</Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      <Button
        title={`${t.common.next} →`}
        onPress={() => router.push('/(onboarding)/goal')}
        style={{ marginBottom: Spacing.lg }}
      />

      {/* Progress dots */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', paddingBottom: Spacing.md }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: i === 1 ? 28 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === 1 ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
