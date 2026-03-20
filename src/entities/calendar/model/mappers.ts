import type { Scalar } from '@op-engineering/op-sqlite';

import type { CalendarDay, DayType } from './types';

export interface CalendarDayRow {
  date: string;
  year: number;
  month: number;
  day: number;
  weekday: number;
  type: DayType;
  holiday_name_ru: string | null;
  holiday_name_en: string | null;
  is_shortened: number;
  work_hours: number;
}

function readString(value: Scalar, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Expected "${fieldName}" to be a string.`);
  }

  return value;
}

function readNullableString(value: Scalar | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error('Expected nullable string column to be a string or null.');
  }

  return value;
}

function readNumber(value: Scalar, fieldName: string): number {
  if (typeof value !== 'number') {
    throw new Error(`Expected "${fieldName}" to be a number.`);
  }

  return value;
}

function readDayType(value: Scalar): DayType {
  if (
    value === 'workday' ||
    value === 'weekend' ||
    value === 'holiday' ||
    value === 'shortened'
  ) {
    return value;
  }

  throw new Error('Expected "type" to be a valid day type.');
}

export function mapCalendarDayRow(
  row: Record<string, Scalar>,
): CalendarDay {
  return {
    date: readString(row.date, 'date'),
    year: readNumber(row.year, 'year'),
    month: readNumber(row.month, 'month'),
    day: readNumber(row.day, 'day'),
    weekday: readNumber(row.weekday, 'weekday'),
    type: readDayType(row.type),
    holidayNameRu: readNullableString(row.holiday_name_ru),
    holidayNameEn: readNullableString(row.holiday_name_en),
    isShortened: readNumber(row.is_shortened, 'is_shortened') === 1,
    workHours: readNumber(row.work_hours, 'work_hours'),
  };
}

export function mapCalendarDayToSqlParams(day: CalendarDay): Scalar[] {
  return [
    day.date,
    day.year,
    day.month,
    day.day,
    day.weekday,
    day.type,
    day.holidayNameRu,
    day.holidayNameEn,
    day.isShortened ? 1 : 0,
    day.workHours,
  ];
}
