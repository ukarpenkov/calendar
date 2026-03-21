import type { CalendarDay } from './types';

export interface CalendarMonthWeek {
  isoWeek: number;
  days: Array<CalendarDay | null>;
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

export function buildMonthWeeks(days: CalendarDay[]): CalendarMonthWeek[] {
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
