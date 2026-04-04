declare function require(moduleName: string): unknown;

import type { DB, SQLBatchTuple } from '@op-engineering/op-sqlite';

import { parseValidateAndNormalizeCalendarImport } from '../../../features/calendar-import';
import type { BundledCalendarRegionCode } from '../../../shared/config/agreedLanguagesAndBundledCalendars';
import {
  ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY,
  ACTIVE_YEAR_METADATA_KEY,
  getDatabase,
  initializeDatabase,
} from '../../../shared/lib/db';
import { resolveBundledCalendarRegionForSeed } from '../../../shared/lib/settings';
import { getBundledCalendarJsonForRegion } from './bundledCalendarJsonByLanguage';
import {
  mapCalendarDayRow,
  mapCalendarDayToSqlParams,
} from './mappers';
import type { CalendarDay, CalendarYear } from './types';

function getExpectedDayCount(year: number): number {
  return new Date(Date.UTC(year, 1, 29)).getUTCDate() === 29 ? 366 : 365;
}

function isCompleteCalendarYear(calendar: CalendarYear): boolean {
  return (
    calendar.days.length === getExpectedDayCount(calendar.year) &&
    calendar.days[0]?.date === `${calendar.year}-01-01` &&
    calendar.days[calendar.days.length - 1]?.date === `${calendar.year}-12-31`
  );
}

