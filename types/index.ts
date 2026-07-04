// ==========================================
// TYPES - NutriSense App
// ==========================================

// --- User & Auth ---
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isOnboarded: boolean;
}

// --- Meal Plan ---
export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: IngredientCategory;
}

export type IngredientCategory =
  | 'fruits_legumes'
  | 'feculents'
  | 'proteines'
  | 'epicerie'
  | 'produits_laitiers'
  | 'autres';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  time: number; // minutes
  servings: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  ingredients: Ingredient[];
  steps: string[];
  nutrition: NutritionInfo;
  tags: string[];
  imageUrl?: string;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe: Recipe;
}

export interface DayPlan {
  date: string;
  meals: Meal[];
}

export interface WeekPlan {
  id: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  budget: number;
  estimatedCost: number;
}

// --- Shopping ---
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: IngredientCategory;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  weekPlanId: string;
  items: ShoppingItem[];
  createdAt: string;
}

// --- Preferences ---
export type Goal = 'healthy' | 'fast' | 'budget' | 'muscle';

export type DietaryPreference =
  | 'halal'
  | 'vegan'
  | 'vegetarian'
  | 'nolactose'
  | 'nogluten'
  | 'nonut'
  | 'keto'
  | 'bio';

export interface UserPreferences {
  budget: number;
  goal: Goal;
  dietary: DietaryPreference[];
  servings: number;
  locale: 'fr' | 'en';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
}

// --- API ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --- Navigation ---
export type RootStackParamList = {
  '(auth)': undefined;
  '(onboarding)': undefined;
  '(tabs)': undefined;
  'recipe/[id]': { id: string };
  modal: undefined;
};

// --- Theme ---
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  card: string;
  tabBar: string;
  tabBarInactive: string;
  statusBar: 'light' | 'dark';
}


// --- NutriSense ---
export interface ScannedProduct {
  barcode: string;
  name: string;
  brand: string;
  nutriScore: 'A' | 'B' | 'C' | 'D' | 'E';
  novaScore: 1 | 2 | 3 | 4;
  ingredients: string[];
  allergens: string[];
  nutrition: NutritionInfo;
  aiAdvice: string;
}

export interface PhotoMealAnalysis {
  detectedFoods: string[];
  estimatedPortion: string;
  nutrition: NutritionInfo;
  confidence: number;
  aiAdvice: string;
}

export interface HealthGoal {
  id: string;
  userId: string;
  weight: number;
  targetWeight: number;
  height: number;
  activityLevel: 'low' | 'medium' | 'high';
  dailyCaloriesTarget: number;
  dailyWaterTarget: number;
  createdAt: string;
}

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}
