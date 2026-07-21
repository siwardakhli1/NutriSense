// SCREEN - Stats (Suivi > Stats) - avec graphiques
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Card } from '@/components/ui';
import { BarChart, LineChart, PieChart, ProgressRing } from '@/components/MiniCharts';
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

const defaultDashboard: Dashboard = {
  dailyStats: [],
  weightHistory: [],
  totals7d: { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, avgWater: 0 },
  streak: 0,
  adherenceRate: 0,
  progressToGoal: { currentWeight: null, targetWeight: null, delta: null, percentDone: null },
  insights: [],
};

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

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

  // Recharge les statistiques CHAQUE FOIS que l'utilisateur revient sur
  // cette page (après avoir validé/retiré des repas dans le plan, par ex.),
  // afin que le suivi reflète toujours les dernières données.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, backgroundColor: colors.background }}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.warning || '#F58220'} />
        <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: colors.text, marginTop: 16 }}>Oups !</Text>
        <Text style={{ fontSize: FontSize.md, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>{error}</Text>
        <TouchableOpacity
          onPress={load}
          style={{ marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.md }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasData = dashboard.dailyStats.length > 0;

  // Préparer les données pour graphiques
  const last7Days = dashboard.dailyStats.slice(-7);
  const caloriesData = last7Days.map((d) => ({
    label: DAY_LABELS[new Date(d.date).getDay() === 0 ? 6 : new Date(d.date).getDay() - 1] || '?',
    value: d.calories,
    color: d.calories > 0 ? colors.primary : colors.border,
  }));

  const macrosData = [
    { label: 'Protéines', value: dashboard.totals7d.avgProtein * 4, color: '#EF4444' },
    { label: 'Glucides', value: dashboard.totals7d.avgCarbs * 4, color: '#F59E0B' },
    { label: 'Lipides', value: dashboard.totals7d.avgFat * 9, color: '#3B82F6' },
  ];

  const weightData = dashboard.weightHistory.slice(-7).map((w, i) => ({
    label: `S${i + 1}`,
    value: w.weight,
  }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: FontSize.sm, color: colors.textMuted, marginBottom: Spacing.md }}>
        Analyse de tes {dashboard.dailyStats.length || 14} derniers jours
      </Text>

      {/* Ligne KPI */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.md }}>
        <Card style={{ flex: 1, alignItems: 'center', padding: 12 }}>
          <Ionicons name="flame" size={22} color="#FF6B00" />
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 }}>
            {dashboard.streak}
          </Text>
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>jour de suite</Text>
        </Card>

        <Card style={{ flex: 1, alignItems: 'center', padding: 12 }}>
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 }}>
            {Math.round(dashboard.adherenceRate)}%
          </Text>
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>adhérence 7j</Text>
        </Card>

        <Card style={{ flex: 1, alignItems: 'center', padding: 12 }}>
          <Ionicons
            name={dashboard.progressToGoal.delta && dashboard.progressToGoal.delta < 0 ? 'trending-down' : 'trending-up'}
            size={22}
            color={colors.primary}
          />
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 }}>
            {dashboard.progressToGoal.delta !== null ? `${dashboard.progressToGoal.delta > 0 ? '+' : ''}${dashboard.progressToGoal.delta}` : '—'}
          </Text>
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>objectif</Text>
        </Card>
      </View>

      {!hasData && (
        <Card style={{ backgroundColor: colors.primaryLight, alignItems: 'center', padding: Spacing.lg, marginBottom: Spacing.md }}>
          <Ionicons name="analytics-outline" size={40} color={colors.primary} />
          <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: colors.text, marginTop: 8 }}>
            Pas encore de données
          </Text>
          <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            Log tes repas via le scanner ou l'app pour voir tes stats.
          </Text>
        </Card>
      )}

      {hasData && (
        <>
          {/* Graphique Calories */}
          <Card style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Ionicons name="flame-outline" size={18} color={colors.primary} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                Calories consommées
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginLeft: 'auto' }}>
                7 derniers jours
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
              Moyenne : <Text style={{ fontWeight: '700', color: colors.text }}>{Math.round(dashboard.totals7d.avgCalories)} kcal/jour</Text>
            </Text>
            <BarChart data={caloriesData} height={100} />
          </Card>

          {/* Répartition Macros */}
          <Card style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Ionicons name="pie-chart-outline" size={18} color={colors.primary} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                Répartition macros
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginLeft: 'auto' }}>
                7j
              </Text>
            </View>
            <PieChart data={macrosData} size={100} />
          </Card>

          {/* Évolution du poids */}
          {weightData.length >= 2 && (
            <Card style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Ionicons name="scale-outline" size={18} color={colors.primary} />
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                  Évolution du poids
                </Text>
              </View>
              <LineChart data={weightData} height={120} color="#3B82F6" />
            </Card>
          )}

          {/* Progression objectif */}
          {dashboard.progressToGoal.percentDone !== null && (
            <Card style={{ padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, alignSelf: 'flex-start' }}>
                <Ionicons name="flag-outline" size={18} color={colors.primary} />
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                  Objectif
                </Text>
              </View>
              <ProgressRing
                value={dashboard.progressToGoal.percentDone}
                size={100}
                color={colors.primary}
                sublabel={
                  dashboard.progressToGoal.targetWeight
                    ? `Objectif : ${dashboard.progressToGoal.targetWeight} kg`
                    : undefined
                }
              />
            </Card>
          )}

          {/* Insights */}
          {dashboard.insights.length > 0 && (
            <Card style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Ionicons name="bulb-outline" size={18} color={colors.primary} />
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                  Conseils personnalisés
                </Text>
              </View>
              {dashboard.insights.map((insight, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottomWidth: i < dashboard.insights.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '800' }}>•</Text>
                  <Text style={{ flex: 1, fontSize: 13, color: colors.text, lineHeight: 18 }}>
                    {insight}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}
