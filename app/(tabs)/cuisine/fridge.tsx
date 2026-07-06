// SCREEN - Mode Frigo
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiresAt?: string;
}

interface RecipeMatch {
  recipe: {
    id: string;
    name: string;
    emoji: string;
    time: number;
    servings: number;
    difficulty: string;
    ingredients: any[];
    nutrition: any;
    tags: string[];
  };
  matchedIngredients: string[];
  missingIngredients: string[];
  matchScore: number;
}

// Suggestions rapides d'ingrédients courants
const QUICK_INGREDIENTS = [
  'Poulet', 'Bœuf', 'Poisson', 'Œufs', 'Tomates', 'Oignon',
  'Ail', 'Riz', 'Pâtes', 'Pommes de terre', 'Fromage', 'Yaourt',
];

export default function FridgeScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [suggestions, setSuggestions] = useState<RecipeMatch[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const [itemsRes, sugRes] = await Promise.all([
      api.get<FridgeItem[]>('/fridge/items'),
      api.get<{ matches: RecipeMatch[] }>('/fridge/suggestions?minMatch=0.15'),
    ]);
    if (itemsRes.success) setItems(itemsRes.data || []);
    if (sugRes.success) setSuggestions(sugRes.data?.matches || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addItem = async (name?: string) => {
    const finalName = (name || newItem).trim();
    if (!finalName || adding) return;
    setAdding(true);
    const res = await api.post('/fridge/items', { name: finalName, quantity: 1 });
    setAdding(false);
    if (res.success) {
      setNewItem('');
      load();
    } else {
      Alert.alert('Erreur', res.message || "Impossible d'ajouter");
    }
  };

  const removeItem = async (id: string) => {
    await api.delete(`/fridge/items/${id}`);
    load();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const fridgeItemNames = items.map((i) => i.name.toLowerCase());

  return (
    <ScrollView
      contentContainerStyle={{ padding: Spacing.lg, backgroundColor: colors.background, flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
      }
    >
      <Text style={{ color: colors.textMuted, marginBottom: 20 }}>
        Renseigne ce que tu as, on te propose des recettes.
      </Text>

      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
          Ajouter un ingrédient
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            value={newItem}
            onChangeText={setNewItem}
            placeholder="ex : Poulet, Riz, Tomates..."
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1, backgroundColor: colors.surfaceVariant,
              borderRadius: BorderRadius.md, paddingHorizontal: 14,
              paddingVertical: 12, color: colors.text,
            }}
            onSubmitEditing={() => addItem()}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={() => addItem()}
            disabled={adding || !newItem.trim()}
            style={{
              backgroundColor: newItem.trim() ? colors.primary : colors.surfaceVariant,
              paddingHorizontal: 20, borderRadius: BorderRadius.md, justifyContent: 'center',
            }}
          >
            {adding ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="add" size={24} color={newItem.trim() ? '#fff' : colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>

        {/* Suggestions rapides */}
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
          Ou clique pour ajouter rapidement :
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {QUICK_INGREDIENTS.filter((i) => !fridgeItemNames.includes(i.toLowerCase())).slice(0, 8).map((ingredient) => (
            <TouchableOpacity
              key={ingredient}
              onPress={() => addItem(ingredient)}
              style={{
                backgroundColor: colors.primaryLight,
                paddingHorizontal: 10, paddingVertical: 5,
                borderRadius: 14, borderWidth: 1, borderColor: colors.primary,
              }}
            >
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                + {ingredient}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {items.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
            Contenu ({items.length})
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onLongPress={() =>
                  Alert.alert('Supprimer ?', item.name, [
                    { text: 'Annuler' },
                    { text: 'Supprimer', style: 'destructive', onPress: () => removeItem(item.id) },
                  ])
                }
                onPress={() =>
                  Alert.alert('Supprimer ?', item.name, [
                    { text: 'Annuler' },
                    { text: 'Supprimer', style: 'destructive', onPress: () => removeItem(item.id) },
                  ])
                }
                style={{
                  backgroundColor: colors.surfaceVariant,
                  paddingHorizontal: 12, paddingVertical: 6,
                  borderRadius: 20, flexDirection: 'row',
                  alignItems: 'center', gap: 6,
                }}
              >
                <Text style={{ color: colors.text }}>{item.name}</Text>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 10 }}>
        {suggestions.length > 0 ? `Recettes suggérées (${suggestions.length})` : 'Recettes suggérées'}
      </Text>

      {suggestions.length === 0 ? (
        <Card>
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Ionicons name="restaurant-outline" size={40} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
              {items.length === 0
                ? 'Ajoute des ingrédients pour voir des suggestions.'
                : "Aucune recette trouvée. Essaie d'ajouter d'autres ingrédients courants (poulet, riz, œufs...)."}
            </Text>
          </View>
        </Card>
      ) : (
        suggestions.map((match) => {
          const pct = Math.round(match.matchScore * 100);
          const hasCount = match.matchedIngredients.length;
          const totalCount = match.matchedIngredients.length + match.missingIngredients.length;

          return (
            <Card key={match.recipe.id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginRight: 12 }}>{match.recipe.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                    {match.recipe.name}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                    ⏱ {match.recipe.time} min • {match.recipe.difficulty}
                  </Text>
                  <Text style={{ color: colors.primary, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                    ✓ Tu as {hasCount}/{totalCount} ingrédients
                  </Text>
                </View>
                <View style={{
                  backgroundColor: pct > 60 ? colors.success : pct > 30 ? colors.warning : colors.textMuted,
                  paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
                }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>{pct}%</Text>
                </View>
              </View>

              {match.matchedIngredients.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 11, color: colors.success, fontWeight: '600' }}>
                    ✅ Que tu as : {match.matchedIngredients.join(', ')}
                  </Text>
                </View>
              )}

              {match.missingIngredients.length > 0 && (
                <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    À acheter : {match.missingIngredients.join(', ')}
                  </Text>
                </View>
              )}
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}
