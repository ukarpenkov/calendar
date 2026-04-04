import type {
  AgreedAppLanguageCode,
  BundledCalendarRegionCode,
} from '../config/agreedLanguagesAndBundledCalendars';

/** Для `en` в репозитории один производственный набор с `ru` (`calendar2026.json`). */
export function appLanguageToDefaultBundledRegion(
  language: AgreedAppLanguageCode,
): BundledCalendarRegionCode {
  return language === 'en' ? 'ru' : language;
}

/**
 * Регион bundled для подстановки в SQLite при ручной смене языка в настройках.
 * Для `en` — `null`: календарь не заменяем (вариант A, `docs/2026-04-04-languages-and-bundled-calendars-plan.md`).
 */
export function getBundledRegionToApplyOnManualAppLanguageChange(
  nextLanguage: AgreedAppLanguageCode,
): BundledCalendarRegionCode | null {
  if (nextLanguage === 'en') {
    return null;
  }
  return appLanguageToDefaultBundledRegion(nextLanguage);
}
