// ==========================================
// COMPONENTS - Meal Card + Day Selector + Budget + Stat
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

export function MealCard({ label, labelIcon, meal, onPress, date, onLogged }: MealCardProps) {
  const { colors } = useTheme();
  const [isEaten, setIsEaten] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logId, setLogId] = useState<string | null>(null);

  // Logique métier : on ne peut pas cocher un repas dans le FUTUR.
  const todayStr = (() => {
    // On cale "aujourd'hui" sur le fuseau de la France (Europe/Paris),
    // pour que le changement de jour se fasse à minuit heure française,
    // quel que soit le fuseau du téléphone/émulateur.
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()); // renvoie 'YYYY-MM-DD'
    } catch {
      const n = new Date();
      return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    }
  })();
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

// ========== DAY SELECTOR ==========
interface DaySelectorProps {
  days: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  dayNumbers?: number[];
  monthLabel?: string;
  daysWithPlan?: boolean[];
  todayIndex?: number;
}

export function DaySelector({
  days,
  selectedIndex,
  onSelect,
  dayNumbers = [],
  monthLabel,
  daysWithPlan = [],
  todayIndex = -1,
}: DaySelectorProps) {
  const { colors } = useTheme();

  return (
    <View>
      {monthLabel && (
        <Text
          style={{
            textAlign: 'center',
            fontSize: 13,
            fontWeight: '700',
            color: colors.textSecondary,
            marginBottom: 8,
            textTransform: 'capitalize',
          }}
        >
          {monthLabel}
        </Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
        {days.map((day, i) => {
          const isSelected = i === selectedIndex;
          const isToday = i === todayIndex;
          const hasPlan = daysWithPlan[i];
          const dayNum = dayNumbers[i];

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
                  color: isSelected ? '#fff' : colors.text,
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

// ==========================================
// COMPOSED MEAL CARD — repas complet, design pro
// Flèche seule + icônes silhouettes + check INDIVIDUEL par plat.
// Chaque composante est loggée séparément → calcul de calories juste.
// ==========================================
interface ComposedMealCardProps {
  label: string;
  labelIcon?: string;      // (conservé pour compat, non utilisé : on met une icône Ionicons)
  meal: Meal;
  date?: string;
  defaultOpen?: boolean;
  onPressComponent?: (recipeId: string) => void;
  onLogged?: () => void;
}

// Icône silhouette (Ionicons outline) selon le type de repas
function mealIconName(type: string): any {
  if (type === 'breakfast') return 'cafe-outline';
  if (type === 'lunch') return 'sunny-outline';
  if (type === 'dinner') return 'moon-outline';
  return 'restaurant-outline';
}

// Couleur de la barre latérale : nuances de vert selon le repas
function mealBarColor(type: string, colors: any): string {
  if (type === 'breakfast') return colors.primaryLight;  // vert clair
  if (type === 'lunch') return colors.primary;           // vert moyen
  if (type === 'dinner') return colors.primaryDark;      // vert foncé
  return colors.primary;
}

export function ComposedMealCard({
  label,
  meal,
  date,
  defaultOpen = false,
  onPressComponent,
  onLogged,
}: ComposedMealCardProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  // Map recipeId -> logId pour les composantes cochées
  const [eatenMap, setEatenMap] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const components = meal.components || [];

  // Fuseau France pour bloquer le futur
  const todayStr = (() => {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Paris',
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date());
    } catch {
      const n = new Date();
      return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    }
  })();
  const isFuture = !!date && date > todayStr;

  // Calories totales du repas et calories mangées (composantes cochées)
  const totalCalories = components.reduce((s, c) => s + (c.recipe.nutrition?.calories || 0), 0);
  const eatenCalories = components.reduce(
    (s, c) => s + (eatenMap[c.recipe.id] ? (c.recipe.nutrition?.calories || 0) : 0),
    0
  );
  const totalTime = components.reduce((s, c) => s + (c.recipe.time || 0), 0);
  const allEaten = components.length > 0 && components.every((c) => eatenMap[c.recipe.id]);

  // Au chargement : retrouver quelles composantes sont déjà loggées
  useEffect(() => {
    if (!date || components.length === 0) return;
    let cancelled = false;
    (async () => {
      const res = await api.get<{ logs: any[] }>('/nutrition/logs?days=365');
      if (cancelled || !res.success || !res.data) return;
      const norm = (s: string) => (s || '').trim().toLowerCase();
      const map: Record<string, string> = {};
      for (const comp of components) {
        const found = res.data.logs.find(
          (l: any) =>
            norm(l.label) === norm(comp.recipe.name) &&
            l.mealType === meal.type &&
            typeof l.loggedAt === 'string' &&
            l.loggedAt.slice(0, 10) === date
        );
        if (found) map[comp.recipe.id] = found.id;
      }
      if (!cancelled) setEatenMap(map);
    })();
    return () => { cancelled = true; };
  }, [meal.type, date, components.length]);

  // Cocher / décocher UNE composante
  const toggleComponent = async (comp: any) => {
    if (!date || isFuture || loadingIds.has(comp.recipe.id)) return;
    setLoadingIds((s) => new Set(s).add(comp.recipe.id));
    const existingLogId = eatenMap[comp.recipe.id];

    if (existingLogId) {
      // Décocher : supprimer le log
      const res = await api.delete(`/nutrition/log/${existingLogId}`);
      if (res.success) {
        setEatenMap((m) => {
          const copy = { ...m };
          delete copy[comp.recipe.id];
          return copy;
        });
        onLogged?.();
      }
    } else {
      // Cocher : créer le log de cette composante
      const loggedAt = date + 'T12:00:00.000Z';
      const n = comp.recipe.nutrition || {};
      const res = await api.post<{ success: boolean; log: any }>('/nutrition/log', {
        source: 'recipe',
        label: comp.recipe.name,
        mealType: meal.type,
        calories: n.calories || 0,
        protein: n.protein || 0,
        carbs: n.carbs || 0,
        fat: n.fat || 0,
        fiber: n.fiber || 0,
        loggedAt,
      });
      if (res.success && (res.data as any)?.log) {
        setEatenMap((m) => ({ ...m, [comp.recipe.id]: (res.data as any).log.id }));
        onLogged?.();
      } else {
        Alert.alert('Erreur', "Impossible d'enregistrer ce plat");
      }
    }
    setLoadingIds((s) => {
      const copy = new Set(s);
      copy.delete(comp.recipe.id);
      return copy;
    });
  };

  // Rétrocompat : ancien format sans composantes → MealCard classique
  if (components.length === 0) {
    return (
      <MealCard
        label={label}
        meal={meal}
        date={date}
        onLogged={onLogged}
        onPress={() => onPressComponent?.(meal.recipe?.id)}
      />
    );
  }

  // Sous-titre de l'en-tête : calories mangées si on a commencé, sinon total
  const headerSub =
    eatenCalories > 0
      ? `${eatenCalories} / ${totalCalories} kcal mangés`
      : `${totalCalories} kcal · ${totalTime} min`;

  return (
    <View style={{ marginBottom: 12 }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: allEaten ? 2 : 1,
          borderColor: allEaten ? colors.primary : colors.border,
          overflow: 'hidden',
          flexDirection: 'row',
        }}
      >
        {/* Barre de couleur latérale (nuance de vert selon le repas) */}
        <View style={{ width: 4, backgroundColor: mealBarColor(meal.type, colors) }} />

        {/* Contenu de la carte */}
        <View style={{ flex: 1 }}>
        {/* En-tête : icône silhouette + nom + flèche seule */}
        <TouchableOpacity
          onPress={() => setOpen((o) => !o)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${open ? 'replier' : 'déplier'}`}
          style={{
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Ionicons name={mealIconName(meal.type)} size={22} color={colors.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{label}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{headerSub}</Text>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Composantes avec case à cocher individuelle */}
        {open && (
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
            {components.map((comp, idx) => {
              const isEaten = !!eatenMap[comp.recipe.id];
              // Boisson et fruit sont trop simples pour avoir une fiche recette
              const isClickable = comp.role !== 'boisson' && comp.role !== 'fruit';
              return (
                <View
                  key={`${comp.role}-${idx}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    borderBottomWidth: idx < components.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  {/* Case à cocher */}
                  <TouchableOpacity
                    onPress={() => toggleComponent(comp)}
                    disabled={isFuture || loadingIds.has(comp.recipe.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isEaten }}
                    accessibilityLabel={`${comp.roleLabel} ${comp.recipe.name}, ${isEaten ? 'mangé' : 'à cocher'}`}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      backgroundColor: isEaten ? colors.primary : 'transparent',
                      borderWidth: isEaten ? 0 : 2,
                      borderColor: isFuture ? colors.border : colors.textMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isFuture ? 0.4 : 1,
                    }}
                  >
                    {isEaten && <Ionicons name="checkmark" size={16} color="#fff" />}
                    {isFuture && !isEaten && <Ionicons name="time-outline" size={14} color={colors.textMuted} />}
                  </TouchableOpacity>

                  {/* Photo du plat (cliquable seulement pour les vraies recettes) */}
                  <TouchableOpacity
                    onPress={() => isClickable && onPressComponent?.(comp.recipe.id)}
                    activeOpacity={isClickable ? 0.7 : 1}
                    disabled={!isClickable}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      backgroundColor: colors.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RecipeImage
                      name={comp.recipe.name}
                      fallbackEmoji={comp.recipe.emoji}
                      style={{ fontSize: 24 }}
                    />
                  </TouchableOpacity>

                  {/* Nom + rôle (cliquable seulement pour les vraies recettes) */}
                  <TouchableOpacity
                    onPress={() => isClickable && onPressComponent?.(comp.recipe.id)}
                    activeOpacity={isClickable ? 0.7 : 1}
                    disabled={!isClickable}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {comp.roleLabel}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.text,
                        marginTop: 1,
                        textDecorationLine: isEaten ? 'line-through' : 'none',
                      }}
                    >
                      {comp.recipe.name}
                    </Text>
                    </View>
                  </TouchableOpacity>

                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    {comp.recipe.nutrition?.calories || 0} kcal
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        </View>
      </View>
    </View>
  );
}
