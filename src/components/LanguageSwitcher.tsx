import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { flags } from '../assets/flags';
import type { SupportedLanguage } from '../assets/flags';

interface Language {
  code: SupportedLanguage;
  name: string;
}

const languages: Language[] = [
  {
    code: 'pt-BR',
    name: 'Português'
  },
  {
    code: 'en',
    name: 'English'
  },
  {
    code: 'es',
    name: 'Español'
  }
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    document.documentElement.lang = lng;
    setIsOpen(false);
  };

  // Mapeia 'pt' para 'pt-BR' para compatibilidade com as flags
  const normalizeLanguage = (lang: string): SupportedLanguage => {
    if (lang === 'pt') return 'pt-BR';
    return (lang as SupportedLanguage) || 'pt-BR';
  };

  const currentLanguage = languages.find(lang =>
    lang.code === normalizeLanguage(i18n.language)
  ) || languages[0];

  useEffect(() => {
    // Aplicar idioma do localStorage ao carregar o componente
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== i18n.language) {
      const normalizedLanguage = normalizeLanguage(savedLanguage);
      if (['pt-BR', 'en', 'es'].includes(normalizedLanguage)) {
        i18n.changeLanguage(normalizedLanguage);
        document.documentElement.lang = normalizedLanguage;
      }
    }
  }, [i18n]);

  return (
    <div className="language-switcher relative">
      <button
        className="btn-language flex items-center gap-2 px-3 py-2 bg-transparent border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={flags[currentLanguage.code]}
          alt={currentLanguage.name}
          className="w-6 h-4 object-cover rounded-sm"
        />
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-20 min-w-[160px]">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${normalizeLanguage(i18n.language) === language.code ? 'bg-gray-700 text-blue-400' : 'text-white'
                  }`}
                onClick={() => changeLanguage(language.code)}
              >
                <img
                  src={flags[language.code]}
                  alt={language.name}
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <span>{language.name}</span>
                {normalizeLanguage(i18n.language) === language.code && (
                  <span className="ml-auto text-blue-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
