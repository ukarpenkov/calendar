import type { CalendarDay, CalendarYear } from '../../../entities/calendar';
import {
  CalendarImportValidationError,
  type CalendarImportValidationIssue,
  type RawCalendarImport,
  type RawHolidayEntry,
} from './types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function createIssue(
  code: CalendarImportValidationIssue['code'],
  message: string,
  path?: string,
): CalendarImportValidationIssue {
  return { code, message, path };
}

function getIsoWeekday(utcDay: number): number {
  return utcDay === 0 ? 7 : utcDay;
}

function getExpectedDayCount(year: number): number {
  return new Date(Date.UTC(year, 1, 29)).getUTCDate() === 29 ? 366 : 365;
}

function parseIsoDate(value: string): {
  year: number;
  month: number;
  day: number;
  date: Date;
} | null {
  const match = ISO_DATE_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day, date };
}

function assertIssues(
  issues: CalendarImportValidationIssue[],
): asserts issues is [] {
  if (issues.length > 0) {
    throw new CalendarImportValidationError(issues);
  }
}

function validateDateArray(
  value: unknown,
  fieldName: 'weekends' | 'preholidays',
  expectedYear: number,
  issues: CalendarImportValidationIssue[],
): string[] {
  if (!Array.isArray(value)) {
    issues.push(
      createIssue(
        'INVALID_FIELD_TYPE',
        `Field "${fieldName}" must be an array of ISO date strings.`,
        fieldName,
      ),
    );
    return [];
  }

  const dates: string[] = [];
  const seen = new Set<string>();

  value.forEach((entry, index) => {
    const path = `${fieldName}[${index}]`;

    if (typeof entry !== 'string') {
      issues.push(
        createIssue(
          'INVALID_FIELD_TYPE',
          `Field "${path}" must be an ISO date string.`,
          path,
        ),
      );
      return;
    }

    const parsed = parseIsoDate(entry);

    if (!parsed) {
      issues.push(
        createIssue(
          'INVALID_DATE',
          `Field "${path}" must use the YYYY-MM-DD format and contain a real calendar date.`,
          path,
        ),
      );
      return;
    }

    if (parsed.year !== expectedYear) {
      issues.push(
        createIssue(
          'YEAR_MISMATCH',
          `Field "${path}" must belong to year ${expectedYear}.`,
          path,
        ),
      );
      return;
    }

    if (seen.has(entry)) {
      issues.push(
        createIssue(
          'DUPLICATE_DATE',
          `Field "${fieldName}" contains a duplicate date "${entry}".`,
          path,
        ),
      );
      return;
    }

    seen.add(entry);
    dates.push(entry);
  });

  return dates;
}

