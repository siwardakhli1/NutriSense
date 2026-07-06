// ==========================================
// RECIPE ICON - Illustrations flat colorées (Twemoji style)
// Rendu : petit carré arrondi coloré + illustration flat
// ==========================================
import React from 'react';
import { View, Image, ViewStyle } from 'react-native';

interface RecipeIconProps {
  name?: string;
  tags?: string[];
  size?: number;
  style?: ViewStyle;
}

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72';

const FOOD_MAP: { keywords: string[]; code: string; bg: string }[] = [
  { keywords: ['omelette', 'oeuf', 'brouille', 'poche'], code: '1f373', bg: '#FEF3C7' },
  { keywords: ['pancake', 'crepe'], code: '1f95e', bg: '#FED7AA' },
  { keywords: ['toast', 'tartine', 'pain', 'bagel', 'sandwich'], code: '1f35e', bg: '#FEF3C7' },
  { keywords: ['croissant'], code: '1f950', bg: '#FED7AA' },
  { keywords: ['granola', 'muesli', 'avoine', 'flocons', 'porridge'], code: '1f963', bg: '#FEF3C7' },
  { keywords: ['yaourt', 'yogurt'], code: '1f9c8', bg: '#DBEAFE' },
  { keywords: ['smoothie', 'jus'], code: '1f964', bg: '#FCE7F3' },
  { keywords: ['cafe', 'coffee'], code: '2615', bg: '#FEF3C7' },
  { keywords: ['avocat'], code: '1f951', bg: '#DCFCE7' },
  { keywords: ['banane'], code: '1f34c', bg: '#FEF9C3' },
  { keywords: ['pomme'], code: '1f34e', bg: '#FEE2E2' },
  { keywords: ['mangue'], code: '1f96d', bg: '#FED7AA' },
  { keywords: ['fraise'], code: '1f353', bg: '#FEE2E2' },
  { keywords: ['citron'], code: '1f34b', bg: '#FEF9C3' },
  { keywords: ['orange'], code: '1f34a', bg: '#FED7AA' },
  { keywords: ['ananas'], code: '1f34d', bg: '#FEF9C3' },
  { keywords: ['raisin'], code: '1f347', bg: '#EDE9FE' },
  { keywords: ['salade', 'caesar', 'nicoise'], code: '1f957', bg: '#DCFCE7' },
  { keywords: ['tomate'], code: '1f345', bg: '#FEE2E2' },
  { keywords: ['brocoli'], code: '1f966', bg: '#DCFCE7' },
  { keywords: ['carotte'], code: '1f955', bg: '#FED7AA' },
  { keywords: ['aubergine'], code: '1f346', bg: '#EDE9FE' },
  { keywords: ['champignon'], code: '1f344', bg: '#FEF3C7' },
  { keywords: ['mais'], code: '1f33d', bg: '#FEF9C3' },
  { keywords: ['crevette', 'gambas'], code: '1f364', bg: '#FCE7F3' },
  { keywords: ['saumon', 'poisson', 'thon', 'cabillaud', 'dorade', 'bar'], code: '1f41f', bg: '#DBEAFE' },
  { keywords: ['sushi', 'maki'], code: '1f363', bg: '#FCE7F3' },
  { keywords: ['calamar', 'poulpe'], code: '1f419', bg: '#FCE7F3' },
  { keywords: ['poulet', 'volaille', 'dinde'], code: '1f357', bg: '#FED7AA' },
  { keywords: ['boeuf', 'steak', 'viande', 'bavette'], code: '1f969', bg: '#FEE2E2' },
  { keywords: ['jambon', 'bacon', 'lardons'], code: '1f953', bg: '#FEE2E2' },
  { keywords: ['burger', 'hamburger'], code: '1f354', bg: '#FED7AA' },
  { keywords: ['kebab', 'brochette'], code: '1f96c', bg: '#FED7AA' },
  { keywords: ['pizza'], code: '1f355', bg: '#FED7AA' },
  { keywords: ['pate', 'pates', 'spaghetti', 'penne', 'carbonara', 'bolognaise'], code: '1f35d', bg: '#FEF3C7' },
  { keywords: ['ramen', 'nouille'], code: '1f35c', bg: '#FED7AA' },
  { keywords: ['riz', 'risotto'], code: '1f35a', bg: '#F3F4F6' },
  { keywords: ['taco', 'tortilla', 'burrito', 'wrap', 'quesadilla'], code: '1f32e', bg: '#FED7AA' },
  { keywords: ['tajine', 'couscous', 'paella'], code: '1f958', bg: '#FED7AA' },
  { keywords: ['curry'], code: '1f35b', bg: '#FED7AA' },
  { keywords: ['dumpling', 'raviolis', 'gyoza'], code: '1f95f', bg: '#FEF3C7' },
  { keywords: ['pho', 'soupe', 'potage', 'veloute'], code: '1f372', bg: '#FED7AA' },
  { keywords: ['fromage', 'feta', 'mozzarella', 'chevre', 'parmesan', 'cheddar'], code: '1f9c0', bg: '#FEF9C3' },
  { keywords: ['beurre'], code: '1f9c8', bg: '#FEF9C3' },
  { keywords: ['lait'], code: '1f95b', bg: '#DBEAFE' },
  { keywords: ['gateau', 'cake', 'brownie'], code: '1f370', bg: '#FCE7F3' },
  { keywords: ['cookie', 'biscuit'], code: '1f36a', bg: '#FED7AA' },
  { keywords: ['glace', 'sorbet'], code: '1f366', bg: '#DBEAFE' },
  { keywords: ['chocolat'], code: '1f36b', bg: '#FED7AA' },
  { keywords: ['donut', 'beignet'], code: '1f369', bg: '#FCE7F3' },
  { keywords: ['tarte'], code: '1f967', bg: '#FED7AA' },
  { keywords: ['the ', 'tea'], code: '1f375', bg: '#DCFCE7' },
];

const TAG_FALLBACK: Record<string, { code: string; bg: string }> = {
  breakfast: { code: '1f373', bg: '#FEF3C7' },
  lunch: { code: '1f957', bg: '#DCFCE7' },
  dinner: { code: '1f37d', bg: '#DBEAFE' },
  snack: { code: '1f36a', bg: '#FCE7F3' },
  vegan: { code: '1f96c', bg: '#DCFCE7' },
  vegetarian: { code: '1f955', bg: '#FED7AA' },
  keto: { code: '1f951', bg: '#DCFCE7' },
  muscle: { code: '1f357', bg: '#FED7AA' },
  healthy: { code: '1f96c', bg: '#DCFCE7' },
};

const DEFAULT_FOOD = { code: '1f37d', bg: '#F3F4F6' };

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

function findFoodIcon(name: string = '', tags: string[] = []): { code: string; bg: string } {
  const normalizedName = normalize(name);

  for (const item of FOOD_MAP) {
    for (const kw of item.keywords) {
      if (normalizedName.includes(kw)) {
        return { code: item.code, bg: item.bg };
      }
    }
  }

  for (const tag of tags) {
    if (TAG_FALLBACK[tag]) {
      return TAG_FALLBACK[tag];
    }
  }

  return DEFAULT_FOOD;
}

export function RecipeIcon({ name, tags, size = 60, style }: RecipeIconProps) {
  const { code, bg } = findFoodIcon(name, tags);
  const url = `${TWEMOJI_BASE}/${code}.png`;
  const iconSize = Math.round(size * 0.65);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Image
        source={{ uri: url }}
        style={{ width: iconSize, height: iconSize }}
        resizeMode="contain"
      />
    </View>
  );
}
