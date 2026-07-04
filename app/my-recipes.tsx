// ==========================================
// SCREEN - Mes recettes personnelles
// ==========================================
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';
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
  isCustom?: boolean;
}

export default function MyRecipesScreen() {
  const { colors } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<Recipe[]>('/recipes/mine');
    if (res.success) setRecipes(res.data || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteRecipe = (id: string, name: string) => {
    Alert.alert(
      'Supprimer ?',
      `Supprimer la recette "${name}" ?`,
      [
        { text: 'Annuler' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            await api.delete(`/recipes/mine/${id}`);
            load();
          },
        },
      ]
    );
  };

  const exportRecipes = async () => {
    if (recipes.length === 0) {
      Alert.alert('Info', 'Aucune recette à exporter');
      return;
    }
    // On appelle l'endpoint d'export et on partage le JSON
    const res = await api.get<any>('/recipes/mine/export');
    if (!res.success || !res.data) {
      Alert.alert('Erreur', "Impossible d'exporter");
      return;
    }
    const json = JSON.stringify(res.data, null, 2);
    try {
      await Share.share({
        message: json,
        title: 'Export mes recettes NutriSense',
      });
    } catch {}
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
          title: 'Mes recettes 👨‍🍳',
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
          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.push('/edit-recipe')}
              style={{
                flex: 2, backgroundColor: colors.primary,
                padding: 14, borderRadius: BorderRadius.md,
                alignItems: 'center', flexDirection: 'row',
                justifyContent: 'center', gap: 6,
              }}
            >
              <Ionicons name="add" size={22} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                Nouvelle recette
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={exportRecipes}
              style={{
                flex: 1, backgroundColor: colors.surface,
                padding: 14, borderRadius: BorderRadius.md,
                alignItems: 'center', flexDirection: 'row',
                justifyContent: 'center', gap: 6,
                borderWidth: 1, borderColor: colors.border,
              }}
            >
              <Ionicons name="download-outline" size={20} color={colors.text} />
              <Text style={{ color: colors.text, fontWeight: '700' }}>Export</Text>
            </TouchableOpacity>
          </View>

          {recipes.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="restaurant-outline" size={60} color={colors.textMuted} />
              <Text style={{ color: colors.text, fontWeight: '700', marginTop: 12, fontSize: 16 }}>
                Aucune recette personnelle
              </Text>
              <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
                Ajoute tes recettes de famille, elles apparaîtront aussi dans tes plans repas.
              </Text>
            </View>
          ) : (
            recipes.map((recipe) => (
              <Card key={recipe.id} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={() => router.push(`/recipe/${recipe.id}`)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 40, marginRight: 14 }}>{recipe.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                      {recipe.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      ⏱ {recipe.time} min · 👥 {recipe.servings} pers · 🔥 {recipe.nutrition?.calories || 0} kcal
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
                    onPress={() => router.push({ pathname: '/edit-recipe', params: { id: recipe.id } })}
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center',
                      justifyContent: 'center', gap: 4, padding: 6,
                    }}
                  >
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>
                      Modifier
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteRecipe(recipe.id, recipe.name)}
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center',
                      justifyContent: 'center', gap: 4, padding: 6,
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={{ color: colors.error, fontWeight: '600', fontSize: 12 }}>
                      Supprimer
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
