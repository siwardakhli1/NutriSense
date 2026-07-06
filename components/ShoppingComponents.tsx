// ==========================================
// COMPONENT - ShoppingItem
// ==========================================
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { ShoppingItem as ShoppingItemType } from '@/types';
import { BorderRadius, Spacing } from '@/constants/Colors';

interface ShoppingItemProps {
  item: ShoppingItemType;
  onToggle: () => void;
}

export function ShoppingItem({ item, onToggle }: ShoppingItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        borderRadius: BorderRadius.md,
        backgroundColor: item.checked ? colors.primaryLight : colors.surfaceVariant,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: item.checked ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          borderWidth: item.checked ? 0 : 2,
          borderColor: colors.border,
          backgroundColor: item.checked ? colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: '500',
          color: item.checked ? colors.textMuted : colors.text,
          textDecorationLine: item.checked ? 'line-through' : 'none',
        }}
      >
        {item.quantity} {item.unit} — {item.name}
      </Text>
    </TouchableOpacity>
  );
}

// ========== CATEGORY HEADER ==========
interface CategoryHeaderProps {
  icon: string;
  title: string;
  checkedCount: number;
  totalCount: number;
  color: string;
}

export function CategoryHeader({ icon, title, checkedCount, totalCount, color }: CategoryHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingLeft: 4 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: color + '33',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>
        {checkedCount}/{totalCount}
      </Text>
    </View>
  );
}
