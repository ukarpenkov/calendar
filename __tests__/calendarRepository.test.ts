/**
 * @format
 */

declare function require(moduleName: string): unknown;

import { open, type DB } from '@op-engineering/op-sqlite';

import {
  createCalendarRepository,
  type CalendarRepository,
} from '../src/entities/calendar';
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';
import {
  ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY,
  initializeDatabase,
} from '../src/shared/lib/db';

const bundledCalendar = require('../calendar2026.json');
const bundledCalendarTr = require('../calendar2026TR.json');
const importedCalendar2025 = require('../calendar2025.json');

describe('calendar sqlite repository', () => {
  let db: DB;
  let repository: CalendarRepository;

  beforeEach(async () => {
    db = open({ name: 'calendar-test.sqlite', location: ':memory:' });
    await initializeDatabase(db);
    repository = createCalendarRepository(db, {
      resolveBundledRegionForSeed: async () => 'ru',
    });
  });

  afterEach(() => {
    db?.close();
  });

  it('stores and reads back the active calendar year', async () => {
    const calendar = parseValidateAndNormalizeCalendarImport(bundledCalendar);

    await repository.replaceActiveYear(calendar);

    expect(await repository.getActiveYear()).toBe(2026);

    const storedCalendar = await repository.getYearCalendar(2026);
    const aprilDays = await repository.getMonthCalendar(2026, 4);

    expect(storedCalendar?.days).toHaveLength(365);
    expect(aprilDays).toHaveLength(30);
    expect(aprilDays.find(day => day.date === '2026-04-30')).toMatchObject({
      type: 'shortened',
      workHours: 7,
    });
  });

  it('seeds bundled 2026 when the database is empty', async () => {
    const seededCalendar = await repository.seedBundledYearIfNeeded();

    expect(seededCalendar.year).toBe(2026);
    expect(seededCalendar.days).toHaveLength(365);
    expect(await repository.getActiveYear()).toBe(2026);
  });

  it('seeds regional bundled JSON when resolver selects a non-default region', async () => {
    const jaRepository = createCalendarRepository(db, {
      resolveBundledRegionForSeed: async () => 'ja',
    });

    const seededCalendar = await jaRepository.seedBundledYearIfNeeded();

    expect(seededCalendar.year).toBe(2026);
    const jan12 = seededCalendar.days.find(d => d.date === '2026-01-12');
    expect(jan12).toMatchObject({
      type: 'holiday',
      holidayNameRu: '成人の日',
      holidayNameEn: 'Coming of Age Day',
      holidayNameJa: '成人の日',
    });
  });

  it('reseeds the bundled year when active metadata points to incomplete data', async () => {
    await db.execute(
      'INSERT INTO app_metadata (key, value) VALUES (?, ?)',
      ['activeYear', '2026'],
    );
    await db.execute(
      `INSERT INTO calendar_days (
        date,
        year,
        month,
        day,
        weekday,
        type,
        holiday_name_ru,
        holiday_name_en,
        is_shortened,
        work_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['2026-01-01', 2026, 1, 1, 4, 'holiday', 'Новый год', "New Year's Day", 0, 0],
    );

    const seededCalendar = await repository.seedBundledYearIfNeeded();

    expect(seededCalendar.days).toHaveLength(365);
    expect(await repository.getActiveYear()).toBe(2026);
  });

  it('replaces the active dataset when a different year is imported', async () => {
    const calendar2026 = parseValidateAndNormalizeCalendarImport(bundledCalendar);
    const calendar2025 = parseValidateAndNormalizeCalendarImport(importedCalendar2025);

    await repository.replaceActiveYear(calendar2026);
    await repository.replaceActiveYear(calendar2025, 'user_json_import');

    expect(await repository.getActiveYear()).toBe(2025);
    expect(await repository.getYearCalendar(2026)).toBeNull();
    expect(await repository.getYearCalendar(2025)).toMatchObject({
      year: 2025,
    });
    expect(await repository.getMonthCalendar(2025, 11)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2025-11-01',
          type: 'shortened',
          workHours: 7,
        }),
      ]),
    );

    const importFlag = await db.execute(
      'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
      [ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY],
    );
    expect(importFlag.rows[0]?.value).toBe('1');

    await repository.replaceActiveYear(calendar2026);

    const cleared = await db.execute(
      'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
      [ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY],
    );
    expect(cleared.rows[0]).toBeUndefined();
  });

  it('persists optional regional holiday name columns from import JSON', async () => {
    const calendar = parseValidateAndNormalizeCalendarImport(bundledCalendarTr);
    await repository.replaceActiveYear(calendar, 'bundled');

    const jan1 = (await repository.getMonthCalendar(2026, 1)).find(
      d => d.date === '2026-01-01',
    );

    expect(jan1).toMatchObject({
      type: 'holiday',
      holidayNameTr: 'Yılbaşı Tatili',
      holidayNameEn: "New Year's Day",
    });
  });
});
