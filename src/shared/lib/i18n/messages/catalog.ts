import { enTranslations, type TranslationKey } from './en';
import { esTranslations } from './es';
import { idTranslations } from './id';
import { jaTranslations } from './ja';
import { ruTranslations } from './ru';
import { trTranslations } from './tr';

export const translations = {
  en: enTranslations,
  ru: ruTranslations,
  tr: trTranslations,
  id: idTranslations,
  ja: jaTranslations,
  es: esTranslations,
} as const;

export type { TranslationKey };
