/**
 * @format
 */

import {
  buildYearMonthSummaries,
  type CalendarYear,
} from '../src/entities/calendar';

describe('buildYearMonthSummaries', () => {
  it('builds month aggregates and calendar weeks from stored days', () => {
    const calendar: CalendarYear = {
      year: 2026,
      days: [
        {
          date: '2026-01-01',
          year: 2026,
          month: 1,
          day: 1,
          weekday: 4,
          type: 'holiday',
          holidayNameRu: 'Новый год',
          holidayNameEn: "New Year's Day",
          isShortened: false,
          workHours: 0,
        },
        {
          date: '2026-01-02',
          year: 2026,
          month: 1,
          day: 2,
          weekday: 5,
          type: 'workday',
          holidayNameRu: null,
          holidayNameEn: null,
          isShortened: false,
          workHours: 8,
        },
        {
          date: '2026-01-03',
          year: 2026,
          month: 1,
          day: 3,
          weekday: 6,
          type: 'weekend',
          holidayNameRu: null,
          holidayNameEn: null,
          isShortened: false,
          workHours: 0,
        },
        {
          date: '2026-01-04',
          year: 2026,
          month: 1,
          day: 4,
          weekday: 7,
          type: 'shortened',
          holidayNameRu: null,
          holidayNameEn: null,
          isShortened: true,
          workHours: 7,
        },
      ],
    };

    const january = buildYearMonthSummaries(calendar)[0];

    expect(january.label).toBe('January');
    expect(january.totalDays).toBe(4);
    expect(january.workingDays).toBe(2);
    expect(january.nonWorkingDays).toBe(2);
    expect(january.workHours).toBe(15);
    expect(january.weeks).toHaveLength(1);
    expect(january.weeks[0]).toMatchObject({
      isoWeek: 1,
    });
    expect(january.weeks[0]?.days.map(day => day?.day ?? null)).toEqual([
      null,
      null,
      null,
      1,
      2,
      3,
      4,
    ]);
  });
});
