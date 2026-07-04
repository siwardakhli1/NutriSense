import { fr } from './fr';
import { en } from './en';
import { es } from './es';
import { it } from './it';
import { ar } from './ar';

export const translations = { fr, en, es, it, ar } as const;
export type Locale = keyof typeof translations;
export type { TranslationKeys } from './fr';

// Langues avec écriture de droite à gauche
export const RTL_LOCALES: Locale[] = ['ar'];

// Métadonnées d'affichage pour le sélecteur de langue
export const LOCALE_LABELS: Record<Locale, { native: string; flag: string }> = {
  fr: { native: 'Français', flag: '🇫🇷' },
  en: { native: 'English', flag: '🇬🇧' },
  es: { native: 'Español', flag: '🇪🇸' },
  it: { native: 'Italiano', flag: '🇮🇹' },
  ar: { native: 'العربية', flag: '🇸🇦' },
};
