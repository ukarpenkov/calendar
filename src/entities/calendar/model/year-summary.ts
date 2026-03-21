import {
  getMonthLabel,
  getMonthShortLabel,
  type AppLanguage,
} from '../../../shared/lib/i18n';
import { buildMonthWeeks, type CalendarMonthWeek } from './month-helpers';
import type { CalendarYear } from './types';

export interface CalendarMonthSummary {
  month: number;
  label: string;
  shortLabel: string;
  totalDays: number;
  workingDays: number;
  nonWorkingDays: number;
  workHours: number;
  weeks: CalendarMonthWeek[];
}

export function buildYearMonthSummaries(
  calendar: CalendarYear,
  language: AppLanguage,
): CalendarMonthSummary[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const days = calendar.days.filter(day => day.month === month);

    const workingDays = days.filter(
      day => day.type === 'workday' || day.type === 'shortened',
    ).length;
    const nonWorkingDays = days.length - workingDays;
    const workHours = days.reduce((sum, day) => sum + day.workHours, 0);

    return {
      month,
      label: getMonthLabel(language, month),
      shortLabel: getMonthShortLabel(language, month),
      totalDays: days.length,
      workingDays,
      nonWorkingDays,
      workHours,
      weeks: buildMonthWeeks(days),
    };
  });
}
