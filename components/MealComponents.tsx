// ==========================================
// COMPONENTS - Meal Card + Composed Meal Card + Day Selector + Budget + Stat
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Meal } from '@/types';
import { FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';
import { RecipeImage } from '@/components/RecipeImage';

interface MealCardProps {
  label: string;
  labelIcon?: string;
  meal: Meal;
  onPress: () => void;
  date?: string; // Date du repas (YYYY-MM-DD)
  onLogged?: () => void;
}

function getMealType(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('petit')) return 'breakfast';
  if (l.includes('déjeuner') || l.includes('dejeuner')) return 'lunch';
  if (l.includes('dîner') || l.includes('diner')) return 'dinner';
  if (l.includes('snack') || l.includes('collation')) return 'snack';
  if (l.includes('déj') || l.includes('dej')) return 'breakfast';
  return 'other';
}

// Renvoie "aujourd'hui" en YYYY-MM-DD, calé sur le fuseau France.
function getTodayStrParis(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  }
}

export function MealCard({ label, labelIcon, meal, onPress, date, onLogged }: MealCardProps) {
  const { colors } = useTheme();
  const [isEaten, setIsEaten] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logId, setLogId] = useState<string | null>(null);

  // Logique métier : on ne peut pas cocher un repas dans le FUTUR.
  const todayStr = getTodayStrParis();
  const isFuture = !!date && date > todayStr;

  // Vérifier si CE repas à CETTE date a été loggé
  useEffect(() => {
    if (!date) return;
    (async () => {
      const res = await api.get<{ logs: any[] }>('/nutrition/logs?days=365');
      if (res.success && res.data) {
        // On match sur date + label + mealType (les 3 doivent correspondre)
        const norm = (s: string) => (s || '').trim().toLowerCase();
        const alreadyLogged = res.data.logs.find(
          (l: any) =>
            norm(l.label) === norm(meal.recipe.name) &&
            l.mealType === meal.type &&
            typeof l.loggedAt === 'string' &&
            l.loggedAt.slice(0, 10) === date
        );
        if (alreadyLogged) {
          setIsEaten(true);
          setLogId(alreadyLogged.id);
        } else {
          setIsEaten(false);
          setLogId(null);
        }
      }
    })();
  }, [meal.recipe.name, label, date]);

  const handleToggleEaten = async () => {
    if (logging || !date) return;
    if (isFuture) return;
    setLogging(true);

    if (isEaten && logId) {
      // Annuler
      const res = await api.delete(`/nutrition/log/${logId}`);
      if (res.success) {
        setIsEaten(false);
        setLogId(null);
        onLogged?.();
      }
    } else {
      // Logger avec la vraie date du repas
      const loggedAt = date + 'T12:00:00.000Z';
      const res = await api.post<{ success: boolean; log: any }>('/nutrition/log', {
        source: 'recipe',
        label: meal.recipe.name,
        mealType: meal.type,
        calories: meal.recipe.nutrition?.calories || 0,
        protein: meal.recipe.nutrition?.protein || 0,
        carbs: meal.recipe.nutrition?.carbs || 0,
        fat: meal.recipe.nutrition?.fat || 0,
        fiber: meal.recipe.nutrition?.fiber || 0,
        loggedAt,
      });
      if (res.success && (res.data as any)?.log) {
        setIsEaten(true);
        setLogId((res.data as any).log.id);
        onLogged?.();
      } else {
        Alert.alert('Erreur', "Impossible d'enregistrer ce repas");
      }
    }
    setLogging(false);
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontSize: FontSize.xs,
          fontWeight: '700',
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: 10,
          paddingLeft: 4,
        }}
      >
        {labelIcon} {label}
      </Text>
      <View
        style={{
          padding: 20,
          borderRadius: BorderRadius.xl,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: isEaten ? colors.primary : colors.border,
          opacity: isEaten ? 0.75 : 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${label} : ${meal.recipe.name}, ${meal.recipe.time || 30} minutes, ${meal.recipe.nutrition?.calories || 0} calories`}
          accessibilityHint="Ouvre les détails de la recette"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 16,
                  color: colors.text,
                  marginBottom: 6,
                  lineHeight: 22,
                  textDecorationLine: isEaten ? 'line-through' : 'none',
                }}
              >
                {meal.recipe.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    {meal.recipe.time} min
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="flame-outline" size={12} color={colors.textMuted} />
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    {meal.recipe.nutrition.calories} kcal
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RecipeImage
                name={meal.recipe.name}
                fallbackEmoji={meal.recipe.emoji}
                style={{ fontSize: 30 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Bouton "J'ai mangé" — état "À venir" pour les jours futurs */}
        <TouchableOpacity
          onPress={handleToggleEaten}
          disabled={logging || isFuture}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            isFuture
              ? 'Repas à venir, non disponible'
              : isEaten
              ? "Annuler j'ai mangé"
              : 'Marquer comme mangé'
          }
          accessibilityState={{ checked: isEaten, disabled: isFuture }}
          style={{
            marginTop: 12,
            paddingVertical: 10,
            borderRadius: BorderRadius.md,
            backgroundColor: isFuture
              ? colors.background
              : isEaten
              ? colors.primary
              : colors.background,
            borderWidth: 1,
            borderColor: isFuture ? colors.border : colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: isFuture ? 0.55 : 1,
          }}
        >
          <Ionicons
            name={
              isFuture
                ? 'time-outline'
                : isEaten
                ? 'checkmark-circle'
                : 'checkmark-circle-outline'
            }
            size={18}
            color={isFuture ? colors.textMuted : isEaten ? '#fff' : colors.primary}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: isFuture ? colors.textMuted : isEaten ? '#fff' : colors.primary,
            }}
          >
            {isFuture ? 'À venir' : isEaten ? 'Repas mangé ✓' : "J'ai mangé"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ========== COMPOSED MEAL CARD ==========
// Affiche un repas COMPOSÉ (entrée / plat / dessert...) avec ses composantes.
// Chaque composante a son propre check "j'ai mangé". Les composantes trop
// simples (boisson, fruit) ne sont pas cliquables. Badge PREMIUM si applicable.
interface ComposedMealCardProps {
  label: string;
  labelIcon?: string;
  meal: any; // meal.components: [{ role, roleLabel, recipe }]
  date?: string;
  onPressComponent?: (recipeId?: string) => void;
}

export function ComposedMealCard({ label, labelIcon, meal, date, onPressComponent }: ComposedMealCardProps) {
  const { colors } = useTheme();

  // Composantes du repas (fallback sur meal.recipe si pas de components)
  const components: any[] =
    meal?.components && meal.components.length > 0
      ? meal.components
      : meal?.recipe
      ? [{ role: 'plat', roleLabel: 'Plat', recipe: meal.recipe }]
      : [];

  // Total calories + temps du repas
  const totalCal = components.reduce((s, c) => s + (c.recipe?.nutrition?.calories || 0), 0);
  const totalTime = components.reduce((s, c) => s + (c.recipe?.time || 0), 0);

  // Suivi des composantes cochées
  const [eatenIds, setEatenIds] = useState<Set<string>>(new Set());
  const [logIds, setLogIds] = useState<Map<string, string>>(new Map());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const todayStr = getTodayStrParis();
  const isFuture = !!date && date > todayStr;
  // Jour passé : on peut CONSULTER ce qui a été mangé, mais pas MODIFIER.
  const isPast = !!date && date < todayStr;
  const isLocked = isFuture || isPast; // cases verrouillées si futur OU passé

  // Charger l'état "mangé" de chaque composante
  useEffect(() => {
    if (!date) return;
    (async () => {
      const res = await api.get<{ logs: any[] }>('/nutrition/logs?days=365');
      if (res.success && res.data) {
        const norm = (s: string) => (s || '').trim().toLowerCase();
        const newEaten = new Set<string>();
        const newLogIds = new Map<string, string>();
        for (const c of components) {
          const found = res.data.logs.find(
            (l: any) =>
              norm(l.label) === norm(c.recipe?.name) &&
              l.mealType === meal.type &&
              typeof l.loggedAt === 'string' &&
              l.loggedAt.slice(0, 10) === date
          );
          if (found) {
            newEaten.add(c.recipe.id);
            newLogIds.set(c.recipe.id, found.id);
          }
        }
        setEatenIds(newEaten);
        setLogIds(newLogIds);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, meal?.type]);

  const toggleComponent = async (recipe: any) => {
    if (!date || isLocked) return; // pas de modif sur jour passé ou futur
    const rid = recipe.id;
    if (loadingIds.has(rid)) return; // ne bloque que CETTE composante

    setLoadingIds((prev) => new Set(prev).add(rid));

    const isEaten = eatenIds.has(rid);
    if (isEaten) {
      const lid = logIds.get(rid);
      if (lid) {
        const res = await api.delete(`/nutrition/log/${lid}`);
        if (res.success) {
          setEatenIds((prev) => {
            const n = new Set(prev);
            n.delete(rid);
            return n;
          });
          setLogIds((prev) => {
            const n = new Map(prev);
            n.delete(rid);
            return n;
          });
        }
      }
    } else {
      const loggedAt = date + 'T12:00:00.000Z';
      const res = await api.post<{ success: boolean; log: any }>('/nutrition/log', {
        source: 'recipe',
        label: recipe.name,
        mealType: meal.type,
        calories: recipe.nutrition?.calories || 0,
        protein: recipe.nutrition?.protein || 0,
        carbs: recipe.nutrition?.carbs || 0,
        fat: recipe.nutrition?.fat || 0,
        fiber: recipe.nutrition?.fiber || 0,
        loggedAt,
      });
      if (res.success && (res.data as any)?.log) {
        setEatenIds((prev) => new Set(prev).add(rid));
        setLogIds((prev) => new Map(prev).set(rid, (res.data as any).log.id));
      }
    }

    setLoadingIds((prev) => {
      const n = new Set(prev);
      n.delete(rid);
      return n;
    });
  };

  const eatenCount = components.filter((c) => eatenIds.has(c.recipe?.id)).length;
  const allEaten = components.length > 0 && eatenCount === components.length;

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontSize: FontSize.xs,
          fontWeight: '700',
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: 10,
          paddingLeft: 4,
        }}
      >
        {labelIcon} {label}
      </Text>

      <View
        style={{
          padding: 16,
          borderRadius: BorderRadius.xl,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: allEaten ? colors.primary : colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        {/* Bandeau "consultation seule" pour un jour passé */}
        {isPast && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.surfaceVariant, borderRadius: 8 }}>
            <Ionicons name="eye-outline" size={13} color={colors.textMuted} />
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>Jour écoulé — consultation seule</Text>
          </View>
        )}

        {/* En-tête : calories + temps totaux */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="flame-outline" size={13} color={colors.textMuted} />
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{totalCal} kcal</Text>
          </View>
          {totalTime > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={13} color={colors.textMuted} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{totalTime} min</Text>
            </View>
          )}
        </View>

        {/* Composantes */}
        {components.map((c, idx) => {
          const recipe = c.recipe;
          if (!recipe) return null;
          const role = c.role || '';
          const isEaten = eatenIds.has(recipe.id);
          const isLoading = loadingIds.has(recipe.id);
          // Boisson / fruit = trop simples → non cliquables (pas de détail recette)
          const isClickable = role !== 'boisson' && role !== 'fruit';
          const isPremium = ((recipe.tags as string[]) || []).includes('premium');

          return (
            <View
              key={recipe.id || idx}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 8,
              }}
            >
              {/* Checkbox "j'ai mangé" */}
              <TouchableOpacity
                onPress={() => toggleComponent(recipe)}
                disabled={isLoading || isLocked}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isEaten, disabled: isLocked }}
                accessibilityLabel={`${isEaten ? 'Annuler' : 'Marquer mangé'} : ${recipe.name}`}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: isLocked ? colors.border : colors.primary,
                  backgroundColor: isEaten ? (isPast ? colors.textMuted : colors.primary) : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isLocked ? 0.6 : 1,
                }}
              >
                {isEaten && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>

              {/* Image de la composante */}
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RecipeImage name={recipe.name} fallbackEmoji={recipe.emoji} style={{ fontSize: 20 }} />
              </View>

              {/* Nom + rôle (cliquable si ce n'est pas une boisson/fruit) */}
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={isClickable ? 0.6 : 1}
                onPress={() => isClickable && onPressComponent?.(recipe.id)}
                disabled={!isClickable}
              >
                <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {c.roleLabel || role}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text,
                      textDecorationLine: isEaten ? 'line-through' : 'none',
                    }}
                  >
                    {recipe.name}
                  </Text>
                  {isPremium && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: colors.primary, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 }}>
                      <Ionicons name="star" size={8} color="#fff" />
                      <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>PREMIUM</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  {recipe.nutrition?.calories || 0} kcal
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ========== DAY SELECTOR ==========
interface DaySelectorProps {
  days: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  dayNumbers?: number[];
  monthLabel?: string;
  daysWithPlan?: boolean[];
  todayIndex?: number;
  onMonthPress?: () => void;
}

export function DaySelector({
  days,
  selectedIndex,
  onSelect,
  dayNumbers = [],
  monthLabel,
  daysWithPlan = [],
  todayIndex = -1,
  onMonthPress,
}: DaySelectorProps) {
  const { colors } = useTheme();

  return (
    <View>
      {monthLabel && (
        <TouchableOpacity
          onPress={onMonthPress}
          disabled={!onMonthPress}
          activeOpacity={onMonthPress ? 0.6 : 1}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 13,
              fontWeight: '700',
              color: colors.textSecondary,
              textTransform: 'capitalize',
            }}
          >
            {monthLabel}
          </Text>
          {onMonthPress && <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />}
        </TouchableOpacity>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
        {days.map((day, i) => {
          const isSelected = i === selectedIndex;
          const isToday = i === todayIndex;
          const hasPlan = daysWithPlan[i];
          const dayNum = dayNumbers[i];
          // Jour passé : avant aujourd'hui (todayIndex). Grisé mais toujours consultable.
          const isPast = todayIndex >= 0 && i < todayIndex;

          return (
            <TouchableOpacity
              key={i}
              onPress={() => onSelect(i)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginRight: 8,
                borderRadius: BorderRadius.md,
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderWidth: isToday && !isSelected ? 2 : 1,
                borderColor: isSelected ? colors.primary : isToday ? colors.primary : colors.border,
                alignItems: 'center',
                minWidth: 56,
                opacity: isPast && !isSelected ? 0.45 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isSelected ? '#fff' : colors.textMuted,
                  marginBottom: 2,
                  textTransform: 'capitalize',
                }}
              >
                {day}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '800',
                  color: isSelected ? '#fff' : isPast ? colors.textMuted : colors.text,
                }}
              >
                {dayNum || day}
              </Text>
              {hasPlan && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: isSelected ? '#fff' : colors.primary,
                    marginTop: 4,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ========== BUDGET CARD ==========
interface BudgetCardProps {
  budget: number;
  spent: number;
}

export function BudgetCard({ budget, spent }: BudgetCardProps) {
  const { colors } = useTheme();
  const total = budget;
  const remaining = total - spent;
  const percentUsed = Math.min((spent / total) * 100, 100);
  const isOver = spent > total;

  return (
    <View
      style={{
        padding: 20,
        borderRadius: BorderRadius.xl,
        backgroundColor: colors.primary,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 1.5, opacity: 0.9 }}>
          BUDGET RESTANT
        </Text>
        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.8 }}>
          Dépensé: {spent.toFixed(1)}€
        </Text>
      </View>

      <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 8 }}>
        {isOver ? `-${(spent - total).toFixed(1)}€` : `${remaining.toFixed(1)}€`}
      </Text>

      <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' }}>
        <View
          style={{
            width: `${percentUsed}%`,
            height: '100%',
            backgroundColor: isOver ? '#FCA5A5' : '#fff',
            borderRadius: 3,
          }}
        />
      </View>

      <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, marginTop: 6, textAlign: 'right' }}>
        Total: {total}€
      </Text>
    </View>
  );
}

// ========== STAT CARD ==========
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({ label, value, unit, icon, color }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        padding: 14,
        borderRadius: BorderRadius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
      }}
    >
      {icon}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: color || colors.text }}>
          {value}
        </Text>
        {unit && (
          <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>
            {unit}
          </Text>
        )}
      </View>
      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}
