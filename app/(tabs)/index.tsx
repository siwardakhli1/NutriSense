// ==========================================
// SCREEN - Plan (Home Tab)
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLanguage, useMealPlan } from '@/hooks/useAppContexts';
import { useAccelerometer } from '@/hooks/useNativeAPIs';
import { MealCard, DaySelector, BudgetCard, StatCard } from '@/components/MealComponents';
import { LoadingSpinner, ErrorDisplay } from '@/components/ui';
import { Spacing, FontSize } from '@/constants/Colors';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export default function PlanScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { weekPlan, isLoading, error, refreshPlan, clearError, generatePlan, preferences } = useMealPlan();
  const { isShaking, startListening } = useAccelerometer();
  const router = useRouter();

  const [selectedDay, setSelectedDay] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Shake to refresh (accéléromètre)
  useEffect(() => {
    const cleanup = startListening();
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    if (isShaking && !isLoading) {
      refreshPlan();
    }
  }, [isShaking]);

  // Générer au premier chargement si pas de plan
  useEffect(() => {
    if (!weekPlan && !isLoading) {
      generatePlan();
    }
  }, []);

  // Auto-régénération si la semaine est terminée
  // Ex: si le plan couvre du 3 au 9 juillet et qu'on est le 10 juillet, on régénère
  useEffect(() => {
    if (!weekPlan?.endDate || isLoading) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(weekPlan.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) {
      console.log('[Plan] Semaine expirée, régénération auto...');
      generatePlan();
    }
  }, [weekPlan?.endDate]);

  // Rafraîchir le plan à chaque fois que l'utilisateur revient sur ce tab
  // (ex: après avoir modifié ses préférences et régénéré)
  useFocusEffect(
    React.useCallback(() => {
      refreshPlan();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPlan();
    setRefreshing(false);
  };

  if (isLoading && !weekPlan) {
    return <LoadingSpinner fullScreen message={t.common.loading} />;
  }

  if (error && !weekPlan) {
    return <ErrorDisplay message={error} onRetry={() => { clearError(); generatePlan(); }} />;
  }

  const dayPlan = weekPlan?.days[selectedDay];
  const lunchMeal = dayPlan?.meals.find((m) => m.type === 'lunch');
  const dinnerMeal = dayPlan?.meals.find((m) => m.type === 'dinner');

  const totalCal = dayPlan?.meals.reduce((sum, m) => sum + m.recipe.nutrition.calories, 0) ?? 0;
  const totalTime = dayPlan?.meals.reduce((sum, m) => sum + m.recipe.time, 0) ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={{ padding: Spacing.lg, paddingBottom: 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }}>
            <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text }}>
              {t.plan.title}
            </Text>
            <TouchableOpacity
              onPress={refreshPlan}
              style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Ionicons name="refresh" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Week selector */}
          <DaySelector
            days={DAY_KEYS.map((k) => t.days[k])}
            selectedIndex={selectedDay}
            onSelect={setSelectedDay}
            dayNumbers={weekPlan?.days?.map((d) => {
              const parts = (d.date || '').split('-');
              return parts.length === 3 ? Number(parts[2]) : 0;
            }) ?? [0, 0, 0, 0, 0, 0, 0]}
            monthLabel={(() => {
              if (!weekPlan?.days?.[0]?.date) {
                const now = new Date();
                return now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
              }
              const d = new Date(weekPlan.days[0].date);
              return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            })()}
            daysWithPlan={weekPlan?.days?.map((d) => (d.meals?.length ?? 0) >= 3) ?? []}
            todayIndex={(() => {
              if (!weekPlan?.days) return -1;
              const todayStr = new Date().toISOString().split('T')[0];
              return weekPlan.days.findIndex((d) => d.date === todayStr);
            })()}
          />
        </View>

        {/* Meals */}
        <View style={{ padding: Spacing.lg, paddingTop: Spacing.lg }}>
          {lunchMeal && (
            <MealCard
              key={`lunch-${dayPlan?.date}`}
              label={t.plan.lunch}
              labelIcon="☀️"
              meal={lunchMeal}
              date={dayPlan?.date}
              onPress={() => router.push(`/recipe/${lunchMeal.recipe.id}`)}
            />
          )}

          {dinnerMeal && (
            <MealCard
              key={`dinner-${dayPlan?.date}`}
              label={t.plan.dinner}
              labelIcon="🌙"
              meal={dinnerMeal}
              date={dayPlan?.date}
              onPress={() => router.push(`/recipe/${dinnerMeal.recipe.id}`)}
            />
          )}

          {/* Budget card */}
          <BudgetCard budget={preferences.budget} spent={weekPlan?.estimatedCost ?? 0} />

          {/* Daily stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <StatCard value={String(totalCal)} unit="kcal" label={t.plan.calories} />
            <StatCard value={String(totalTime)} unit={t.plan.min} label={t.plan.totalTime} />
            <StatCard value="~6" unit="€" label={t.plan.cost} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
