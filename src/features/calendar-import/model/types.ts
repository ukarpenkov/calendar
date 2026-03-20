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
  | 'INVALID_TEXT';

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
