// ==========================================
// SCREEN - Recipes Tab
// ==========================================
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLanguage, useMealPlan } from '@/hooks/useAppContexts';
import { Recipe } from '@/types';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

export default function RecipesScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { recipes } = useMealPlan();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <Card
      onPress={() => router.push(`/recipe/${item.id}`)}
      style={{ marginBottom: 12 }}
      accessibilityLabel={`Recette ${item.name}, ${item.time} minutes, ${item.nutrition.calories} calories, ${item.servings} personnes`}
      accessibilityHint="Ouvre les détails de la recette"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.time} min</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="flame-outline" size={12} color={colors.textMuted} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.nutrition.calories} kcal</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="people-outline" size={12} color={colors.textMuted} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.servings}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: Spacing.lg, paddingBottom: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
          <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text }}>
            {t.tabs.recipes}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              onPress={() => router.push('/my-recipes')}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: colors.surfaceVariant,
                paddingHorizontal: 12, paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Ionicons name="restaurant" size={16} color={colors.primary} />
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>
                Mes recettes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/favorites')}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: colors.surfaceVariant,
                paddingHorizontal: 12, paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Ionicons name="heart" size={16} color="#FF6B6B" />
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>
                Favoris
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.md,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: Spacing.md,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher une recette..."
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingLeft: 10,
              fontSize: FontSize.md,
              color: colors.text,
            }}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.lg, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: Spacing.xl }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Text style={{ color: colors.textMuted, fontSize: FontSize.md }}>
              Aucune recette trouvée
            </Text>
          </View>
        }
      />
    </View>
  );
}
