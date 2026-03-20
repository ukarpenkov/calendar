import type { CalendarDay, CalendarYear } from './types';

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTH_SHORT_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export interface CalendarMonthWeek {
  isoWeek: number;
  days: Array<CalendarDay | null>;
}

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

function parseIsoDateParts(value: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = value.split('-').map(Number);

  return { year, month, day };
}

function toUtcDate(value: string): Date {
  const { year, month, day } = parseIsoDateParts(value);
  return new Date(Date.UTC(year, month - 1, day));
}

function getIsoWeekNumber(value: string): number {
  const date = toUtcDate(value);
  const utcDay = date.getUTCDay() || 7;

  date.setUTCDate(date.getUTCDate() + 4 - utcDay);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diffInDays = Math.floor(
    (date.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000),
  );

  return Math.ceil((diffInDays + 1) / 7);
}

function buildMonthWeeks(days: CalendarDay[]): CalendarMonthWeek[] {
  if (days.length === 0) {
    return [];
  }

  const weeks: CalendarMonthWeek[] = [];
  let currentWeek = Array<CalendarDay | null>(7).fill(null);

  for (const day of days) {
    currentWeek[day.weekday - 1] = day;

    const isEndOfWeek = day.weekday === 7;
    const isEndOfMonth = day.day === days.length;

    if (isEndOfWeek || isEndOfMonth) {
      weeks.push({
        isoWeek: getIsoWeekNumber(day.date),
        days: currentWeek,
      });

      currentWeek = Array<CalendarDay | null>(7).fill(null);
    }
  }

  return weeks;
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
