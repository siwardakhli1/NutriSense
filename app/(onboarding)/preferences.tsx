// ==========================================
// SCREEN - Onboarding Preferences (étape 3/3)
// ==========================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLanguage, useMealPlan, useAuth } from '@/hooks/useAppContexts';
import { useVibration } from '@/hooks/useNativeAPIs';
import { useNotifications } from '@/hooks/useNotifications';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { DietaryPreference } from '@/types';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

const PREFS: { id: DietaryPreference; icon: string }[] = [
  { id: 'halal', icon: 'moon-outline' },
  { id: 'vegan', icon: 'leaf-outline' },
  { id: 'vegetarian', icon: 'nutrition-outline' },
  { id: 'nolactose', icon: 'water-outline' },
  { id: 'nogluten', icon: 'ban-outline' },
  { id: 'nonut', icon: 'alert-circle-outline' },
  { id: 'keto', icon: 'flame-outline' },
  { id: 'bio', icon: 'flower-outline' },
];

export default function OnboardingPreferences() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { preferences, updateDietary, generatePlan, weekPlan } = useMealPlan();
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
      // Ne générer un plan que s'il n'en existe pas déjà un.
      // (Évite d'écraser le plan existant si l'utilisateur revient sur l'onboarding.)
      if (!weekPlan) {
        await Promise.race([
          generatePlan(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 15000)
          ),
        ]);
      }
    } catch (e) {
      console.warn('generatePlan timeout or error, continuing...', e);
    }

    vibrateSuccess();

    // La notification de bienvenue n'est envoyée que si l'utilisateur
    // a explicitement activé les notifications dans son profil.
    try {
      const notificationsEnabled = await AsyncStorage.getItem('notifications_enabled');
      if (notificationsEnabled === 'true') {
        await scheduleNotification(
          'Bienvenue sur NutriSense',
          'Ton plan repas de la semaine est prêt.',
        );
      }
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
      </View>
    );
  }

  const selectedCount = preferences.dietary.length;

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title="Tes préférences"
      subtitle="Sélectionne tes régimes ou restrictions (optionnel)"
      onNext={handleGenerate}
      nextLabel="Générer mon plan"
      bottomHint={selectedCount > 0 ? `${selectedCount} préférence${selectedCount > 1 ? 's' : ''} sélectionnée${selectedCount > 1 ? 's' : ''}` : undefined}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {PREFS.map((p) => {
          const active = preferences.dietary.includes(p.id);
          const prefKey = p.id as keyof typeof t.dietary;

          return (
            <TouchableOpacity
              key={p.id}
              activeOpacity={0.8}
              onPress={() => togglePref(p.id)}
              accessible={true}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={t.dietary[prefKey] || p.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: BorderRadius.lg,
                borderWidth: 2,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primaryLight : colors.card,
              }}
            >
              <Ionicons name={p.icon as any} size={20} color={active ? colors.primary : colors.textSecondary} />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: active ? '700' : '500',
                  color: active ? colors.primary : colors.text,
                }}
              >
                {t.dietary[prefKey] || p.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
