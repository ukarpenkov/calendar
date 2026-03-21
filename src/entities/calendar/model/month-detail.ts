import {
  getMonthLabel,
  getMonthShortLabel,
  type AppLanguage,
} from '../../../shared/lib/i18n';
import { buildMonthWeeks, type CalendarMonthWeek } from './month-helpers';
import type { CalendarDay } from './types';

export interface CalendarMonthDetail {
  year: number;
  month: number;
  label: string;
  shortLabel: string;
  totalDays: number;
  workingDays: number;
  nonWorkingDays: number;
  workHours: number;
  weeks: CalendarMonthWeek[];
  days: CalendarDay[];
}

export function buildMonthDetail(
  year: number,
  month: number,
  days: CalendarDay[],
  language: AppLanguage,
): CalendarMonthDetail {
  const workingDays = days.filter(
    day => day.type === 'workday' || day.type === 'shortened',
  ).length;
  const workHours = days.reduce((sum, day) => sum + day.workHours, 0);

  return {
    year,
    month,
    label: getMonthLabel(language, month),
    shortLabel: getMonthShortLabel(language, month),
    totalDays: days.length,
    workingDays,
    nonWorkingDays: days.length - workingDays,
    workHours,
    weeks: buildMonthWeeks(days),
    days,
  };
}
