import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AppSettingsContextType {
  t: (key: string, options?: any) => string;
  currency: string;
  setCurrency: (c: string) => void;
  setLanguage: (l: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');
  const { t, i18n } = useTranslation();

  const setCurrency = useCallback((c: string) => setCurrencyState(c), []);

  const setLanguage = useCallback((l: string) => {
    i18n.changeLanguage(l);
  }, [i18n]);

  return (
    <AppSettingsContext.Provider value={{ t, currency, setCurrency, setLanguage }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettingsContextType {
  const context = useContext(AppSettingsContext);
  if (!context) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return context;
}
