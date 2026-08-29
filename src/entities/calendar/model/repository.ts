import type { DB, SQLBatchTuple } from '@op-engineering/op-sqlite';

import { parseValidateAndNormalizeCalendarImport } from '../../../features/calendar-import';
import {
  BUNDLED_CALENDAR_YEAR,
  type BundledCalendarRegionCode,
} from '../../../shared/config/agreedLanguagesAndBundledCalendars';
import {
  ACTIVE_CALENDAR_SOURCE_METADATA_KEY,
  ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY,
  ACTIVE_YEAR_METADATA_KEY,
  getDatabase,
  initializeDatabase,
  USER_JSON_IMPORT_YEAR_METADATA_KEY,
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

async function readYearDays(
  db: DB,
  year: number,
  source: CalendarDataSource,
): Promise<CalendarDay[]> {
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
    WHERE source = ? AND year = ?
    ORDER BY date ASC`,
    [source, year],
  );

  return result.rows.map(mapCalendarDayRow);
}

export type ReplaceActiveYearSource = 'bundled' | 'user_json_import';
export type CalendarDataSource = ReplaceActiveYearSource;

const CALENDAR_DATA_SOURCES = new Set<string>(['bundled', 'user_json_import']);

function isCalendarDataSource(value: unknown): value is CalendarDataSource {
  return typeof value === 'string' && CALENDAR_DATA_SOURCES.has(value);
}

async function readMetadataValue(db: DB, key: string): Promise<string | null> {
  const result = await db.execute(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
    [key],
  );
  const rawValue = result.rows[0]?.value;

  return typeof rawValue === 'string' ? rawValue : null;
}

async function writeMetadataValue(
  db: DB,
  key: string,
  value: string,
): Promise<void> {
  await db.execute(
    `INSERT INTO app_metadata (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

async function readActiveCalendarSource(
  db: DB,
): Promise<CalendarDataSource> {
  const storedSource = await readMetadataValue(
    db,
    ACTIVE_CALENDAR_SOURCE_METADATA_KEY,
  );

  if (isCalendarDataSource(storedSource)) {
    return storedSource;
  }

  const legacyImportFlag = await readMetadataValue(
    db,
    ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY,
  );

  return legacyImportFlag === '1' ? 'user_json_import' : 'bundled';
}

async function readStoredUserJsonImportYear(db: DB): Promise<number | null> {
  const storedYear = await readMetadataValue(db, USER_JSON_IMPORT_YEAR_METADATA_KEY);

  if (storedYear !== null) {
    const parsedYear = Number(storedYear);
    if (Number.isInteger(parsedYear)) {
      return parsedYear;
    }
  }

  const result = await db.execute(
    `SELECT year
     FROM calendar_days
     WHERE source = ?
     GROUP BY year
     ORDER BY year DESC
     LIMIT 1`,
    ['user_json_import'],
  );
  const rawYear = result.rows[0]?.year;

  if (typeof rawYear === 'number' && Number.isInteger(rawYear)) {
    return rawYear;
  }
  if (typeof rawYear === 'string') {
    const parsedYear = Number(rawYear);
    return Number.isInteger(parsedYear) ? parsedYear : null;
  }

  return null;
}

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
          [
            `INSERT INTO app_metadata (key, value)
             VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [USER_JSON_IMPORT_YEAR_METADATA_KEY, String(calendar.year)],
          ],
        ]
      : [['DELETE FROM app_metadata WHERE key = ?', [ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY]]];

  const commands: SQLBatchTuple[] = [
    ['DELETE FROM calendar_days WHERE source = ?', [source]],
    ['DELETE FROM app_metadata WHERE key = ?', [ACTIVE_YEAR_METADATA_KEY]],
    ...calendar.days.map(day => [
      `INSERT INTO calendar_days (
        source,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [source, ...mapCalendarDayToSqlParams(day)],
    ] as SQLBatchTuple),
    [
      'INSERT INTO app_metadata (key, value) VALUES (?, ?)',
      [ACTIVE_YEAR_METADATA_KEY, String(calendar.year)],
    ],
    [
      `INSERT INTO app_metadata (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [ACTIVE_CALENDAR_SOURCE_METADATA_KEY, source],
    ],
    ...userImportCommands,
  ];

  await db.executeBatch(commands);
}

async function saveUserJsonImportRows(
  db: DB,
  calendar: CalendarYear,
): Promise<void> {
  const source: CalendarDataSource = 'user_json_import';
  const commands: SQLBatchTuple[] = [
    ['DELETE FROM calendar_days WHERE source = ?', [source]],
    ...calendar.days.map(day => [
      `INSERT INTO calendar_days (
        source,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [source, ...mapCalendarDayToSqlParams(day)],
    ] as SQLBatchTuple),
    [
      `INSERT INTO app_metadata (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [USER_JSON_IMPORT_YEAR_METADATA_KEY, String(calendar.year)],
    ],
  ];

  await db.executeBatch(commands);
}

export interface CalendarRepository {
  seedBundledYearIfNeeded(): Promise<CalendarYear>;
  getActiveYear(): Promise<number | null>;
  getActiveCalendarSource(): Promise<CalendarDataSource>;
  getYearCalendar(year: number): Promise<CalendarYear | null>;
  getMonthCalendar(year: number, month: number): Promise<CalendarDay[]>;
  getUserJsonImportYear(): Promise<number | null>;
  saveUserJsonImport(calendar: CalendarYear): Promise<void>;
  activateUserJsonImport(): Promise<CalendarYear | null>;
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
          const source = await readActiveCalendarSource(db);
          if (
            source === 'bundled' &&
            calendar.year !== BUNDLED_CALENDAR_YEAR
          ) {
            const region = await resolveBundledRegionForSeed();
            const bundledRaw = getBundledCalendarJsonForRegion(region);
            const bundledCalendar =
              parseValidateAndNormalizeCalendarImport(bundledRaw);

            await replaceActiveYearRows(db, bundledCalendar, 'bundled');

            return bundledCalendar;
          }

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

    async getActiveCalendarSource() {
      await initializeDatabase(db);
      return readActiveCalendarSource(db);
    },

    async getYearCalendar(year: number) {
      await initializeDatabase(db);

      const source = await readActiveCalendarSource(db);
      const days = await readYearDays(db, year, source);

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
      const source = await readActiveCalendarSource(db);

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
        WHERE source = ? AND year = ? AND month = ?
        ORDER BY day ASC`,
        [source, year, month],
      );

      return result.rows.map(mapCalendarDayRow);
    },

    async getUserJsonImportYear() {
      await initializeDatabase(db);
      return readStoredUserJsonImportYear(db);
    },

    async saveUserJsonImport(calendar: CalendarYear) {
      await initializeDatabase(db);
      await saveUserJsonImportRows(db, calendar);
    },

    async activateUserJsonImport() {
      await initializeDatabase(db);
      const importedYear = await readStoredUserJsonImportYear(db);

      if (importedYear === null) {
        return null;
      }

      const days = await readYearDays(db, importedYear, 'user_json_import');

      if (days.length === 0) {
        return null;
      }

      await writeMetadataValue(db, ACTIVE_YEAR_METADATA_KEY, String(importedYear));
      await writeMetadataValue(
        db,
        ACTIVE_CALENDAR_SOURCE_METADATA_KEY,
        'user_json_import',
      );
      await writeMetadataValue(db, ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY, '1');

      return {
        year: importedYear,
        days,
      };
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

export async function getActiveCalendarSource(): Promise<CalendarDataSource> {
  return getCalendarRepository().getActiveCalendarSource();
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

export async function getActiveCalendarIsUserJsonImport(): Promise<boolean> {
  const db = getDatabase();
  await initializeDatabase(db);
  return (await readActiveCalendarSource(db)) === 'user_json_import';
}

export async function getUserJsonImportYear(): Promise<number | null> {
  return getCalendarRepository().getUserJsonImportYear();
}

export async function saveUserJsonImport(
  calendar: CalendarYear,
): Promise<void> {
  return getCalendarRepository().saveUserJsonImport(calendar);
}

export async function activateUserJsonImport(): Promise<CalendarYear | null> {
  return getCalendarRepository().activateUserJsonImport();
}

export async function replaceActiveYear(
  calendar: CalendarYear,
  source: ReplaceActiveYearSource = 'bundled',
): Promise<void> {
  return getCalendarRepository().replaceActiveYear(calendar, source);
}
