// ==========================================
// CONTEXT - LanguageContext
// Multi-lingue : fr / en / es / it / ar (avec RTL pour AR)
// ==========================================
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Locale, TranslationKeys, RTL_LOCALES } from '@/i18n';

interface LanguageContextType {
  locale: Locale;
  t: TranslationKeys;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
}

export const LanguageContext = createContext<LanguageContextType>({
  locale: 'fr',
  t: translations.fr,
  setLocale: () => {},
  isRTL: false,
});

const LANG_STORAGE_KEY = '@mealplanner_locale';
const VALID_LOCALES: Locale[] = ['fr', 'en', 'es', 'it', 'ar'];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((saved) => {
      if (saved && VALID_LOCALES.includes(saved as Locale)) {
        setLocaleState(saved as Locale);
        applyRTL(saved as Locale);
      }
    });
  }, []);

  const applyRTL = (loc: Locale) => {
    const shouldBeRTL = RTL_LOCALES.includes(loc);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
      // Sur Android/iOS, un vrai changement RTL nécessite un restart de l'app.
      // On applique le changement mais le prochain launch prendra effet complètement.
    }
  };

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    await AsyncStorage.setItem(LANG_STORAGE_KEY, newLocale);
    applyRTL(newLocale);
  }, []);

  const t = translations[locale];
  const isRTL = RTL_LOCALES.includes(locale);

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}
