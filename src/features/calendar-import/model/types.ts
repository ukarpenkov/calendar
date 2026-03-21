import type { CalendarYear } from '../../../entities/calendar';

export interface RawHolidayEntry {
  date: string;
  name_ru: string;
  name_en: string;
}

export interface RawCalendarImport {
  year: number;
  holidays: RawHolidayEntry[];
  weekends: string[];
  preholidays: string[];
}

export type CalendarImportValidationCode =
  | 'INVALID_JSON'
  | 'INVALID_ROOT'
  | 'MISSING_FIELD'
  | 'INVALID_FIELD_TYPE'
  | 'INVALID_YEAR'
  | 'INVALID_DATE'
  | 'YEAR_MISMATCH'
  | 'DUPLICATE_DATE'
  | 'INVALID_TEXT'
  | 'INCONSISTENT_DAY_TYPE';

export interface CalendarImportValidationIssue {
  code: CalendarImportValidationCode;
  message: string;
  path?: string;
}

export class CalendarImportValidationError extends Error {
  readonly issues: CalendarImportValidationIssue[];

  constructor(issues: CalendarImportValidationIssue[]) {
    super(issues[0]?.message ?? 'Calendar import validation failed.');
    this.name = 'CalendarImportValidationError';
    this.issues = issues;
  }
}

export interface CalendarImportSourceFile {
  uri: string;
  name: string;
  type: string | null;
  size: number | null;
}

export interface PreparedCalendarImport {
  file: CalendarImportSourceFile;
  calendar: CalendarYear;
}

export type CalendarImportSourceErrorCode =
  | 'UNSUPPORTED_FILE'
  | 'FILE_READ_FAILED'
  | 'PICKER_FAILED';

export class CalendarImportSourceError extends Error {
  readonly code: CalendarImportSourceErrorCode;

  constructor(code: CalendarImportSourceErrorCode, message: string) {
    super(message);
    this.name = 'CalendarImportSourceError';
    this.code = code;
  }
}
