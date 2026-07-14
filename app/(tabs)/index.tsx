// ==========================================
// SCREEN - Plan (Home Tab)
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLanguage, useMealPlan } from '@/hooks/useAppContexts';
import { useAccelerometer } from '@/hooks/useNativeAPIs';
import { useShare } from '@/hooks/useShare';
import { MealCard, ComposedMealCard, DaySelector, BudgetCard, StatCard } from '@/components/MealComponents';
import { api } from '@/services/api';
import { MonthCalendar } from '@/components/MonthCalendar';
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
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [monthCalendarOpen, setMonthCalendarOpen] = useState(false);
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

  // (Shake-to-refresh désactivé : évitons tout rechargement involontaire du plan)
  // useEffect(() => {
  //   if (isShaking && !isLoading) {
  //     refreshPlan();
  //   }
  // }, [isShaking]);

  // Marquer la fin du chargement initial
  useEffect(() => {
    if (!isLoading && !initialLoadDone) setInitialLoadDone(true);
  }, [isLoading, initialLoadDone]);

  // Générer SEULEMENT après le chargement initial, s'il n'y a vraiment aucun plan
  useEffect(() => {
    if (initialLoadDone && !weekPlan && !isLoading) {
      generatePlan();
    }
  }, [initialLoadDone, weekPlan, isLoading]);

  // (Auto-régénération d'expiration RETIRÉE : elle pouvait régénérer le plan
  //  involontairement. L'utilisateur régénère manuellement via le bouton 🔄 si besoin.)

  // (Retiré : le refresh auto à chaque focus rechargeait le plan inutilement)

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

  // Liste des ingrédients uniques du jour (toutes composantes)
  const dayIngredients = (() => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const m of (dayPlan?.meals || []) as any[]) {
      const parts = (m.components && m.components.length > 0)
        ? m.components.map((c: any) => c.recipe)
        : (m.recipe ? [m.recipe] : []);
      for (const r of parts) {
        for (const ing of (r?.ingredients || []) as any[]) {
          const nm = (ing.name || '').trim();
          if (nm && !seen.has(nm.toLowerCase())) {
            seen.add(nm.toLowerCase());
            names.push(nm);
          }
        }
      }
    }
    return names;
  })();

  // Coût réel du jour (calculé côté backend)
  const dayCost = (dayPlan as any)?.cost ?? 0;
  const mealCosts = (dayPlan as any)?.mealCosts ?? { breakfast: 0, lunch: 0, dinner: 0 };

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
            onMonthPress={() => setMonthCalendarOpen(true)}
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
            <ComposedMealCard
              key={`breakfast-${dayPlan?.date}`}
              label={t.plan.breakfast}
              labelIcon="🌅"
              meal={breakfastMeal}
              date={dayPlan?.date}
              onPressComponent={(id) => id && router.push(`/recipe/${id}`)}
            />
          )}

          {lunchMeal && (
            <ComposedMealCard
              key={`lunch-${dayPlan?.date}`}
              label={t.plan.lunch}
              labelIcon="☀️"
              meal={lunchMeal}
              date={dayPlan?.date}
              onPressComponent={(id) => id && router.push(`/recipe/${id}`)}
            />
          )}

          {dinnerMeal && (
            <ComposedMealCard
              key={`dinner-${dayPlan?.date}`}
              label={t.plan.dinner}
              labelIcon="🌙"
              meal={dinnerMeal}
              date={dayPlan?.date}
              onPressComponent={(id) => id && router.push(`/recipe/${id}`)}
            />
          )}

          {/* Section ingrédients du jour */}
          <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginTop: 20, marginBottom: 10 }}>
            Ingrédients du jour
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Ionicons name="cart-outline" size={20} color={colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Courses à prévoir</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 'auto' }}>
                {dayIngredients.length} ingrédients
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {(showAllIngredients ? dayIngredients : dayIngredients.slice(0, 8)).map((ing, i) => (
                <View key={i} style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 }}>
                  <Text style={{ fontSize: 12, color: colors.primary }}>{ing}</Text>
                </View>
              ))}
              {!showAllIngredients && dayIngredients.length > 8 && (
                <TouchableOpacity onPress={() => setShowAllIngredients(true)} style={{ backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 }}>
                  <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>+ {dayIngredients.length - 8} autres</Text>
                </TouchableOpacity>
              )}
              {showAllIngredients && dayIngredients.length > 8 && (
                <TouchableOpacity onPress={() => setShowAllIngredients(false)} style={{ backgroundColor: colors.surfaceVariant, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>Réduire</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Coût du jour — détail par repas */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="wallet-outline" size={18} color={colors.primary} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Coût du jour</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>≈ {dayCost.toFixed(2)}€</Text>
            </View>
            <View style={{ gap: 7 }}>
              {breakfastMeal && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>🌅 {t.plan.breakfast}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>{(mealCosts.breakfast || 0).toFixed(2)}€</Text>
                </View>
              )}
              {lunchMeal && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>☀️ {t.plan.lunch}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>{(mealCosts.lunch || 0).toFixed(2)}€</Text>
                </View>
              )}
              {dinnerMeal && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>🌙 {t.plan.dinner}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>{(mealCosts.dinner || 0).toFixed(2)}€</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Calendrier mensuel (s'ouvre au clic sur le mois) */}
      <MonthCalendar
        visible={monthCalendarOpen}
        onClose={() => setMonthCalendarOpen(false)}
        planDates={weekPlan?.days?.map((d) => d.date) ?? []}
        todayStr={(() => {
          const realToday = getTodayStr();
          const dates = weekPlan?.days?.map((d) => d.date) ?? [];
          // Si aujourd'hui est dans le plan, on l'utilise. Sinon, le plan démarre
          // aujourd'hui par design → on prend son premier jour comme référence.
          if (dates.includes(realToday)) return realToday;
          return dates[0] ?? realToday;
        })()}
        onSelectPlanDay={(idx) => setSelectedDay(idx)}
      />
    </SafeAreaView>
  );
}
