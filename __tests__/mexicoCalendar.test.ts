import * as fs from 'fs';
import * as path from 'path';
import { open } from '@op-engineering/op-sqlite';
import {
  createCalendarRepository,
  getDayTypeLabel,
} from '../src/entities/calendar';
import { getBundledCalendarJsonForRegion } from '../src/entities/calendar/model/bundledCalendarJsonByLanguage';
import { getHolidayDisplayName } from '../src/entities/calendar/model/holiday-display-name';
import { getDayImage } from '../src/entities/calendar/model/holidayImages';
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';
import { initializeDatabase } from '../src/shared/lib/db';
import { DATABASE_SCHEMA_VERSION } from '../src/shared/lib/db/schema';
import {
  appLanguageToDefaultBundledRegion,
  getBundledRegionToApplyOnManualAppLanguageChange,
} from '../src/shared/lib/bundledCalendarRegion';
import {
  getTranslation,
  getMonthLabel,
  getCompactWeekdayLabels,
  getLanguageNativeLabel,
  getThemeModeLabel,
  mapLocaleStringToAppLanguage,
} from '../src/shared/lib/i18n';
import { enTranslations } from '../src/shared/lib/i18n/messages/en';
import { esTranslations } from '../src/shared/lib/i18n/messages/es';
import { getDayDrawableResourceName } from '../src/widgets/imageMapping';

const raw = getBundledCalendarJsonForRegion('es');
const calendar = parseValidateAndNormalizeCalendarImport(raw);
const dayOn = (date: string) => calendar.days.find(day => day.date === date)!;

it('selects Spanish and the Mexico calendar using the existing language policy', () => {
  for (const locale of ['es-MX', 'es_MX', 'es', '  ES-mx  ', 'es-ES']) {
    const language = mapLocaleStringToAppLanguage(locale);
    expect(language).toBe('es');
    expect(appLanguageToDefaultBundledRegion(language)).toBe('es');
  }
  expect(getBundledRegionToApplyOnManualAppLanguageChange('es')).toBe('es');
  expect(getLanguageNativeLabel('es')).toBe('Español');
  expect(getTranslation('es', 'settings.bundledCalendar.chip.es')).toBe(
    'México',
  );
  expect(getTranslation('es', 'year.home.title', { year: 2027 })).toBe(
    'Año 2027',
  );
  expect(getMonthLabel('es', 9)).toBe('Septiembre');
  expect(getCompactWeekdayLabels('es')).toEqual([
    'L',
    'M',
    'X',
    'J',
    'V',
    'S',
    'D',
  ]);
  expect(getDayTypeLabel('holiday', 'es')).toBe('Día festivo');
  expect(getThemeModeLabel('es', 'dark')).toBe('Oscuro');
});

it('translates every UI key and preserves all interpolation parameters', () => {
  expect(Object.keys(esTranslations).sort()).toEqual(
    Object.keys(enTranslations).sort(),
  );
  for (const key of Object.keys(enTranslations) as Array<
    keyof typeof enTranslations
  >) {
    expect(esTranslations[key].trim()).not.toBe('');
    expect(esTranslations[key].match(/\{\{\w+\}\}/g)?.sort() ?? []).toEqual(
      enTranslations[key].match(/\{\{\w+\}\}/g)?.sort() ?? [],
    );
  }
});

it('uses Mexican observed dates and the nationwide election without invented days off', () => {
  expect(calendar.days).toHaveLength(365);
  expect(
    calendar.days.filter(day => day.type === 'holiday').map(day => day.date),
  ).toEqual([
    '2027-01-01',
    '2027-02-01',
    '2027-03-15',
    '2027-05-01',
    '2027-06-06',
    '2027-09-16',
    '2027-11-15',
    '2027-12-25',
  ]);
  for (const date of ['2027-02-05', '2027-05-05', '2027-11-02', '2027-12-27']) {
    expect(dayOn(date).type).toBe('workday');
  }
  expect(dayOn('2027-11-20').type).toBe('weekend');
  expect(calendar.days.some(day => day.isShortened)).toBe(false);
  expect(calendar.days.filter(day => day.type === 'workday')).toHaveLength(256);
  expect(getHolidayDisplayName(dayOn('2027-09-16'), 'es')).toBe(
    'Día de la Independencia',
  );
  expect(
    getHolidayDisplayName(
      { ...dayOn('2027-09-16'), holidayNameEs: null },
      'es',
    ),
  ).toBe('Independence Day of Mexico');
});

it('validates Spanish holiday names on import', () => {
  const invalid = JSON.parse(JSON.stringify(raw));
  invalid.holidays[0].name_es = '  ';
  expect(() => parseValidateAndNormalizeCalendarImport(invalid)).toThrow();
});

