// ==========================================
// SCREEN - Shopping Tab
// ==========================================
import React from 'react';
import { View, Text, SectionList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLanguage, useMealPlan } from '@/hooks/useAppContexts';
import { useShare } from '@/hooks/useShare';
import { useVibration } from '@/hooks/useNativeAPIs';
import { ShoppingItem, CategoryHeader } from '@/components/ShoppingComponents';
import { IngredientCategory, ShoppingItem as ShoppingItemType } from '@/types';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

const CATEGORY_META: Record<IngredientCategory, { icon: string; color: string }> = {
  fruits_legumes: { icon: 'nutrition-outline', color: '#A8E6CF' },
  feculents: { icon: 'restaurant-outline', color: '#FFD93D' },
  proteines: { icon: 'fish-outline', color: '#FF8A80' },
  epicerie: { icon: 'cube-outline', color: '#6EC6FF' },
  produits_laitiers: { icon: 'water-outline', color: '#DDA0DD' },
  autres: { icon: 'basket-outline', color: '#C0C0C0' },
};

export default function ShoppingScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { shoppingList, toggleShoppingItem, preferences } = useMealPlan();
  const { shareShoppingList } = useShare();
  const { vibrate } = useVibration();

  const items = shoppingList?.items ?? [];
  const totalItems = items.length;
  const checkedCount = items.filter((i) => i.checked).length;

  // Grouper par catégorie
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<IngredientCategory, ShoppingItemType[]>);

  const sections = Object.entries(grouped).map(([cat, items]) => ({
    category: cat as IngredientCategory,
    data: items,
  }));

  const handleToggle = (itemId: string) => {
    vibrate(20);
    toggleShoppingItem(itemId);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: Spacing.lg, paddingBottom: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
          <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text }}>
            {t.shopping.title}
          </Text>
          <TouchableOpacity
            onPress={() => shoppingList && shareShoppingList(shoppingList)}
            style={{ backgroundColor: colors.surfaceVariant, borderRadius: 12, padding: 10 }}
          >
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: BorderRadius.lg,
            padding: 18,
            marginBottom: Spacing.md,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
              {checkedCount} / {totalItems} {t.shopping.articles}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              ~{preferences.budget}€ {t.shopping.estimated}
            </Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <View
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.8)',
                width: totalItems > 0 ? `${(checkedCount / totalItems) * 100}%` : '0%',
              }}
            />
          </View>
        </View>
      </View>

      {/* List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: Spacing.lg }}>
            <ShoppingItem item={item} onToggle={() => handleToggle(item.id)} />
            <View style={{ height: 6 }} />
          </View>
        )}
        renderSectionHeader={({ section }) => {
          const meta = CATEGORY_META[section.category];
          const catItems = section.data;
          const catChecked = catItems.filter((i) => i.checked).length;
          const catTitle = t.shopping.categories[section.category] ?? section.category;

          return (
            <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, backgroundColor: colors.background }}>
              <CategoryHeader
                icon={meta.icon}
                title={catTitle}
                checkedCount={catChecked}
                totalCount={catItems.length}
                color={meta.color}
              />
            </View>
          );
        }}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
