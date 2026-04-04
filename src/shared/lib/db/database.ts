import { open, type DB } from '@op-engineering/op-sqlite';

import {
  DATABASE_NAME,
  DATABASE_SCHEMA_VERSION,
  SCHEMA_COMMANDS,
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

async function applyMigrations(db: DB, currentVersion: number): Promise<void> {
  if (currentVersion > DATABASE_SCHEMA_VERSION) {
    throw new Error(
      `Database schema version ${currentVersion} is newer than the app supports.`,
    );
  }

  if (currentVersion < 1) {
    await db.executeBatch(SCHEMA_COMMANDS);
  } else if (currentVersion < 2) {
    await migrateFromV1ToV2(db);
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