async function readActiveYearValue(db: DB): Promise<number | null> {
  const result = await db.execute(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
    [ACTIVE_YEAR_METADATA_KEY],
  );
  const rawValue = result.rows[0]?.value;

  if (typeof rawValue !== 'string') {
    return null;
  }

  const parsedValue = Number(rawValue);

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

async function readYearDays(db: DB, year: number): Promise<CalendarDay[]> {
  const result = await db.execute(
    `SELECT
      date,
      year,
      month,
      day,
      weekday,
      type,
      holiday_name_ru,
      holiday_name_en,
      holiday_name_tr,
      holiday_name_id,
      holiday_name_ja,
      is_shortened,
      work_hours
    FROM calendar_days
    WHERE year = ?
    ORDER BY date ASC`,
    [year],
  );

  return result.rows.map(mapCalendarDayRow);
}

export type ReplaceActiveYearSource = 'bundled' | 'user_json_import';

async function replaceActiveYearRows(
  db: DB,
  calendar: CalendarYear,
  source: ReplaceActiveYearSource,
): Promise<void> {
  const userImportCommands: SQLBatchTuple[] =
    source === 'user_json_import'
      ? [
          [
            `INSERT INTO app_metadata (key, value)
             VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY, '1'],
          ],
        ]
      : [['DELETE FROM app_metadata WHERE key = ?', [ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY]]];

  const commands: SQLBatchTuple[] = [
    ['DELETE FROM calendar_days'],
    ['DELETE FROM app_metadata WHERE key = ?', [ACTIVE_YEAR_METADATA_KEY]],
    ...calendar.days.map(day => [
      `INSERT INTO calendar_days (
        date,
        year,
        month,
        day,
        weekday,
        type,
        holiday_name_ru,
        holiday_name_en,
        holiday_name_tr,
        holiday_name_id,
        holiday_name_ja,
        is_shortened,
        work_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      mapCalendarDayToSqlParams(day),
    ] as SQLBatchTuple),
    [
      'INSERT INTO app_metadata (key, value) VALUES (?, ?)',
      [ACTIVE_YEAR_METADATA_KEY, String(calendar.year)],
    ],
    ...userImportCommands,
  ];

  await db.executeBatch(commands);
}

export interface CalendarRepository {
  seedBundledYearIfNeeded(): Promise<CalendarYear>;
  getActiveYear(): Promise<number | null>;
  getYearCalendar(year: number): Promise<CalendarYear | null>;
  getMonthCalendar(year: number, month: number): Promise<CalendarDay[]>;
  replaceActiveYear(
    calendar: CalendarYear,
    source?: ReplaceActiveYearSource,
  ): Promise<void>;
}

export type CalendarRepositoryDependencies = {
  /**
   * Регион предзагруженного JSON при сидировании пустой/битой БД.
   * По умолчанию: явный выбор из настроек или язык UI (`en` → набор `ru`).
   */
  resolveBundledRegionForSeed?: () => Promise<BundledCalendarRegionCode>;
};

async function defaultResolveBundledRegionForSeed(): Promise<BundledCalendarRegionCode> {
  return resolveBundledCalendarRegionForSeed();
}

export function createCalendarRepository(
  db: DB,
  dependencies?: CalendarRepositoryDependencies,
): CalendarRepository {
  const resolveBundledRegionForSeed =
    dependencies?.resolveBundledRegionForSeed ??
    defaultResolveBundledRegionForSeed;

  return {
    async seedBundledYearIfNeeded() {
      await initializeDatabase(db);

      const activeYear = await readActiveYearValue(db);

      if (activeYear !== null) {
        const calendar = await this.getYearCalendar(activeYear);

        if (calendar && isCompleteCalendarYear(calendar)) {
          return calendar;
        }
      }

      const region = await resolveBundledRegionForSeed();
      const bundledRaw = getBundledCalendarJsonForRegion(region);
      const bundledCalendar =
        parseValidateAndNormalizeCalendarImport(bundledRaw);

      await replaceActiveYearRows(db, bundledCalendar, 'bundled');

      return bundledCalendar;
    },

    async getActiveYear() {
      await initializeDatabase(db);
      return readActiveYearValue(db);
    },

    async getYearCalendar(year: number) {
      await initializeDatabase(db);

      const days = await readYearDays(db, year);

      if (days.length === 0) {
        return null;
      }

      return {
        year,
        days,
      };
    },

    async getMonthCalendar(year: number, month: number) {
      await initializeDatabase(db);

      const result = await db.execute(
        `SELECT
          date,
          year,
          month,
          day,
          weekday,
          type,
          holiday_name_ru,
          holiday_name_en,
          holiday_name_tr,
          holiday_name_id,
          holiday_name_ja,
          is_shortened,
          work_hours
        FROM calendar_days
        WHERE year = ? AND month = ?
        ORDER BY day ASC`,
        [year, month],
      );

      return result.rows.map(mapCalendarDayRow);
    },

    async replaceActiveYear(
      calendar: CalendarYear,
      source: ReplaceActiveYearSource = 'bundled',
    ) {
      await initializeDatabase(db);
      await replaceActiveYearRows(db, calendar, source);
    },
  };
}

let repositoryInstance: CalendarRepository | null = null;

export function getCalendarRepository(): CalendarRepository {
  if (!repositoryInstance) {
    repositoryInstance = createCalendarRepository(getDatabase());
  }

  return repositoryInstance;
}

export async function seedBundledYearIfNeeded(): Promise<CalendarYear> {
  return getCalendarRepository().seedBundledYearIfNeeded();
}

export async function getActiveYear(): Promise<number | null> {
  return getCalendarRepository().getActiveYear();
}

export async function getYearCalendar(
  year: number,
): Promise<CalendarYear | null> {
  return getCalendarRepository().getYearCalendar(year);
}

export async function getMonthCalendar(
  year: number,
  month: number,
): Promise<CalendarDay[]> {
  return getCalendarRepository().getMonthCalendar(year, month);
}

async function readUserJsonImportFlag(db: DB): Promise<boolean> {
  const result = await db.execute(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
    [ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY],
  );
  const raw = result.rows[0]?.value;
  return raw === '1';
}

export async function getActiveCalendarIsUserJsonImport(): Promise<boolean> {
  const db = getDatabase();
  await initializeDatabase(db);
  return readUserJsonImportFlag(db);
}

export async function replaceActiveYear(
  calendar: CalendarYear,
  source: ReplaceActiveYearSource = 'bundled',
): Promise<void> {
  return getCalendarRepository().replaceActiveYear(calendar, source);
}
