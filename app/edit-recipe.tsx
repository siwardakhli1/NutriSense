// SCREEN - Créer / modifier une recette perso
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';
import { computeNutritionFromIngredients } from '@/utils/nutrition';

const AVAILABLE_TAGS = [
  { id: 'breakfast', label: 'Petit-déj' },
  { id: 'lunch', label: 'Déjeuner' },
  { id: 'dinner', label: 'Dîner' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Végé' },
  { id: 'halal', label: 'Halal' },
  { id: 'keto', label: 'Keto' },
  { id: 'sans_gluten', label: 'Sans gluten' },
  { id: 'sans_lactose', label: 'Sans lactose' },
  { id: 'healthy', label: 'Healthy' },
  { id: 'fast', label: 'Rapide' },
  { id: 'budget', label: 'Budget' },
  { id: 'muscle', label: 'Muscle' },
];

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export default function EditRecipeScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!params.id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('20');
  const [servings, setServings] = useState('2');
  const [difficulty, setDifficulty] = useState('facile');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: '', unit: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const res = await api.get<any>(`/recipes/${params.id}`);
      if (res.success && res.data) {
        setName(res.data.name);
        setTimeMinutes(String(res.data.time || 20));
        setServings(String(res.data.servings || 2));
        setDifficulty(res.data.difficulty || 'facile');
        setIngredients(res.data.ingredients || [{ name: '', quantity: '', unit: '' }]);
        setSteps(res.data.steps || ['']);
        setTags(res.data.tags || []);
        setCalories(String(res.data.nutrition?.calories || ''));
        setProtein(String(res.data.nutrition?.protein || ''));
        setCarbs(String(res.data.nutrition?.carbs || ''));
        setFat(String(res.data.nutrition?.fat || ''));
      }
      setLoading(false);
    })();
  }, [params.id, isEdit]);

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));

  // Calcule automatiquement les valeurs nutritionnelles à partir des ingrédients.
  const handleAutoNutrition = () => {
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Aucun ingrédient', "Ajoute d'abord des ingrédients pour estimer la nutrition.");
      return;
    }
    const { nutrition, matched, total } = computeNutritionFromIngredients(
      validIngredients,
      Number(servings) || 1
    );
    setCalories(String(nutrition.calories));
    setProtein(String(nutrition.protein));
    setCarbs(String(nutrition.carbs));
    setFat(String(nutrition.fat));

    if (matched === 0) {
      Alert.alert(
        'Estimation impossible',
        "Aucun ingrédient n'a été reconnu dans la base nutritionnelle. Tu peux saisir les valeurs manuellement."
      );
    } else if (matched < total) {
      Alert.alert(
        'Estimation partielle',
        `${matched} ingrédient(s) sur ${total} reconnu(s). Les valeurs sont une estimation, ajuste-les si besoin.`
      );
    } else {
      Alert.alert('Estimation calculée', 'Les valeurs ont été estimées à partir des ingrédients. Tu peux les ajuster.');
    }
  };

  const updateIngredient = (i: number, field: keyof Ingredient, val: string) => {
    const updated = [...ingredients];
    updated[i] = { ...updated[i], [field]: val };
    setIngredients(updated);
  };

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, val: string) => {
    const updated = [...steps];
    updated[i] = val;
    setSteps(updated);
  };

  const toggleTag = (tagId: string) => {
    setTags(tags.includes(tagId) ? tags.filter(t => t !== tagId) : [...tags, tagId]);
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom de la recette est requis');
      return;
    }
    const validIngredients = ingredients.filter(i => i.name.trim());
    const validSteps = steps.filter(s => s.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Erreur', 'Ajoute au moins un ingrédient');
      return;
    }
    if (validSteps.length === 0) {
      Alert.alert('Erreur', 'Ajoute au moins une étape');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      timeMinutes: Number(timeMinutes) || 20,
      servings: Number(servings) || 2,
      difficulty,
      ingredients: validIngredients.map((i, idx) => ({
        id: `ing_${idx}`,
        name: i.name.trim(),
        quantity: i.quantity.trim() || '1',
        unit: i.unit.trim() || 'unité',
        category: 'autres',
      })),
      steps: validSteps.map(s => s.trim()),
      nutrition: {
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: 0,
      },
      tags,
    };

    const res = isEdit
      ? await api.put(`/recipes/mine/${params.id}`, payload)
      : await api.post('/recipes/mine', payload);
    setSaving(false);

    if (res.success) {
      Alert.alert('OK', isEdit ? 'Recette modifiée' : 'Recette créée', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Erreur', res.message || 'Impossible de sauvegarder');
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
          title: isEdit ? 'Modifier la recette' : 'Nouvelle recette',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
          <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>

            {/* Nom */}
            <Card style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>Nom de la recette *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Tajine de ma grand-mère"
                placeholderTextColor={colors.textMuted}
                style={fieldStyle(colors)}
              />
            </Card>

            {/* Temps + portions + difficulté */}
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>Temps (min)</Text>
                  <TextInput
                    value={timeMinutes}
                    onChangeText={setTimeMinutes}
                    keyboardType="numeric"
                    style={fieldStyle(colors)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>Portions</Text>
                  <TextInput
                    value={servings}
                    onChangeText={setServings}
                    keyboardType="numeric"
                    style={fieldStyle(colors)}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6, marginTop: 10 }}>Difficulté</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {['facile', 'moyen', 'difficile'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDifficulty(d)}
                    style={{
                      flex: 1, padding: 10, borderRadius: BorderRadius.md,
                      backgroundColor: difficulty === d ? colors.primary : colors.surfaceVariant,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: difficulty === d ? '#fff' : colors.text, fontWeight: '600', fontSize: 12 }}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Ingrédients */}
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 }}>
                  Ingrédients *
                </Text>
                <TouchableOpacity onPress={addIngredient}>
                  <Ionicons name="add-circle" size={26} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {ingredients.map((ing, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
                  <TextInput
                    value={ing.quantity}
                    onChangeText={(v) => updateIngredient(i, 'quantity', v)}
                    placeholder="200"
                    placeholderTextColor={colors.textMuted}
                    style={{ ...fieldStyle(colors), width: 60 }}
                  />
                  <TextInput
                    value={ing.unit}
                    onChangeText={(v) => updateIngredient(i, 'unit', v)}
                    placeholder="g"
                    placeholderTextColor={colors.textMuted}
                    style={{ ...fieldStyle(colors), width: 60 }}
                  />
                  <TextInput
                    value={ing.name}
                    onChangeText={(v) => updateIngredient(i, 'name', v)}
                    placeholder="Poulet"
                    placeholderTextColor={colors.textMuted}
                    style={{ ...fieldStyle(colors), flex: 1 }}
                  />
                  <TouchableOpacity onPress={() => removeIngredient(i)} style={{ padding: 8 }}>
                    <Ionicons name="close" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </Card>

            {/* Étapes */}
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 }}>
                  Étapes de préparation *
                </Text>
                <TouchableOpacity onPress={addStep}>
                  <Ionicons name="add-circle" size={26} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {steps.map((step, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 8, alignItems: 'flex-start' }}>
                  <View style={{
                    width: 26, height: 26, borderRadius: 13,
                    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
                    marginTop: 8,
                  }}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
                  </View>
                  <TextInput
                    value={step}
                    onChangeText={(v) => updateStep(i, v)}
                    placeholder="Cuire le riz 12 min..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    style={{ ...fieldStyle(colors), flex: 1, minHeight: 60, textAlignVertical: 'top' }}
                  />
                  <TouchableOpacity onPress={() => removeStep(i)} style={{ padding: 8 }}>
                    <Ionicons name="close" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </Card>

            {/* Nutrition */}
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                  Nutrition (par portion)
                </Text>
                <TouchableOpacity
                  onPress={handleAutoNutrition}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    backgroundColor: colors.primary,
                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
                  }}
                >
                  <Ionicons name="calculator-outline" size={14} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Calculer</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>Cal.</Text>
                  <TextInput value={calories} onChangeText={setCalories} placeholder="450" placeholderTextColor={colors.textMuted} keyboardType="numeric" style={fieldStyle(colors)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>Prot.</Text>
                  <TextInput value={protein} onChangeText={setProtein} placeholder="25" placeholderTextColor={colors.textMuted} keyboardType="numeric" style={fieldStyle(colors)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>Glu.</Text>
                  <TextInput value={carbs} onChangeText={setCarbs} placeholder="60" placeholderTextColor={colors.textMuted} keyboardType="numeric" style={fieldStyle(colors)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>Lip.</Text>
                  <TextInput value={fat} onChangeText={setFat} placeholder="15" placeholderTextColor={colors.textMuted} keyboardType="numeric" style={fieldStyle(colors)} />
                </View>
              </View>
            </Card>

            {/* Tags */}
            <Card style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
                Tags (pour le plan repas)
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = tags.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() => toggleTag(tag.id)}
                      style={{
                        paddingHorizontal: 10, paddingVertical: 6,
                        borderRadius: 14,
                        backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                      }}
                    >
                      <Text style={{
                        color: isSelected ? '#fff' : colors.text,
                        fontSize: 12, fontWeight: '600',
                      }}>{tag.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Save button */}
            <TouchableOpacity
              onPress={save}
              disabled={saving}
              style={{
                backgroundColor: colors.primary,
                padding: 16, borderRadius: BorderRadius.md,
                alignItems: 'center',
              }}
            >
              {saving ? <ActivityIndicator color="#fff" /> : (
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                  {isEdit ? 'Enregistrer les modifs' : 'Créer la recette'}
                </Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const fieldStyle = (colors: any) => ({
  backgroundColor: colors.surfaceVariant,
  borderRadius: BorderRadius.md,
  paddingHorizontal: 14, paddingVertical: 10,
  color: colors.text, fontSize: 14,
});
