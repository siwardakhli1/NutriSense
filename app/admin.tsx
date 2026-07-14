// ==========================================
// SCREEN - Espace Admin (dashboard)
// Accessible uniquement aux administrateurs (protégé aussi côté backend).
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';
import { api } from '@/services/api';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

interface AdminStats {
  userCount: number;
  newUsersThisWeek: number;
  recipeCount: number;
  premiumCount: number;
  weekPlanCount: number;
  referralCount: number;
  rewardsUnlocked: number;
}

function StatBox({ icon, label, value, sub, colors }: any) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: BorderRadius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Ionicons name={icon} size={16} color={colors.primary} />
        <Text style={{ fontSize: 11, color: colors.textMuted }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{value}</Text>
      {sub ? <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{sub}</Text> : null}
    </View>
  );
}

function AdminAction({ icon, label, desc, onPress, colors }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: BorderRadius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 8,
      }}
    >
      <Ionicons name={icon} size={22} color={colors.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{label}</Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function AdminScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await api.get<AdminStats>('/admin/stats');
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || 'Accès refusé ou erreur');
      }
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Espace Admin',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>

          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <View style={{ padding: 20, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
              <Ionicons name="lock-closed-outline" size={32} color={colors.textMuted} />
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 10, textAlign: 'center' }}>
                {error}
              </Text>
            </View>
          ) : stats ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
                  Tableau de bord
                </Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                <StatBox icon="people-outline" label="Utilisateurs" value={stats.userCount} sub={`+${stats.newUsersThisWeek} cette semaine`} colors={colors} />
                <StatBox icon="calendar-outline" label="Plans générés" value={stats.weekPlanCount} colors={colors} />
                <StatBox icon="restaurant-outline" label="Recettes" value={stats.recipeCount} sub={`${stats.premiumCount} premium`} colors={colors} />
                <StatBox icon="gift-outline" label="Parrainages" value={stats.referralCount} sub={`${stats.rewardsUnlocked} récompenses`} colors={colors} />
              </View>

              <Text style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 10 }}>
                Gestion
              </Text>
              <AdminAction
                icon="restaurant-outline"
                label="Gérer les recettes"
                desc="Voir et supprimer des recettes"
                onPress={() => router.push('/admin-recipes')}
                colors={colors}
              />
              <AdminAction
                icon="people-outline"
                label="Liste des utilisateurs"
                desc="Voir les inscrits et parrainages"
                onPress={() => router.push('/admin-users')}
                colors={colors}
              />
            </>
          ) : null}

        </ScrollView>
      </SafeAreaView>
    </>
  );
}