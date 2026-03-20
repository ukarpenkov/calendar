import {
  buildMonthWeeks,
  MONTH_LABELS,
  MONTH_SHORT_LABELS,
  type CalendarMonthWeek,
} from './month-helpers';
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
): CalendarMonthDetail {
  const monthIndex = month - 1;
  const workingDays = days.filter(
    day => day.type === 'workday' || day.type === 'shortened',
  ).length;
  const workHours = days.reduce((sum, day) => sum + day.workHours, 0);

  return {
    year,
    month,
    label: MONTH_LABELS[monthIndex] ?? `Month ${month}`,
    shortLabel: MONTH_SHORT_LABELS[monthIndex] ?? String(month),
    totalDays: days.length,
    workingDays,
    nonWorkingDays: days.length - workingDays,
    workHours,
    weeks: buildMonthWeeks(days),
    days,
  };
}