function validateHolidays(
  value: unknown,
  expectedYear: number,
  issues: CalendarImportValidationIssue[],
): RawHolidayEntry[] {
  if (!Array.isArray(value)) {
    issues.push(
      createIssue(
        'INVALID_FIELD_TYPE',
        'Field "holidays" must be an array of holiday objects.',
        'holidays',
      ),
    );
    return [];
  }

  const holidays: RawHolidayEntry[] = [];
  const seenDates = new Set<string>();

  value.forEach((entry, index) => {
    const basePath = `holidays[${index}]`;

    if (!isRecord(entry)) {
      issues.push(
        createIssue(
          'INVALID_FIELD_TYPE',
          `Field "${basePath}" must be an object with date and localized names.`,
          basePath,
        ),
      );
      return;
    }

    const dateValue = entry.date;
    const nameRu = entry.name_ru;
    const nameEn = entry.name_en;

    if (typeof dateValue !== 'string') {
      issues.push(
        createIssue(
          'INVALID_FIELD_TYPE',
          `Field "${basePath}.date" must be an ISO date string.`,
          `${basePath}.date`,
        ),
      );
      return;
    }

    const parsedDate = parseIsoDate(dateValue);

    if (!parsedDate) {
      issues.push(
        createIssue(
          'INVALID_DATE',
          `Field "${basePath}.date" must use the YYYY-MM-DD format and contain a real calendar date.`,
          `${basePath}.date`,
        ),
      );
      return;
    }

    if (parsedDate.year !== expectedYear) {
      issues.push(
        createIssue(
          'YEAR_MISMATCH',
          `Field "${basePath}.date" must belong to year ${expectedYear}.`,
          `${basePath}.date`,
        ),
      );
      return;
    }

    if (seenDates.has(dateValue)) {
      issues.push(
        createIssue(
          'DUPLICATE_DATE',
          `Field "holidays" contains a duplicate date "${dateValue}".`,
          `${basePath}.date`,
        ),
      );
      return;
    }

    if (typeof nameRu !== 'string' || nameRu.trim().length === 0) {
      issues.push(
        createIssue(
          'INVALID_TEXT',
          `Field "${basePath}.name_ru" must be a non-empty string.`,
          `${basePath}.name_ru`,
        ),
      );
      return;
    }

    if (typeof nameEn !== 'string' || nameEn.trim().length === 0) {
      issues.push(
        createIssue(
          'INVALID_TEXT',
          `Field "${basePath}.name_en" must be a non-empty string.`,
          `${basePath}.name_en`,
        ),
      );
      return;
    }

    seenDates.add(dateValue);
    holidays.push({
      date: dateValue,
      name_ru: nameRu.trim(),
      name_en: nameEn.trim(),
    });
  });

  return holidays;
}

function validateDayTypeConsistency(
  year: number,
  holidays: RawHolidayEntry[],
  weekends: string[],
  preholidays: string[],
  issues: CalendarImportValidationIssue[],
) {
  const holidayDates = new Set(holidays.map(holiday => holiday.date));
  const weekendDates = new Set(weekends);

  weekends.forEach((date, index) => {
    const parsed = parseIsoDate(date);

    if (!parsed || parsed.year !== year) {
      return;
    }

    const weekday = getIsoWeekday(parsed.date.getUTCDay());

    if (weekday < 6) {
      issues.push(
        createIssue(
          'INCONSISTENT_DAY_TYPE',
          `Field "weekends[${index}]" must fall on Saturday or Sunday.`,
          `weekends[${index}]`,
        ),
      );
    }
  });

  preholidays.forEach((date, index) => {
    const path = `preholidays[${index}]`;

    if (holidayDates.has(date)) {
      issues.push(
        createIssue(
          'INCONSISTENT_DAY_TYPE',
          `Field "${path}" cannot overlap with a holiday date.`,
          path,
        ),
      );
    }

    if (weekendDates.has(date)) {
      issues.push(
        createIssue(
          'INCONSISTENT_DAY_TYPE',
          `Field "${path}" cannot overlap with a weekend date.`,
          path,
        ),
      );
    }
  });
}

export function parseCalendarImportJson(json: string): RawCalendarImport {
  try {
    const parsed = JSON.parse(json) as unknown;
    return validateCalendarImportData(parsed);
  } catch (error) {
    if (error instanceof CalendarImportValidationError) {
      throw error;
    }

    throw new CalendarImportValidationError([
      createIssue(
        'INVALID_JSON',
        'Calendar import file is not valid JSON.',
        'root',
      ),
    ]);
  }
}

