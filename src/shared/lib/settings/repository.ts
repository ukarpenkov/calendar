import type { DB } from '@op-engineering/op-sqlite';

import {
  AGREED_APP_LANGUAGE_CODES,
  BUNDLED_CALENDAR_REGION_CODES,
  type BundledCalendarRegionCode,
} from '../../config/agreedLanguagesAndBundledCalendars';
import { appLanguageToDefaultBundledRegion } from '../bundledCalendarRegion';
import { getDatabase, initializeDatabase } from '../db';
import { detectDeviceLanguage, type AppLanguage } from '../i18n';

const APP_LANGUAGE_METADATA_KEY = 'language';
const APP_THEME_METADATA_KEY = 'theme';
const APP_BUNDLED_CALENDAR_REGION_METADATA_KEY = 'bundled_calendar_region';

type AppThemeMode = 'light' | 'dark';

const STORED_LANGUAGE_CODES = new Set<string>(AGREED_APP_LANGUAGE_CODES);
const STORED_BUNDLED_REGION_CODES = new Set<string>(
  BUNDLED_CALENDAR_REGION_CODES,
);

function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === 'string' && STORED_LANGUAGE_CODES.has(value);
}

function isBundledCalendarRegionCode(
  value: unknown,
): value is BundledCalendarRegionCode {
  return typeof value === 'string' && STORED_BUNDLED_REGION_CODES.has(value);
}

function isAppThemeMode(value: unknown): value is AppThemeMode {
  return value === 'light' || value === 'dark';
}

async function readMetadataValue(db: DB, key: string): Promise<string | null> {
  const result = await db.execute(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
    [key],
  );

  const rawValue = result.rows[0]?.value;
  return typeof rawValue === 'string' ? rawValue : null;
}

export interface AppPreferencesRepository {
  getLanguage(): Promise<AppLanguage | null>;
  setLanguage(language: AppLanguage): Promise<void>;
  getBundledCalendarRegion(): Promise<BundledCalendarRegionCode | null>;
  setBundledCalendarRegion(region: BundledCalendarRegionCode): Promise<void>;
  getTheme(): Promise<AppThemeMode | null>;
  setTheme(theme: AppThemeMode): Promise<void>;
}

export function createAppPreferencesRepository(db: DB): AppPreferencesRepository {
  return {
    async getLanguage() {
      await initializeDatabase(db);

      const storedValue = await readMetadataValue(db, APP_LANGUAGE_METADATA_KEY);
      return isAppLanguage(storedValue) ? storedValue : null;
    },

    async setLanguage(language) {
      await initializeDatabase(db);

      await db.execute(
        `INSERT INTO app_metadata (key, value)
         VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [APP_LANGUAGE_METADATA_KEY, language],
      );
    },

    async getBundledCalendarRegion() {
      await initializeDatabase(db);

      const storedValue = await readMetadataValue(
        db,
        APP_BUNDLED_CALENDAR_REGION_METADATA_KEY,
      );
      return isBundledCalendarRegionCode(storedValue) ? storedValue : null;
    },

    async setBundledCalendarRegion(region) {
      await initializeDatabase(db);

      await db.execute(
        `INSERT INTO app_metadata (key, value)
         VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [APP_BUNDLED_CALENDAR_REGION_METADATA_KEY, region],
      );
    },

    async getTheme() {
      await initializeDatabase(db);

      const storedValue = await readMetadataValue(db, APP_THEME_METADATA_KEY);
      return isAppThemeMode(storedValue) ? storedValue : null;
    },

    async setTheme(theme) {
      await initializeDatabase(db);

      await db.execute(
        `INSERT INTO app_metadata (key, value)
         VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [APP_THEME_METADATA_KEY, theme],
      );
    },
  };
}

let repositoryInstance: AppPreferencesRepository | null = null;

export function getAppPreferencesRepository(): AppPreferencesRepository {
  if (!repositoryInstance) {
    repositoryInstance = createAppPreferencesRepository(getDatabase());
  }

  return repositoryInstance;
}

export async function getStoredLanguage(): Promise<AppLanguage | null> {
  return getAppPreferencesRepository().getLanguage();
}

export async function setStoredLanguage(language: AppLanguage): Promise<void> {
  return getAppPreferencesRepository().setLanguage(language);
}

export async function getStoredBundledCalendarRegion(): Promise<BundledCalendarRegionCode | null> {
  return getAppPreferencesRepository().getBundledCalendarRegion();
}

export async function setStoredBundledCalendarRegion(
  region: BundledCalendarRegionCode,
): Promise<void> {
  return getAppPreferencesRepository().setBundledCalendarRegion(region);
}

/** Регион для сидирования: явное значение из настроек или вывод из языка UI. */
export async function resolveBundledCalendarRegionForSeed(): Promise<BundledCalendarRegionCode> {
  const storedRegion = await getStoredBundledCalendarRegion();
  if (storedRegion) {
    return storedRegion;
  }

  const storedLanguage = await getAppPreferencesRepository().getLanguage();
  return appLanguageToDefaultBundledRegion(
    storedLanguage ?? detectDeviceLanguage(),
  );
}

export async function getStoredTheme(): Promise<AppThemeMode | null> {
  return getAppPreferencesRepository().getTheme();
}

export async function setStoredTheme(theme: AppThemeMode): Promise<void> {
  return getAppPreferencesRepository().setTheme(theme);
}
