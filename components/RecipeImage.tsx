// ==========================================
// RECIPE IMAGE - Affiche le bon emoji selon le nom du plat
// ==========================================
import React from 'react';
import { Text, TextStyle } from 'react-native';

interface Props {
  name: string;
  fallbackEmoji?: string | null;
  style?: TextStyle;
}

const KEYWORDS: { keys: string[]; emoji: string }[] = [
  // Poissons / Fruits de mer
  { keys: ['crevette', 'gambas'], emoji: '🍤' },
  { keys: ['saumon'], emoji: '🐟' },
  { keys: ['poisson', 'thon', 'cabillaud', 'dorade', 'bar'], emoji: '🐟' },
  { keys: ['sushi', 'maki'], emoji: '🍣' },
  { keys: ['calamar', 'poulpe'], emoji: '🦑' },
  { keys: ['moule'], emoji: '🦪' },
  { keys: ['homard'], emoji: '🦞' },
  { keys: ['crabe'], emoji: '🦀' },

  // Viandes / Volailles
  { keys: ['poulet', 'volaille', 'dinde'], emoji: '🍗' },
  { keys: ['boeuf', 'steak', 'bavette', 'entrecote'], emoji: '🥩' },
  { keys: ['jambon', 'bacon', 'lardons'], emoji: '🥓' },
  { keys: ['burger', 'hamburger'], emoji: '🍔' },
  { keys: ['kebab', 'brochette', 'kefta'], emoji: '🍢' },
  { keys: ['saucisse', 'merguez', 'chorizo'], emoji: '🌭' },

  // Petit-déj
  { keys: ['omelette', 'oeuf', 'brouille', 'poche'], emoji: '🍳' },
  { keys: ['pancake', 'crepe'], emoji: '🥞' },
  { keys: ['toast', 'tartine', 'bagel', 'sandwich'], emoji: '🥪' },
  { keys: ['croissant'], emoji: '🥐' },
  { keys: ['granola', 'muesli', 'avoine', 'flocons', 'porridge', 'bowl'], emoji: '🥣' },
  { keys: ['yaourt', 'yogurt'], emoji: '🥛' },
  { keys: ['smoothie'], emoji: '🥤' },
  { keys: ['jus'], emoji: '🧃' },
  { keys: ['cafe', 'coffee'], emoji: '☕' },
  { keys: ['the ', 'the '], emoji: '🍵' },

  // Fruits
  { keys: ['avocat'], emoji: '🥑' },
  { keys: ['banane'], emoji: '🍌' },
  { keys: ['pomme'], emoji: '🍎' },
  { keys: ['mangue'], emoji: '🥭' },
  { keys: ['fraise'], emoji: '🍓' },
  { keys: ['citron'], emoji: '🍋' },
  { keys: ['orange'], emoji: '🍊' },
  { keys: ['ananas'], emoji: '🍍' },
  { keys: ['raisin'], emoji: '🍇' },
  { keys: ['peche'], emoji: '🍑' },
  { keys: ['fruits rouges', 'myrtille'], emoji: '🫐' },
  { keys: ['pasteque', 'melon'], emoji: '🍉' },
  { keys: ['coco'], emoji: '🥥' },
  { keys: ['kiwi'], emoji: '🥝' },
  { keys: ['cerise'], emoji: '🍒' },
  { keys: ['poire'], emoji: '🍐' },

  // Salades / Légumes
  { keys: ['salade', 'caesar', 'nicoise'], emoji: '🥗' },
  { keys: ['tomate'], emoji: '🍅' },
  { keys: ['brocoli'], emoji: '🥦' },
  { keys: ['carotte'], emoji: '🥕' },
  { keys: ['aubergine'], emoji: '🍆' },
  { keys: ['champignon'], emoji: '🍄' },
  { keys: ['patate', 'pomme de terre'], emoji: '🥔' },
  { keys: ['mais'], emoji: '🌽' },
  { keys: ['piment'], emoji: '🌶️' },
  { keys: ['courgette'], emoji: '🥒' },
  { keys: ['oignon'], emoji: '🧅' },
  { keys: ['ail'], emoji: '🧄' },

  // Plats du monde
  { keys: ['pizza'], emoji: '🍕' },
  { keys: ['pate', 'pates', 'spaghetti', 'penne', 'linguine', 'carbonara', 'bolognaise'], emoji: '🍝' },
  { keys: ['ramen', 'nouille'], emoji: '🍜' },
  { keys: ['riz', 'risotto'], emoji: '🍚' },
  { keys: ['taco', 'tortilla', 'burrito', 'wrap', 'quesadilla', 'fajita'], emoji: '🌮' },
  { keys: ['tajine', 'couscous', 'paella'], emoji: '🥘' },
  { keys: ['curry'], emoji: '🍛' },
  { keys: ['dumpling', 'raviolis', 'gyoza'], emoji: '🥟' },
  { keys: ['pho', 'soupe', 'potage', 'veloute', 'bouillon'], emoji: '🍲' },
  { keys: ['bibimbap'], emoji: '🍚' },
  { keys: ['fondu'], emoji: '🫕' },
  { keys: ['sushi', 'sashimi', 'maki'], emoji: '🍣' },

  // Fromages / Produits laitiers
  { keys: ['fromage', 'feta', 'mozzarella', 'chevre', 'parmesan', 'cheddar', 'gruyere'], emoji: '🧀' },
  { keys: ['beurre'], emoji: '🧈' },
  { keys: ['lait'], emoji: '🥛' },

  // Desserts
  { keys: ['gateau', 'cake', 'brownie', 'muffin'], emoji: '🍰' },
  { keys: ['cookie', 'biscuit'], emoji: '🍪' },
  { keys: ['glace', 'sorbet'], emoji: '🍦' },
  { keys: ['chocolat'], emoji: '🍫' },
  { keys: ['donut', 'beignet'], emoji: '🍩' },
  { keys: ['tarte'], emoji: '🥧' },
  { keys: ['creme'], emoji: '🍨' },
  { keys: ['macaron'], emoji: '🍬' },
  { keys: ['pudding', 'chia'], emoji: '🍮' },

  // Boissons
  { keys: ['soda', 'coca'], emoji: '🥤' },
  { keys: ['biere'], emoji: '🍺' },
  { keys: ['vin'], emoji: '🍷' },
  { keys: ['eau'], emoji: '💧' },

  // Autres
  { keys: ['pain', 'baguette'], emoji: '🥖' },
  { keys: ['legume', 'ratatouille'], emoji: '🥗' },
  { keys: ['houmous'], emoji: '🫓' },
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

function findEmoji(name: string, fallback: string | null | undefined): string {
  const normalized = normalize(name || '');

  for (const item of KEYWORDS) {
    for (const key of item.keys) {
      if (normalized.includes(key)) {
        return item.emoji;
      }
    }
  }

  return fallback || '🍽️';
}

export function RecipeImage({ name, fallbackEmoji, style }: Props) {
  const emoji = findEmoji(name, fallbackEmoji);
  return <Text style={style}>{emoji}</Text>;
}

// Fonction utilitaire réutilisable
export function getRecipeEmoji(name: string, fallback?: string | null): string {
  return findEmoji(name, fallback);
}
