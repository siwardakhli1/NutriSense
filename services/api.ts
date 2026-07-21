// ==========================================
// SERVICE - API Client v2
// Ajouts vs v1 : refresh token automatique, storage sécurisé,
// timeout configurable, retry sur 401 TOKEN_EXPIRED.
// Compatible AuthContext existant (méthodes get/post/put/delete).
// ==========================================
import { ApiResponse } from '@/types';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Sur téléphone réel : remplace localhost par l'IP de ton PC (ex: 192.168.1.42)
const API_BASE_URL = 'https://nutrisense-2026.onrender.com/api'; // ☁️ Production (Render)
// const API_BASE_URL = 'http://10.0.2.2:3000/api';             // 💻 Local (émulateur)
const TIMEOUT_MS = 60000;
 

const ACCESS_TOKEN_KEY = '@nutrisense_access_token';
const REFRESH_TOKEN_KEY = '@nutrisense_refresh_token';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshing: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.restoreTokens();
  }

  private async restoreTokens() {
    try {
      const [access, refresh] = await Promise.all([
        AsyncStorage.getItem(ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      ]);
      this.token = access;
      this.refreshToken = refresh;
    } catch {
      /* silent */
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    else AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  setRefreshToken(token: string | null) {
    this.refreshToken = token;
    if (token) AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    else AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async clearTokens() {
    this.token = null;
    this.refreshToken = null;
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const state = await Promise.race([
        NetInfo.fetch(),
        new Promise<{ isConnected: boolean }>((resolve) =>
          setTimeout(() => resolve({ isConnected: true }), 3000)
        ),
      ]);
      return state.isConnected ?? true;
    } catch {
      return true;
    }
  }

  /**
   * Tente de rafraîchir le token. Retourne true si succès.
   * Gère le cas de plusieurs requêtes qui tombent en 401 en même temps.
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshing) return this.refreshing;
    if (!this.refreshToken) return false;

    this.refreshing = (async () => {
      try {
        const res = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        this.setToken(data.accessToken);
        this.setRefreshToken(data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshing = null;
      }
    })();

    return this.refreshing;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    isRetry = false
  ): Promise<ApiResponse<T>> {
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return {
        success: false,
        error: 'NO_CONNECTION',
        message: 'Pas de connexion internet',
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();

      // Access token expiré → tenter refresh + retry unique
      if (response.status === 401 && data?.error === 'TOKEN_EXPIRED' && !isRetry) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) return this.request<T>(method, endpoint, body, true);
        await this.clearTokens();
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'REQUEST_FAILED',
          message: data.message || 'Une erreur est survenue',
        };
      }

      return { success: true, data };
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        return { success: false, error: 'TIMEOUT', message: 'Le serveur met trop de temps à répondre' };
      }
      return { success: false, error: 'NETWORK_ERROR', message: 'Impossible de contacter le serveur' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body);
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body);
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const api = new ApiClient(API_BASE_URL);
