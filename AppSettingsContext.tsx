import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language } from './translations';
import { Currency } from './currencies';

type Theme = 'dark' | 'light';

type AppSettings = {
  language: Language;
  currency: Currency;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  setTheme: (theme: Theme) => void;
  t: typeof translations.es;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    card: string;
  };
};

const AppSettingsContext = createContext<AppSettings | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('es');
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('app_language');
      const savedCurr = await AsyncStorage.getItem('app_currency');
      const savedTheme = await AsyncStorage.getItem('app_theme');

      if (savedLang) setLanguageState(savedLang as Language);
      if (savedCurr) setCurrencyState(savedCurr as Currency);
      if (savedTheme) setThemeState(savedTheme as Theme);
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('app_language', lang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const setCurrency = async (curr: Currency) => {
    try {
      setCurrencyState(curr);
      await AsyncStorage.setItem('app_currency', curr);
    } catch (error) {
      console.log('Error saving currency:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const t = translations[language];

  const colors = theme === 'dark' 
    ? {
        background: '#000',
        surface: '#0a0a0a',
        text: '#fff',
        textSecondary: '#888',
        primary: '#00e5b0',
        border: '#1a1a1a',
        card: '#0f0f0f',
      }
    : {
        background: '#fff',
        surface: '#f5f5f5',
        text: '#000',
        textSecondary: '#666',
        primary: '#00c896',
        border: '#e0e0e0',
        card: '#fff',
      };

  return (
    <AppSettingsContext.Provider
      value={{
        language,
        currency,
        theme,
        setLanguage,
        setCurrency,
        setTheme,
        t,
        colors,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};