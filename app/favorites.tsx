// SCREEN - Mes recettes favorites
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';
import { useShare } from '@/hooks/useShare';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

interface Recipe {
  id: string;
  name: string;
  emoji: string;
  time: number;
  servings: number;
  difficulty: string;
  ingredients: any[];
  steps: string[];
  nutrition: any;
  tags: string[];
}

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const { shareRecipe } = useShare();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<Recipe[]>('/recipes/favorites/list');
    if (res.success) setFavorites(res.data || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeFav = async (recipeId: string) => {
    setFavorites((f) => f.filter((r) => r.id !== recipeId));
    await api.delete(`/recipes/${recipeId}/favorite`);
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
          title: 'Mes recettes favorites',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={{ padding: Spacing.lg, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        >
          {favorites.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="heart-outline" size={60} color={colors.textMuted} />
              <Text style={{ color: colors.text, fontWeight: '700', marginTop: 12, fontSize: 16 }}>
                Aucun favori pour l'instant
              </Text>
              <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
                Tap sur le cœur d'une recette pour l'ajouter à tes favoris.
              </Text>
            </View>
          ) : (
            favorites.map((recipe) => (
              <Card key={recipe.id} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={() => router.push(`/recipe/${recipe.id}`)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                      {recipe.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {recipe.time} min · {recipe.servings} pers · {recipe.nutrition?.calories || 0} kcal
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {(recipe.tags || []).slice(0, 3).map((tag) => (
                        <View key={tag} style={{
                          backgroundColor: colors.surfaceVariant,
                          paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
                        }}>
                          <Text style={{ fontSize: 10, color: colors.textMuted }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={{
                  flexDirection: 'row', gap: 8, marginTop: 10,
                  paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
                }}>
                  <TouchableOpacity
                    onPress={() => shareRecipe(recipe as any)}
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center',
                      justifyContent: 'center', gap: 4, padding: 6,
                    }}
                  >
                    <Ionicons name="share-outline" size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>
                      Partager
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeFav(recipe.id)}
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center',
                      justifyContent: 'center', gap: 4, padding: 6,
                    }}
                  >
                    <Ionicons name="heart-dislike-outline" size={16} color={colors.error} />
                    <Text style={{ color: colors.error, fontWeight: '600', fontSize: 12 }}>
                      Retirer
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
