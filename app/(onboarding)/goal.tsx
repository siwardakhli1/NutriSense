// ==========================================
// SCREEN - Onboarding Goal (étape 2/3)
// ==========================================
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLanguage, useMealPlan } from '@/hooks/useAppContexts';
import { useVibration } from '@/hooks/useNativeAPIs';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { Goal } from '@/types';
import { BorderRadius } from '@/constants/Colors';

const GOALS: {
  id: Goal;
  icon: string;
  gradient: string;
  labelKey: keyof any;
}[] = [
  { id: 'healthy', icon: 'leaf-outline', gradient: '#A8E6CF', labelKey: 'healthy' },
  { id: 'fast', icon: 'flash-outline', gradient: '#FFD93D', labelKey: 'fast' },
  { id: 'budget', icon: 'wallet-outline', gradient: '#6EC6FF', labelKey: 'budget' },
  { id: 'muscle', icon: 'barbell-outline', gradient: '#FF8A80', labelKey: 'muscle' },
];

export default function OnboardingGoal() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { preferences, updateGoal } = useMealPlan();
  const { vibrate } = useVibration();
  const router = useRouter();

  const handleSelect = (goal: Goal) => {
    vibrate();
    updateGoal(goal);
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={3}
      title="Ton objectif"
      subtitle="Qu'est-ce qui compte le plus pour toi ?"
      onNext={() => {
        vibrate();
        router.push('/(onboarding)/preferences');
      }}
      nextLabel="Suivant"
      nextDisabled={!preferences.goal}
    >
      <View style={{ gap: 12 }}>
        {GOALS.map((g) => {
          const isSelected = preferences.goal === g.id;
          const goalLabel = t.goals[g.id as keyof typeof t.goals] as string;
          const descKey = `${g.id}Desc` as keyof typeof t.goals;
          const goalDesc = t.goals[descKey] as string;

          return (
            <TouchableOpacity
              key={g.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(g.id)}
              accessible={true}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Objectif ${goalLabel || g.id}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                padding: 18,
                borderRadius: BorderRadius.lg,
                backgroundColor: isSelected ? colors.primaryLight : colors.card,
                borderWidth: 2,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: g.gradient,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={g.icon as any} size={26} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                  {goalLabel || g.id}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  {goalDesc || ''}
                </Text>
              </View>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
