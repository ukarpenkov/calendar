/**
 * @format
 */

import { buildMonthDetail } from '../src/entities/calendar';

describe('buildMonthDetail', () => {
  it('builds month totals and week rows outside the UI layer', () => {
    const detail = buildMonthDetail(
      2026,
      1,
      [
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
      'en',
    );

    expect(detail.label).toBe('January');
    expect(detail.totalDays).toBe(4);
    expect(detail.workingDays).toBe(2);
    expect(detail.nonWorkingDays).toBe(2);
    expect(detail.workHours).toBe(15);
    expect(detail.weeks).toHaveLength(1);
    expect(detail.weeks[0]?.days.map(day => day?.day ?? null)).toEqual([
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
