// SCREEN - Mes préférences (modifier objectif, régimes, portions)
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

  // Valeurs initiales (pour détecter ce qui a réellement changé)
  const initialRef = React.useRef({ goal: 'healthy', budget: 60, dietary: [] as string[], servings: 2 });

  useEffect(() => {
    (async () => {
      const res = await api.get<Preferences>('/preferences');
      if (res.success && res.data) {
        setGoal(res.data.goal || 'healthy');
        setBudget(res.data.budget || 60);
        setDietary(res.data.dietary || []);
        setServings(res.data.servings || 2);
        initialRef.current = {
          goal: res.data.goal || 'healthy',
          budget: res.data.budget || 60,
          dietary: res.data.dietary || [],
          servings: res.data.servings || 2,
        };
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

    // Détecter si SEUL le nombre de personnes a changé.
    const init = initialRef.current;
    const dietarySame =
      init.dietary.length === dietary.length &&
      init.dietary.every((d) => dietary.includes(d));
    const onlyServingsChanged =
      init.goal === goal &&
      init.budget === budget &&
      dietarySame &&
      init.servings !== servings;

    setRegenerating(true);

    // Si seul le nombre de personnes change → ré-échelonner SANS changer les recettes.
    // Sinon (régime/objectif changé) → régénérer de nouvelles recettes.
    const endpoint = onlyServingsChanged ? '/meals/rescale' : '/meals/regenerate-from-today';
    const res = await api.post(endpoint, onlyServingsChanged ? { servings } : { goal, budget, dietary, servings });

    if (res.success) {
      // Mettre à jour la référence pour les prochains changements
      initialRef.current = { goal, budget, dietary: [...dietary], servings };
      // Forcer le rechargement du contexte pour que le tab Plan voie le nouveau plan
      await refreshPlan();
      setRegenerating(false);
      Alert.alert(
        '✅ Plan mis à jour',
        onlyServingsChanged
          ? 'Les quantités et le budget ont été adaptés au nombre de personnes.'
          : 'Les jours passés sont conservés, le reste de la semaine a été régénéré !',
        [{ text: 'Voir mon plan', onPress: () => router.replace('/(tabs)') }]
      );
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
