// ==========================================
// SCREEN - Onboarding Budget (étape 1/3)
// ==========================================
import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useTheme, useLanguage, useMealPlan } from '@/hooks/useAppContexts';
import { useVibration } from '@/hooks/useNativeAPIs';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { Spacing, BorderRadius } from '@/constants/Colors';

export default function OnboardingBudget() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { preferences, updateBudget } = useMealPlan();
  const { vibrate } = useVibration();
  const router = useRouter();

  const budget = preferences.budget || 100;

  return (
    <OnboardingLayout
      step={1}
      totalSteps={3}
      title="Ton budget hebdomadaire"
      subtitle="Combien peux-tu dépenser en courses par semaine ?"
      onNext={() => {
        vibrate();
        router.push('/(onboarding)/goal');
      }}
      nextLabel="Suivant"
    >
      <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
        {/* Big budget display */}
        <View
          style={{
            paddingVertical: 40,
            paddingHorizontal: 60,
            borderRadius: BorderRadius.xl,
            backgroundColor: '#FEEED4',
            alignItems: 'center',
            marginBottom: Spacing.xl,
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: '#8B6F47',
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            MON BUDGET
          </Text>
          <Text
            style={{
              fontSize: 56,
              fontWeight: '900',
              color: '#D2691E',
              letterSpacing: -2,
            }}
          >
            {budget}€
          </Text>
          <Text style={{ fontSize: 13, color: '#8B6F47', marginTop: 4 }}>
            par semaine
          </Text>
        </View>

        {/* Slider */}
        <View style={{ width: '100%' }}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={15}
            maximumValue={300}
            step={5}
            value={budget}
            onValueChange={(value) => updateBudget(Math.round(value))}
            minimumTrackTintColor="#D2691E"
            maximumTrackTintColor={colors.border}
            thumbTintColor="#D2691E"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>15€</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '700' }}>150€</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>300€</Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}
