/**
 * @format
 */

import { getVacationDaysInRange } from '../src/features/vacation/lib/vacation-utils';
import type { CalendarDay } from '../src/entities/calendar/model/types';

function makeDay(
  date: string,
  day: number,
  weekday: number,
  type: CalendarDay['type'],
): CalendarDay {
  return {
    date,
    year: 2026,
    month: 1,
    day,
    weekday,
    type,
    holidayNameRu: type === 'holiday' ? 'Holiday' : null,
    holidayNameEn: type === 'holiday' ? 'Holiday' : null,
    holidayNameTr: null,
    holidayNameId: null,
    holidayNameJa: null,
    isShortened: type === 'shortened',
    workHours: type === 'workday' ? 8 : type === 'shortened' ? 7 : 0,
  };
}

// January 2026: 1=Thu, 7=Wed (holidays), 8=Thu (shortened)
const januaryDays: CalendarDay[] = [
  makeDay('2026-01-01', 1, 4, 'holiday'),   // Thu — holiday
  makeDay('2026-01-02', 2, 5, 'workday'),    // Fri
  makeDay('2026-01-03', 3, 6, 'weekend'),    // Sat
  makeDay('2026-01-04', 4, 7, 'weekend'),    // Sun
  makeDay('2026-01-05', 5, 1, 'workday'),    // Mon
  makeDay('2026-01-06', 6, 2, 'workday'),    // Tue
  makeDay('2026-01-07', 7, 3, 'holiday'),    // Wed — holiday
  makeDay('2026-01-08', 8, 4, 'shortened'),  // Thu
  makeDay('2026-01-09', 9, 5, 'workday'),    // Fri
  makeDay('2026-01-10', 10, 6, 'weekend'),   // Sat
];

describe('getVacationDaysInRange', () => {
  it('counts 5 workday-only range', () => {
    // Jan 2 (Fri), 5 (Mon), 6 (Tue), 9 (Fri) = 4 workdays in range Jan 2-9
    // but we want exactly 5 workdays — use wider range
    // Jan 2, 5, 6, 9 = 4 workdays between Jan 2 and Jan 9
    const result = getVacationDaysInRange('2026-01-02', '2026-01-09', januaryDays);
    expect(result.workDays).toBe(4);
  });

  it('does not count weekends', () => {
    const result = getVacationDaysInRange('2026-01-03', '2026-01-04', januaryDays);
    expect(result.totalDays).toBe(2);
    expect(result.workDays).toBe(0);
  });

  it('does not count holidays', () => {
    const result = getVacationDaysInRange('2026-01-01', '2026-01-01', januaryDays);
    expect(result.totalDays).toBe(1);
    expect(result.workDays).toBe(0);
  });

  it('does not count shortened days', () => {
    const result = getVacationDaysInRange('2026-01-08', '2026-01-08', januaryDays);
    expect(result.totalDays).toBe(1);
    expect(result.workDays).toBe(0);
  });

  it('returns zeros when endDate < startDate', () => {
    const result = getVacationDaysInRange('2026-01-10', '2026-01-01', januaryDays);
    expect(result).toEqual({ totalDays: 0, workDays: 0, preHolidayDates: [] });
  });

  it('includes day before holiday in preHolidayDates', () => {
    // Jan 6 (Tue) is before Jan 7 (holiday)
    const result = getVacationDaysInRange('2026-01-01', '2026-01-09', januaryDays);
    expect(result.preHolidayDates).toContain('2026-01-06');
  });

  it('does not include day before weekend in preHolidayDates', () => {
    // Jan 2 (Fri) is before Jan 3 (Sat) — weekend, not holiday
    const result = getVacationDaysInRange('2026-01-01', '2026-01-10', januaryDays);
    expect(result.preHolidayDates).not.toContain('2026-01-02');
  });

  it('returns correct totalDays count', () => {
    const result = getVacationDaysInRange('2026-01-01', '2026-01-10', januaryDays);
    expect(result.totalDays).toBe(10);
  });
});
