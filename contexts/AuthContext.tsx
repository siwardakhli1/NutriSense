// CONTEXT - AuthContext
import React, { createContext, useCallback, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '@/types';
import { api } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string; isOnboarded: boolean } }
  | { type: 'COMPLETE_ONBOARDING' };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isOnboarded: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isOnboarded: (action.payload.user as any).isOnboarded === true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'RESTORE_SESSION':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isOnboarded: action.payload.isOnboarded,
        isLoading: false,
      };
    case 'COMPLETE_ONBOARDING':
      return { ...state, isOnboarded: true };
    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  completeOnboarding: async () => {},
});

const AUTH_STORAGE_KEY = '@nutrisense_auth';
const ONBOARD_STORAGE_KEY = '@nutrisense_onboarded';
const ACCESS_TOKEN_KEY = '@nutrisense_access_token';
const REFRESH_TOKEN_KEY = '@nutrisense_refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurer la session au démarrage
  useEffect(() => {
    (async () => {
      try {
        const [storedAuth, storedOnboarded, accessToken, refreshToken] = await Promise.all([
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
          AsyncStorage.getItem(ONBOARD_STORAGE_KEY),
          AsyncStorage.getItem(ACCESS_TOKEN_KEY),
          AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        ]);

        // Si les tokens sont manquants ou legacy mock → nettoyer tout
        const isValidToken = accessToken && !accessToken.includes('mock');
        if (!storedAuth || !isValidToken) {
          await AsyncStorage.multiRemove([
            AUTH_STORAGE_KEY, ONBOARD_STORAGE_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY,
          ]);
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        // Restaurer les tokens dans le client API
        api.setToken(accessToken);
        if (refreshToken) api.setRefreshToken(refreshToken);

        // Vérifier que la session est encore valide côté serveur
        const check = await api.get('/auth/me');
        if (!check.success) {
          // Token expiré ou compte supprimé côté serveur → on nettoie
          await AsyncStorage.multiRemove([
            AUTH_STORAGE_KEY, ONBOARD_STORAGE_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY,
          ]);
          await api.clearTokens();
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        const { user } = JSON.parse(storedAuth);
        // Utiliser en priorité isOnboarded du backend (source de vérité)
        const backendUser = (check as any).data;
        const isOnboarded = backendUser?.isOnboarded ?? (storedOnboarded === 'true');
        // Mettre à jour l'AsyncStorage si le backend a un statut différent
        if (isOnboarded) {
          await AsyncStorage.setItem(ONBOARD_STORAGE_KEY, 'true');
        }
        dispatch({
          type: 'RESTORE_SESSION',
          payload: { user: backendUser || user, token: accessToken, isOnboarded },
        });
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const response = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      { email, password }
    );

    if (!response.success || !response.data) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: response.message || 'Connexion échouée' };
    }

    const { user, accessToken, refreshToken } = response.data;
    api.setToken(accessToken);
    api.setRefreshToken(refreshToken);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
    if ((user as any).isOnboarded) {
      await AsyncStorage.setItem(ONBOARD_STORAGE_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(ONBOARD_STORAGE_KEY);
    }
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: accessToken } });
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, referralCode?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const response = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/register',
      { name, email, password, ...(referralCode?.trim() ? { referralCode: referralCode.trim() } : {}) }
    );

    if (!response.success || !response.data) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: response.message || 'Inscription échouée' };
    }

    const { user, accessToken, refreshToken } = response.data;
    api.setToken(accessToken);
    api.setRefreshToken(refreshToken);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: accessToken } });
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    await api.clearTokens();
    await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, ONBOARD_STORAGE_KEY]);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const completeOnboarding = useCallback(async () => {
    // Sauvegarder côté backend (persiste entre déconnexions)
    try {
      await api.post('/auth/complete-onboarding');
    } catch (e) {
      console.warn('Failed to save onboarding status on backend', e);
    }
    // Sauvegarder aussi en local pour affichage rapide
    await AsyncStorage.setItem(ONBOARD_STORAGE_KEY, 'true');
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}
