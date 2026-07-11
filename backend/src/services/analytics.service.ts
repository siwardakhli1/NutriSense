// ==========================================
// SERVICE - Analytics utilisateur (Prisma / PostgreSQL)
// ==========================================
import { prisma } from '../config/database';

export interface DailyStat {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterMl: number;
  mealsCount: number;
}

export interface WeightPoint {
  date: string;
  weight: number;
}

export interface UserDashboard {
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

/**
 * Stats journalières agrégées via SQL Postgres.
 */
export async function getDailyStats(userId: string, days: number): Promise<DailyStat[]> {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      TO_CHAR(DATE(logged_at), 'YYYY-MM-DD') as date,
      COALESCE(SUM(calories), 0)::int as calories,
      COALESCE(SUM(protein), 0)::float as protein,
      COALESCE(SUM(carbs), 0)::float as carbs,
      COALESCE(SUM(fat), 0)::float as fat,
      COALESCE(SUM(fiber), 0)::float as fiber,
      COALESCE(SUM(water_ml), 0)::int as "waterMl",
      COUNT(*)::int as "mealsCount"
    FROM nutrition_logs
    WHERE user_id = ${userId}
      AND logged_at >= NOW() - (${days}::text || ' days')::interval
    GROUP BY DATE(logged_at)
    ORDER BY date ASC
  `;

  return rows.map((r: any) => ({
    date: r.date,
    calories: Math.round(r.calories),
    protein: Math.round(r.protein),
    carbs: Math.round(r.carbs),
    fat: Math.round(r.fat),
    fiber: Math.round(r.fiber),
    waterMl: Math.round(r.waterMl),
    mealsCount: r.mealsCount,
  }));
}

export async function getWeightHistory(userId: string, days: number): Promise<WeightPoint[]> {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT TO_CHAR(DATE(logged_at), 'YYYY-MM-DD') as date, weight
    FROM weight_logs
    WHERE user_id = ${userId}
      AND logged_at >= NOW() - (${days}::text || ' days')::interval
    ORDER BY logged_at ASC
  `;
  return rows.map((r: any) => ({ date: r.date, weight: r.weight }));
}

/**
 * Streak = jours consécutifs avec au moins un log nutritionnel.
 */
export async function computeStreak(userId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ date: Date }[]>`
    SELECT DISTINCT DATE(logged_at) as date
    FROM nutrition_logs
    WHERE user_id = ${userId}
    ORDER BY date DESC
    LIMIT 60
  `;

  if (!rows.length) return 0;

  // Convertit une date en numéro de jour (UTC) pour comparer sans souci de fuseau.
  const toDayNumber = (d: Date): number => {
    const dt = new Date(d);
    return Math.floor(
      Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()) / 86400000
    );
  };

  // Jours (numéros) où au moins un repas a été loggé, triés décroissant.
  const loggedDays = rows.map((r) => toDayNumber(new Date(r.date)));

  // On compte la plus longue suite de jours consécutifs à partir du jour
  // le plus récent loggé (pas d'aujourd'hui) : ça gère aussi bien les repas
  // passés que les repas cochés à l'avance.
  let streak = 1;
  for (let i = 1; i < loggedDays.length; i++) {
    const gap = loggedDays[i - 1] - loggedDays[i];
    if (gap === 1) streak++;
    else if (gap === 0) continue;
    else break;
  }
  return streak;
}

/**
 * Adhérence : % de jours (sur 7) respectant l'objectif calorique (+/- 15%).
 */
export async function computeAdherence(userId: string): Promise<number> {
  const goal = await prisma.healthGoal.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  if (!goal) return 0;

  const stats = await getDailyStats(userId, 7);
  if (!stats.length) return 0;

  const target = goal.dailyCaloriesTarget;
  const tolerance = 0.15;
  const compliant = stats.filter((s) => Math.abs(s.calories - target) <= target * tolerance).length;

  return Math.round((compliant / stats.length) * 100);
}

export async function generateInsights(userId: string): Promise<string[]> {
  const insights: string[] = [];
  const stats = await getDailyStats(userId, 14);

  if (stats.length < 3) {
    insights.push("Continue à logger tes repas pour des insights personnalisés 🍽️");
    return insights;
  }

  const avgCal = stats.reduce((s, d) => s + d.calories, 0) / stats.length;
  const overDays = stats.filter((d) => d.calories > avgCal * 1.2).length;
  if (overDays >= 3) {
    insights.push(`Tu dépasses ta moyenne de 20% sur ${overDays} jours ces 2 dernières semaines.`);
  }

  const avgProtein = stats.reduce((s, d) => s + d.protein, 0) / stats.length;
  if (avgProtein < 60) {
    insights.push(`Ton apport protéique moyen (${Math.round(avgProtein)}g) est bas. Vise 80-100g minimum.`);
  }

  const avgFiber = stats.reduce((s, d) => s + d.fiber, 0) / stats.length;
  if (avgFiber < 20) {
    insights.push(`Fibres insuffisantes (${Math.round(avgFiber)}g/j). Ajoute légumineuses et légumes.`);
  }

  const avgWater = stats.reduce((s, d) => s + d.waterMl, 0) / stats.length;
  if (avgWater > 0 && avgWater < 1500) {
    insights.push(`Hydratation moyenne : ${Math.round(avgWater)}ml/j. Vise au moins 1.5L.`);
  }

  if (insights.length === 0) {
    insights.push('Bonne régularité sur les 2 dernières semaines, continue comme ça 💪');
  }

  return insights;
}

export async function buildDashboard(userId: string): Promise<UserDashboard> {
  const [dailyStats, weightHistory, goal, insights] = await Promise.all([
    getDailyStats(userId, 14),
    getWeightHistory(userId, 90),
    prisma.healthGoal.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    generateInsights(userId),
  ]);

  const totals = dailyStats.length
    ? {
        avgCalories: Math.round(dailyStats.reduce((s, d) => s + d.calories, 0) / dailyStats.length),
        avgProtein: Math.round(dailyStats.reduce((s, d) => s + d.protein, 0) / dailyStats.length),
        avgCarbs: Math.round(dailyStats.reduce((s, d) => s + d.carbs, 0) / dailyStats.length),
        avgFat: Math.round(dailyStats.reduce((s, d) => s + d.fat, 0) / dailyStats.length),
        avgWater: Math.round(dailyStats.reduce((s, d) => s + d.waterMl, 0) / dailyStats.length),
      }
    : { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, avgWater: 0 };

  const latestWeight = weightHistory[weightHistory.length - 1]?.weight ?? goal?.weight ?? null;
  const targetWeight = goal?.targetWeight ?? null;
  let percentDone: number | null = null;
  let delta: number | null = null;
  if (goal && latestWeight != null && targetWeight != null) {
    delta = Number((latestWeight - targetWeight).toFixed(1));
    const totalToLose = Math.abs(goal.weight - targetWeight);
    const alreadyDone = Math.abs(goal.weight - latestWeight);
    percentDone = totalToLose > 0 ? Math.round((alreadyDone / totalToLose) * 100) : 100;
    percentDone = Math.max(0, Math.min(100, percentDone));
  }

  return {
    dailyStats,
    weightHistory,
    totals7d: totals,
    streak: await computeStreak(userId),
    adherenceRate: await computeAdherence(userId),
    progressToGoal: { currentWeight: latestWeight, targetWeight, delta, percentDone },
    insights,
  };
}
