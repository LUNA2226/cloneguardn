import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import ptTranslations from './locales/pt.json';
import esTranslations from './locales/es.json';
i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslations
    },
    pt: {
      translation: ptTranslations
    },
    es: {
      translation: esTranslations
    }
  },
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false
  }
});
export default i18n;