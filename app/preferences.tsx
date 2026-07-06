// SCREEN - Mes préférences (modifier objectif, budget, régimes, portions)
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useTheme, useMealPlan } from '@/hooks/useAppContexts';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

const GOALS = [
  { id: 'healthy', label: 'Healthy', icon: 'leaf-outline', desc: 'Équilibré' },
  { id: 'fast', label: 'Rapide', icon: 'flash-outline', desc: 'Repas < 20 min' },
  { id: 'budget', label: 'Budget', icon: 'wallet-outline', desc: 'Économique' },
  { id: 'muscle', label: 'Muscle', icon: 'barbell-outline', desc: 'Prise de masse' },
];

const DIETARY_OPTIONS = [
  { id: 'vegan', label: 'Vegan', icon: 'leaf-outline' },
  { id: 'vegetarian', label: 'Végétarien', icon: 'nutrition-outline' },
  { id: 'halal', label: 'Halal', icon: 'moon-outline' },
  { id: 'keto', label: 'Keto', icon: 'flame-outline' },
  { id: 'sans_gluten', label: 'Sans gluten', icon: 'ban-outline' },
  { id: 'sans_lactose', label: 'Sans lactose', icon: 'water-outline' },
];

const SERVINGS_OPTIONS = [1, 2, 3, 4, 6];

interface Preferences {
  budget: number;
  goal: string;
  dietary: string[];
  servings: number;
  locale?: string;
  theme?: string;
  notificationsEnabled?: boolean;
}

export default function PreferencesScreen() {
  const { colors } = useTheme();
  const { refreshPlan } = useMealPlan();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const [goal, setGoal] = useState('healthy');
  const [budget, setBudget] = useState(60);
  const [dietary, setDietary] = useState<string[]>([]);
  const [servings, setServings] = useState(2);

  useEffect(() => {
    (async () => {
      const res = await api.get<Preferences>('/preferences');
      if (res.success && res.data) {
        setGoal(res.data.goal || 'healthy');
        setBudget(res.data.budget || 60);
        setDietary(res.data.dietary || []);
        setServings(res.data.servings || 2);
      }
      setLoading(false);
    })();
  }, []);

  const toggleDietary = (id: string) => {
    setDietary((current) =>
      current.includes(id) ? current.filter((d) => d !== id) : [...current, id]
    );
  };

  const save = async (): Promise<boolean> => {
    setSaving(true);
    const res = await api.put('/preferences', { goal, budget, dietary, servings });
    setSaving(false);
    if (!res.success) {
      Alert.alert('Erreur', res.message || 'Impossible de sauvegarder');
      return false;
    }
    return true;
  };

  const saveOnly = async () => {
    const ok = await save();
    if (ok) {
      Alert.alert('✅ Enregistré', 'Tes préférences sont à jour', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const saveAndRegenerate = async () => {
    const ok = await save();
    if (!ok) return;

    setRegenerating(true);
    const res = await api.post('/meals/generate', { goal, budget, dietary, servings });

    if (res.success) {
      // Forcer le rechargement du contexte pour que le tab Plan voit le nouveau plan
      await refreshPlan();
      setRegenerating(false);
      Alert.alert('✅ Plan régénéré', 'Ton nouveau plan est prêt !', [
        { text: 'Voir mon plan', onPress: () => router.replace('/(tabs)') },
      ]);
    } else {
      setRegenerating(false);
      Alert.alert('Erreur', res.message || 'Impossible de régénérer le plan');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mes préférences',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>

          {/* Objectif */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Ionicons name="flag-outline" size={18} color={colors.text} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
              Mon objectif
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {GOALS.map((g) => {
              const isSelected = goal === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setGoal(g.id)}
                  style={{
                    flex: 1, minWidth: '47%',
                    padding: 14,
                    borderRadius: BorderRadius.md,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name={g.icon as any} size={26} color={isSelected ? '#fff' : colors.primary} />
                  <Text style={{
                    fontWeight: '700', marginTop: 4,
                    color: isSelected ? '#fff' : colors.text,
                  }}>{g.label}</Text>
                  <Text style={{
                    fontSize: 11, marginTop: 2,
                    color: isSelected ? 'rgba(255,255,255,0.85)' : colors.textMuted,
                  }}>{g.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Budget */}
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 10 }}>
            💰 Budget hebdomadaire
          </Text>
          <Card style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setBudget((b) => Math.max(10, b - 10))}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: colors.surfaceVariant,
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Ionicons name="remove" size={22} color={colors.text} />
              </TouchableOpacity>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: colors.primary }}>
                  {budget} €
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>par semaine</Text>
              </View>

              <TouchableOpacity
                onPress={() => setBudget((b) => Math.min(500, b + 10))}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: colors.surfaceVariant,
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Ionicons name="add" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Presets */}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, justifyContent: 'center' }}>
              {[30, 50, 80, 120].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => setBudget(preset)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor: budget === preset ? colors.primary : colors.surfaceVariant,
                  }}
                >
                  <Text style={{
                    fontSize: 12, fontWeight: '600',
                    color: budget === preset ? '#fff' : colors.text,
                  }}>{preset}€</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Régimes alimentaires */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Ionicons name="leaf-outline" size={18} color={colors.text} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
              Régimes alimentaires
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>
            Sélectionne ceux qui te concernent (plusieurs possibles)
          </Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {DIETARY_OPTIONS.map((d) => {
              const isSelected = dietary.includes(d.id);
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => toggleDietary(d.id)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    padding: 14, borderRadius: BorderRadius.md,
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                >
                  <Ionicons name={d.icon as any} size={22} color={isSelected ? '#fff' : colors.primary} style={{ marginRight: 12 }} />
                  <Text style={{
                    flex: 1, fontWeight: '600', fontSize: 15,
                    color: isSelected ? colors.primary : colors.text,
                  }}>{d.label}</Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Portions */}
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
            👥 Nombre de portions
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>
            Nombre de personnes à chaque repas
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 30 }}>
            {SERVINGS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setServings(s)}
                style={{
                  flex: 1, padding: 14, borderRadius: BorderRadius.md,
                  alignItems: 'center',
                  backgroundColor: servings === s ? colors.primary : colors.surface,
                  borderWidth: 2,
                  borderColor: servings === s ? colors.primary : colors.border,
                }}
              >
                <Text style={{
                  fontSize: 18, fontWeight: '800',
                  color: servings === s ? '#fff' : colors.text,
                }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Boutons d'action */}
          <TouchableOpacity
            onPress={saveAndRegenerate}
            disabled={saving || regenerating}
            style={{
              backgroundColor: colors.primary,
              padding: 16, borderRadius: BorderRadius.md,
              alignItems: 'center', marginBottom: 10,
              flexDirection: 'row', justifyContent: 'center', gap: 8,
            }}
          >
            {(saving || regenerating) ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                  Régénérer mon plan
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={saveOnly}
            disabled={saving || regenerating}
            style={{
              backgroundColor: colors.surface,
              padding: 16, borderRadius: BorderRadius.md,
              alignItems: 'center',
              borderWidth: 1, borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
              Enregistrer sans régénérer
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}
