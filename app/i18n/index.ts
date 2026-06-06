import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

// Intentar obtener el idioma guardado
const getSavedLanguage = async () => {
  try {
    // En React Native, importamos AsyncStorage de esta forma
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const savedLanguage = await AsyncStorage.getItem('repsfinder_language');
    return savedLanguage || 'es';
  } catch (error) {
    console.error('Error loading saved language:', error);
    return 'es';
  }
};

// Inicialización con promesa para obtener el idioma guardado
getSavedLanguage().then(savedLanguage => {
  i18n
    .use(initReactI18next)
    .init({
      lng: savedLanguage,
      fallbackLng: 'es',
      resources: {
        es: { translation: translations.es },
        en: { translation: translations.en },
      },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      nsMode: 'default'
    }
  });
});

export default i18n;
