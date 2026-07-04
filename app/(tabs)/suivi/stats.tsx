// ==========================================
// SCREEN - Stats (Suivi > Stats) v2 : robuste + états vides
// ==========================================
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

interface DailyStat {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterMl: number;
  mealsCount: number;
}

interface WeightPoint {
  date: string;
  weight: number;
}

interface Dashboard {
  dailyStats: DailyStat[];
  weightHistory: WeightPoint[];
  totals7d: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    avgWater: number;
  };
  streak: number;
  adherenceRate: number;
  progressToGoal: {
    currentWeight: number | null;
    targetWeight: number | null;
    delta: number | null;
    percentDone: number | null;
  };
  insights: string[];
}

// Valeurs par défaut safe
const defaultDashboard: Dashboard = {
  dailyStats: [],
  weightHistory: [],
  totals7d: { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, avgWater: 0 },
  streak: 0,
  adherenceRate: 0,
  progressToGoal: { currentWeight: null, targetWeight: null, delta: null, percentDone: null },
  insights: [],
};

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const [dashboard, setDashboard] = useState<Dashboard>(defaultDashboard);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await api.get<Dashboard>('/analytics/dashboard');
    if (res.success && res.data) {
      // Merge avec les defaults pour éviter les undefined
      setDashboard({
        dailyStats: res.data.dailyStats ?? [],
        weightHistory: res.data.weightHistory ?? [],
        totals7d: res.data.totals7d ?? defaultDashboard.totals7d,
        streak: res.data.streak ?? 0,
        adherenceRate: res.data.adherenceRate ?? 0,
        progressToGoal: res.data.progressToGoal ?? defaultDashboard.progressToGoal,
        insights: res.data.insights ?? [],
      });
    } else {
      setError(res.message || 'Impossible de charger les stats');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const logDemoData = async () => {
    // Ajouter quelques logs de démo pour peupler le dashboard
    setLoading(true);
    const meals = [
      { source: 'manual', label: 'Petit-déj', mealType: 'breakfast', calories: 380, protein: 18, carbs: 42, fat: 12, fiber: 6, waterMl: 300 },
      { source: 'manual', label: 'Déjeuner', mealType: 'lunch', calories: 520, protein: 30, carbs: 55, fat: 18, fiber: 8, waterMl: 500 },
      { source: 'manual', label: 'Dîner', mealType: 'dinner', calories: 460, protein: 28, carbs: 42, fat: 16, fiber: 7, waterMl: 400 },
    ];
    for (const m of meals) {
      await api.post('/logs/nutrition', m);
    }
    await load();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background }}>
        <Ionicons name="alert-circle-outline" size={50} color={colors.warning} />
        <Text style={{ color: colors.text, marginTop: 12, textAlign: 'center', fontWeight: '700' }}>Oups !</Text>
        <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity onPress={load} style={{
          marginTop: 16, backgroundColor: colors.primary,
          paddingHorizontal: 20, paddingVertical: 12, borderRadius: BorderRadius.md,
        }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Toujours safe grâce au ?? [] dans le state
  const hasData = dashboard.dailyStats.length > 0;
  const maxCal = hasData ? Math.max(...dashboard.dailyStats.map((d) => d.calories), 1) : 1;
  const hasWeight = dashboard.weightHistory.length > 1;
  const maxWeight = hasWeight ? Math.max(...dashboard.weightHistory.map((w) => w.weight), 1) : 1;
  const minWeight = hasWeight ? Math.min(...dashboard.weightHistory.map((w) => w.weight), maxWeight) : 1;

  return (
    <ScrollView
      contentContainerStyle={{ padding: Spacing.lg, backgroundColor: colors.background, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={{ color: colors.textMuted, marginBottom: Spacing.lg }}>
        Analyse de tes 14 derniers jours
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StatBox colors={colors} icon="flame" value={String(dashboard.streak)}
          label={`jour${dashboard.streak > 1 ? 's' : ''} de suite`} highlight={colors.warning} />
        <StatBox colors={colors} icon="checkmark-circle" value={`${dashboard.adherenceRate}%`}
          label="adhérence 7j" highlight={colors.success} />
        <StatBox colors={colors} icon="trending-up"
          value={dashboard.progressToGoal.percentDone != null ? `${dashboard.progressToGoal.percentDone}%` : '—'}
          label="objectif" highlight={colors.primary} />
      </View>

      {/* Message si pas de données + bouton de démo */}
      {!hasData && (
        <Card style={{ marginBottom: 16, backgroundColor: colors.primaryLight }}>
          <View style={{ alignItems: 'center', padding: 8 }}>
            <Ionicons name="analytics-outline" size={40} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700', marginTop: 8, textAlign: 'center' }}>
              Pas encore de données
            </Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 4, fontSize: 13 }}>
              Log tes repas via le scanner ou l'app pour voir tes stats.
            </Text>
            <TouchableOpacity
              onPress={logDemoData}
              style={{
                marginTop: 12, backgroundColor: colors.primary,
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: BorderRadius.md,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                🎯 Ajouter 3 repas démo
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {dashboard.insights.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 10 }}>
            🧠 Insights personnalisés
          </Text>
          {dashboard.insights.map((insight, i) => (
            <View key={i} style={{
              flexDirection: 'row', paddingVertical: 8,
              borderBottomWidth: i < dashboard.insights.length - 1 ? 1 : 0,
              borderColor: colors.border,
            }}>
              <Text style={{ color: colors.primary, marginRight: 8 }}>•</Text>
              <Text style={{ color: colors.text, flex: 1, lineHeight: 20 }}>{insight}</Text>
            </View>
          ))}
        </Card>
      )}

      {hasData && (
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
            Calories quotidiennes
          </Text>
          <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
            Moyenne : {dashboard.totals7d.avgCalories} kcal/j
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 6 }}>
            {dashboard.dailyStats.slice(-7).map((d, i) => {
              const h = (d.calories / maxCal) * 120;
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{
                    width: '100%', height: h, backgroundColor: colors.primary,
                    borderRadius: 6, marginBottom: 4,
                  }} />
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>
                    {d.date?.slice(-5) || ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {hasWeight && (
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
            Courbe de poids
          </Text>
          <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
            {dashboard.progressToGoal.currentWeight} kg → cible {dashboard.progressToGoal.targetWeight} kg
          </Text>
          <View style={{ height: 100, flexDirection: 'row', alignItems: 'flex-end' }}>
            {dashboard.weightHistory.map((w, i) => {
              const normalized = (w.weight - minWeight) / (maxWeight - minWeight || 1);
              const h = normalized * 80 + 10;
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{
                    width: 6, height: 6, borderRadius: 3,
                    backgroundColor: colors.primary, marginBottom: h,
                  }} />
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {hasData && (
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
            Macros moyens (14j)
          </Text>
          <MacroBar label="Protéines" value={dashboard.totals7d.avgProtein} target={100} unit="g" color={colors.primary} colors={colors} />
          <MacroBar label="Glucides" value={dashboard.totals7d.avgCarbs} target={250} unit="g" color={colors.accent} colors={colors} />
          <MacroBar label="Lipides" value={dashboard.totals7d.avgFat} target={70} unit="g" color={colors.warning} colors={colors} />
          <MacroBar label="Eau" value={dashboard.totals7d.avgWater / 1000} target={2} unit="L" color="#3b82f6" colors={colors} />
        </Card>
      )}
    </ScrollView>
  );
}

function StatBox({ colors, icon, value, label, highlight }: any) {
  return (
    <View style={{
      flex: 1, backgroundColor: colors.surface, padding: 12,
      borderRadius: BorderRadius.md, alignItems: 'center',
    }}>
      <Ionicons name={icon} size={22} color={highlight} />
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

function MacroBar({ label, value, target, unit, color, colors }: any) {
  const pct = Math.min(100, (value / target) * 100);
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: colors.textMuted }}>
          {value.toFixed(0)}{unit} / {target}{unit}
        </Text>
      </View>
      <View style={{
        height: 8, backgroundColor: colors.surfaceVariant,
        borderRadius: 4, overflow: 'hidden',
      }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
      </View>
    </View>
  );
}
