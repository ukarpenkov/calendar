/**
 * @format
 */

import {
  getHolidayDisplayName,
  type CalendarDay,
} from '../src/entities/calendar';

function baseDay(overrides: Partial<CalendarDay>): CalendarDay {
  return {
    date: '2026-01-01',
    year: 2026,
    month: 1,
    day: 1,
    weekday: 4,
    type: 'holiday',
    holidayNameRu: null,
    holidayNameEn: null,
    holidayNameTr: null,
    holidayNameId: null,
    holidayNameJa: null,
    isShortened: false,
    workHours: 0,
    ...overrides,
  };
}

describe('getHolidayDisplayName', () => {
  it('prefers locale-specific columns with EN/RU fallback', () => {
    const day = baseDay({
      holidayNameRu: 'RU',
      holidayNameEn: 'EN',
      holidayNameTr: 'TR',
      holidayNameId: 'ID',
      holidayNameJa: 'JA',
    });
    expect(getHolidayDisplayName(day, 'tr')).toBe('TR');
    expect(getHolidayDisplayName(day, 'id')).toBe('ID');
    expect(getHolidayDisplayName(day, 'ja')).toBe('JA');
    expect(getHolidayDisplayName(day, 'ru')).toBe('RU');
    expect(getHolidayDisplayName(day, 'en')).toBe('EN');
  });

  it('falls back when a locale-specific column is absent', () => {
    const day = baseDay({
      holidayNameRu: 'RU',
      holidayNameEn: 'EN',
    });
    expect(getHolidayDisplayName(day, 'tr')).toBe('EN');
    expect(
      getHolidayDisplayName(
        baseDay({ holidayNameRu: 'RU', holidayNameEn: null }),
        'tr',
      ),
    ).toBe('RU');
  });

  it('returns null when no names are present', () => {
    expect(getHolidayDisplayName(baseDay({}), 'en')).toBeNull();
  });
});
