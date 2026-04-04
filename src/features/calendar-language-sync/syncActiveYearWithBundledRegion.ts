import {
  getActiveCalendarIsUserJsonImport,
  getYearCalendar,
  replaceActiveYear,
  type CalendarYear,
} from '../../entities/calendar';
import { getBundledCalendarJsonForRegion } from '../../entities/calendar/model/bundledCalendarJsonByLanguage';
import { parseValidateAndNormalizeCalendarImport } from '../calendar-import';
import type { BundledRegionChangeCause } from './bundledRegionChangeRegistry';
import {
  BUNDLED_CALENDAR_YEAR,
  type BundledCalendarRegionCode,
} from '../../shared/config/agreedLanguagesAndBundledCalendars';

export function shouldApplyBundledCalendarOnRegionChange(
  activeCalendarYear: number,
): boolean {
  return activeCalendarYear === BUNDLED_CALENDAR_YEAR;
}

/**
 * Подставляет предзагруженный JSON выбранного региона для активного года 2026.
 * Для других лет (импорт) — без замены.
 */
export async function syncActiveYearWithBundledRegion(options: {
  region: BundledCalendarRegionCode;
  activeCalendarYear: number;
  changeCause?: BundledRegionChangeCause;
}): Promise<CalendarYear | null> {
  const { region, activeCalendarYear, changeCause = 'settings' } = options;

  if (!shouldApplyBundledCalendarOnRegionChange(activeCalendarYear)) {
    return null;
  }

  if (
    changeCause === 'app_language' &&
    (await getActiveCalendarIsUserJsonImport())
  ) {
    return null;
  }

  const raw = getBundledCalendarJsonForRegion(region);
  const calendar = parseValidateAndNormalizeCalendarImport(raw);
  await replaceActiveYear(calendar, 'bundled');
  const stored = await getYearCalendar(calendar.year);
  if (!stored) {
    throw new Error('CalendarYear missing after replaceActiveYear.');
  }
  return stored;
}
