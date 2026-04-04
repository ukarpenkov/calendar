/**
 * Зафиксированный минимум языков UI и соответствующих bundled JSON на активный год (чеклист п.1
 * `docs/2026-04-04-languages-and-bundled-calendars-plan.md`).
 *
 * Дополнительные страны — отдельными итерациями; новые коды добавлять здесь и в Metro/bundler.
 *
 * Политика для `en`: тот же производственный набор, что и для `ru` (`calendar2026.json`), при
 * автоматическом выборе стартового календаря; отдельного «английского» региона в bundled нет.
 */

export const BUNDLED_CALENDAR_YEAR = 2026 as const;

/** Порядок — ориентир для UI-списков; не менять без согласования с настройками/миграциями. */
export const AGREED_APP_LANGUAGE_CODES = ['ru', 'en', 'tr', 'id', 'ja'] as const;

export type AgreedAppLanguageCode = (typeof AGREED_APP_LANGUAGE_CODES)[number];

/** Имя файла в корне репозитория (как у текущего `require('../../../../calendar2026.json')`). */
export const BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE = {
  ru: 'calendar2026.json',
  en: 'calendar2026.json',
  tr: 'calendar2026TR.json',
  id: 'calendar2026IDN.json',
  ja: 'calendar2026JP.json',
} as const satisfies Record<AgreedAppLanguageCode, string>;
