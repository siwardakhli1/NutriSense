// ==========================================
// SCREEN - Onboarding Preferences
// ==========================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, useLanguage, useMealPlan, useAuth } from '@/hooks/useAppContexts';
import { useVibration } from '@/hooks/useNativeAPIs';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui';
import { DietaryPreference } from '@/types';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

const PREFS: { id: DietaryPreference; emoji: string }[] = [
  { id: 'halal', emoji: '🌙' },
  { id: 'vegan', emoji: '🌱' },
  { id: 'vegetarian', emoji: '🥬' },
  { id: 'nolactose', emoji: '🥛' },
  { id: 'nogluten', emoji: '🌾' },
  { id: 'nonut', emoji: '🥜' },
  { id: 'keto', emoji: '🥑' },
  { id: 'bio', emoji: '🍃' },
];

export default function OnboardingPreferences() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { preferences, updateDietary, generatePlan } = useMealPlan();
  const { completeOnboarding } = useAuth();
  const { vibrate, vibrateSuccess } = useVibration();
  const { scheduleNotification } = useNotifications();

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePref = (id: DietaryPreference) => {
    vibrate(20);
    const current = preferences.dietary;
    const updated = current.includes(id)
      ? current.filter((p) => p !== id)
      : [...current, id];
    updateDietary(updated);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Simuler la progression
    const steps = [15, 35, 55, 75, 90, 100];
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 400));
      setProgress(step);
    }

    try {
      // Timeout de sécurité pour éviter de rester bloqué
      await Promise.race([
        generatePlan(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        ),
      ]);
    } catch (e) {
      console.warn('generatePlan timeout or error, continuing...', e);
    }

    vibrateSuccess();

    // Planifier une notification de bienvenue
    try {
      await scheduleNotification(
        '🎉 Bienvenue sur NutriSense !',
        'Ton plan repas de la semaine est prêt.',
      );
    } catch (e) {
      console.warn('Notification error:', e);
    }

    await completeOnboarding();
    router.replace('/(tabs)');
  };

  // Loading screen
  if (isGenerating) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.xl,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>

        <Text style={{ fontSize: FontSize.xl, fontWeight: '700', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
          {progress < 50
            ? t.onboarding.analyzing
            : progress < 100
            ? t.onboarding.generating
            : t.onboarding.ready}
        </Text>

        <Text style={{ fontSize: FontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: 32 }}>
          {progress < 50
            ? 'On combine budget, objectifs et préférences'
            : 'Sélection des meilleures recettes'}
        </Text>

        <View style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: colors.border }}>
          <View
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
              width: `${progress}%`,
            }}
          />
        </View>
        <Text style={{ fontSize: FontSize.sm, color: colors.textMuted, marginTop: 12, fontWeight: '600' }}>
          {progress}%
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: Spacing.lg, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: 60, marginBottom: 8 }}>
        <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text }}>
          {t.onboarding.prefsTitle}
        </Text>
      </View>
      <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, marginBottom: Spacing.lg }}>
        {t.onboarding.prefsSubtitle}
      </Text>

      {/* Chips */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {PREFS.map((p) => {
            const active = preferences.dietary.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.7}
                onPress={() => togglePref(p.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 50,
                  borderWidth: 2,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primaryLight : colors.card,
                }}
              >
                <Text style={{ fontSize: 18 }}>{p.emoji}</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: active ? '700' : '500',
                    color: active ? colors.primary : colors.text,
                  }}
                >
                  {t.dietary[p.id]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: Spacing.lg }}>
          {preferences.dietary.length === 0
            ? t.onboarding.prefsNone
            : t.onboarding.prefsCount.replace('{count}', String(preferences.dietary.length))}
        </Text>
      </View>

      {/* CTA */}
      <Button
        title={t.onboarding.generate}
        onPress={handleGenerate}
        style={{ marginBottom: Spacing.lg }}
      />

      {/* Progress dots */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', paddingBottom: Spacing.md }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: i === 3 ? 28 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === 3 ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
