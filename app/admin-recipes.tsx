// ==========================================
// SCREEN - Admin : Gérer les recettes
// Liste toutes les recettes, recherche, suppression (avec confirmation).
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';
import { api } from '@/services/api';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

interface AdminRecipe {
  id: string;
  name: string;
  emoji: string | null;
  timeMinutes: number | null;
  nutrition: any;
  tags: string[];
}

export default function AdminRecipesScreen() {
  const { colors } = useTheme();
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRecipes = async () => {
    const res = await api.get<{ recipes: AdminRecipe[] }>('/admin/recipes');
    if (res.success && res.data) {
      setRecipes(res.data.recipes);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleDelete = (recipe: AdminRecipe) => {
    Alert.alert(
      'Supprimer la recette',
      `Es-tu sûr(e) de vouloir supprimer "${recipe.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(recipe.id);
            const res = await api.delete(`/admin/recipes/${recipe.id}`);
            if (res.success) {
              setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
            } else {
              Alert.alert('Erreur', res.message || 'Impossible de supprimer');
            }
            setDeletingId(null);
          },
        },
      ]
    );
  };

  // Filtrer par recherche
  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (tags: string[]): any => {
    if (tags.includes('boisson')) return 'cafe-outline';
    if (tags.includes('fruit')) return 'nutrition-outline';
    if (tags.includes('dessert')) return 'ice-cream-outline';
    return 'restaurant-outline';
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Gérer les recettes',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <View style={{ padding: Spacing.lg, paddingBottom: 0 }}>
          {/* Recherche */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
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

          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>
            {filtered.length} recette{filtered.length > 1 ? 's' : ''}
          </Text>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingTop: 0 }}>
            {filtered.map((recipe) => {
              const isPremium = (recipe.tags || []).includes('premium');
              const isDeleting = deletingId === recipe.id;
              return (
                <View
                  key={recipe.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 8,
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: colors.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={getIcon(recipe.tags || [])} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                        {recipe.name}
                      </Text>
                      {isPremium && (
                        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 }}>
                          <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>PREMIUM</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {recipe.nutrition?.calories || 0} kcal
                      {recipe.timeMinutes ? ` · ${recipe.timeMinutes} min` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(recipe)}
                    disabled={isDeleting}
                    accessibilityRole="button"
                    accessibilityLabel={`Supprimer ${recipe.name}`}
                    style={{ padding: 6 }}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color={colors.textMuted} />
                    ) : (
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}

            {filtered.length === 0 && (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Ionicons name="search-outline" size={40} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: 10 }}>Aucune recette trouvée</Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
