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
  if (l.includes('petit') || l.includes('déj')) return 'breakfast';
  if (l.includes('déjeuner')) return 'lunch';
  if (l.includes('dîner') || l.includes('diner')) return 'dinner';
  if (l.includes('snack') || l.includes('collation')) return 'snack';
  return 'other';
}

export function MealCard({ label, labelIcon, meal, onPress, date, onLogged }: MealCardProps) {
  const { colors } = useTheme();
  const [isEaten, setIsEaten] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logId, setLogId] = useState<string | null>(null);

  // Vérifier si CE repas à CETTE date a été loggé
  useEffect(() => {
    if (!date) return;
    (async () => {
      const res = await api.get<{ logs: any[] }>('/nutrition/logs?days=30');
      if (res.success && res.data) {
        const mealType = getMealType(label);
        // On match sur date + label + mealType (les 3 doivent correspondre)
        const alreadyLogged = res.data.logs.find(
          (l: any) =>
            l.label === meal.recipe.name &&
            l.mealType === mealType &&
            l.loggedAt.startsWith(date) // date au format YYYY-MM-DD
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
      const loggedAt = new Date(date + 'T12:00:00').toISOString();
      const res = await api.post<{ success: boolean; log: any }>('/nutrition/log', {
        source: 'recipe',
        label: meal.recipe.name,
        mealType: getMealType(label),
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
              <Text style={{ fontSize: 30 }}>{meal.recipe.emoji}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bouton "J'ai mangé" */}
        <TouchableOpacity
          onPress={handleToggleEaten}
          disabled={logging}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isEaten ? "Annuler j'ai mangé" : 'Marquer comme mangé'}
          accessibilityState={{ checked: isEaten }}
          style={{
            marginTop: 12,
            paddingVertical: 10,
            borderRadius: BorderRadius.md,
            backgroundColor: isEaten ? colors.primary : colors.background,
            borderWidth: 1,
            borderColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Ionicons
            name={isEaten ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={18}
            color={isEaten ? '#fff' : colors.primary}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: isEaten ? '#fff' : colors.primary,
            }}
          >
            {isEaten ? 'Repas mangé ✓' : "J'ai mangé"}
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
