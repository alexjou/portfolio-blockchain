// Importando as bandeiras locais
import brazilFlag from './brazil.svg';
import usaFlag from './usa.svg';
import spainFlag from './spain.svg';

// Tipo das linguagens suportadas
export type SupportedLanguage = 'pt-BR' | 'en' | 'es' | 'pt';

// Interface para o objeto flags
export interface FlagImages {
  'pt-BR': string;
  'en': string;
  'es': string;
  'pt': string;
}

// Flags para cada idioma
export const flags: FlagImages = {
  'pt-BR': brazilFlag,
  'en': usaFlag,
  'es': spainFlag,
  'pt': brazilFlag // Usamos a mesma bandeira do Brasil para o código 'pt'
};
