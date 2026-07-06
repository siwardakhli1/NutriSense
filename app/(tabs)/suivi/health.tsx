// ==========================================
// SCREEN - Santé (Suivi > Santé)
// Objectif calorique via BMR, log poids, progression
// ==========================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

interface HealthGoal {
  id: string;
  weight: number;
  targetWeight: number;
  height: number;
  activityLevel: string;
  dailyCaloriesTarget: number;
  dailyWaterTarget: number;
  createdAt: string;
}

export default function HealthScreen() {
  const { colors } = useTheme();
  const [goal, setGoal] = useState<HealthGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [weight, setWeight] = useState('68');
  const [targetWeight, setTargetWeight] = useState('62');
  const [height, setHeight] = useState('165');
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>('medium');

  // Weight log
  const [newWeight, setNewWeight] = useState('');

  const load = useCallback(async () => {
    const res = await api.get<HealthGoal | null>('/health-goals/latest');
    if (res.success && res.data) {
      setGoal(res.data);
      setWeight(String(res.data.weight));
      setTargetWeight(String(res.data.targetWeight));
      setHeight(String(res.data.height));
      setActivityLevel(res.data.activityLevel as any);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveGoal = async () => {
    setSaving(true);
    const res = await api.post<HealthGoal>('/health-goals', {
      weight: Number(weight),
      targetWeight: Number(targetWeight),
      height: Number(height),
      activityLevel,
    });
    setSaving(false);
    if (res.success && res.data) {
      setGoal(res.data);
      Alert.alert('✅ Objectif enregistré', `Cible : ${res.data.dailyCaloriesTarget} kcal / jour`);
    } else {
      Alert.alert('Erreur', res.message || 'Objectif non enregistré');
    }
  };

  const logWeight = async () => {
    const w = Number(newWeight);
    if (!w || w < 20 || w > 400) {
      Alert.alert('Erreur', 'Poids invalide');
      return;
    }
    const res = await api.post('/logs/weight', { weight: w });
    if (res.success) {
      setNewWeight('');
      Alert.alert('✅ Pesée enregistrée', `${w} kg enregistré`);
      load();
    } else {
      Alert.alert('Erreur', res.message || 'Enregistrement échoué');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const activityOptions: { value: 'low' | 'medium' | 'high'; label: string }[] = [
    { value: 'low', label: 'Sédentaire' },
    { value: 'medium', label: 'Modéré' },
    { value: 'high', label: 'Actif' },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ padding: Spacing.lg, backgroundColor: colors.background, flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
      }
    >
      <Text style={{ color: colors.textMuted, marginBottom: Spacing.lg }}>
        Suivi de ton objectif santé et de tes pesées.
      </Text>

      {/* Objectif actuel */}
      {goal && (
        <Card style={{ marginBottom: 16, backgroundColor: colors.primaryLight }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="flag-outline" size={20} color={colors.primary} />
            <Text style={{ fontWeight: '800', color: colors.primary, fontSize: FontSize.lg }}>
              Ton objectif
            </Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <Row label="Calories/jour" value={`${goal.dailyCaloriesTarget} kcal`} colors={colors} />
            <Row label="Hydratation" value={`${goal.dailyWaterTarget} ml`} colors={colors} />
            <Row label="Poids actuel" value={`${goal.weight} kg`} colors={colors} />
            <Row label="Poids cible" value={`${goal.targetWeight} kg`} colors={colors} />
            <Row label="Écart" value={`${(goal.weight - goal.targetWeight).toFixed(1)} kg`} colors={colors} highlight />
          </View>
        </Card>
      )}

      {/* Log rapide de pesée */}
      {goal && (
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 8 }}>
            ⚖️ Enregistrer ma pesée du jour
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={newWeight}
              onChangeText={setNewWeight}
              placeholder="Poids en kg"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              style={{
                flex: 1, backgroundColor: colors.surfaceVariant,
                color: colors.text, padding: 12, borderRadius: BorderRadius.md,
              }}
            />
            <TouchableOpacity
              onPress={logWeight}
              disabled={!newWeight}
              style={{
                backgroundColor: newWeight ? colors.primary : colors.surfaceVariant,
                paddingHorizontal: 20, borderRadius: BorderRadius.md, justifyContent: 'center',
              }}
            >
              <Ionicons name="checkmark" size={22} color={newWeight ? '#fff' : colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Formulaire de configuration */}
      <Card>
        <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 12, fontSize: FontSize.md }}>
          {goal ? 'Mettre à jour mes infos' : 'Configurer mon objectif'}
        </Text>

        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Poids actuel (kg)</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          style={{
            backgroundColor: colors.surfaceVariant, color: colors.text,
            padding: 14, borderRadius: BorderRadius.md, marginBottom: 10,
          }}
        />

        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Poids objectif (kg)</Text>
        <TextInput
          value={targetWeight}
          onChangeText={setTargetWeight}
          keyboardType="decimal-pad"
          style={{
            backgroundColor: colors.surfaceVariant, color: colors.text,
            padding: 14, borderRadius: BorderRadius.md, marginBottom: 10,
          }}
        />

        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>Taille (cm)</Text>
        <TextInput
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          style={{
            backgroundColor: colors.surfaceVariant, color: colors.text,
            padding: 14, borderRadius: BorderRadius.md, marginBottom: 12,
          }}
        />

        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>Niveau d'activité</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
          {activityOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setActivityLevel(opt.value)}
              style={{
                flex: 1, padding: 10, borderRadius: BorderRadius.md,
                backgroundColor: activityLevel === opt.value ? colors.primary : colors.surfaceVariant,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: activityLevel === opt.value ? '#fff' : colors.text,
                fontWeight: '600', fontSize: 13,
              }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={saveGoal}
          disabled={saving}
          style={{
            backgroundColor: colors.primary, padding: 14,
            borderRadius: BorderRadius.md, alignItems: 'center',
          }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: 'white', fontWeight: '700' }}>
              {goal ? 'Mettre à jour' : 'Calculer mon objectif'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 10, textAlign: 'center' }}>
          Calcul basé sur la formule de Mifflin-St Jeor
        </Text>
      </Card>
    </ScrollView>
  );
}

function Row({ label, value, colors, highlight }: any) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: colors.text }}>{label}</Text>
      <Text style={{
        color: highlight ? colors.primary : colors.text,
        fontWeight: highlight ? '800' : '600',
      }}>{value}</Text>
    </View>
  );
}
