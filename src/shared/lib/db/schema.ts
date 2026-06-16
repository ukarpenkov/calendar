import type { SQLBatchTuple } from '@op-engineering/op-sqlite';

export const DATABASE_NAME = 'calendar.sqlite';
export const DATABASE_SCHEMA_VERSION = 4;
export const ACTIVE_YEAR_METADATA_KEY = 'activeYear';
export const ACTIVE_CALENDAR_SOURCE_METADATA_KEY = 'active_calendar_source';
export const USER_JSON_IMPORT_YEAR_METADATA_KEY = 'user_json_import_year';

/** Значение `1`, если активный год последним был записан из локального JSON-импорта (не из bundled). */
export const ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY =
  'active_calendar_user_json_import';

export const SCHEMA_COMMANDS: SQLBatchTuple[] = [
  ['PRAGMA foreign_keys = ON'],
  [
    `CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    ) STRICT`,
  ],
  [
    `CREATE TABLE IF NOT EXISTS calendar_days (
      source TEXT NOT NULL DEFAULT 'bundled' CHECK (source IN ('bundled', 'user_json_import')),
      date TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      day INTEGER NOT NULL,
      weekday INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('workday', 'weekend', 'holiday', 'shortened')),
      holiday_name_ru TEXT,
      holiday_name_en TEXT,
      holiday_name_tr TEXT,
      holiday_name_id TEXT,
      holiday_name_ja TEXT,
      is_shortened INTEGER NOT NULL CHECK (is_shortened IN (0, 1)),
      work_hours INTEGER NOT NULL,
      PRIMARY KEY (source, date)
    ) STRICT`,
  ],
  ['CREATE INDEX IF NOT EXISTS idx_calendar_days_source_year ON calendar_days(source, year)'],
  [
    'CREATE INDEX IF NOT EXISTS idx_calendar_days_source_year_month ON calendar_days(source, year, month)',
  ],
  [
    `CREATE TABLE IF NOT EXISTS vacation_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#2DD4BF'
    ) STRICT`,
  ],
];