it('resolves each Mexican illustration in both the app and widget, including Spanish-only names', () => {
  const expected = {
    '2027-02-01': 'mx_constitution',
    '2027-03-15': 'mx_juarez',
    '2027-06-06': 'mx_election',
    '2027-09-16': 'mx_independence',
    '2027-11-15': 'mx_revolution',
  };
  for (const [date, asset] of Object.entries(expected)) {
    const day = { ...dayOn(date), holidayNameEn: null, holidayNameRu: null };
    expect(getDayDrawableResourceName(day)).toBe(`day_${asset}`);
    // Asset identity is handled by React Native's Jest asset transformer.
    expect(getDayImage(day)).not.toEqual(
      require('../assets/days_img/default_fiesta_fallback.webp'),
    );
    const appFile = path.join(__dirname, '../assets/days_img', `${asset}.webp`);
    const widgetFile = path.join(
      __dirname,
      '../android/app/src/main/res/drawable',
      `day_${asset}.webp`,
    );
    expect(fs.readFileSync(appFile).equals(fs.readFileSync(widgetFile))).toBe(
      true,
    );
  }
  expect(getDayDrawableResourceName(dayOn('2027-01-01'))).toBe(
    'day_new_year_default',
  );
  expect(getDayDrawableResourceName(dayOn('2027-05-01'))).toBe('day_may1');
  expect(getDayDrawableResourceName(dayOn('2027-12-25'))).toBe(
    'day_7jan_cristmas',
  );
});

it('seeds Mexico, persists Spanish in both calendar slots and keeps imported data on region changes', async () => {
  const db = open({ name: 'mexico-test.sqlite', location: ':memory:' });
  try {
    const repository = createCalendarRepository(db, {
      resolveBundledRegionForSeed: async () => 'es',
    });
    await repository.seedBundledYearIfNeeded();
    expect((await repository.getMonthCalendar(2027, 9))[15].holidayNameEs).toBe(
      'Día de la Independencia',
    );
    await repository.saveUserJsonImport(calendar);
    await repository.replaceActiveYear(
      parseValidateAndNormalizeCalendarImport(
        getBundledCalendarJsonForRegion('ru'),
      ),
    );
    await repository.activateUserJsonImport();
    const stored = await repository.getYearCalendar(2027);
    expect(
      stored?.days.find(day => day.date === '2027-03-15')?.holidayNameEs,
    ).toBe('Natalicio de Benito Juárez');
  } finally {
    db.close();
  }
});

it('upgrades a v4 database without losing existing calendars, preferences or vacations', async () => {
  const db = open({ name: 'mexico-migration.sqlite', location: ':memory:' });
  // The Node adapter only returns rows for SELECT; emulate native PRAGMA reads.
  const executeSync = db.executeSync.bind(db);
  jest
    .spyOn(db, 'executeSync')
    .mockImplementation((query, params) =>
      executeSync(
        query === 'PRAGMA user_version'
          ? 'SELECT user_version FROM pragma_user_version'
          : query,
        params,
      ),
    );
  try {
    await initializeDatabase(db);
    const repository = createCalendarRepository(db);
    const russian = parseValidateAndNormalizeCalendarImport(
      getBundledCalendarJsonForRegion('ru'),
    );
    await repository.replaceActiveYear(russian);
    await repository.saveUserJsonImport(russian);
    await db.execute(
      "INSERT INTO app_metadata (key, value) VALUES ('language', 'ru')",
    );
    await db.execute(
      "INSERT INTO vacation_periods (start_date, end_date, color) VALUES ('2027-07-01', '2027-07-07', '#2DD4BF')",
    );
    await db.execute('ALTER TABLE calendar_days DROP COLUMN holiday_name_es');
    await db.execute('PRAGMA user_version = 4');
    await initializeDatabase(db);
    await initializeDatabase(db);
    expect(db.executeSync('PRAGMA user_version').rows[0].user_version).toBe(
      DATABASE_SCHEMA_VERSION,
    );
    expect(
      db.executeSync('SELECT COUNT(*) AS count FROM calendar_days').rows[0]
        .count,
    ).toBe(730);
    expect(
      db.executeSync("SELECT value FROM app_metadata WHERE key = 'language'")
        .rows[0].value,
    ).toBe('ru');
    expect(
      db.executeSync('SELECT start_date FROM vacation_periods').rows[0]
        .start_date,
    ).toBe('2027-07-01');
    expect(
      (await repository.getMonthCalendar(2027, 1))[0].holidayNameEs,
    ).toBeNull();
    await repository.replaceActiveYear(calendar);
    expect((await repository.getMonthCalendar(2027, 1))[0].holidayNameEs).toBe(
      'Año Nuevo',
    );
  } finally {
    db.close();
  }
});
