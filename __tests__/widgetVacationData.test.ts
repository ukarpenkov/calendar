/**
 * @format
 */

import { initializeDatabase } from '../src/shared/lib/db';
import type { DB } from '@op-engineering/op-sqlite';

function getLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

jest.mock('../src/shared/lib/i18n', () => {
  const actual = jest.requireActual('../src/shared/lib/i18n');
  return {
    ...actual,
    detectDeviceLanguage: () => 'en',
  };
});

jest.mock('../src/widgets/imageMapping', () => ({
  getDayDrawableResourceName: () => 'day_work_default',
  WIDGET_DEFAULT_IMAGE_BY_MONTH: {},
}));

const mockTestDb: { current: any } = { current: null };

jest.mock('@op-engineering/op-sqlite', () => {
  const actual = jest.requireActual('@op-engineering/op-sqlite');
  return {
    ...actual,
    open: jest.fn((opts: any) => {
      if (mockTestDb.current && opts?.name === 'calendar.sqlite') {
        return mockTestDb.current;
      }
      return actual.open(opts);
    }),
  };
});

import { fetchTodayWidgetData } from '../src/widgets/widgetData';

describe('Widget vacation data', () => {
  let db: DB;
  const realOpSqlite = jest.requireActual('@op-engineering/op-sqlite');

  beforeEach(async () => {
    db = realOpSqlite.open({ name: 'widget-vacation-test.sqlite', location: ':memory:' });
    mockTestDb.current = db;
    await initializeDatabase(db);

    const today = getLocalIsoDate();
    await db.execute(
      `INSERT INTO calendar_days (source, date, year, month, day, weekday, type, is_shortened, work_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['bundled', today, 2026, 6, 12, 5, 'workday', 0, 8],
    );
  });

  afterEach(() => {
    db?.close();
    mockTestDb.current = null;
  });

  it('isOnVacation true when today is within a vacation period', async () => {
    const today = getLocalIsoDate();
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      [today, today, '#2DD4BF'],
    );

    const result = await fetchTodayWidgetData();

    expect(result).not.toBeNull();
    expect(result!.isOnVacation).toBe(true);
    expect(result!.vacationColor).toBe('#2DD4BF');
  });

  it('isOnVacation false when today is not in any vacation period', async () => {
    const result = await fetchTodayWidgetData();

    expect(result).not.toBeNull();
    expect(result!.isOnVacation).toBe(false);
    expect(result!.vacationColor).toBeNull();
  });

  it('isOnVacation true when today is the start_date of a period', async () => {
    const today = getLocalIsoDate();
    const futureDate = getLocalIsoDate().replace(/\d{2}$/, '28');
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      [today, futureDate, '#FF6B6B'],
    );

    const result = await fetchTodayWidgetData();

    expect(result).not.toBeNull();
    expect(result!.isOnVacation).toBe(true);
    expect(result!.vacationColor).toBe('#FF6B6B');
  });

  it('isOnVacation true when today is the end_date of a period', async () => {
    const today = getLocalIsoDate();
    const pastDate = getLocalIsoDate().replace(/\d{2}$/, '01');
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      [pastDate, today, '#4FC3F7'],
    );

    const result = await fetchTodayWidgetData();

    expect(result).not.toBeNull();
    expect(result!.isOnVacation).toBe(true);
    expect(result!.vacationColor).toBe('#4FC3F7');
  });
});
