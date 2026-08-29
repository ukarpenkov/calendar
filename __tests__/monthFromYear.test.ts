/**
 * @format
 */

declare function require(moduleName: string): unknown;

import {
  getCalendarDaysForMonth,
  getUtcDaysInMonth,
} from '../src/entities/calendar';
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';

const bundledCalendar = require('../calendar2027.json');

describe('getCalendarDaysForMonth', () => {
  const calendar = parseValidateAndNormalizeCalendarImport(bundledCalendar);

  it('returns sorted days matching UTC month length for a complete year', () => {
    for (let month = 1; month <= 12; month += 1) {
      const days = getCalendarDaysForMonth(calendar, month);
      expect(days).toHaveLength(getUtcDaysInMonth(calendar.year, month));
      expect(days[0]?.day).toBe(1);
      expect(days[days.length - 1]?.day).toBe(days.length);
    }
  });

  it('returns empty when the year payload does not contain a full month', () => {
    const partialYear = {
      year: calendar.year,
      days: calendar.days.filter(d => d.month === 1),
    };
    expect(getCalendarDaysForMonth(partialYear, 1)).toHaveLength(31);
    expect(getCalendarDaysForMonth(partialYear, 2)).toEqual([]);
  });

  it('returns empty for invalid month index', () => {
    expect(getCalendarDaysForMonth(calendar, 0)).toEqual([]);
    expect(getCalendarDaysForMonth(calendar, 13)).toEqual([]);
  });

  it('returns empty when a month contains the wrong number of day rows', () => {
    const februaryFirst = calendar.days.find(day => day.date === '2027-02-01');
    expect(februaryFirst).toBeDefined();

    const corruptedYear = {
      year: calendar.year,
      days: [...calendar.days, februaryFirst!],
    };

    expect(getCalendarDaysForMonth(corruptedYear, 2)).toEqual([]);
  });
});
