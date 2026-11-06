import type {
  AgreedAppLanguageCode,
  BundledCalendarRegionCode,
} from '../../../shared/config/agreedLanguagesAndBundledCalendars';
import { appLanguageToDefaultBundledRegion } from '../../../shared/lib/bundledCalendarRegion';

/**
 * Статические require для Metro. Имена файлов должны совпадать с
 * `BUNDLED_CALENDAR_JSON_FILENAME_BY_REGION` в `agreedLanguagesAndBundledCalendars.ts`.
 */
const BUNDLED_CALENDAR_JSON_BY_REGION = {
  ru: require('../../../../assets/calendars/calendar2027.json'),
  tr: require('../../../../assets/calendars/calendar2027TR.json'),
  id: require('../../../../assets/calendars/calendar2027IDN.json'),
  ja: require('../../../../assets/calendars/calendar2027JP.json'),
  es: require('../../../../assets/calendars/calendar2027MX.json'),
} as const satisfies Record<BundledCalendarRegionCode, unknown>;

export function getBundledCalendarJsonForRegion(
  region: BundledCalendarRegionCode,
): unknown {
  return BUNDLED_CALENDAR_JSON_BY_REGION[region];
}

export function getBundledCalendarJsonObject(
  language: AgreedAppLanguageCode,
): unknown {
  return getBundledCalendarJsonForRegion(
    appLanguageToDefaultBundledRegion(language),
  );
}
