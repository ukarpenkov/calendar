import type { AppLanguage } from '../../../shared/lib/i18n';
import { getCalendarImagesForDays } from './holidayImages';
import { buildMonthDetail, type CalendarMonthDetail } from './month-detail';
import { getCalendarDaysForMonth } from './month-from-year';
import type { CalendarMonthSummary } from './year-summary';
import type { CalendarYear } from './types';

export type CalendarYearMonthDetails = Partial<
  Record<number, CalendarMonthDetail>
>;

export interface CalendarYearViewCache {
  monthDetails: CalendarYearMonthDetails;
  monthSummaries: CalendarMonthSummary[];
  imageSources: ReturnType<typeof getCalendarImagesForDays>;
}

function buildMonthSummaryFromDetail(
  detail: CalendarMonthDetail,
): CalendarMonthSummary {
  return {
    month: detail.month,
    label: detail.label,
    shortLabel: detail.shortLabel,
    totalDays: detail.totalDays,
    workingDays: detail.workingDays,
    nonWorkingDays: detail.nonWorkingDays,
    workHours: detail.workHours,
    weeks: detail.weeks,
  };
}

export function buildCalendarYearViewCache(
  calendar: CalendarYear,
  language: AppLanguage,
): CalendarYearViewCache {
  const monthDetails: CalendarYearMonthDetails = {};
  const monthSummaries: CalendarMonthSummary[] = [];

  for (let month = 1; month <= 12; month += 1) {
    const days = getCalendarDaysForMonth(calendar, month);
    if (days.length === 0) {
      continue;
    }

    const detail = buildMonthDetail(calendar.year, month, days, language);
    monthDetails[month] = detail;
    monthSummaries.push(buildMonthSummaryFromDetail(detail));
  }

  return {
    monthDetails,
    monthSummaries,
    imageSources: getCalendarImagesForDays(calendar.days),
  };
}
