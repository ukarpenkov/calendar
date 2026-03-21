import type { DB } from '@op-engineering/op-sqlite';

import { getDatabase, initializeDatabase } from '../db';
import type { AppLanguage } from '../i18n';

const APP_LANGUAGE_METADATA_KEY = 'language';
const APP_THEME_METADATA_KEY = 'theme';

type AppThemeMode = 'light' | 'dark';

function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'en' || value === 'ru';
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

export async function getStoredTheme(): Promise<AppThemeMode | null> {
  return getAppPreferencesRepository().getTheme();
}

export async function setStoredTheme(theme: AppThemeMode): Promise<void> {
  return getAppPreferencesRepository().setTheme(theme);
}
