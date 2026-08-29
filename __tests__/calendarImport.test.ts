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

const bundledCalendar = require('../calendar2027.json');

function isoWeekendDatesForYear(year: number): string[] {
  const dates: string[] = [];
  const startUtc = Date.UTC(year, 0, 1);
  const endUtc = Date.UTC(year + 1, 0, 1);

  for (let timestamp = startUtc; timestamp < endUtc; timestamp += 24 * 60 * 60 * 1000) {
    const current = new Date(timestamp);
    const weekday = current.getUTCDay();

    if (weekday === 0 || weekday === 6) {
      dates.push(current.toISOString().slice(0, 10));
    }
  }

  return dates;
}

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
  it('normalizes the bundled 2027 calendar into a full year', () => {
    const calendar = parseValidateAndNormalizeCalendarImport(bundledCalendar);

    expect(calendar.year).toBe(2027);
    expect(calendar.days).toHaveLength(365);
    expect(new Set(calendar.days.map(day => day.date)).size).toBe(365);

    expect(calendar.days[0]).toMatchObject({
      date: '2027-01-01',
      weekday: 5,
      type: 'holiday',
      holidayNameRu: 'Новый год',
      holidayNameEn: "New Year's Day",
      holidayNameTr: null,
      holidayNameId: null,
      holidayNameJa: null,
      isShortened: false,
      workHours: 0,
    });

    expect(
      calendar.days.find(day => day.date === '2027-03-08'),
    ).toMatchObject({
      type: 'holiday',
      workHours: 0,
    });

    expect(
      calendar.days.find(day => day.date === '2027-04-30'),
    ).toMatchObject({
      type: 'shortened',
      isShortened: true,
      workHours: 7,
    });

    expect(
      calendar.days.find(day => day.date === '2027-04-01'),
    ).toMatchObject({
      type: 'workday',
      isShortened: false,
      workHours: 8,
    });
  });

  it('keeps validation and normalization as separate deterministic steps', () => {
    const validated = validateCalendarImportData(bundledCalendar);
    const calendar = normalizeCalendarImport(validated);

    expect(calendar.days.find(day => day.date === '2027-01-10')).toMatchObject({
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

  it('normalizes a leap year to 366 days', () => {
    const calendar = parseValidateAndNormalizeCalendarImport({
      year: 2024,
      holidays: [],
      weekends: isoWeekendDatesForYear(2024),
      preholidays: [],
    });

    expect(calendar.year).toBe(2024);
    expect(calendar.days).toHaveLength(366);
    expect(calendar.days[59]?.date).toBe('2024-02-29');
    expect(calendar.days[59]?.type).toBe('workday');
  });

  it('rejects non-object JSON roots before field validation', () => {
    const error = expectValidationError(() => validateCalendarImportData(null));

    expect(error.issues).toEqual([
      expect.objectContaining({
        code: 'INVALID_ROOT',
        path: 'root',
      }),
    ]);
  });

  it('rejects invalid year values with a clear issue', () => {
    const error = expectValidationError(() =>
      validateCalendarImportData({
        year: 1800,
        holidays: [],
        weekends: [],
        preholidays: [],
      }),
    );

    expect(error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'INVALID_YEAR',
          path: 'year',
        }),
      ]),
    );
  });

  it('rejects inconsistent weekend and shortened-day combinations', () => {
    const error = expectValidationError(() =>
      validateCalendarImportData({
        year: 2025,
        holidays: [],
        weekends: ['2025-03-07', '2025-03-08'],
        preholidays: ['2025-03-08'],
      }),
    );

    expect(error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'INCONSISTENT_DAY_TYPE',
          path: 'weekends[0]',
        }),
      ]),
    );
  });

  it('drops preholidays that duplicate weekends or holidays (LLM-style overlaps)', () => {
    const raw = validateCalendarImportData({
      year: 2026,
      holidays: [
        {
          date: '2026-09-21',
          name_ru: 'День независимости',
          name_en: 'Independence Day',
        },
      ],
      weekends: [...isoWeekendDatesForYear(2026)],
      preholidays: ['2026-09-20', '2026-09-18'],
    });

    expect(raw.preholidays).toEqual(['2026-09-18']);

    const calendar = normalizeCalendarImport(raw);
    expect(calendar.days.find(day => day.date === '2026-09-20')).toMatchObject({
      type: 'weekend',
      isShortened: false,
    });
    expect(calendar.days.find(day => day.date === '2026-09-18')).toMatchObject({
      type: 'shortened',
      isShortened: true,
    });
  });

  it('drops preholidays that duplicate a holiday date', () => {
    const raw = validateCalendarImportData({
      year: 2026,
      holidays: [
        {
          date: '2026-05-01',
          name_ru: 'Праздник',
          name_en: 'Holiday',
        },
      ],
      weekends: isoWeekendDatesForYear(2026),
      preholidays: ['2026-05-01', '2026-04-30'],
    });

    expect(raw.preholidays).toEqual(['2026-04-30']);
  });

  it('accepts optional localized holiday names name_tr, name_id, name_ja', () => {
    const calendar = parseValidateAndNormalizeCalendarImport({
      year: 2026,
      holidays: [
        {
          date: '2026-01-01',
          name_ru: 'Новый год',
          name_en: "New Year's Day",
          name_tr: 'Yılbaşı',
          name_id: 'Tahun Baru',
          name_ja: '元日',
        },
      ],
      weekends: isoWeekendDatesForYear(2026),
      preholidays: [],
    });

    expect(calendar.days[0]).toMatchObject({
      holidayNameRu: 'Новый год',
      holidayNameEn: "New Year's Day",
      holidayNameTr: 'Yılbaşı',
      holidayNameId: 'Tahun Baru',
      holidayNameJa: '元日',
    });
  });

  it('rejects empty optional localized holiday name when the key is present', () => {
    const error = expectValidationError(() =>
      validateCalendarImportData({
        year: 2026,
        holidays: [
          {
            date: '2026-01-01',
            name_ru: 'Новый год',
            name_en: "New Year's Day",
            name_tr: '   ',
          },
        ],
        weekends: isoWeekendDatesForYear(2026),
        preholidays: [],
      }),
    );

    expect(error.issues).toEqual([
      expect.objectContaining({
        code: 'INVALID_TEXT',
        path: 'holidays[0].name_tr',
      }),
    ]);
  });
});
