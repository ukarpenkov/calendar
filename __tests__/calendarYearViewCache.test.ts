/**
 * @format
 */

declare function require(moduleName: string): unknown;

import {
  buildCalendarYearViewCache,
  getUtcDaysInMonth,
} from '../src/entities/calendar';
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';

const bundledCalendar = require('../calendar2027.json');

describe('buildCalendarYearViewCache', () => {
  const calendar = parseValidateAndNormalizeCalendarImport(bundledCalendar);

  it('prepares month details, summaries, and image sources once per active year', () => {
    const cache = buildCalendarYearViewCache(calendar, 'en');

    expect(cache.monthSummaries).toHaveLength(12);
    expect(Object.keys(cache.monthDetails)).toHaveLength(12);
    expect(cache.monthDetails[5]?.totalDays).toBe(
      getUtcDaysInMonth(calendar.year, 5),
    );
    expect(cache.monthSummaries[4]?.label).toBe('May');
    expect(cache.imageSources.length).toBeGreaterThan(0);
  });
});
