import { open, type DB } from '@op-engineering/op-sqlite';

import {
  ACTIVE_CALENDAR_SOURCE_METADATA_KEY,
  ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY,
  ACTIVE_YEAR_METADATA_KEY,
  DATABASE_NAME,
  DATABASE_SCHEMA_VERSION,
  SCHEMA_COMMANDS,
  USER_JSON_IMPORT_YEAR_METADATA_KEY,
} from './schema';

let databaseInstance: DB | null = null;
let initializationPromise: Promise<DB> | null = null;

function createDatabase(): DB {
  return open({ name: DATABASE_NAME });
}

function readSchemaVersion(db: DB): number {
  const result = db.executeSync('PRAGMA user_version');
  const row = result.rows[0];
  if (!row) {
    return 0;
  }

  const direct = row.user_version;
  if (typeof direct === 'number' && Number.isInteger(direct)) {
    return direct;
  }
  if (typeof direct === 'string') {
    const parsed = Number(direct);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }

  const fallback = Object.values(row)[0];
  if (typeof fallback === 'number' && Number.isInteger(fallback)) {
    return fallback;
  }
  if (typeof fallback === 'string') {
    const parsed = Number(fallback);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }

  return 0;
}

async function migrateFromV1ToV2(db: DB): Promise<void> {
  await db.execute(
    'ALTER TABLE calendar_days ADD COLUMN holiday_name_tr TEXT',
  );
  await db.execute(
    'ALTER TABLE calendar_days ADD COLUMN holiday_name_id TEXT',
  );
  await db.execute(
    'ALTER TABLE calendar_days ADD COLUMN holiday_name_ja TEXT',
  );
}

async function readMetadataValue(db: DB, key: string): Promise<string | null> {
  const result = await db.execute(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
    [key],
  );

  const rawValue = result.rows[0]?.value;
  return typeof rawValue === 'string' ? rawValue : null;
}

async function migrateFromV2ToV3(db: DB): Promise<void> {
  const activeYear = await readMetadataValue(db, ACTIVE_YEAR_METADATA_KEY);
  const userJsonImportActive =
    (await readMetadataValue(db, ACTIVE_CALENDAR_USER_JSON_IMPORT_KEY)) === '1';
  const migratedSource = userJsonImportActive ? 'user_json_import' : 'bundled';

  await db.execute(
    `CREATE TABLE calendar_days_v3 (
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
  );

  await db.execute(
    `INSERT INTO calendar_days_v3 (
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
    )
    SELECT
      ?,
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
    FROM calendar_days`,
    [migratedSource],
  );

  await db.execute('DROP TABLE calendar_days');
  await db.execute('ALTER TABLE calendar_days_v3 RENAME TO calendar_days');
  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_calendar_days_source_year ON calendar_days(source, year)',
  );
  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_calendar_days_source_year_month ON calendar_days(source, year, month)',
  );
  await db.execute(
    `INSERT INTO app_metadata (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [ACTIVE_CALENDAR_SOURCE_METADATA_KEY, migratedSource],
  );

  if (userJsonImportActive && activeYear) {
    await db.execute(
      `INSERT INTO app_metadata (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [USER_JSON_IMPORT_YEAR_METADATA_KEY, activeYear],
    );
  }
}

async function migrateFromV3ToV4(db: DB): Promise<void> {
  await db.execute(
    `CREATE TABLE IF NOT EXISTS vacation_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#2DD4BF'
    ) STRICT`,
  );
}

async function applyMigrations(db: DB, currentVersion: number): Promise<void> {
  if (currentVersion > DATABASE_SCHEMA_VERSION) {
    throw new Error(
      `Database schema version ${currentVersion} is newer than the app supports.`,
    );
  }

  if (currentVersion < 1) {
    await db.executeBatch(SCHEMA_COMMANDS);
  } else {
    if (currentVersion < 2) {
      await migrateFromV1ToV2(db);
    }
    if (currentVersion < 3) {
      await migrateFromV2ToV3(db);
    }
    if (currentVersion < 4) {
      await migrateFromV3ToV4(db);
    }
  }

  if (currentVersion !== DATABASE_SCHEMA_VERSION) {
    await db.execute(`PRAGMA user_version = ${DATABASE_SCHEMA_VERSION}`);
  }
}

export function getDatabase(): DB {
  if (!databaseInstance) {
    databaseInstance = createDatabase();
  }

  return databaseInstance;
}

export async function initializeDatabase(db: DB = getDatabase()): Promise<DB> {
  if (db !== databaseInstance) {
    await applyMigrations(db, readSchemaVersion(db));
    return db;
  }

  if (!initializationPromise) {
    initializationPromise = applyMigrations(db, readSchemaVersion(db))
      .then(() => db)
      .catch(error => {
        initializationPromise = null;
        throw error;
      });
  }

  return initializationPromise;
}
