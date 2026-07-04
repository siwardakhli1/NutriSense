// ==========================================
// SCREEN - Onboarding Goal
// ==========================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLanguage, useMealPlan } from '@/hooks/useAppContexts';
import { useVibration } from '@/hooks/useNativeAPIs';
import { Button } from '@/components/ui';
import { Goal } from '@/types';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

const GOALS: { id: Goal; emoji: string; gradient: string }[] = [
  { id: 'healthy', emoji: '🥗', gradient: '#A8E6CF' },
  { id: 'fast', emoji: '⚡', gradient: '#FFD93D' },
  { id: 'budget', emoji: '💰', gradient: '#6EC6FF' },
  { id: 'muscle', emoji: '💪', gradient: '#FF8A80' },
];

export default function OnboardingGoal() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { preferences, updateGoal } = useMealPlan();
  const { vibrate } = useVibration();
  const router = useRouter();

  const handleSelect = (goal: Goal) => {
    vibrate(30);
    updateGoal(goal);
  };

  return (
    <View style={{ flex: 1, padding: Spacing.lg, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: 60, marginBottom: 8 }}>
        <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text }}>
          {t.onboarding.goalTitle}
        </Text>
      </View>
      <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, marginBottom: Spacing.lg }}>
        {t.onboarding.goalSubtitle}
      </Text>

      {/* Goals list */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 12 }}>
          {GOALS.map((g) => {
            const isSelected = preferences.goal === g.id;
            const goalKey = g.id as keyof typeof t.goals;

            return (
              <TouchableOpacity
                key={g.id}
                activeOpacity={0.8}
                onPress={() => handleSelect(g.id)}
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
                  <Text style={{ fontSize: 26 }}>{g.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>
                    {t.goals[goalKey]}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                    {t.goals[`${goalKey}Desc` as keyof typeof t.goals]}
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    borderWidth: isSelected ? 0 : 2,
                    borderColor: colors.border,
                    backgroundColor: isSelected ? colors.primary : 'transparent',
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
      </ScrollView>

      {/* CTA */}
      <Button
        title={`${t.common.next} →`}
        onPress={() => router.push('/(onboarding)/preferences')}
        disabled={!preferences.goal}
        style={{ marginTop: Spacing.md, marginBottom: Spacing.lg }}
      />

      {/* Progress dots */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', paddingBottom: Spacing.md }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: i === 2 ? 28 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === 2 ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
