// ==========================================
// DB - Seeding recettes (v4 : 60 recettes, cuisine du monde)
// Couverture : vegan / vegetarian / halal / keto / sans_gluten / sans_lactose
// Types : breakfast / lunch / dinner
// Objectifs : healthy / fast / budget / muscle
// ==========================================
import { prisma } from '../config/database';

export async function seedRecipes(): Promise<void> {
  const count = await prisma.recipe.count();
  if (count > 0) return;

  console.log('🌱 Seeding recipes (60 recettes du monde)...');

  const recipes = [
    // ============================================
    // 🥣 PETITS-DÉJEUNERS (12)
    // ============================================
    { id: 'b01', name: "Bowl d'avoine banane cannelle", emoji: '🥣', timeMinutes: 7, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b01_1', name: 'Flocons avoine', quantity: '60', unit: 'g', category: 'feculents' },
        { id: 'b01_2', name: 'Lait végétal', quantity: '200', unit: 'ml', category: 'produits_laitiers' },
        { id: 'b01_3', name: 'Banane', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'b01_4', name: 'Cannelle', quantity: '1', unit: 'c.à.c', category: 'epicerie' }],
      steps: ['Chauffer le lait végétal.', 'Ajouter avoine + cannelle.', 'Cuire 3 min.', 'Servir avec banane coupée.'],
      nutrition: { calories: 340, protein: 10, carbs: 62, fat: 6, fiber: 8 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'healthy', 'budget', 'fast', 'breakfast'] },

    { id: 'b02', name: 'Omelette champignons fromage', emoji: '🍳', timeMinutes: 10, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b02_1', name: 'Œufs', quantity: '3', unit: 'pièces', category: 'proteines' },
        { id: 'b02_2', name: 'Champignons', quantity: '100', unit: 'g', category: 'fruits_legumes' },
        { id: 'b02_3', name: 'Gruyère', quantity: '30', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Revenir les champignons.', 'Battre les œufs.', "Cuire l'omelette.", 'Ajouter le fromage.'],
      nutrition: { calories: 350, protein: 26, carbs: 4, fat: 25, fiber: 2 },
      tags: ['vegetarian', 'halal', 'keto', 'sans_gluten', 'healthy', 'muscle', 'fast', 'breakfast'] },

    { id: 'b03', name: 'Yaourt grec granola miel', emoji: '🥄', timeMinutes: 3, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b03_1', name: 'Yaourt grec', quantity: '200', unit: 'g', category: 'produits_laitiers' },
        { id: 'b03_2', name: 'Granola', quantity: '40', unit: 'g', category: 'epicerie' },
        { id: 'b03_3', name: 'Miel', quantity: '1', unit: 'c.à.s', category: 'epicerie' },
        { id: 'b03_4', name: 'Fruits rouges', quantity: '50', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Verser le yaourt.', 'Ajouter granola et fruits.', 'Arroser de miel.'],
      nutrition: { calories: 380, protein: 18, carbs: 52, fat: 10, fiber: 5 },
      tags: ['vegetarian', 'halal', 'healthy', 'muscle', 'fast', 'breakfast'] },

    { id: 'b04', name: 'Toast avocat œuf poché', emoji: '🥑', timeMinutes: 10, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b04_1', name: 'Pain complet', quantity: '2', unit: 'tranches', category: 'feculents' },
        { id: 'b04_2', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'b04_3', name: 'Œuf', quantity: '1', unit: 'pièce', category: 'proteines' }],
      steps: ['Toaster le pain.', "Écraser l'avocat.", "Pocher l'œuf 3 min.", 'Assembler.'],
      nutrition: { calories: 420, protein: 18, carbs: 34, fat: 24, fiber: 10 },
      tags: ['vegetarian', 'halal', 'sans_lactose', 'healthy', 'fast', 'breakfast'] },

    { id: 'b05', name: 'Smoothie bowl mangue coco', emoji: '🥭', timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b05_1', name: 'Mangue surgelée', quantity: '200', unit: 'g', category: 'fruits_legumes' },
        { id: 'b05_2', name: 'Lait de coco', quantity: '100', unit: 'ml', category: 'epicerie' },
        { id: 'b05_3', name: 'Graines de chia', quantity: '15', unit: 'g', category: 'epicerie' }],
      steps: ['Mixer mangue + lait de coco.', 'Verser dans un bol.', 'Saupoudrer de chia.'],
      nutrition: { calories: 310, protein: 6, carbs: 42, fat: 14, fiber: 9 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'fast', 'breakfast'] },

    { id: 'b06', name: 'Pancakes protéinés banane', emoji: '🥞', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'b06_1', name: 'Flocons avoine mixés', quantity: '80', unit: 'g', category: 'feculents' },
        { id: 'b06_2', name: 'Banane', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'b06_3', name: 'Œufs', quantity: '2', unit: 'pièces', category: 'proteines' }],
      steps: ['Mixer tous les ingrédients.', 'Cuire à la poêle 2 min par face.', 'Servir tièdes.'],
      nutrition: { calories: 380, protein: 20, carbs: 52, fat: 10, fiber: 6 },
      tags: ['vegetarian', 'halal', 'healthy', 'muscle', 'budget', 'breakfast'] },

    { id: 'b07', name: 'Tartine beurre cacahuète banane', emoji: '🍞', timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b07_1', name: 'Pain complet', quantity: '2', unit: 'tranches', category: 'feculents' },
        { id: 'b07_2', name: 'Beurre de cacahuète', quantity: '30', unit: 'g', category: 'epicerie' },
        { id: 'b07_3', name: 'Banane', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Toaster le pain.', 'Étaler beurre de cacahuète.', 'Ajouter tranches de banane.'],
      nutrition: { calories: 460, protein: 14, carbs: 58, fat: 20, fiber: 8 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'budget', 'fast', 'breakfast'] },

    { id: 'b08', name: 'Chia pudding coco fruits rouges', emoji: '🫐', timeMinutes: 10, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b08_1', name: 'Graines de chia', quantity: '30', unit: 'g', category: 'epicerie' },
        { id: 'b08_2', name: 'Lait de coco', quantity: '150', unit: 'ml', category: 'epicerie' },
        { id: 'b08_3', name: 'Fruits rouges', quantity: '80', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Mélanger chia + lait de coco.', 'Laisser reposer 4h (ou nuit).', 'Ajouter fruits rouges.'],
      nutrition: { calories: 320, protein: 8, carbs: 28, fat: 20, fiber: 12 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'breakfast'] },

    { id: 'b09', name: 'Œufs brouillés avocat feta', emoji: '🍳', timeMinutes: 8, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b09_1', name: 'Œufs', quantity: '3', unit: 'pièces', category: 'proteines' },
        { id: 'b09_2', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'b09_3', name: 'Feta', quantity: '40', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Battre les œufs.', 'Cuire à feu doux en remuant.', 'Ajouter avocat et feta.'],
      nutrition: { calories: 480, protein: 26, carbs: 8, fat: 38, fiber: 6 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'keto', 'healthy', 'muscle', 'fast', 'breakfast'] },

    { id: 'b10', name: 'Bircher muesli aux pommes', emoji: '🍎', timeMinutes: 8, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b10_1', name: 'Flocons avoine', quantity: '50', unit: 'g', category: 'feculents' },
        { id: 'b10_2', name: 'Yaourt', quantity: '100', unit: 'g', category: 'produits_laitiers' },
        { id: 'b10_3', name: 'Pomme râpée', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'b10_4', name: 'Amandes effilées', quantity: '15', unit: 'g', category: 'epicerie' }],
      steps: ['Mélanger avoine + yaourt.', 'Ajouter pomme râpée.', 'Réfrigérer 1h.', 'Ajouter amandes au moment de servir.'],
      nutrition: { calories: 360, protein: 12, carbs: 52, fat: 12, fiber: 8 },
      tags: ['vegetarian', 'halal', 'healthy', 'breakfast'] },

    { id: 'b11', name: 'Porridge riz coco mangue', emoji: '🥥', timeMinutes: 15, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b11_1', name: 'Riz basmati', quantity: '50', unit: 'g', category: 'feculents' },
        { id: 'b11_2', name: 'Lait de coco', quantity: '250', unit: 'ml', category: 'epicerie' },
        { id: 'b11_3', name: 'Mangue', quantity: '1/2', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Cuire le riz dans le lait de coco 15 min.', 'Servir avec mangue en dés.'],
      nutrition: { calories: 380, protein: 6, carbs: 54, fat: 16, fiber: 4 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'budget', 'breakfast'] },

    { id: 'b12', name: 'Fromage blanc noix miel', emoji: '🥛', timeMinutes: 3, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'b12_1', name: 'Fromage blanc 0%', quantity: '200', unit: 'g', category: 'produits_laitiers' },
        { id: 'b12_2', name: 'Noix', quantity: '20', unit: 'g', category: 'epicerie' },
        { id: 'b12_3', name: 'Miel', quantity: '1', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Verser fromage blanc.', 'Concasser noix.', 'Arroser miel.'],
      nutrition: { calories: 280, protein: 22, carbs: 20, fat: 12, fiber: 2 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'muscle', 'fast', 'breakfast'] },

    // ============================================
    // 🍱 DÉJEUNERS (25)
    // ============================================
    { id: 'l01', name: 'Bowl quinoa légumes grillés', emoji: '🥗', timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l01_1', name: 'Quinoa', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'l01_2', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l01_3', name: 'Pois chiches', quantity: '150', unit: 'g', category: 'proteines' },
        { id: 'l01_4', name: 'Carottes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Cuire quinoa 12 min.', 'Griller pois chiches à la poêle.', 'Râper carottes.', 'Assembler.'],
      nutrition: { calories: 460, protein: 18, carbs: 62, fat: 16, fiber: 12 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'lunch'] },

    { id: 'l02', name: 'Buddha bowl saumon avocat', emoji: '🐟', timeMinutes: 25, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l02_1', name: 'Filet de saumon', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'l02_2', name: 'Riz complet', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'l02_3', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l02_4', name: 'Épinards', quantity: '100', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Cuire le riz complet.', 'Cuire le saumon poêle.', 'Assembler bowl.', 'Sauce sésame-soja.'],
      nutrition: { calories: 580, protein: 42, carbs: 48, fat: 22, fiber: 8 },
      tags: ['halal', 'sans_lactose', 'sans_gluten', 'healthy', 'muscle', 'lunch'] },

    { id: 'l03', name: 'Salade grecque feta olives', emoji: '🇬🇷', timeMinutes: 12, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l03_1', name: 'Concombre', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l03_2', name: 'Tomates', quantity: '3', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'l03_3', name: 'Feta', quantity: '100', unit: 'g', category: 'produits_laitiers' },
        { id: 'l03_4', name: 'Olives noires', quantity: '80', unit: 'g', category: 'epicerie' }],
      steps: ['Couper les légumes en dés.', 'Émietter la feta.', 'Ajouter olives.', 'Huile olive + origan.'],
      nutrition: { calories: 390, protein: 14, carbs: 18, fat: 28, fiber: 5 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'keto', 'healthy', 'fast', 'lunch'] },

    { id: 'l04', name: 'Salade thon riz œuf', emoji: '🥗', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l04_1', name: 'Thon en boîte', quantity: '200', unit: 'g', category: 'proteines' },
        { id: 'l04_2', name: 'Riz basmati', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'l04_3', name: 'Œufs durs', quantity: '2', unit: 'pièces', category: 'proteines' },
        { id: 'l04_4', name: 'Salade verte', quantity: '100', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Cuire riz + œufs.', 'Émietter thon.', 'Mélanger.', 'Vinaigrette moutarde.'],
      nutrition: { calories: 480, protein: 38, carbs: 52, fat: 12, fiber: 3 },
      tags: ['halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'fast', 'muscle', 'lunch'] },

    { id: 'l05', name: 'Poke bowl saumon mangue', emoji: '🍣', timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l05_1', name: 'Saumon frais', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'l05_2', name: 'Riz sushi', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'l05_3', name: 'Mangue', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l05_4', name: 'Edamame', quantity: '80', unit: 'g', category: 'proteines' }],
      steps: ['Cuire le riz sushi.', 'Couper saumon en dés.', 'Assembler tous les ingrédients.', 'Sauce soja-sésame.'],
      nutrition: { calories: 620, protein: 38, carbs: 62, fat: 22, fiber: 8 },
      tags: ['halal', 'sans_lactose', 'sans_gluten', 'healthy', 'muscle', 'lunch'] },

    { id: 'l06', name: 'Salade quinoa légumineuses', emoji: '🥬', timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l06_1', name: 'Quinoa', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'l06_2', name: 'Lentilles cuites', quantity: '150', unit: 'g', category: 'proteines' },
        { id: 'l06_3', name: 'Concombre', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l06_4', name: 'Menthe fraîche', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' }],
      steps: ['Cuire quinoa.', 'Mélanger avec lentilles.', 'Ajouter concombre + menthe.', 'Citron + huile olive.'],
      nutrition: { calories: 420, protein: 22, carbs: 62, fat: 8, fiber: 14 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'muscle', 'lunch'] },

    { id: 'l07', name: 'Taboulé libanais', emoji: '🌿', timeMinutes: 15, servings: 3, difficulty: 'facile',
      ingredients: [
        { id: 'l07_1', name: 'Boulghour fin', quantity: '100', unit: 'g', category: 'feculents' },
        { id: 'l07_2', name: 'Persil plat', quantity: '2', unit: 'bouquets', category: 'fruits_legumes' },
        { id: 'l07_3', name: 'Tomates', quantity: '3', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'l07_4', name: 'Menthe', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' }],
      steps: ['Réhydrater boulghour.', 'Hacher persil + menthe très finement.', 'Ajouter tomates en dés.', 'Citron + huile olive.'],
      nutrition: { calories: 280, protein: 8, carbs: 42, fat: 10, fiber: 6 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'budget', 'fast', 'healthy', 'lunch'] },

    { id: 'l08', name: 'Salade thaï bœuf grillé', emoji: '🇹🇭', timeMinutes: 20, servings: 2, difficulty: 'moyen',
      ingredients: [
        { id: 'l08_1', name: 'Bœuf émincé', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'l08_2', name: 'Salade', quantity: '100', unit: 'g', category: 'fruits_legumes' },
        { id: 'l08_3', name: 'Concombre', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l08_4', name: 'Coriandre', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' }],
      steps: ['Griller le bœuf.', 'Émincer légumes.', 'Sauce citron vert-nuoc mam-piment.', 'Assembler.'],
      nutrition: { calories: 380, protein: 38, carbs: 12, fat: 20, fiber: 4 },
      tags: ['halal', 'sans_lactose', 'sans_gluten', 'keto', 'healthy', 'muscle', 'lunch'] },

    { id: 'l09', name: 'Curry pois chiches épinards', emoji: '🇮🇳', timeMinutes: 25, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'l09_1', name: 'Pois chiches', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'l09_2', name: 'Lait de coco', quantity: '400', unit: 'ml', category: 'epicerie' },
        { id: 'l09_3', name: 'Épinards', quantity: '150', unit: 'g', category: 'fruits_legumes' },
        { id: 'l09_4', name: 'Curry poudre', quantity: '2', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Revenir oignon + épices.', 'Ajouter pois chiches.', 'Verser lait coco, mijoter 15 min.', 'Ajouter épinards.'],
      nutrition: { calories: 420, protein: 20, carbs: 55, fat: 14, fiber: 11 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'lunch'] },

    { id: 'l10', name: 'Soupe lentilles corail coco', emoji: '🍲', timeMinutes: 25, servings: 3, difficulty: 'facile',
      ingredients: [
        { id: 'l10_1', name: 'Lentilles corail', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'l10_2', name: 'Lait de coco', quantity: '200', unit: 'ml', category: 'epicerie' },
        { id: 'l10_3', name: 'Oignon', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l10_4', name: 'Curcuma', quantity: '1', unit: 'c.à.c', category: 'epicerie' }],
      steps: ['Revenir oignon.', 'Ajouter lentilles + eau + curcuma.', 'Cuire 15 min.', 'Lait coco, mixer.'],
      nutrition: { calories: 380, protein: 22, carbs: 48, fat: 10, fiber: 12 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'lunch'] },

    { id: 'l11', name: 'Chili sin carne', emoji: '🌶️', timeMinutes: 35, servings: 4, difficulty: 'facile',
      ingredients: [
        { id: 'l11_1', name: 'Haricots rouges', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'l11_2', name: 'Tomates concassées', quantity: '400', unit: 'g', category: 'fruits_legumes' },
        { id: 'l11_3', name: 'Maïs', quantity: '200', unit: 'g', category: 'fruits_legumes' },
        { id: 'l11_4', name: 'Cumin + paprika', quantity: '2', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Revenir oignon + épices.', 'Ajouter haricots + maïs + tomates.', 'Mijoter 25 min.'],
      nutrition: { calories: 340, protein: 18, carbs: 52, fat: 6, fiber: 15 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'lunch'] },

    { id: 'l12', name: 'Spaghetti pesto tomates cerises', emoji: '🍝', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l12_1', name: 'Spaghetti', quantity: '250', unit: 'g', category: 'feculents' },
        { id: 'l12_2', name: 'Pesto', quantity: '4', unit: 'c.à.s', category: 'epicerie' },
        { id: 'l12_3', name: 'Tomates cerises', quantity: '200', unit: 'g', category: 'fruits_legumes' },
        { id: 'l12_4', name: 'Parmesan', quantity: '40', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Cuire pâtes al dente.', 'Couper tomates en deux.', 'Mélanger pâtes chaudes + pesto.', 'Parmesan.'],
      nutrition: { calories: 480, protein: 18, carbs: 62, fat: 16, fiber: 5 },
      tags: ['vegetarian', 'halal', 'fast', 'budget', 'lunch'] },

    { id: 'l13', name: 'Risotto champignons parmesan', emoji: '🇮🇹', timeMinutes: 30, servings: 2, difficulty: 'moyen',
      ingredients: [
        { id: 'l13_1', name: 'Riz arborio', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'l13_2', name: 'Champignons', quantity: '250', unit: 'g', category: 'fruits_legumes' },
        { id: 'l13_3', name: 'Bouillon légumes', quantity: '800', unit: 'ml', category: 'epicerie' },
        { id: 'l13_4', name: 'Parmesan', quantity: '50', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Revenir champignons.', 'Ajouter riz + bouillon louche par louche.', 'Remuer 20 min.', 'Parmesan à la fin.'],
      nutrition: { calories: 520, protein: 18, carbs: 78, fat: 14, fiber: 4 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'lunch'] },

    { id: 'l14', name: 'Wok tofu légumes croquants', emoji: '🥢', timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l14_1', name: 'Tofu ferme', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'l14_2', name: 'Brocolis', quantity: '200', unit: 'g', category: 'fruits_legumes' },
        { id: 'l14_3', name: 'Poivron rouge', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l14_4', name: 'Sauce soja', quantity: '3', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Griller tofu en cubes.', 'Sauter légumes au wok 5 min.', 'Ajouter tofu + sauce soja.'],
      nutrition: { calories: 380, protein: 24, carbs: 22, fat: 20, fiber: 8 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'healthy', 'muscle', 'lunch'] },

    { id: 'l15', name: 'Wrap poulet avocat', emoji: '🌯', timeMinutes: 10, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l15_1', name: 'Tortillas', quantity: '2', unit: 'pièces', category: 'feculents' },
        { id: 'l15_2', name: 'Poulet cuit', quantity: '200', unit: 'g', category: 'proteines' },
        { id: 'l15_3', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l15_4', name: 'Salade', quantity: '50', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Émietter poulet.', 'Trancher avocat.', 'Garnir tortillas.', 'Rouler.'],
      nutrition: { calories: 510, protein: 35, carbs: 40, fat: 22, fiber: 6 },
      tags: ['halal', 'fast', 'muscle', 'lunch'] },

    { id: 'l16', name: 'Falafels salade tahini', emoji: '🧆', timeMinutes: 25, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'l16_1', name: 'Pois chiches', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'l16_2', name: 'Persil', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' },
        { id: 'l16_3', name: 'Tahini', quantity: '4', unit: 'c.à.s', category: 'epicerie' },
        { id: 'l16_4', name: 'Salade verte', quantity: '150', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Mixer pois chiches + persil + épices.', 'Former boulettes.', 'Cuire à la poêle.', 'Servir avec sauce tahini.'],
      nutrition: { calories: 460, protein: 20, carbs: 48, fat: 22, fiber: 12 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'budget', 'lunch'] },

    { id: 'l17', name: 'Dahl lentilles jaunes', emoji: '🍛', timeMinutes: 25, servings: 3, difficulty: 'facile',
      ingredients: [
        { id: 'l17_1', name: 'Lentilles jaunes', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'l17_2', name: 'Tomates', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'l17_3', name: 'Curcuma', quantity: '2', unit: 'c.à.c', category: 'epicerie' },
        { id: 'l17_4', name: 'Gingembre frais', quantity: '20', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Cuire lentilles avec curcuma + gingembre 20 min.', 'Ajouter tomates.', 'Servir avec riz basmati.'],
      nutrition: { calories: 360, protein: 22, carbs: 52, fat: 4, fiber: 14 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'lunch'] },

    { id: 'l18', name: 'Nouilles udon miso légumes', emoji: '🍜', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l18_1', name: 'Nouilles udon', quantity: '250', unit: 'g', category: 'feculents' },
        { id: 'l18_2', name: 'Miso', quantity: '2', unit: 'c.à.s', category: 'epicerie' },
        { id: 'l18_3', name: 'Bok choy', quantity: '150', unit: 'g', category: 'fruits_legumes' },
        { id: 'l18_4', name: 'Champignons shiitake', quantity: '100', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Cuire nouilles.', 'Faire bouillon miso.', 'Ajouter bok choy + champignons.', 'Verser sur nouilles.'],
      nutrition: { calories: 420, protein: 14, carbs: 72, fat: 6, fiber: 6 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'budget', 'lunch'] },

    { id: 'l19', name: 'Enchiladas haricots noirs', emoji: '🇲🇽', timeMinutes: 30, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'l19_1', name: 'Tortillas maïs', quantity: '6', unit: 'pièces', category: 'feculents' },
        { id: 'l19_2', name: 'Haricots noirs', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'l19_3', name: 'Cheddar', quantity: '100', unit: 'g', category: 'produits_laitiers' },
        { id: 'l19_4', name: 'Sauce tomate', quantity: '300', unit: 'ml', category: 'epicerie' }],
      steps: ['Garnir tortillas de haricots.', 'Rouler et disposer en plat.', 'Napper sauce + fromage.', 'Four 15 min.'],
      nutrition: { calories: 490, protein: 22, carbs: 62, fat: 16, fiber: 12 },
      tags: ['vegetarian', 'halal', 'budget', 'lunch'] },

    { id: 'l20', name: 'Tortilla espagnole pommes de terre', emoji: '🇪🇸', timeMinutes: 30, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'l20_1', name: 'Œufs', quantity: '6', unit: 'pièces', category: 'proteines' },
        { id: 'l20_2', name: 'Pommes de terre', quantity: '400', unit: 'g', category: 'fruits_legumes' },
        { id: 'l20_3', name: 'Oignon', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Cuire pommes de terre + oignon en tranches.', 'Battre œufs.', 'Verser sur pommes de terre.', 'Cuire des 2 côtés.'],
      nutrition: { calories: 380, protein: 20, carbs: 32, fat: 18, fiber: 4 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'budget', 'lunch'] },

    { id: 'l21', name: 'Couscous légumes pois chiches', emoji: '🇲🇦', timeMinutes: 35, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'l21_1', name: 'Semoule', quantity: '300', unit: 'g', category: 'feculents' },
        { id: 'l21_2', name: 'Pois chiches', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'l21_3', name: 'Courgettes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'l21_4', name: 'Carottes', quantity: '3', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Mijoter légumes + pois chiches 25 min.', 'Préparer semoule.', 'Servir avec le bouillon.'],
      nutrition: { calories: 460, protein: 18, carbs: 82, fat: 6, fiber: 12 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'budget', 'lunch'] },

    { id: 'l22', name: 'Bo bun poulet vietnamien', emoji: '🇻🇳', timeMinutes: 25, servings: 2, difficulty: 'moyen',
      ingredients: [
        { id: 'l22_1', name: 'Vermicelles de riz', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'l22_2', name: 'Poulet', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'l22_3', name: 'Carotte râpée', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'l22_4', name: 'Nuoc mam', quantity: '3', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Cuire vermicelles.', 'Griller le poulet mariné.', 'Assembler bol + carottes + herbes.', 'Sauce nuoc cham.'],
      nutrition: { calories: 480, protein: 38, carbs: 55, fat: 10, fiber: 4 },
      tags: ['halal', 'sans_lactose', 'sans_gluten', 'healthy', 'muscle', 'lunch'] },

    { id: 'l23', name: 'Salade lentilles feta grenade', emoji: '🥗', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l23_1', name: 'Lentilles vertes cuites', quantity: '200', unit: 'g', category: 'proteines' },
        { id: 'l23_2', name: 'Feta', quantity: '80', unit: 'g', category: 'produits_laitiers' },
        { id: 'l23_3', name: 'Grenade', quantity: '1/2', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l23_4', name: 'Roquette', quantity: '80', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Mélanger lentilles + roquette.', 'Ajouter feta + grenade.', 'Vinaigrette balsamique.'],
      nutrition: { calories: 380, protein: 22, carbs: 42, fat: 14, fiber: 12 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'healthy', 'fast', 'lunch'] },

    { id: 'l24', name: 'Ratatouille provençale', emoji: '🍅', timeMinutes: 40, servings: 4, difficulty: 'facile',
      ingredients: [
        { id: 'l24_1', name: 'Aubergine', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'l24_2', name: 'Courgettes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'l24_3', name: 'Tomates', quantity: '4', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'l24_4', name: 'Poivrons', quantity: '2', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Couper tous les légumes en dés.', 'Revenir séparément.', 'Assembler et mijoter 25 min.'],
      nutrition: { calories: 220, protein: 6, carbs: 32, fat: 8, fiber: 10 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'lunch'] },

    { id: 'l25', name: 'Salade poulet grillé césar', emoji: '🥗', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'l25_1', name: 'Blanc de poulet', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'l25_2', name: 'Salade romaine', quantity: '150', unit: 'g', category: 'fruits_legumes' },
        { id: 'l25_3', name: 'Parmesan', quantity: '30', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Griller poulet.', 'Émincer salade.', 'Copeaux parmesan.', 'Sauce yaourt-citron.'],
      nutrition: { calories: 380, protein: 42, carbs: 8, fat: 20, fiber: 3 },
      tags: ['halal', 'sans_gluten', 'keto', 'healthy', 'muscle', 'fast', 'lunch'] },

    // ============================================
    // 🍽️ DÎNERS (23)
    // ============================================
    { id: 'd01', name: 'Saumon vapeur légumes citron', emoji: '🐟', timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'd01_1', name: 'Filet de saumon', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'd01_2', name: 'Courgettes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd01_3', name: 'Citron', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'd01_4', name: 'Aneth', quantity: '1', unit: 'branche', category: 'epicerie' }],
      steps: ['Vapeur saumon 12 min.', 'Vapeur courgettes 8 min.', 'Arroser citron + aneth.'],
      nutrition: { calories: 380, protein: 42, carbs: 10, fat: 20, fiber: 4 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'muscle', 'dinner'] },

    { id: 'd02', name: 'Cabillaud rôti aux herbes', emoji: '🐠', timeMinutes: 25, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'd02_1', name: 'Filet de cabillaud', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'd02_2', name: 'Patates douces', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd02_3', name: 'Thym', quantity: '2', unit: 'branches', category: 'epicerie' }],
      steps: ['Four 200°C.', 'Cuire patates douces 20 min.', 'Ajouter cabillaud + herbes 10 min.'],
      nutrition: { calories: 340, protein: 34, carbs: 32, fat: 6, fiber: 5 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'healthy', 'muscle', 'dinner'] },

    { id: 'd03', name: 'Boulettes agneau menthe riz', emoji: '🍖', timeMinutes: 30, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'd03_1', name: 'Agneau haché', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'd03_2', name: 'Menthe fraîche', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' },
        { id: 'd03_3', name: 'Riz basmati', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'd03_4', name: 'Oignon', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Mélanger agneau + menthe + oignon.', 'Former boulettes.', 'Cuire poêle 10 min.', 'Servir avec riz.'],
      nutrition: { calories: 620, protein: 42, carbs: 55, fat: 26, fiber: 3 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'healthy', 'muscle', 'dinner'] },

    { id: 'd04', name: 'Poulet tikka masala', emoji: '🇮🇳', timeMinutes: 35, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'd04_1', name: 'Poulet', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'd04_2', name: 'Yaourt', quantity: '200', unit: 'g', category: 'produits_laitiers' },
        { id: 'd04_3', name: 'Tomates concassées', quantity: '400', unit: 'g', category: 'fruits_legumes' },
        { id: 'd04_4', name: 'Épices garam masala', quantity: '2', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Mariner poulet dans yaourt + épices 30 min.', 'Griller poulet.', 'Sauce tomate épicée.', 'Mélanger.'],
      nutrition: { calories: 480, protein: 42, carbs: 18, fat: 24, fiber: 4 },
      tags: ['halal', 'sans_gluten', 'healthy', 'muscle', 'dinner'] },

    { id: 'd05', name: 'Kebab poulet libanais', emoji: '🇱🇧', timeMinutes: 30, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'd05_1', name: 'Poulet en cubes', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'd05_2', name: 'Pain pita', quantity: '3', unit: 'pièces', category: 'feculents' },
        { id: 'd05_3', name: 'Salade + tomates', quantity: '200', unit: 'g', category: 'fruits_legumes' },
        { id: 'd05_4', name: 'Sauce tzatziki', quantity: '150', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Mariner poulet + épices.', 'Griller en brochettes.', 'Assembler dans pita + salade + sauce.'],
      nutrition: { calories: 520, protein: 42, carbs: 42, fat: 18, fiber: 4 },
      tags: ['halal', 'muscle', 'dinner'] },

    { id: 'd06', name: 'Tajine poulet olives citron', emoji: '🇲🇦', timeMinutes: 40, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'd06_1', name: 'Cuisses de poulet', quantity: '6', unit: 'pièces', category: 'proteines' },
        { id: 'd06_2', name: 'Olives vertes', quantity: '100', unit: 'g', category: 'epicerie' },
        { id: 'd06_3', name: 'Oignons', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd06_4', name: 'Citron confit', quantity: '1', unit: 'pièce', category: 'epicerie' }],
      steps: ['Dorer poulet.', 'Ajouter oignons émincés.', 'Épices + olives.', 'Mijoter 30 min à couvert.'],
      nutrition: { calories: 520, protein: 42, carbs: 12, fat: 32, fiber: 3 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'healthy', 'dinner'] },

    { id: 'd07', name: 'Bœuf sauté brocolis sésame', emoji: '🥩', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'd07_1', name: 'Bœuf émincé', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'd07_2', name: 'Brocolis', quantity: '250', unit: 'g', category: 'fruits_legumes' },
        { id: 'd07_3', name: 'Sauce soja', quantity: '3', unit: 'c.à.s', category: 'epicerie' },
        { id: 'd07_4', name: 'Graines de sésame', quantity: '10', unit: 'g', category: 'epicerie' }],
      steps: ['Saisir bœuf au wok 3 min.', 'Ajouter brocolis.', 'Sauce soja.', 'Sésame.'],
      nutrition: { calories: 420, protein: 42, carbs: 12, fat: 22, fiber: 5 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'keto', 'muscle', 'fast', 'dinner'] },

    { id: 'd08', name: 'Aubergines parmigiana', emoji: '🍆', timeMinutes: 50, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'd08_1', name: 'Aubergines', quantity: '3', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd08_2', name: 'Sauce tomate', quantity: '400', unit: 'ml', category: 'epicerie' },
        { id: 'd08_3', name: 'Mozzarella', quantity: '200', unit: 'g', category: 'produits_laitiers' },
        { id: 'd08_4', name: 'Parmesan', quantity: '60', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Griller aubergines en tranches.', 'Alterner aubergine/sauce/mozza en plat.', 'Four 30 min.'],
      nutrition: { calories: 380, protein: 20, carbs: 22, fat: 22, fiber: 8 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'healthy', 'dinner'] },

    { id: 'd09', name: 'Moussaka végétarienne', emoji: '🇬🇷', timeMinutes: 60, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'd09_1', name: 'Aubergines', quantity: '3', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd09_2', name: 'Lentilles cuites', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'd09_3', name: 'Béchamel', quantity: '400', unit: 'ml', category: 'produits_laitiers' },
        { id: 'd09_4', name: 'Tomates', quantity: '400', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Griller aubergines.', 'Préparer sauce lentilles-tomates.', 'Alterner en plat + béchamel.', 'Four 30 min.'],
      nutrition: { calories: 460, protein: 22, carbs: 42, fat: 22, fiber: 10 },
      tags: ['vegetarian', 'halal', 'dinner'] },

    { id: 'd10', name: 'Gnocchis sauce tomate basilic', emoji: '🇮🇹', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'd10_1', name: 'Gnocchis', quantity: '400', unit: 'g', category: 'feculents' },
        { id: 'd10_2', name: 'Sauce tomate', quantity: '300', unit: 'ml', category: 'epicerie' },
        { id: 'd10_3', name: 'Basilic frais', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' },
        { id: 'd10_4', name: 'Parmesan', quantity: '40', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Cuire gnocchis 3 min.', 'Réchauffer sauce tomate.', 'Mélanger + basilic + parmesan.'],
      nutrition: { calories: 460, protein: 14, carbs: 78, fat: 8, fiber: 5 },
      tags: ['vegetarian', 'halal', 'budget', 'fast', 'dinner'] },

    { id: 'd11', name: 'Curry thaï vert tofu', emoji: '🇹🇭', timeMinutes: 25, servings: 2, difficulty: 'moyen',
      ingredients: [
        { id: 'd11_1', name: 'Tofu ferme', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'd11_2', name: 'Lait de coco', quantity: '400', unit: 'ml', category: 'epicerie' },
        { id: 'd11_3', name: 'Pâte curry vert', quantity: '3', unit: 'c.à.s', category: 'epicerie' },
        { id: 'd11_4', name: 'Aubergines thai', quantity: '200', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Revenir pâte curry.', 'Ajouter lait coco.', 'Ajouter tofu + aubergines.', 'Mijoter 15 min.'],
      nutrition: { calories: 480, protein: 22, carbs: 22, fat: 34, fiber: 6 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'dinner'] },

    { id: 'd12', name: 'Nouilles soba edamame', emoji: '🍜', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'd12_1', name: 'Nouilles soba', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'd12_2', name: 'Edamame', quantity: '150', unit: 'g', category: 'proteines' },
        { id: 'd12_3', name: 'Sauce soja', quantity: '3', unit: 'c.à.s', category: 'epicerie' },
        { id: 'd12_4', name: 'Ciboule', quantity: '3', unit: 'brins', category: 'fruits_legumes' }],
      steps: ['Cuire soba 4 min.', 'Cuire edamame vapeur.', 'Sauce soja-sésame.', 'Servir chaud.'],
      nutrition: { calories: 420, protein: 22, carbs: 68, fat: 6, fiber: 8 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'healthy', 'muscle', 'dinner'] },

    { id: 'd13', name: 'Pho végétarien vietnamien', emoji: '🇻🇳', timeMinutes: 30, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'd13_1', name: 'Nouilles de riz', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'd13_2', name: 'Bouillon légumes', quantity: '1500', unit: 'ml', category: 'epicerie' },
        { id: 'd13_3', name: 'Tofu grillé', quantity: '200', unit: 'g', category: 'proteines' },
        { id: 'd13_4', name: 'Coriandre + basilic thaï', quantity: '2', unit: 'bouquets', category: 'fruits_legumes' }],
      steps: ['Parfumer bouillon avec anis étoilé + cannelle.', 'Cuire nouilles séparément.', 'Assembler bol.'],
      nutrition: { calories: 360, protein: 18, carbs: 58, fat: 6, fiber: 5 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'dinner'] },

    { id: 'd14', name: 'Shakshuka œufs tomates épicées', emoji: '🇮🇱', timeMinutes: 25, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'd14_1', name: 'Œufs', quantity: '4', unit: 'pièces', category: 'proteines' },
        { id: 'd14_2', name: 'Tomates concassées', quantity: '400', unit: 'g', category: 'fruits_legumes' },
        { id: 'd14_3', name: 'Poivrons', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd14_4', name: 'Cumin + paprika', quantity: '2', unit: 'c.à.c', category: 'epicerie' }],
      steps: ['Revenir poivrons + oignon.', 'Ajouter tomates + épices.', 'Casser œufs dessus.', 'Cuire 8 min.'],
      nutrition: { calories: 380, protein: 22, carbs: 22, fat: 22, fiber: 6 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'dinner'] },

    { id: 'd15', name: 'Aubergines farcies quinoa', emoji: '🍆', timeMinutes: 45, servings: 2, difficulty: 'moyen',
      ingredients: [
        { id: 'd15_1', name: 'Aubergines', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd15_2', name: 'Quinoa', quantity: '100', unit: 'g', category: 'feculents' },
        { id: 'd15_3', name: 'Pignons', quantity: '30', unit: 'g', category: 'epicerie' },
        { id: 'd15_4', name: 'Tomates', quantity: '2', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Vider aubergines.', 'Cuire quinoa + mélanger avec chair aubergine + tomates.', 'Farcir + four 25 min.'],
      nutrition: { calories: 380, protein: 12, carbs: 52, fat: 14, fiber: 12 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'sans_gluten', 'healthy', 'budget', 'dinner'] },

    { id: 'd16', name: 'Curry poulet coco indien', emoji: '🍛', timeMinutes: 35, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'd16_1', name: 'Poulet', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'd16_2', name: 'Lait de coco', quantity: '400', unit: 'ml', category: 'epicerie' },
        { id: 'd16_3', name: 'Riz basmati', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'd16_4', name: 'Curry indien', quantity: '2', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Dorer poulet.', 'Ajouter épices + lait coco.', 'Mijoter 20 min.', 'Servir avec riz basmati.'],
      nutrition: { calories: 620, protein: 40, carbs: 55, fat: 24, fiber: 4 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'muscle', 'dinner'] },

    { id: 'd17', name: 'Poisson à la marocaine', emoji: '🇲🇦', timeMinutes: 30, servings: 2, difficulty: 'moyen',
      ingredients: [
        { id: 'd17_1', name: 'Filet de merlan', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'd17_2', name: 'Tomates', quantity: '3', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd17_3', name: 'Chermoula (coriandre + cumin)', quantity: '3', unit: 'c.à.s', category: 'epicerie' },
        { id: 'd17_4', name: 'Citron', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Mariner poisson dans chermoula 20 min.', 'Cuire avec tomates 15 min.', 'Arroser citron.'],
      nutrition: { calories: 320, protein: 38, carbs: 12, fat: 14, fiber: 4 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'healthy', 'muscle', 'dinner'] },

    { id: 'd18', name: 'Saumon teriyaki japonais', emoji: '🇯🇵', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'd18_1', name: 'Filet de saumon', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'd18_2', name: 'Sauce teriyaki', quantity: '4', unit: 'c.à.s', category: 'epicerie' },
        { id: 'd18_3', name: 'Riz japonais', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'd18_4', name: 'Sésame', quantity: '10', unit: 'g', category: 'epicerie' }],
      steps: ['Cuire saumon.', 'Ajouter sauce teriyaki.', 'Servir avec riz + sésame.'],
      nutrition: { calories: 520, protein: 40, carbs: 52, fat: 18, fiber: 2 },
      tags: ['halal', 'sans_lactose', 'healthy', 'muscle', 'fast', 'dinner'] },

    { id: 'd19', name: 'Merguez couscous royal', emoji: '🌭', timeMinutes: 30, servings: 3, difficulty: 'facile',
      ingredients: [
        { id: 'd19_1', name: 'Merguez', quantity: '6', unit: 'pièces', category: 'proteines' },
        { id: 'd19_2', name: 'Semoule', quantity: '250', unit: 'g', category: 'feculents' },
        { id: 'd19_3', name: 'Légumes couscous', quantity: '400', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Griller merguez.', 'Préparer semoule.', 'Mijoter légumes.', 'Servir avec harissa.'],
      nutrition: { calories: 620, protein: 32, carbs: 62, fat: 28, fiber: 6 },
      tags: ['halal', 'budget', 'dinner'] },

    { id: 'd20', name: 'Steak grillé légumes rôtis', emoji: '🥩', timeMinutes: 25, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'd20_1', name: 'Steak de bœuf', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'd20_2', name: 'Courgettes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd20_3', name: 'Poivrons', quantity: '2', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Rôtir légumes au four 20 min.', 'Griller steak 3 min par face.', 'Servir.'],
      nutrition: { calories: 480, protein: 42, carbs: 18, fat: 26, fiber: 6 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'keto', 'muscle', 'dinner'] },

    { id: 'd21', name: 'Lasagnes végétariennes épinards', emoji: '🇮🇹', timeMinutes: 50, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'd21_1', name: 'Pâtes à lasagne', quantity: '250', unit: 'g', category: 'feculents' },
        { id: 'd21_2', name: 'Épinards', quantity: '400', unit: 'g', category: 'fruits_legumes' },
        { id: 'd21_3', name: 'Ricotta', quantity: '250', unit: 'g', category: 'produits_laitiers' },
        { id: 'd21_4', name: 'Sauce tomate', quantity: '400', unit: 'ml', category: 'epicerie' }],
      steps: ['Blanchir épinards.', 'Mélanger avec ricotta.', 'Alterner pâtes/épinards/sauce.', 'Four 30 min.'],
      nutrition: { calories: 520, protein: 22, carbs: 62, fat: 20, fiber: 6 },
      tags: ['vegetarian', 'halal', 'budget', 'dinner'] },

    { id: 'd22', name: 'Brochettes agneau riz safrané', emoji: '🍢', timeMinutes: 30, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'd22_1', name: 'Agneau en cubes', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'd22_2', name: 'Riz basmati', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'd22_3', name: 'Safran', quantity: '1', unit: 'pincée', category: 'epicerie' },
        { id: 'd22_4', name: 'Yaourt', quantity: '150', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Mariner agneau dans yaourt + épices.', 'Cuire riz avec safran.', 'Griller brochettes 12 min.'],
      nutrition: { calories: 580, protein: 42, carbs: 55, fat: 22, fiber: 3 },
      tags: ['halal', 'sans_gluten', 'healthy', 'muscle', 'dinner'] },

    { id: 'd23', name: 'Chakchouka végétarienne', emoji: '🥘', timeMinutes: 25, servings: 3, difficulty: 'facile',
      ingredients: [
        { id: 'd23_1', name: 'Poivrons', quantity: '3', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd23_2', name: 'Tomates', quantity: '4', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'd23_3', name: 'Œufs', quantity: '4', unit: 'pièces', category: 'proteines' },
        { id: 'd23_4', name: 'Ail + cumin', quantity: '1', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Revenir poivrons + ail.', 'Ajouter tomates + cumin.', 'Casser œufs dessus.', 'Cuire 8 min.'],
      nutrition: { calories: 320, protein: 18, carbs: 22, fat: 18, fiber: 6 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'dinner'] },

    // ============================================
    // 🍤 RECETTES CREVETTES (5)
    // ============================================
    { id: 'sh01', name: 'Spaghetti aux crevettes ail', emoji: '🍝', timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'sh01_1', name: 'Spaghetti', quantity: '250', unit: 'g', category: 'feculents' },
        { id: 'sh01_2', name: 'Crevettes', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'sh01_3', name: 'Ail', quantity: '3', unit: 'gousses', category: 'fruits_legumes' },
        { id: 'sh01_4', name: 'Persil', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' }],
      steps: ['Cuire les spaghettis al dente.', "Revenir l'ail dans huile d'olive.", 'Ajouter crevettes 3 min.', 'Mélanger avec les pâtes + persil.'],
      nutrition: { calories: 520, protein: 32, carbs: 68, fat: 12, fiber: 4 },
      tags: ['halal', 'sans_lactose', 'healthy', 'muscle', 'fast', 'lunch', 'dinner'] },

    { id: 'sh02', name: 'Crevettes sautées légumes riz', emoji: '🍤', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'sh02_1', name: 'Crevettes', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'sh02_2', name: 'Riz basmati', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'sh02_3', name: 'Poivron rouge', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'sh02_4', name: 'Sauce soja', quantity: '3', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Cuire le riz.', 'Sauter poivron au wok 3 min.', 'Ajouter crevettes 3 min.', 'Sauce soja.'],
      nutrition: { calories: 460, protein: 32, carbs: 58, fat: 8, fiber: 4 },
      tags: ['halal', 'sans_lactose', 'sans_gluten', 'healthy', 'muscle', 'fast', 'lunch', 'dinner'] },

    { id: 'sh03', name: 'Crevettes au curry coco', emoji: '🍤', timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'sh03_1', name: 'Crevettes', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'sh03_2', name: 'Lait de coco', quantity: '400', unit: 'ml', category: 'epicerie' },
        { id: 'sh03_3', name: 'Curry poudre', quantity: '2', unit: 'c.à.s', category: 'epicerie' },
        { id: 'sh03_4', name: 'Riz basmati', quantity: '150', unit: 'g', category: 'feculents' }],
      steps: ['Revenir crevettes 2 min.', 'Ajouter curry + lait coco.', 'Mijoter 8 min.', 'Servir avec riz basmati.'],
      nutrition: { calories: 540, protein: 30, carbs: 55, fat: 22, fiber: 3 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'healthy', 'muscle', 'dinner'] },

    { id: 'sh04', name: 'Salade crevettes avocat mangue', emoji: '🥗', timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'sh04_1', name: 'Crevettes cuites', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'sh04_2', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'sh04_3', name: 'Mangue', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'sh04_4', name: 'Salade verte', quantity: '80', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Couper avocat + mangue en dés.', 'Mélanger avec salade + crevettes.', 'Vinaigrette citron vert.'],
      nutrition: { calories: 380, protein: 28, carbs: 30, fat: 18, fiber: 8 },
      tags: ['halal', 'sans_lactose', 'sans_gluten', 'healthy', 'fast', 'lunch'] },

    { id: 'sh05', name: 'Gambas grillées ail piment', emoji: '🍤', timeMinutes: 10, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'sh05_1', name: 'Gambas', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'sh05_2', name: 'Ail', quantity: '4', unit: 'gousses', category: 'fruits_legumes' },
        { id: 'sh05_3', name: 'Piment', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'sh05_4', name: 'Persil', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' }],
      steps: ["Chauffer huile d'olive avec ail + piment.", 'Ajouter gambas 4 min.', 'Parsemer persil.'],
      nutrition: { calories: 280, protein: 42, carbs: 4, fat: 12, fiber: 1 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'muscle', 'fast', 'dinner'] },

  ];

  await prisma.recipe.createMany({ data: recipes });
  console.log(`✅ ${recipes.length} recettes seedées (12 petit-déj + 25 déj + 23 dîners + 5 crevettes)`);
}
