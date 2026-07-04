// ==========================================
// HOOK - useShare
// Partager un élément de l'app
// ==========================================
import { useCallback } from 'react';
import { Share, Platform } from 'react-native';
import { Recipe, ShoppingList } from '@/types';

export function useShare() {
  const shareRecipe = useCallback(async (recipe: Recipe) => {
    const ingredients = recipe.ingredients
      .map((i) => `• ${i.quantity} ${i.unit} ${i.name}`)
      .join('\n');

    const steps = recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');

    const message = `🍽️ ${recipe.name}\n\n⏱️ ${recipe.time} min · 👤 ${recipe.servings} pers. · 🔥 ${recipe.nutrition.calories} kcal\n\n📝 Ingrédients :\n${ingredients}\n\n👩‍🍳 Préparation :\n${steps}\n\n— Envoyé depuis NutriSense 📱`;

    try {
      await Share.share({
        message,
        title: `Recette : ${recipe.name}`,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  }, []);

  const shareShoppingList = useCallback(async (shoppingList: ShoppingList) => {
    const items = shoppingList.items
      .filter((i) => !i.checked)
      .map((i) => `${i.checked ? '✅' : '⬜'} ${i.quantity} ${i.unit} ${i.name}`)
      .join('\n');

    const message = `🛒 Ma liste de courses\n\n${items}\n\n— Envoyé depuis NutriSense 📱`;

    try {
      await Share.share({
        message,
        title: 'Liste de courses',
      });
    } catch (error) {
      console.error('Error sharing shopping list:', error);
    }
  }, []);

  const shareWeekPlan = useCallback(async (planSummary: string) => {
    try {
      await Share.share({
        message: `📅 Mon plan repas de la semaine\n\n${planSummary}\n\n— Envoyé depuis NutriSense 📱`,
        title: 'Mon plan repas',
      });
    } catch (error) {
      console.error('Error sharing week plan:', error);
    }
  }, []);

  const shareText = useCallback(async (title: string, message: string) => {
    try {
      await Share.share({ message, title });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, []);

  return { shareRecipe, shareShoppingList, shareWeekPlan, shareText };
}
