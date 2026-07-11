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
import { useShare } from '@/hooks/useShare';
import { MealCard, DaySelector, BudgetCard, StatCard } from '@/components/MealComponents';
import { LoadingSpinner, ErrorDisplay } from '@/components/ui';
import { Spacing, FontSize } from '@/constants/Colors';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

// Renvoie la date du jour au format YYYY-MM-DD en heure LOCALE (pas UTC).
function getTodayStr() {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const d = String(n.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function PlanScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { weekPlan, isLoading, error, refreshPlan, clearError, generatePlan, preferences } = useMealPlan();
  const { isShaking, startListening } = useAccelerometer();
  const { shareWeekPlan } = useShare();
  const router = useRouter();

  const [selectedDay, setSelectedDay] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  // Sélectionne automatiquement AUJOURD'HUI une seule fois, quand le plan
  // arrive pour la première fois. Ensuite l'utilisateur navigue librement :
  // ses clics ne sont JAMAIS écrasés.
  const didSelectTodayRef = React.useRef(false);
  useEffect(() => {
    if (didSelectTodayRef.current) return;      // déjà fait → on ne touche plus
    if (!weekPlan?.days || weekPlan.days.length === 0) return;
    const todayStr = getTodayStr();
    const idx = weekPlan.days.findIndex((d: any) => d.date === todayStr);
    setSelectedDay(idx >= 0 ? idx : 0);
    didSelectTodayRef.current = true;           // marqué comme fait pour toujours
  }, [weekPlan]);

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
  const breakfastMeal = dayPlan?.meals.find((m) => m.type === 'breakfast');
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
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  if (!weekPlan) return;
                  const summary = weekPlan.days
                    .map((d, i) => {
                      const daysFr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                      const meals = d.meals.map((m) => `  • ${m.type === 'lunch' ? '🍴 Midi' : m.type === 'dinner' ? '🌙 Soir' : '☀️ Matin'} : ${m.recipe.name}`).join('\n');
                      return `${daysFr[i] || `Jour ${i + 1}`} ${d.date ? `(${d.date})` : ''}\n${meals}`;
                    })
                    .join('\n\n');
                  const total = `\n\n💰 Budget estimé : ${weekPlan.estimatedCost.toFixed(1)}€ / ${preferences.budget}€`;
                  shareWeekPlan(summary + total);
                }}
                accessibilityRole="button"
                accessibilityLabel="Partager mon plan de la semaine"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={generatePlan}
                accessibilityRole="button"
                accessibilityLabel="Régénérer le plan"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Ionicons name="refresh" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Week selector */}
          <DaySelector
            days={
              weekPlan?.days?.map((d) => {
                const parts = (d.date || '').split('-');
                if (parts.length !== 3) return '';
                const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                const jsDay = dt.getDay();
                const keyMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
                return t.days[keyMap[jsDay]];
              }) ?? DAY_KEYS.map((k) => t.days[k])
            }
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
              const todayStr = getTodayStr();
              return weekPlan.days.findIndex((d) => d.date === todayStr);
            })()}
          />
        </View>

        {/* Meals */}
        <View style={{ padding: Spacing.lg, paddingTop: Spacing.lg }}>
          {breakfastMeal && (
            <MealCard
              key={`breakfast-${dayPlan?.date}`}
              label={t.plan.breakfast}
              labelIcon="🌅"
              meal={breakfastMeal}
              date={dayPlan?.date}
              onPress={() => router.push(`/recipe/${breakfastMeal.recipe.id}`)}
            />
          )}

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
