// ==========================================
// COMPONENTS - Plan repas
// ==========================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Meal, Recipe } from '@/types';
import { BorderRadius, Spacing, FontSize } from '@/constants/Colors';

// ========== MEAL CARD ==========
interface MealCardProps {
  label: string;
  labelIcon: string;
  meal: Meal;
  onPress: () => void;
}

export function MealCard({ label, labelIcon, meal, onPress }: MealCardProps) {
  const { colors } = useTheme();

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
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={{
          padding: 20,
          borderRadius: BorderRadius.xl,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text, marginBottom: 6, lineHeight: 22 }}>
              {meal.recipe.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                🕐 {meal.recipe.time} min
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                🔥 {meal.recipe.nutrition.calories} kcal
              </Text>
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
    </View>
  );
}

// ========== DAY SELECTOR ==========
interface DaySelectorProps {
  days: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  dayNumbers?: number[];
  monthLabel?: string;         // ex: "Juillet 2026"
  daysWithPlan?: boolean[];    // 7 bools: si un jour a un plan complet
  todayIndex?: number;         // index du jour actuel dans la semaine (0-6)
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
}

export function DaySelector({
  days, selectedIndex, onSelect, dayNumbers,
  monthLabel, daysWithPlan, todayIndex,
  onPreviousWeek, onNextWeek,
}: DaySelectorProps) {
  const { colors } = useTheme();

  return (
    <View>
      {/* Header avec mois + navigation */}
      {monthLabel && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingHorizontal: 4,
        }}>
          <TouchableOpacity
            onPress={onPreviousWeek}
            disabled={!onPreviousWeek}
            style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: colors.surfaceVariant,
              justifyContent: 'center', alignItems: 'center',
              opacity: onPreviousWeek ? 1 : 0.4,
            }}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </TouchableOpacity>

          <Text style={{
            fontSize: 15, fontWeight: '700', color: colors.text,
            textTransform: 'capitalize',
          }}>
            {monthLabel}
          </Text>

          <TouchableOpacity
            onPress={onNextWeek}
            disabled={!onNextWeek}
            style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: colors.surfaceVariant,
              justifyContent: 'center', alignItems: 'center',
              opacity: onNextWeek ? 1 : 0.4,
            }}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Jours de la semaine */}
      <View style={{ flexDirection: 'row', gap: 4, paddingBottom: 4 }}>
        {days.map((day, i) => {
          const active = selectedIndex === i;
          const isToday = todayIndex === i;
          const hasPlan = daysWithPlan?.[i];

          return (
            <TouchableOpacity
              key={`${day}-${i}`}
              onPress={() => onSelect(i)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: BorderRadius.md,
                backgroundColor: active ? colors.primary : 'transparent',
                borderWidth: !active && isToday ? 1.5 : 0,
                borderColor: colors.primary,
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: active ? 'rgba(255,255,255,0.85)' : (isToday ? colors.primary : colors.textMuted),
                }}
              >
                {day}
              </Text>
              {dayNumbers && (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: active ? '#FFFFFF' : (isToday ? colors.primary : colors.text),
                    marginTop: 2,
                  }}
                >
                  {dayNumbers[i]}
                </Text>
              )}
              {/* Indicateur : point vert si plan complet */}
              {hasPlan && (
                <View style={{
                  width: 5, height: 5, borderRadius: 3,
                  backgroundColor: active ? '#fff' : colors.success,
                  marginTop: 4,
                }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
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
  const remaining = budget - spent;
  const progress = Math.min(spent / budget, 1);

  return (
    <View
      style={{
        backgroundColor: colors.primary,
        borderRadius: BorderRadius.xl,
        padding: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>
            Budget restant
          </Text>
          <Text style={{ fontSize: 36, fontWeight: '800', color: '#FFFFFF', marginTop: 4 }}>
            {remaining}€
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            Dépensé: {spent}€
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            Total: {budget}€
          </Text>
        </View>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.15)',
          marginTop: 16,
        }}
      >
        <View
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255,255,255,0.8)',
            width: `${progress * 100}%`,
          }}
        />
      </View>
    </View>
  );
}

// ========== STAT CARD ==========
interface StatCardProps {
  value: string;
  unit: string;
  label: string;
}

export function StatCard({ value, unit, label }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        borderRadius: BorderRadius.lg,
        backgroundColor: colors.surfaceVariant,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
        {value}
        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textMuted }}> {unit}</Text>
      </Text>
      <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}
