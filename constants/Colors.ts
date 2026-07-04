// ==========================================
// COLORS - Système de thème global
// ==========================================
import { ThemeColors } from '@/types';

export const Colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    primary: '#1A6B4A',
    primaryLight: '#D4F0E0',
    primaryDark: '#0E4430',
    accent: '#D4853A',
    accentLight: '#FDEBD3',
    background: '#F5F3EE',
    surface: '#FFFFFF',
    surfaceVariant: 'rgba(255,255,255,0.7)',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#AAAAAA',
    border: 'rgba(0,0,0,0.06)',
    error: '#E53935',
    success: '#43A047',
    warning: '#FB8C00',
    card: '#FFFFFF',
    tabBar: 'rgba(255,255,255,0.85)',
    tabBarInactive: '#AAAAAA',
    statusBar: 'dark',
  },
  dark: {
    primary: '#4ADE80',
    primaryLight: '#1A3A28',
    primaryDark: '#22C55E',
    accent: '#F59E0B',
    accentLight: '#3D2E1A',
    background: '#0F1512',
    surface: '#1A2420',
    surfaceVariant: 'rgba(255,255,255,0.06)',
    text: '#F0F0F0',
    textSecondary: '#A0A0A0',
    textMuted: '#666666',
    border: 'rgba(255,255,255,0.08)',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
    card: '#1E2D27',
    tabBar: 'rgba(15,21,18,0.9)',
    tabBarInactive: '#555555',
    statusBar: 'light',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 32,
  hero: 42,
} as const;
