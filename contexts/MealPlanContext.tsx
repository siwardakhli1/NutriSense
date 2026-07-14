// CONTEXT - MealPlanContext
import React, { createContext, useCallback, useEffect, useReducer } from 'react';
import {
  WeekPlan, ShoppingList, UserPreferences, Goal, DietaryPreference, Recipe,
} from '@/types';
import { api } from '@/services/api';

interface MealPlanState {
  weekPlan: WeekPlan | null;
  shoppingList: ShoppingList | null;
  recipes: Recipe[];
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

interface MealPlanContextType extends MealPlanState {
  generatePlan: () => Promise<void>;
  regenerateFromToday: () => Promise<void>;
  toggleShoppingItem: (itemId: string) => Promise<void>;
  updateBudget: (budget: number) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  updateDietary: (dietary: DietaryPreference[]) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  refreshPlan: () => Promise<void>;
  clearError: () => void;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLAN'; payload: WeekPlan | null }
  | { type: 'SET_SHOPPING'; payload: ShoppingList | null }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'UPDATE_SHOPPING_ITEMS'; payload: any[] };

const defaultPreferences: UserPreferences = {
  budget: 60,
  goal: 'healthy',
  dietary: [],
  servings: 2,
  locale: 'fr',
  theme: 'system',
  notificationsEnabled: true,
};

const initialState: MealPlanState = {
  weekPlan: null,
  shoppingList: null,
  recipes: [],
  preferences: defaultPreferences,
  isLoading: false,
  error: null,
};

function mealPlanReducer(state: MealPlanState, action: Action): MealPlanState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_PLAN':
      return { ...state, weekPlan: action.payload, isLoading: false };
    case 'SET_SHOPPING':
      return { ...state, shoppingList: action.payload };
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };
    case 'UPDATE_SHOPPING_ITEMS':
      if (!state.shoppingList) return state;
      return {
        ...state,
        shoppingList: { ...state.shoppingList, items: action.payload },
      };
    default:
      return state;
  }
}

export const MealPlanContext = createContext<MealPlanContextType>({
  ...initialState,
  generatePlan: async () => {},
  regenerateFromToday: async () => {},
  toggleShoppingItem: async () => {},
  updateBudget: async () => {},
  updateGoal: async () => {},
  updateDietary: async () => {},
  getRecipeById: () => undefined,
  refreshPlan: async () => {},
  clearError: () => {},
});

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState);

  // Charge le plan courant + préférences au démarrage
  const loadCurrent = useCallback(async () => {
    // Préférences
    const prefsRes = await api.get<UserPreferences>('/preferences');
    if (prefsRes.success && prefsRes.data) {
      dispatch({ type: 'SET_PREFERENCES', payload: prefsRes.data });
    }

    // Plan courant (dernier généré)
    const planRes = await api.get<{
      weekPlan: WeekPlan | null;
      shoppingList: ShoppingList | null;
      recipes: Recipe[];
    }>('/meals/current');

    if (planRes.success && planRes.data) {
      // On charge simplement le plan existant SANS jamais le régénérer automatiquement.
      // (Toute auto-régénération a été retirée : elle changeait le plan involontairement.
      //  L'utilisateur régénère manuellement via le bouton 🔄 s'il le souhaite.)
      dispatch({ type: 'SET_PLAN', payload: planRes.data.weekPlan });
      dispatch({ type: 'SET_SHOPPING', payload: planRes.data.shoppingList });
      dispatch({ type: 'SET_RECIPES', payload: planRes.data.recipes });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chargement UNIQUE au montage : ne se relance pas quand les préférences changent.

  // Charge le plan une seule fois au démarrage de l'app.
  useEffect(() => { loadCurrent(); }, [loadCurrent]);

  const generatePlan = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const response = await api.post<{
      weekPlan: WeekPlan;
      shoppingList: ShoppingList;
      recipes: Recipe[];
    }>('/meals/generate', {
      budget: state.preferences.budget,
      goal: state.preferences.goal,
      dietary: state.preferences.dietary,
      servings: state.preferences.servings,
    });

    if (response.success && response.data) {
      dispatch({ type: 'SET_PLAN', payload: response.data.weekPlan });
      dispatch({ type: 'SET_SHOPPING', payload: response.data.shoppingList });
      dispatch({ type: 'SET_RECIPES', payload: response.data.recipes });
    } else {
      dispatch({ type: 'SET_ERROR', payload: response.message || 'Impossible de générer le plan' });
    }
  }, [state.preferences]);

const regenerateFromToday = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const response = await api.post<{
      weekPlan: WeekPlan;
      shoppingList: ShoppingList;
      recipes: Recipe[];
    }>('/meals/regenerate-from-today', {
      budget: state.preferences.budget,
      goal: state.preferences.goal,
      dietary: state.preferences.dietary,
      servings: state.preferences.servings,
    });

    if (response.success && response.data) {
      dispatch({ type: 'SET_PLAN', payload: response.data.weekPlan });
      dispatch({ type: 'SET_SHOPPING', payload: response.data.shoppingList });
      dispatch({ type: 'SET_RECIPES', payload: response.data.recipes });
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [state.preferences]);

    const toggleShoppingItem = useCallback(async (itemId: string) => {
    if (!state.shoppingList) return;
    // Optimistic update UI d'abord
    const optimisticItems = state.shoppingList.items.map((it: any) =>
      it.id === itemId ? { ...it, checked: !it.checked } : it
    );
    dispatch({ type: 'UPDATE_SHOPPING_ITEMS', payload: optimisticItems });

    // Sync serveur
    await api.patch(`/shopping/${state.shoppingList.id}/items/${itemId}/toggle`);
  }, [state.shoppingList]);

  const updatePreferenceRemote = useCallback(async (partial: Partial<UserPreferences>) => {
    const merged = { ...state.preferences, ...partial };
    dispatch({ type: 'SET_PREFERENCES', payload: merged });
    await api.put('/preferences', partial);

    // Régénère aujourd'hui + le futur selon les nouvelles préférences,
    // en préservant les jours passés (historique figé).
    dispatch({ type: 'SET_LOADING', payload: true });
    const response = await api.post<{
      weekPlan: WeekPlan;
      shoppingList: ShoppingList;
      recipes: Recipe[];
    }>('/meals/regenerate-from-today', {
      budget: merged.budget,
      goal: merged.goal,
      dietary: merged.dietary,
      servings: merged.servings,
    });
    if (response.success && response.data) {
      dispatch({ type: 'SET_PLAN', payload: response.data.weekPlan });
      dispatch({ type: 'SET_SHOPPING', payload: response.data.shoppingList });
      dispatch({ type: 'SET_RECIPES', payload: response.data.recipes });
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [state.preferences]);

  const updateBudget = useCallback((budget: number) => updatePreferenceRemote({ budget }), [updatePreferenceRemote]);
  const updateGoal = useCallback((goal: Goal) => updatePreferenceRemote({ goal }), [updatePreferenceRemote]);
  const updateDietary = useCallback((dietary: DietaryPreference[]) => updatePreferenceRemote({ dietary }), [updatePreferenceRemote]);

  const getRecipeById = useCallback(
    (id: string) => state.recipes.find((r) => r.id === id),
    [state.recipes]
  );

  const refreshPlan = useCallback(async () => {
    await loadCurrent();
  }, [loadCurrent]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  return (
    <MealPlanContext.Provider
      value={{
        ...state,
        generatePlan,
        regenerateFromToday,
        toggleShoppingItem,
        updateBudget,
        updateGoal,
        updateDietary,
        getRecipeById,
        refreshPlan,
        clearError,
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
}
