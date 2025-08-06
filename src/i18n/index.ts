import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Tradução direta para desenvolvimento e fallback
import ptBR from '../../public/locales/pt-BR/translation.json';
import en from '../../public/locales/en/translation.json';
import es from '../../public/locales/es/translation.json';

const resources = {
  'pt-BR': { translation: ptBR },
  'en': { translation: en },
  'es': { translation: es }
};

i18n
  // Detecta o idioma do usuário
  .use(LanguageDetector)
  // Carrega traduções usando http (pode ser usado em SSR)
  .use(Backend)
  // Passa o i18n para react-i18next
  .use(initReactI18next)
  // Inicializa i18next
  .init({
    resources, // Adiciona as traduções diretamente
    fallbackLng: {
      'pt': ['pt-BR'],
      'default': ['pt-BR']
    },
    supportedLngs: ['pt-BR', 'en', 'es', 'pt'],
    debug: import.meta.env.DEV,

    // Mapeia códigos de idioma que não são suportados diretamente
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,

    interpolation: {
      escapeValue: false, // não é necessário para o React
    },

    // Opções de detecção de idioma
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    // Carrega traduções do diretório /public/locales
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
