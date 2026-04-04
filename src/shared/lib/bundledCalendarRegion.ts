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
