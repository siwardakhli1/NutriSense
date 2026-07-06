// ==========================================
// SCREEN - Recipe Detail [id]
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLanguage, useMealPlan } from '@/hooks/useAppContexts';
import { RecipeImage } from '@/components/RecipeImage';
import { useShare } from '@/hooks/useShare';
import { useVibration } from '@/hooks/useNativeAPIs';
import { ErrorDisplay } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { getRecipeById } = useMealPlan();
  const { shareRecipe } = useShare();
  const { vibrate } = useVibration();
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const recipe = getRecipeById(id);

  // Charger le statut favori depuis le backend
  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await api.get<any[]>('/recipes/favorites/list');
      if (res.success && res.data) {
        setLiked(res.data.some((r: any) => r.id === id));
      }
    })();
  }, [id]);

  if (!recipe) {
    return <ErrorDisplay message="Recette introuvable" onRetry={() => router.back()} retryLabel={t.common.back} />;
  }

  const handleLike = async () => {
    vibrate(30);
    const newState = !liked;
    setLiked(newState); // update UI immédiat

    if (newState) {
      await api.post(`/recipes/${id}/favorite`);
    } else {
      await api.delete(`/recipes/${id}/favorite`);
    }
  };

  const macros = [
    { label: t.recipe.protein, value: recipe.nutrition.protein, unit: 'g', color: '#FF8A80', max: 60 },
    { label: t.recipe.carbs, value: recipe.nutrition.carbs, unit: 'g', color: '#FFD93D', max: 80 },
    { label: t.recipe.fat, value: recipe.nutrition.fat, unit: 'g', color: '#6EC6FF', max: 40 },
    { label: t.recipe.fiber, value: recipe.nutrition.fiber, unit: 'g', color: '#A8E6CF', max: 20 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Nav bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surfaceVariant, borderRadius: 12, padding: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: colors.text }}>
          {t.recipe.title}
        </Text>
        <TouchableOpacity onPress={handleLike} style={{ padding: 8 }}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? '#FF6B6B' : colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => shareRecipe(recipe)} style={{ padding: 8 }}>
          <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingTop: 0 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View
          style={{
            backgroundColor: colors.primaryLight,
            borderRadius: BorderRadius.xl,
            padding: 28,
            alignItems: 'center',
            marginBottom: Spacing.lg,
          }}
        >
          <RecipeImage name={recipe.name} fallbackEmoji={recipe.emoji} style={{ fontSize: 64, marginBottom: 10 }} />
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 14,
              lineHeight: 28,
            }}
          >
            {recipe.name}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {[
              { icon: 'time-outline', text: `${recipe.time} min` },
              { icon: 'people-outline', text: `${recipe.servings} ${t.recipe.servings}` },
              { icon: 'flame-outline', text: `${recipe.nutrition.calories} kcal` },
              { icon: 'stats-chart-outline', text: recipe.difficulty === 'facile' ? t.recipe.easy : recipe.difficulty === 'moyen' ? t.recipe.medium : t.recipe.hard },
            ].map((tag, i) => (
              <View
                key={i}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 50,
                  backgroundColor: colors.surfaceVariant,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Ionicons name={tag.icon as any} size={12} color={colors.textSecondary} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
                  {tag.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Macros */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: Spacing.lg }}>
          {macros.map((m) => (
            <View
              key={m.label}
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 14,
                borderRadius: BorderRadius.lg,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ width: 44, height: 44, marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    borderWidth: 4,
                    borderColor: m.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>
                    {m.value}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>
                {m.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Ingredients */}
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 14 }}>
          {t.recipe.ingredients}
        </Text>
        <View style={{ gap: 8, marginBottom: Spacing.lg }}>
          {recipe.ingredients.map((ing) => (
            <View
              key={ing.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                borderRadius: BorderRadius.md,
                backgroundColor: colors.surfaceVariant,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>{ing.name}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
                {ing.quantity} {ing.unit}
              </Text>
            </View>
          ))}
        </View>

        {/* Steps */}
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 14 }}>
          {t.recipe.preparation}
        </Text>
        <View style={{ gap: 14, marginBottom: Spacing.xl }}>
          {recipe.steps.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: colors.textSecondary, paddingTop: 5 }}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
