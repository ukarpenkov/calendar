import type { AgreedAppLanguageCode } from '../../../shared/config/agreedLanguagesAndBundledCalendars';

/**
 * Статические require для Metro. Имена файлов должны совпадать с
 * `BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE` в `agreedLanguagesAndBundledCalendars.ts`.
 */
const BUNDLED_CALENDAR_JSON_BY_LANGUAGE = {
  ru: require('../../../../calendar2026.json'),
  en: require('../../../../calendar2026.json'),
  tr: require('../../../../calendar2026TR.json'),
  id: require('../../../../calendar2026IDN.json'),
  ja: require('../../../../calendar2026JP.json'),
} as const satisfies Record<AgreedAppLanguageCode, unknown>;

export function getBundledCalendarJsonObject(
  language: AgreedAppLanguageCode,
): unknown {
  return BUNDLED_CALENDAR_JSON_BY_LANGUAGE[language];
}
