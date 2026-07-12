// ==========================================
// DB - Seeding recettes (Option B : repas complets)
// Couverture régimes : vegan / vegetarian / halal / keto / sans_gluten / sans_lactose
// Composantes : boisson / pdej_principal / fruit / entree / plat / dessert
// Types repas : breakfast / lunch / dinner
// Objectifs : healthy / fast / budget / muscle
// Cuisine variée : française, maghrébine, asiatique, italienne, méditerranéenne
// ==========================================
import { prisma } from '../config/database';

export async function seedRecipes(): Promise<void> {
  const count = await prisma.recipe.count();
  if (count > 0) return;

  console.log('Seeding recipes (repas complets multi-composantes)...');

  const recipes = [
    // ==========================================================
    // ☕ BOISSONS PETIT-DÉJEUNER (tag: boisson + breakfast)
    // ==========================================================
    { id: 'bo01', name: 'Café au lait', emoji: null, timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'bo01_1', name: 'Café moulu', quantity: '8', unit: 'g', category: 'epicerie' },
        { id: 'bo01_2', name: 'Lait demi-écrémé', quantity: '150', unit: 'ml', category: 'produits_laitiers' }],
      steps: ['Préparer un expresso ou café filtre bien serré.', 'Faire chauffer le lait sans le faire bouillir.', 'Verser le lait chaud sur le café.', 'Mélanger et servir aussitôt.'],
      nutrition: { calories: 90, protein: 5, carbs: 8, fat: 4, fiber: 0 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'healthy', 'budget', 'fast', 'breakfast', 'boisson'] },

    { id: 'bo02', name: 'Thé vert à la menthe', emoji: null, timeMinutes: 7, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'bo02_1', name: 'Thé vert', quantity: '1', unit: 'c.à.c', category: 'epicerie' },
        { id: 'bo02_2', name: 'Menthe fraîche', quantity: '5', unit: 'feuilles', category: 'fruits_legumes' },
        { id: 'bo02_3', name: 'Sucre', quantity: '1', unit: 'c.à.c', category: 'epicerie' }],
      steps: ['Porter l\'eau à frémissement.', 'Ajouter le thé vert et laisser infuser 3 min.', 'Ajouter la menthe fraîche et le sucre.', 'Servir chaud dans un verre.'],
      nutrition: { calories: 25, protein: 0, carbs: 6, fat: 0, fiber: 0 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'fast', 'breakfast', 'boisson'] },

    { id: 'bo03', name: 'Smoothie banane fraise', emoji: null, timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'bo03_1', name: 'Banane', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'bo03_2', name: 'Fraises', quantity: '100', unit: 'g', category: 'fruits_legumes' },
        { id: 'bo03_3', name: 'Lait végétal', quantity: '200', unit: 'ml', category: 'produits_laitiers' }],
      steps: ['Éplucher la banane et laver les fraises.', 'Mettre tous les ingrédients dans un blender.', 'Mixer jusqu\'à obtenir une texture lisse.', 'Verser dans un grand verre et servir frais.'],
      nutrition: { calories: 180, protein: 4, carbs: 35, fat: 3, fiber: 5 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'fast', 'breakfast', 'boisson'] },

    { id: 'bo04', name: 'Jus d\'orange pressé', emoji: null, timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'bo04_1', name: 'Oranges', quantity: '3', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Couper les oranges en deux.', 'Presser à l\'aide d\'un presse-agrumes.', 'Filtrer si désiré.', 'Servir immédiatement pour garder les vitamines.'],
      nutrition: { calories: 110, protein: 2, carbs: 26, fat: 0, fiber: 1 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'fast', 'breakfast', 'boisson'] },

    // ==========================================================
    // 🥣 PRINCIPAUX PETIT-DÉJEUNER (tag: pdej_principal + breakfast)
    // ==========================================================
    { id: 'pd01', name: 'Bowl d\'avoine banane cannelle', emoji: null, timeMinutes: 8, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'pd01_1', name: 'Flocons d\'avoine', quantity: '60', unit: 'g', category: 'feculents' },
        { id: 'pd01_2', name: 'Lait végétal', quantity: '200', unit: 'ml', category: 'produits_laitiers' },
        { id: 'pd01_3', name: 'Banane', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'pd01_4', name: 'Cannelle', quantity: '1', unit: 'c.à.c', category: 'epicerie' }],
      steps: ['Verser le lait végétal dans une casserole et chauffer à feu doux.', 'Ajouter les flocons d\'avoine et la cannelle.', 'Cuire 3 à 4 minutes en remuant jusqu\'à épaississement.', 'Verser dans un bol.', 'Couper la banane en rondelles et disposer sur le dessus.', 'Servir tiède.'],
      nutrition: { calories: 340, protein: 10, carbs: 62, fat: 6, fiber: 8 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'healthy', 'budget', 'fast', 'breakfast', 'pdej_principal'] },

    { id: 'pd02', name: 'Omelette aux champignons et fromage', emoji: null, timeMinutes: 12, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'pd02_1', name: 'Œufs', quantity: '3', unit: 'pièces', category: 'proteines' },
        { id: 'pd02_2', name: 'Champignons de Paris', quantity: '100', unit: 'g', category: 'fruits_legumes' },
        { id: 'pd02_3', name: 'Fromage râpé', quantity: '30', unit: 'g', category: 'produits_laitiers' },
        { id: 'pd02_4', name: 'Beurre', quantity: '10', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Nettoyer et émincer les champignons.', 'Faire fondre le beurre dans une poêle.', 'Faire revenir les champignons 5 minutes.', 'Battre les œufs en omelette, saler et poivrer.', 'Verser les œufs sur les champignons.', 'Ajouter le fromage râpé, plier l\'omelette et servir.'],
      nutrition: { calories: 350, protein: 26, carbs: 4, fat: 26, fiber: 1 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'keto', 'healthy', 'muscle', 'fast', 'breakfast', 'pdej_principal'] },

    { id: 'pd03', name: 'Yaourt grec granola et miel', emoji: null, timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'pd03_1', name: 'Yaourt grec', quantity: '200', unit: 'g', category: 'produits_laitiers' },
        { id: 'pd03_2', name: 'Granola', quantity: '50', unit: 'g', category: 'feculents' },
        { id: 'pd03_3', name: 'Miel', quantity: '1', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Verser le yaourt grec dans un bol.', 'Ajouter le granola par-dessus.', 'Arroser d\'un filet de miel.', 'Servir immédiatement pour garder le croquant.'],
      nutrition: { calories: 380, protein: 18, carbs: 48, fat: 12, fiber: 4 },
      tags: ['vegetarian', 'halal', 'healthy', 'fast', 'breakfast', 'pdej_principal'] },

    { id: 'pd04', name: 'Œufs brouillés à l\'avocat', emoji: null, timeMinutes: 10, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'pd04_1', name: 'Œufs', quantity: '2', unit: 'pièces', category: 'proteines' },
        { id: 'pd04_2', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'pd04_3', name: 'Huile d\'olive', quantity: '1', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Battre les œufs avec une pincée de sel.', 'Chauffer l\'huile dans une poêle à feu doux.', 'Verser les œufs et remuer constamment pour des œufs crémeux.', 'Couper l\'avocat en tranches.', 'Dresser les œufs avec l\'avocat et servir.'],
      nutrition: { calories: 360, protein: 16, carbs: 8, fat: 30, fiber: 7 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'muscle', 'fast', 'breakfast', 'pdej_principal'] },

    { id: 'pd05', name: 'Pancakes vegan à la banane', emoji: null, timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'pd05_1', name: 'Farine', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'pd05_2', name: 'Banane', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'pd05_3', name: 'Lait végétal', quantity: '200', unit: 'ml', category: 'produits_laitiers' },
        { id: 'pd05_4', name: 'Levure chimique', quantity: '1', unit: 'sachet', category: 'epicerie' }],
      steps: ['Écraser les bananes à la fourchette.', 'Mélanger la farine et la levure.', 'Ajouter le lait végétal et les bananes écrasées.', 'Mélanger jusqu\'à obtenir une pâte lisse.', 'Cuire les pancakes dans une poêle chaude 2 min par face.', 'Servir tièdes.'],
      nutrition: { calories: 320, protein: 8, carbs: 64, fat: 4, fiber: 5 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'healthy', 'budget', 'breakfast', 'pdej_principal'] },

    // ==========================================================
    // 🍎 FRUITS PETIT-DÉJEUNER (tag: fruit + breakfast)
    // ==========================================================
    { id: 'fr01', name: 'Salade de fruits frais', emoji: null, timeMinutes: 10, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'fr01_1', name: 'Pomme', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'fr01_2', name: 'Kiwi', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'fr01_3', name: 'Orange', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Éplucher et couper tous les fruits en dés.', 'Mélanger délicatement dans un bol.', 'Servir frais.'],
      nutrition: { calories: 120, protein: 2, carbs: 30, fat: 0, fiber: 6 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'fast', 'breakfast', 'fruit'] },

    { id: 'fr02', name: 'Banane', emoji: null, timeMinutes: 1, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'fr02_1', name: 'Banane', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Éplucher la banane.', 'Déguster.'],
      nutrition: { calories: 90, protein: 1, carbs: 23, fat: 0, fiber: 3 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'fast', 'breakfast', 'fruit'] },

    { id: 'fr03', name: 'Pomme', emoji: null, timeMinutes: 1, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'fr03_1', name: 'Pomme', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Laver la pomme.', 'Déguster entière ou coupée en quartiers.'],
      nutrition: { calories: 80, protein: 0, carbs: 21, fat: 0, fiber: 4 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'fast', 'breakfast', 'fruit'] },

    // ==========================================================
    // 🥗 ENTRÉES DÉJEUNER (tag: entree + lunch)
    // ==========================================================
    { id: 'en01', name: 'Salade méchouia tunisienne', emoji: null, timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'en01_1', name: 'Poivrons', quantity: '3', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'en01_2', name: 'Tomates', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'en01_3', name: 'Ail', quantity: '2', unit: 'gousses', category: 'fruits_legumes' },
        { id: 'en01_4', name: 'Huile d\'olive', quantity: '2', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Griller les poivrons et tomates au four jusqu\'à ce que la peau noircisse.', 'Laisser refroidir puis retirer la peau.', 'Hacher finement les légumes.', 'Écraser l\'ail et mélanger.', 'Assaisonner d\'huile d\'olive, sel et cumin.', 'Servir froid.'],
      nutrition: { calories: 120, protein: 3, carbs: 12, fat: 8, fiber: 4 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'lunch', 'entree'] },

    { id: 'en02', name: 'Salade grecque', emoji: null, timeMinutes: 15, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'en02_1', name: 'Concombre', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'en02_2', name: 'Tomates', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'en02_3', name: 'Feta', quantity: '100', unit: 'g', category: 'produits_laitiers' },
        { id: 'en02_4', name: 'Olives noires', quantity: '50', unit: 'g', category: 'epicerie' }],
      steps: ['Couper le concombre et les tomates en gros dés.', 'Ajouter les olives noires.', 'Émietter la feta par-dessus.', 'Arroser d\'huile d\'olive et d\'origan.', 'Mélanger délicatement et servir frais.'],
      nutrition: { calories: 220, protein: 8, carbs: 10, fat: 17, fiber: 3 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'keto', 'healthy', 'fast', 'lunch', 'entree'] },

    { id: 'en03', name: 'Velouté de potiron', emoji: null, timeMinutes: 25, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'en03_1', name: 'Potiron', quantity: '400', unit: 'g', category: 'fruits_legumes' },
        { id: 'en03_2', name: 'Oignon', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'en03_3', name: 'Crème végétale', quantity: '50', unit: 'ml', category: 'produits_laitiers' }],
      steps: ['Éplucher et couper le potiron en cubes.', 'Faire revenir l\'oignon émincé.', 'Ajouter le potiron et couvrir d\'eau.', 'Cuire 20 minutes jusqu\'à tendreté.', 'Mixer avec la crème végétale.', 'Assaisonner et servir chaud.'],
      nutrition: { calories: 140, protein: 3, carbs: 22, fat: 5, fiber: 5 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'lunch', 'entree'] },

    { id: 'en04', name: 'Bruschetta tomate basilic', emoji: null, timeMinutes: 12, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'en04_1', name: 'Pain de campagne', quantity: '4', unit: 'tranches', category: 'feculents' },
        { id: 'en04_2', name: 'Tomates', quantity: '3', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'en04_3', name: 'Basilic', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' },
        { id: 'en04_4', name: 'Ail', quantity: '1', unit: 'gousse', category: 'fruits_legumes' }],
      steps: ['Toaster les tranches de pain.', 'Frotter chaque tranche avec l\'ail.', 'Couper les tomates en petits dés.', 'Répartir les tomates sur le pain.', 'Ajouter le basilic ciselé et un filet d\'huile d\'olive.', 'Servir aussitôt.'],
      nutrition: { calories: 180, protein: 5, carbs: 30, fat: 5, fiber: 3 },
      tags: ['vegan', 'vegetarian', 'halal', 'healthy', 'budget', 'fast', 'lunch', 'entree'] },

    { id: 'en05', name: 'Houmous et crudités', emoji: null, timeMinutes: 10, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'en05_1', name: 'Pois chiches', quantity: '200', unit: 'g', category: 'proteines' },
        { id: 'en05_2', name: 'Tahini', quantity: '2', unit: 'c.à.s', category: 'epicerie' },
        { id: 'en05_3', name: 'Citron', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'en05_4', name: 'Carottes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Mixer les pois chiches avec le tahini et le jus de citron.', 'Ajouter de l\'ail et un filet d\'huile d\'olive.', 'Mixer jusqu\'à obtenir une texture crémeuse.', 'Couper les carottes en bâtonnets.', 'Servir le houmous avec les crudités.'],
      nutrition: { calories: 210, protein: 9, carbs: 24, fat: 10, fiber: 7 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'fast', 'lunch', 'entree'] },

    // ==========================================================
    // 🍽️ PLATS PRINCIPAUX (tag: plat + lunch/dinner)
    // ==========================================================
    { id: 'pl01', name: 'Couscous royal aux légumes', emoji: null, timeMinutes: 60, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'pl01_1', name: 'Semoule', quantity: '500', unit: 'g', category: 'feculents' },
        { id: 'pl01_2', name: 'Agneau', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'pl01_3', name: 'Courgettes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'pl01_4', name: 'Carottes', quantity: '3', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'pl01_5', name: 'Pois chiches', quantity: '200', unit: 'g', category: 'proteines' },
        { id: 'pl01_6', name: 'Ras el-hanout', quantity: '2', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Faire revenir l\'agneau avec l\'oignon dans une cocotte 5 minutes.', 'Ajouter les épices ras el-hanout et mouiller d\'eau.', 'Incorporer les carottes et les pois chiches, cuire 30 minutes.', 'Ajouter les courgettes et cuire 15 minutes de plus.', 'Préparer la semoule en la cuisant à la vapeur.', 'Égrainer la semoule à la fourchette avec un filet d\'huile.', 'Dresser la semoule, disposer la viande et les légumes.', 'Arroser de bouillon et servir bien chaud.'],
      nutrition: { calories: 620, protein: 35, carbs: 78, fat: 18, fiber: 9 },
      tags: ['halal', 'sans_lactose', 'healthy', 'muscle', 'lunch', 'dinner', 'plat'] },

    { id: 'pl02', name: 'Tajine de poulet aux olives et citron', emoji: null, timeMinutes: 50, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'pl02_1', name: 'Cuisses de poulet', quantity: '4', unit: 'pièces', category: 'proteines' },
        { id: 'pl02_2', name: 'Citron confit', quantity: '1', unit: 'pièce', category: 'epicerie' },
        { id: 'pl02_3', name: 'Olives vertes', quantity: '100', unit: 'g', category: 'epicerie' },
        { id: 'pl02_4', name: 'Oignon', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'pl02_5', name: 'Gingembre', quantity: '1', unit: 'c.à.c', category: 'epicerie' }],
      steps: ['Faire dorer les cuisses de poulet dans un tajine ou une cocotte.', 'Ajouter les oignons émincés et le gingembre.', 'Verser un verre d\'eau et couvrir.', 'Laisser mijoter 30 minutes à feu doux.', 'Ajouter le citron confit coupé et les olives.', 'Poursuivre la cuisson 15 minutes.', 'Parsemer de coriandre et servir avec du pain.'],
      nutrition: { calories: 480, protein: 42, carbs: 12, fat: 28, fiber: 3 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'healthy', 'muscle', 'lunch', 'dinner', 'plat'] },

    { id: 'pl03', name: 'Spaghetti aux crevettes et ail', emoji: null, timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'pl03_1', name: 'Spaghetti', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'pl03_2', name: 'Crevettes', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'pl03_3', name: 'Ail', quantity: '3', unit: 'gousses', category: 'fruits_legumes' },
        { id: 'pl03_4', name: 'Persil', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' }],
      steps: ['Cuire les spaghetti dans l\'eau bouillante salée.', 'Faire revenir l\'ail haché dans l\'huile d\'olive.', 'Ajouter les crevettes et cuire 4 minutes.', 'Égoutter les pâtes et les ajouter à la poêle.', 'Mélanger avec le persil ciselé.', 'Servir immédiatement.'],
      nutrition: { calories: 520, protein: 32, carbs: 68, fat: 12, fiber: 3 },
      tags: ['halal', 'sans_lactose', 'healthy', 'muscle', 'fast', 'lunch', 'dinner', 'plat'] },

    { id: 'pl04', name: 'Curry de pois chiches épinards', emoji: null, timeMinutes: 30, servings: 3, difficulty: 'facile',
      ingredients: [
        { id: 'pl04_1', name: 'Pois chiches', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'pl04_2', name: 'Épinards', quantity: '200', unit: 'g', category: 'fruits_legumes' },
        { id: 'pl04_3', name: 'Lait de coco', quantity: '200', unit: 'ml', category: 'epicerie' },
        { id: 'pl04_4', name: 'Curry', quantity: '2', unit: 'c.à.s', category: 'epicerie' },
        { id: 'pl04_5', name: 'Riz basmati', quantity: '200', unit: 'g', category: 'feculents' }],
      steps: ['Faire revenir l\'oignon et l\'ail émincés.', 'Ajouter le curry et faire torréfier 1 minute.', 'Incorporer les pois chiches et le lait de coco.', 'Mijoter 15 minutes à feu doux.', 'Ajouter les épinards et cuire 5 minutes.', 'Cuire le riz basmati en parallèle.', 'Servir le curry sur le riz.'],
      nutrition: { calories: 540, protein: 18, carbs: 82, fat: 16, fiber: 12 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'lunch', 'dinner', 'plat'] },

    { id: 'pl05', name: 'Saumon grillé riz et brocolis', emoji: null, timeMinutes: 25, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'pl05_1', name: 'Pavé de saumon', quantity: '2', unit: 'pièces', category: 'proteines' },
        { id: 'pl05_2', name: 'Riz complet', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'pl05_3', name: 'Brocolis', quantity: '200', unit: 'g', category: 'fruits_legumes' },
        { id: 'pl05_4', name: 'Citron', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Cuire le riz complet selon les instructions.', 'Faire cuire les brocolis à la vapeur 8 minutes.', 'Assaisonner le saumon de sel, poivre et citron.', 'Griller le saumon 4 minutes de chaque côté.', 'Dresser le saumon avec le riz et les brocolis.', 'Servir avec un quartier de citron.'],
      nutrition: { calories: 560, protein: 40, carbs: 48, fat: 22, fiber: 6 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'healthy', 'muscle', 'lunch', 'dinner', 'plat'] },

    { id: 'pl06', name: 'Boulettes d\'agneau à la menthe et riz', emoji: null, timeMinutes: 35, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'pl06_1', name: 'Agneau haché', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'pl06_2', name: 'Menthe fraîche', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' },
        { id: 'pl06_3', name: 'Riz', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'pl06_4', name: 'Oignon', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Mélanger l\'agneau haché avec l\'oignon râpé et la menthe.', 'Assaisonner de sel, poivre et cumin.', 'Former des boulettes à la main.', 'Faire dorer les boulettes dans une poêle 10 minutes.', 'Cuire le riz en parallèle.', 'Servir les boulettes sur le riz.'],
      nutrition: { calories: 580, protein: 34, carbs: 56, fat: 24, fiber: 2 },
      tags: ['halal', 'sans_lactose', 'healthy', 'muscle', 'lunch', 'dinner', 'plat'] },

    { id: 'pl07', name: 'Ratatouille provençale', emoji: null, timeMinutes: 45, servings: 4, difficulty: 'facile',
      ingredients: [
        { id: 'pl07_1', name: 'Aubergine', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'pl07_2', name: 'Courgettes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'pl07_3', name: 'Poivrons', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'pl07_4', name: 'Tomates', quantity: '4', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Couper tous les légumes en dés.', 'Faire revenir l\'oignon et l\'ail.', 'Ajouter les poivrons et l\'aubergine, cuire 10 minutes.', 'Incorporer les courgettes et les tomates.', 'Assaisonner d\'herbes de Provence.', 'Mijoter 25 minutes à feu doux.', 'Servir chaud ou tiède.'],
      nutrition: { calories: 180, protein: 4, carbs: 24, fat: 8, fiber: 8 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'lunch', 'dinner', 'plat'] },

    { id: 'pl08', name: 'Poulet sauté aux légumes asiatique', emoji: null, timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'pl08_1', name: 'Blanc de poulet', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'pl08_2', name: 'Poivrons', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'pl08_3', name: 'Sauce soja', quantity: '3', unit: 'c.à.s', category: 'epicerie' },
        { id: 'pl08_4', name: 'Nouilles', quantity: '200', unit: 'g', category: 'feculents' }],
      steps: ['Couper le poulet en lanières.', 'Faire sauter le poulet à feu vif 5 minutes.', 'Ajouter les poivrons émincés.', 'Verser la sauce soja et faire revenir 3 minutes.', 'Cuire les nouilles séparément.', 'Mélanger nouilles et poulet, servir chaud.'],
      nutrition: { calories: 500, protein: 38, carbs: 58, fat: 10, fiber: 4 },
      tags: ['halal', 'sans_lactose', 'healthy', 'muscle', 'fast', 'lunch', 'dinner', 'plat'] },

    // ==========================================================
    // 🍰 DESSERTS (tag: dessert + lunch/dinner)
    // ==========================================================
    { id: 'de01', name: 'Makroud aux dattes', emoji: null, timeMinutes: 40, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'de01_1', name: 'Semoule fine', quantity: '250', unit: 'g', category: 'feculents' },
        { id: 'de01_2', name: 'Pâte de dattes', quantity: '200', unit: 'g', category: 'fruits_legumes' },
        { id: 'de01_3', name: 'Miel', quantity: '100', unit: 'g', category: 'epicerie' },
        { id: 'de01_4', name: 'Huile d\'olive', quantity: '3', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Mélanger la semoule avec l\'huile et un peu d\'eau pour former une pâte.', 'Étaler la pâte et garnir de pâte de dattes.', 'Rouler puis découper en losanges.', 'Faire frire les makrouds jusqu\'à dorure.', 'Tremper dans le miel chaud.', 'Laisser égoutter et servir.'],
      nutrition: { calories: 280, protein: 4, carbs: 52, fat: 8, fiber: 3 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'budget', 'lunch', 'dinner', 'dessert'] },

    { id: 'de02', name: 'Salade de fruits frais', emoji: null, timeMinutes: 10, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'de02_1', name: 'Pomme', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'de02_2', name: 'Orange', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'de02_3', name: 'Raisin', quantity: '100', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Éplucher et couper les fruits en morceaux.', 'Mélanger dans un saladier.', 'Ajouter un filet de jus de citron.', 'Réserver au frais et servir.'],
      nutrition: { calories: 110, protein: 1, carbs: 28, fat: 0, fiber: 5 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'fast', 'lunch', 'dinner', 'dessert'] },

    { id: 'de03', name: 'Mousse au chocolat', emoji: null, timeMinutes: 20, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'de03_1', name: 'Chocolat noir', quantity: '200', unit: 'g', category: 'epicerie' },
        { id: 'de03_2', name: 'Œufs', quantity: '4', unit: 'pièces', category: 'proteines' },
        { id: 'de03_3', name: 'Sucre', quantity: '30', unit: 'g', category: 'epicerie' }],
      steps: ['Faire fondre le chocolat au bain-marie.', 'Séparer les blancs des jaunes.', 'Incorporer les jaunes au chocolat fondu.', 'Monter les blancs en neige avec le sucre.', 'Incorporer délicatement les blancs au chocolat.', 'Réfrigérer 3 heures minimum avant de servir.'],
      nutrition: { calories: 320, protein: 9, carbs: 28, fat: 20, fiber: 3 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'lunch', 'dinner', 'dessert'] },

    { id: 'de04', name: 'Yaourt au miel et noix', emoji: null, timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'de04_1', name: 'Yaourt nature', quantity: '150', unit: 'g', category: 'produits_laitiers' },
        { id: 'de04_2', name: 'Miel', quantity: '1', unit: 'c.à.s', category: 'epicerie' },
        { id: 'de04_3', name: 'Noix', quantity: '30', unit: 'g', category: 'epicerie' }],
      steps: ['Verser le yaourt dans un bol.', 'Ajouter le miel.', 'Concasser les noix et parsemer.', 'Servir frais.'],
      nutrition: { calories: 220, protein: 8, carbs: 22, fat: 12, fiber: 2 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'keto', 'healthy', 'fast', 'lunch', 'dinner', 'dessert'] },

    { id: 'de05', name: 'Compote pomme cannelle', emoji: null, timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'de05_1', name: 'Pommes', quantity: '4', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'de05_2', name: 'Cannelle', quantity: '1', unit: 'c.à.c', category: 'epicerie' }],
      steps: ['Éplucher et couper les pommes en morceaux.', 'Mettre dans une casserole avec un fond d\'eau.', 'Cuire à feu doux 15 minutes.', 'Ajouter la cannelle et écraser à la fourchette.', 'Servir tiède ou froid.'],
      nutrition: { calories: 130, protein: 1, carbs: 33, fat: 0, fiber: 5 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'lunch', 'dinner', 'dessert'] },


    // ==========================================================
    // 🥑 RECETTES KETO (peu de glucides)
    // ==========================================================
    { id: 'kt01', name: 'Poulet grillé et courgettes', emoji: null, timeMinutes: 25, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'kt01_1', name: 'Blanc de poulet', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'kt01_2', name: 'Courgettes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'kt01_3', name: 'Huile d\'olive', quantity: '2', unit: 'c.à.s', category: 'epicerie' }],
      steps: ['Assaisonner le poulet de sel, poivre et herbes.', 'Griller le poulet 6 minutes de chaque côté.', 'Couper les courgettes en rondelles.', 'Faire revenir les courgettes à l\'huile d\'olive.', 'Dresser le poulet avec les courgettes.', 'Servir chaud.'],
      nutrition: { calories: 380, protein: 42, carbs: 8, fat: 20, fiber: 3 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'muscle', 'lunch', 'dinner', 'plat'] },

    { id: 'kt02', name: 'Saumon et salade d\'avocat', emoji: null, timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'kt02_1', name: 'Pavé de saumon', quantity: '2', unit: 'pièces', category: 'proteines' },
        { id: 'kt02_2', name: 'Avocat', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'kt02_3', name: 'Roquette', quantity: '80', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Griller le saumon 4 minutes de chaque côté.', 'Couper les avocats en tranches.', 'Disposer la roquette dans une assiette.', 'Ajouter l\'avocat et le saumon.', 'Arroser d\'huile d\'olive et de citron.', 'Servir aussitôt.'],
      nutrition: { calories: 480, protein: 36, carbs: 6, fat: 34, fiber: 7 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'muscle', 'fast', 'lunch', 'dinner', 'plat'] },

    { id: 'kt03', name: 'Fromage blanc aux amandes', emoji: null, timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'kt03_1', name: 'Fromage blanc', quantity: '150', unit: 'g', category: 'produits_laitiers' },
        { id: 'kt03_2', name: 'Amandes', quantity: '30', unit: 'g', category: 'epicerie' }],
      steps: ['Verser le fromage blanc dans un bol.', 'Concasser les amandes.', 'Parsemer les amandes sur le fromage blanc.', 'Servir frais.'],
      nutrition: { calories: 240, protein: 16, carbs: 8, fat: 16, fiber: 3 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'keto', 'healthy', 'fast', 'breakfast', 'pdej_principal', 'dessert'] },

    { id: 'kt04', name: 'Eau infusée citron concombre', emoji: null, timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'kt04_1', name: 'Citron', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'kt04_2', name: 'Concombre', quantity: '0.5', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'kt04_3', name: 'Eau', quantity: '250', unit: 'ml', category: 'epicerie' }],
      steps: ['Couper le citron et le concombre en rondelles.', 'Les mettre dans un grand verre d\'eau.', 'Laisser infuser 10 minutes au frais.', 'Servir bien frais.'],
      nutrition: { calories: 15, protein: 0, carbs: 4, fat: 0, fiber: 1 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'budget', 'fast', 'breakfast', 'boisson'] },


    // ==========================================================
    // 🌱 PLATS VEGAN supplémentaires (pour varier sur 7 jours)
    // ==========================================================
    { id: 'vg01', name: 'Dahl de lentilles corail', emoji: null, timeMinutes: 30, servings: 3, difficulty: 'facile',
      ingredients: [
        { id: 'vg01_1', name: 'Lentilles corail', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'vg01_2', name: 'Lait de coco', quantity: '200', unit: 'ml', category: 'epicerie' },
        { id: 'vg01_3', name: 'Tomates', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'vg01_4', name: 'Curry', quantity: '1', unit: 'c.à.s', category: 'epicerie' },
        { id: 'vg01_5', name: 'Riz basmati', quantity: '200', unit: 'g', category: 'feculents' }],
      steps: ['Rincer les lentilles corail.', 'Faire revenir l\'oignon et les épices.', 'Ajouter les lentilles, les tomates et le lait de coco.', 'Mijoter 20 minutes à feu doux.', 'Cuire le riz en parallèle.', 'Servir le dahl sur le riz.'],
      nutrition: { calories: 520, protein: 20, carbs: 78, fat: 14, fiber: 11 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'lunch', 'dinner', 'plat'] },

    { id: 'vg02', name: 'Buddha bowl quinoa avocat', emoji: null, timeMinutes: 25, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'vg02_1', name: 'Quinoa', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'vg02_2', name: 'Pois chiches', quantity: '200', unit: 'g', category: 'proteines' },
        { id: 'vg02_3', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'vg02_4', name: 'Carottes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Cuire le quinoa 15 minutes.', 'Rôtir les pois chiches avec des épices.', 'Râper les carottes.', 'Couper l\'avocat en tranches.', 'Disposer tous les éléments dans un bol.', 'Arroser d\'une sauce tahini-citron.'],
      nutrition: { calories: 490, protein: 18, carbs: 62, fat: 18, fiber: 14 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'muscle', 'lunch', 'dinner', 'plat'] },

    { id: 'vg03', name: 'Chili sin carne', emoji: null, timeMinutes: 35, servings: 4, difficulty: 'facile',
      ingredients: [
        { id: 'vg03_1', name: 'Haricots rouges', quantity: '400', unit: 'g', category: 'proteines' },
        { id: 'vg03_2', name: 'Tomates', quantity: '400', unit: 'g', category: 'fruits_legumes' },
        { id: 'vg03_3', name: 'Poivrons', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'vg03_4', name: 'Maïs', quantity: '150', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Faire revenir l\'oignon, l\'ail et les poivrons.', 'Ajouter les épices (cumin, paprika).', 'Incorporer les tomates, les haricots et le maïs.', 'Mijoter 25 minutes.', 'Rectifier l\'assaisonnement.', 'Servir avec du riz ou du pain.'],
      nutrition: { calories: 380, protein: 16, carbs: 62, fat: 6, fiber: 15 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'lunch', 'dinner', 'plat'] },

    { id: 'vg04', name: 'Pâtes à la sauce tomate basilic', emoji: null, timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'vg04_1', name: 'Pâtes', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'vg04_2', name: 'Tomates', quantity: '400', unit: 'g', category: 'fruits_legumes' },
        { id: 'vg04_3', name: 'Basilic', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' },
        { id: 'vg04_4', name: 'Ail', quantity: '2', unit: 'gousses', category: 'fruits_legumes' }],
      steps: ['Cuire les pâtes al dente.', 'Faire revenir l\'ail dans l\'huile d\'olive.', 'Ajouter les tomates et mijoter 10 minutes.', 'Incorporer le basilic ciselé.', 'Mélanger les pâtes à la sauce.', 'Servir chaud.'],
      nutrition: { calories: 460, protein: 12, carbs: 88, fat: 6, fiber: 6 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'healthy', 'budget', 'fast', 'lunch', 'dinner', 'plat'] },

    { id: 'vg05', name: 'Wok de tofu et légumes', emoji: null, timeMinutes: 22, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'vg05_1', name: 'Tofu ferme', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'vg05_2', name: 'Brocolis', quantity: '200', unit: 'g', category: 'fruits_legumes' },
        { id: 'vg05_3', name: 'Sauce soja', quantity: '3', unit: 'c.à.s', category: 'epicerie' },
        { id: 'vg05_4', name: 'Nouilles', quantity: '200', unit: 'g', category: 'feculents' }],
      steps: ['Couper le tofu en cubes et le faire dorer.', 'Ajouter les brocolis et faire sauter.', 'Verser la sauce soja.', 'Cuire les nouilles séparément.', 'Mélanger nouilles, tofu et légumes.', 'Servir chaud.'],
      nutrition: { calories: 470, protein: 24, carbs: 60, fat: 14, fiber: 7 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'healthy', 'muscle', 'fast', 'lunch', 'dinner', 'plat'] },

    // PDEJ principaux vegan
    { id: 'vg06', name: 'Porridge chia et fruits rouges', emoji: null, timeMinutes: 10, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'vg06_1', name: 'Graines de chia', quantity: '30', unit: 'g', category: 'epicerie' },
        { id: 'vg06_2', name: 'Lait végétal', quantity: '200', unit: 'ml', category: 'produits_laitiers' },
        { id: 'vg06_3', name: 'Fruits rouges', quantity: '100', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Mélanger les graines de chia et le lait végétal.', 'Laisser reposer 10 minutes (ou toute la nuit).', 'Remuer pour éviter les grumeaux.', 'Ajouter les fruits rouges par-dessus.', 'Servir frais.'],
      nutrition: { calories: 300, protein: 10, carbs: 38, fat: 12, fiber: 12 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'fast', 'breakfast', 'pdej_principal'] },

    { id: 'vg07', name: 'Tartine avocat écrasé', emoji: null, timeMinutes: 8, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'vg07_1', name: 'Pain complet', quantity: '2', unit: 'tranches', category: 'feculents' },
        { id: 'vg07_2', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'vg07_3', name: 'Citron', quantity: '0.5', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Toaster le pain complet.', 'Écraser l\'avocat avec le jus de citron.', 'Saler et poivrer.', 'Étaler sur les tartines.', 'Servir aussitôt.'],
      nutrition: { calories: 320, protein: 8, carbs: 34, fat: 18, fiber: 10 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_lactose', 'healthy', 'fast', 'breakfast', 'pdej_principal'] },


    // ==========================================================
    // 🥑 RECETTES KETO supplémentaires (pour varier sur 7 jours)
    // ==========================================================
    { id: 'kt05', name: 'Steak et haricots verts', emoji: null, timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'kt05_1', name: 'Steak de bœuf', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'kt05_2', name: 'Haricots verts', quantity: '250', unit: 'g', category: 'fruits_legumes' },
        { id: 'kt05_3', name: 'Beurre', quantity: '20', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Cuire les haricots verts à la vapeur.', 'Saisir les steaks 3 minutes par face.', 'Faire revenir les haricots au beurre.', 'Assaisonner de sel et poivre.', 'Dresser et servir.'],
      nutrition: { calories: 450, protein: 40, carbs: 8, fat: 28, fiber: 4 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'muscle', 'fast', 'lunch', 'dinner', 'plat'] },

    { id: 'kt06', name: 'Omelette au fromage et épinards', emoji: null, timeMinutes: 12, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'kt06_1', name: 'Œufs', quantity: '3', unit: 'pièces', category: 'proteines' },
        { id: 'kt06_2', name: 'Épinards', quantity: '100', unit: 'g', category: 'fruits_legumes' },
        { id: 'kt06_3', name: 'Fromage râpé', quantity: '40', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Faire tomber les épinards à la poêle.', 'Battre les œufs.', 'Verser les œufs sur les épinards.', 'Ajouter le fromage.', 'Plier l\'omelette et servir.'],
      nutrition: { calories: 380, protein: 28, carbs: 4, fat: 28, fiber: 2 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'keto', 'healthy', 'muscle', 'fast', 'lunch', 'dinner', 'plat'] },

    { id: 'kt07', name: 'Salade César au poulet', emoji: null, timeMinutes: 20, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'kt07_1', name: 'Blanc de poulet', quantity: '250', unit: 'g', category: 'proteines' },
        { id: 'kt07_2', name: 'Salade romaine', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'kt07_3', name: 'Parmesan', quantity: '40', unit: 'g', category: 'produits_laitiers' }],
      steps: ['Griller le poulet et le couper en lanières.', 'Laver et couper la salade.', 'Préparer une sauce césar.', 'Mélanger salade, poulet et sauce.', 'Parsemer de parmesan.', 'Servir frais.'],
      nutrition: { calories: 400, protein: 38, carbs: 6, fat: 24, fiber: 3 },
      tags: ['halal', 'sans_gluten', 'keto', 'healthy', 'muscle', 'fast', 'lunch', 'entree', 'plat'] },

    { id: 'kt08', name: 'Avocat aux crevettes', emoji: null, timeMinutes: 10, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'kt08_1', name: 'Avocat', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'kt08_2', name: 'Crevettes', quantity: '150', unit: 'g', category: 'proteines' },
        { id: 'kt08_3', name: 'Citron', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Couper les avocats en deux et retirer le noyau.', 'Décortiquer les crevettes cuites.', 'Garnir les avocats de crevettes.', 'Arroser de jus de citron.', 'Servir frais.'],
      nutrition: { calories: 320, protein: 18, carbs: 8, fat: 24, fiber: 7 },
      tags: ['halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'fast', 'lunch', 'dinner', 'entree'] },

    { id: 'kt09', name: 'Mousse au chocolat keto (avocat)', emoji: null, timeMinutes: 10, servings: 2, difficulty: 'facile',
      ingredients: [
        { id: 'kt09_1', name: 'Avocat', quantity: '1', unit: 'pièce', category: 'fruits_legumes' },
        { id: 'kt09_2', name: 'Cacao', quantity: '2', unit: 'c.à.s', category: 'epicerie' },
        { id: 'kt09_3', name: 'Amandes', quantity: '20', unit: 'g', category: 'epicerie' }],
      steps: ['Mixer l\'avocat avec le cacao.', 'Ajouter un édulcorant si désiré.', 'Mixer jusqu\'à texture lisse.', 'Parsemer d\'amandes concassées.', 'Réfrigérer avant de servir.'],
      nutrition: { calories: 240, protein: 6, carbs: 10, fat: 20, fiber: 8 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'fast', 'lunch', 'dinner', 'dessert'] },

    { id: 'kt10', name: 'Café crème (keto)', emoji: null, timeMinutes: 5, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'kt10_1', name: 'Café moulu', quantity: '8', unit: 'g', category: 'epicerie' },
        { id: 'kt10_2', name: 'Crème entière', quantity: '30', unit: 'ml', category: 'produits_laitiers' }],
      steps: ['Préparer un café serré.', 'Ajouter la crème entière.', 'Mélanger.', 'Servir chaud.'],
      nutrition: { calories: 110, protein: 2, carbs: 2, fat: 11, fiber: 0 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'keto', 'healthy', 'fast', 'breakfast', 'boisson'] },


    // ==========================================================
    // 🧀 PLATS VÉGÉTARIENS + variés supplémentaires
    // ==========================================================
    { id: 'vt01', name: 'Risotto aux champignons', emoji: null, timeMinutes: 35, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'vt01_1', name: 'Riz arborio', quantity: '250', unit: 'g', category: 'feculents' },
        { id: 'vt01_2', name: 'Champignons de Paris', quantity: '250', unit: 'g', category: 'fruits_legumes' },
        { id: 'vt01_3', name: 'Parmesan', quantity: '50', unit: 'g', category: 'produits_laitiers' },
        { id: 'vt01_4', name: 'Oignon', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Faire revenir l\'oignon émincé.', 'Ajouter le riz et le nacrer.', 'Verser le bouillon louche par louche.', 'Incorporer les champignons poêlés.', 'Ajouter le parmesan hors du feu.', 'Servir crémeux.'],
      nutrition: { calories: 480, protein: 14, carbs: 78, fat: 12, fiber: 4 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'healthy', 'lunch', 'dinner', 'plat'] },

    { id: 'vt02', name: 'Gratin de courgettes', emoji: null, timeMinutes: 40, servings: 4, difficulty: 'facile',
      ingredients: [
        { id: 'vt02_1', name: 'Courgettes', quantity: '4', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'vt02_2', name: 'Œufs', quantity: '3', unit: 'pièces', category: 'proteines' },
        { id: 'vt02_3', name: 'Fromage râpé', quantity: '80', unit: 'g', category: 'produits_laitiers' },
        { id: 'vt02_4', name: 'Crème fraîche', quantity: '150', unit: 'ml', category: 'produits_laitiers' }],
      steps: ['Émincer les courgettes en rondelles.', 'Les faire revenir 10 minutes.', 'Battre les œufs avec la crème.', 'Disposer les courgettes dans un plat.', 'Verser l\'appareil et le fromage.', 'Cuire au four 25 minutes à 180°C.'],
      nutrition: { calories: 340, protein: 18, carbs: 12, fat: 24, fiber: 4 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'keto', 'healthy', 'lunch', 'dinner', 'plat'] },

    { id: 'vt03', name: 'Falafels et salade', emoji: null, timeMinutes: 30, servings: 3, difficulty: 'moyen',
      ingredients: [
        { id: 'vt03_1', name: 'Pois chiches', quantity: '300', unit: 'g', category: 'proteines' },
        { id: 'vt03_2', name: 'Persil', quantity: '1', unit: 'bouquet', category: 'fruits_legumes' },
        { id: 'vt03_3', name: 'Ail', quantity: '2', unit: 'gousses', category: 'fruits_legumes' },
        { id: 'vt03_4', name: 'Tomates', quantity: '2', unit: 'pièces', category: 'fruits_legumes' }],
      steps: ['Mixer les pois chiches avec l\'ail et le persil.', 'Former des boulettes.', 'Les faire dorer à la poêle.', 'Préparer une salade de tomates.', 'Servir les falafels sur la salade.', 'Accompagner de sauce tahini.'],
      nutrition: { calories: 420, protein: 16, carbs: 52, fat: 16, fiber: 12 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'lunch', 'dinner', 'plat'] },

    { id: 'vt04', name: 'Quiche aux légumes', emoji: null, timeMinutes: 45, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'vt04_1', name: 'Pâte brisée', quantity: '1', unit: 'pièce', category: 'feculents' },
        { id: 'vt04_2', name: 'Œufs', quantity: '3', unit: 'pièces', category: 'proteines' },
        { id: 'vt04_3', name: 'Courgettes', quantity: '2', unit: 'pièces', category: 'fruits_legumes' },
        { id: 'vt04_4', name: 'Crème fraîche', quantity: '200', unit: 'ml', category: 'produits_laitiers' }],
      steps: ['Étaler la pâte dans un moule.', 'Faire revenir les légumes.', 'Battre les œufs avec la crème.', 'Disposer les légumes sur la pâte.', 'Verser l\'appareil.', 'Cuire 30 minutes à 180°C.'],
      nutrition: { calories: 440, protein: 14, carbs: 36, fat: 28, fiber: 3 },
      tags: ['vegetarian', 'halal', 'healthy', 'lunch', 'dinner', 'plat'] },

    // Desserts supplémentaires (variés)
    { id: 'de06', name: 'Riz au lait vanille', emoji: null, timeMinutes: 30, servings: 3, difficulty: 'facile',
      ingredients: [
        { id: 'de06_1', name: 'Riz rond', quantity: '150', unit: 'g', category: 'feculents' },
        { id: 'de06_2', name: 'Lait', quantity: '750', unit: 'ml', category: 'produits_laitiers' },
        { id: 'de06_3', name: 'Sucre', quantity: '60', unit: 'g', category: 'epicerie' }],
      steps: ['Chauffer le lait avec la vanille.', 'Ajouter le riz.', 'Cuire 25 minutes à feu doux en remuant.', 'Ajouter le sucre.', 'Laisser tiédir.', 'Servir tiède ou froid.'],
      nutrition: { calories: 280, protein: 8, carbs: 52, fat: 5, fiber: 1 },
      tags: ['vegetarian', 'halal', 'sans_gluten', 'healthy', 'budget', 'lunch', 'dinner', 'dessert'] },

    { id: 'de07', name: 'Tiramisu express', emoji: null, timeMinutes: 20, servings: 4, difficulty: 'moyen',
      ingredients: [
        { id: 'de07_1', name: 'Mascarpone', quantity: '250', unit: 'g', category: 'produits_laitiers' },
        { id: 'de07_2', name: 'Œufs', quantity: '3', unit: 'pièces', category: 'proteines' },
        { id: 'de07_3', name: 'Biscuits', quantity: '200', unit: 'g', category: 'feculents' },
        { id: 'de07_4', name: 'Café moulu', quantity: '20', unit: 'g', category: 'epicerie' }],
      steps: ['Séparer les blancs des jaunes.', 'Mélanger jaunes, sucre et mascarpone.', 'Monter les blancs en neige.', 'Tremper les biscuits dans le café.', 'Alterner biscuits et crème.', 'Réfrigérer 4 heures.'],
      nutrition: { calories: 380, protein: 10, carbs: 32, fat: 24, fiber: 1 },
      tags: ['vegetarian', 'halal', 'lunch', 'dinner', 'dessert'] },

    // Fruits supplémentaires (petit-déj)
    { id: 'fr04', name: 'Orange', emoji: null, timeMinutes: 2, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'fr04_1', name: 'Orange', quantity: '1', unit: 'pièce', category: 'fruits_legumes' }],
      steps: ['Éplucher l\'orange.', 'Séparer les quartiers.', 'Déguster.'],
      nutrition: { calories: 62, protein: 1, carbs: 15, fat: 0, fiber: 3 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'healthy', 'budget', 'fast', 'breakfast', 'fruit'] },

    { id: 'fr05', name: 'Bol de fraises', emoji: null, timeMinutes: 3, servings: 1, difficulty: 'facile',
      ingredients: [
        { id: 'fr05_1', name: 'Fraises', quantity: '150', unit: 'g', category: 'fruits_legumes' }],
      steps: ['Laver les fraises.', 'Équeuter.', 'Servir dans un bol.'],
      nutrition: { calories: 50, protein: 1, carbs: 12, fat: 0, fiber: 3 },
      tags: ['vegan', 'vegetarian', 'halal', 'sans_gluten', 'sans_lactose', 'keto', 'healthy', 'budget', 'fast', 'breakfast', 'fruit'] },


  ];

  await prisma.recipe.createMany({ data: recipes });
  console.log(`${recipes.length} recettes seedées`);
}
