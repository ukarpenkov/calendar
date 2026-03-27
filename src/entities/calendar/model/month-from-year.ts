import type { CalendarDay, CalendarYear } from './types';

/** UTC day count for `month` (1–12) in `year`. */
export function getUtcDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Returns days for `month` from an in-memory full-year payload when the slice
 * matches the expected month length; otherwise an empty array (invalid data).
 */
export function getCalendarDaysForMonth(
  calendar: CalendarYear,
  month: number,
): CalendarDay[] {
  if (month < 1 || month > 12) {
    return [];
  }

  const expected = getUtcDaysInMonth(calendar.year, month);
  const monthDays = calendar.days.filter(
    day => day.year === calendar.year && day.month === month,
  );

  if (monthDays.length !== expected) {
    return [];
  }

  return [...monthDays].sort((a, b) => a.day - b.day);
}
