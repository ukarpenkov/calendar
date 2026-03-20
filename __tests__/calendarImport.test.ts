/**
 * @format
 */

declare function require(moduleName: string): unknown;

import {
  CalendarImportValidationError,
  normalizeCalendarImport,
  parseCalendarImportJson,
  parseValidateAndNormalizeCalendarImport,
  validateCalendarImportData,
} from '../src/features/calendar-import';

const bundledCalendar = require('../calendar2026.json');

function expectValidationError(callback: () => unknown) {
  try {
    callback();
    throw new Error('Expected CalendarImportValidationError to be thrown.');
  } catch (error) {
    expect(error).toBeInstanceOf(CalendarImportValidationError);
    return error as CalendarImportValidationError;
  }
}

describe('calendar import pipeline', () => {
  it('normalizes the bundled 2026 calendar into a full year', () => {
    const calendar = parseValidateAndNormalizeCalendarImport(bundledCalendar);

    expect(calendar.year).toBe(2026);
    expect(calendar.days).toHaveLength(365);
    expect(new Set(calendar.days.map(day => day.date)).size).toBe(365);

    expect(calendar.days[0]).toMatchObject({
      date: '2026-01-01',
      weekday: 4,
      type: 'holiday',
      holidayNameRu: 'Новый год',
      holidayNameEn: "New Year's Day",
      isShortened: false,
      workHours: 0,
    });

    expect(
      calendar.days.find(day => day.date === '2026-03-08'),
    ).toMatchObject({
      type: 'holiday',
      workHours: 0,
    });

    expect(
      calendar.days.find(day => day.date === '2026-04-30'),
    ).toMatchObject({
      type: 'shortened',
      isShortened: true,
      workHours: 7,
    });

    expect(
      calendar.days.find(day => day.date === '2026-04-01'),
    ).toMatchObject({
      type: 'workday',
      isShortened: false,
      workHours: 8,
    });
  });

  it('keeps validation and normalization as separate deterministic steps', () => {
    const validated = validateCalendarImportData(bundledCalendar);
    const calendar = normalizeCalendarImport(validated);

    expect(calendar.days.find(day => day.date === '2026-01-10')).toMatchObject({
      type: 'weekend',
      workHours: 0,
    });
  });

  it('rejects malformed JSON before validation', () => {
    const error = expectValidationError(() =>
      parseCalendarImportJson('{"year": 2026,'),
    );

    expect(error.issues).toEqual([
      expect.objectContaining({
        code: 'INVALID_JSON',
        path: 'root',
      }),
    ]);
  });

  it('rejects broken payloads with actionable field-level errors', () => {
    const error = expectValidationError(() =>
      validateCalendarImportData({
        year: 2026,
        holidays: [
          {
            date: '2026-01-01',
            name_ru: 'Новый год',
            name_en: 'New Year',
          },
          {
            date: '2026-01-01',
            name_ru: 'Duplicate holiday',
            name_en: 'Duplicate holiday',
          },
          {
            date: '2027-01-07',
            name_ru: 'Wrong year',
            name_en: 'Wrong year',
          },
        ],
        weekends: ['2026-13-01'],
        preholidays: ['2026-02-20', '2026-02-20'],
      }),
    );

    expect(error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'DUPLICATE_DATE',
          path: 'holidays[1].date',
        }),
        expect.objectContaining({
          code: 'YEAR_MISMATCH',
          path: 'holidays[2].date',
        }),
        expect.objectContaining({
          code: 'INVALID_DATE',
          path: 'weekends[0]',
        }),
        expect.objectContaining({
          code: 'DUPLICATE_DATE',
          path: 'preholidays[1]',
        }),
      ]),
    );
  });
});