export function validateCalendarImportData(
  input: unknown,
): RawCalendarImport {
  const issues: CalendarImportValidationIssue[] = [];

  if (!isRecord(input)) {
    throw new CalendarImportValidationError([
      createIssue(
        'INVALID_ROOT',
        'Calendar import must be a JSON object.',
        'root',
      ),
    ]);
  }

  const yearValue = input.year;
  const holidaysValue = input.holidays;
  const weekendsValue = input.weekends;
  const preholidaysValue = input.preholidays;

  if (yearValue === undefined) {
    issues.push(createIssue('MISSING_FIELD', 'Field "year" is required.', 'year'));
  }

  if (holidaysValue === undefined) {
    issues.push(
      createIssue('MISSING_FIELD', 'Field "holidays" is required.', 'holidays'),
    );
  }

  if (weekendsValue === undefined) {
    issues.push(
      createIssue('MISSING_FIELD', 'Field "weekends" is required.', 'weekends'),
    );
  }

  if (preholidaysValue === undefined) {
    issues.push(
      createIssue(
        'MISSING_FIELD',
        'Field "preholidays" is required.',
        'preholidays',
      ),
    );
  }

  let year = 0;

  if (yearValue !== undefined) {
    if (
      typeof yearValue !== 'number' ||
      !Number.isInteger(yearValue) ||
      yearValue < 1970 ||
      yearValue > 9999
    ) {
      issues.push(
        createIssue(
          'INVALID_YEAR',
          'Field "year" must be an integer between 1970 and 9999.',
          'year',
        ),
      );
    } else {
      year = yearValue;
    }
  }

  const holidays =
    holidaysValue === undefined
      ? []
      : validateHolidays(holidaysValue, year, issues);
  const weekends =
    weekendsValue === undefined
      ? []
      : validateDateArray(weekendsValue, 'weekends', year, issues);
  const preholidays =
    preholidaysValue === undefined
      ? []
      : validateDateArray(preholidaysValue, 'preholidays', year, issues);

  assertIssues(issues);
  validateDayTypeConsistency(year, holidays, weekends, preholidays, issues);
  assertIssues(issues);

  return {
    year,
    holidays,
    weekends,
    preholidays,
  };
}

export function normalizeCalendarImport(
  rawCalendar: RawCalendarImport,
): CalendarYear {
  const holidayByDate = new Map(
    rawCalendar.holidays.map(holiday => [holiday.date, holiday] as const),
  );
  const weekendDates = new Set(rawCalendar.weekends);
  const shortenedDates = new Set(rawCalendar.preholidays);
  const days: CalendarDay[] = [];

  // Priority is explicit and deterministic: holiday > shortened > weekend > workday.
  const startUtc = Date.UTC(rawCalendar.year, 0, 1);
  const endUtc = Date.UTC(rawCalendar.year + 1, 0, 1);

  for (let timestamp = startUtc; timestamp < endUtc; timestamp += DAY_IN_MS) {
    const currentDate = new Date(timestamp);
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();
    const isoDate = currentDate.toISOString().slice(0, 10);
    const holiday = holidayByDate.get(isoDate);
    const isShortened = shortenedDates.has(isoDate);
    const isWeekend = weekendDates.has(isoDate);

    let type: CalendarDay['type'] = 'workday';

    if (holiday) {
      type = 'holiday';
    } else if (isShortened) {
      type = 'shortened';
    } else if (isWeekend) {
      type = 'weekend';
    }

    const workHours = type === 'workday' ? 8 : type === 'shortened' ? 7 : 0;

    days.push({
      date: isoDate,
      year,
      month,
      day,
      weekday: getIsoWeekday(currentDate.getUTCDay()),
      type,
      holidayNameRu: holiday?.name_ru ?? null,
      holidayNameEn: holiday?.name_en ?? null,
      isShortened,
      workHours,
    });
  }

  if (days.length !== getExpectedDayCount(rawCalendar.year)) {
    throw new CalendarImportValidationError([
      createIssue(
        'INVALID_DATE',
        `Normalized year ${rawCalendar.year} does not contain the expected number of days.`,
        'days',
      ),
    ]);
  }

  return {
    year: rawCalendar.year,
    days,
  };
}

export function parseValidateAndNormalizeCalendarImport(
  source: string | unknown,
): CalendarYear {
  const rawCalendar =
    typeof source === 'string'
      ? parseCalendarImportJson(source)
      : validateCalendarImportData(source);

  return normalizeCalendarImport(rawCalendar);
}
