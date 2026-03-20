import {
  buildMonthWeeks,
  MONTH_LABELS,
  MONTH_SHORT_LABELS,
  type CalendarMonthWeek,
} from './month-helpers';
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
): CalendarMonthSummary[] {
  return MONTH_LABELS.map((label, index) => {
    const month = index + 1;
    const days = calendar.days.filter(day => day.month === month);

    const workingDays = days.filter(
      day => day.type === 'workday' || day.type === 'shortened',
    ).length;
    const nonWorkingDays = days.length - workingDays;
    const workHours = days.reduce((sum, day) => sum + day.workHours, 0);

    return {
      month,
      label,
      shortLabel: MONTH_SHORT_LABELS[index],
      totalDays: days.length,
      workingDays,
      nonWorkingDays,
      workHours,
      weeks: buildMonthWeeks(days),
    };
  });
}
