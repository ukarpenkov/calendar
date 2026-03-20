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
  const value = result.rows[0]?.user_version;

  return typeof value === 'number' ? value : 0;
}

async function applyMigrations(db: DB, currentVersion: number): Promise<void> {
  if (currentVersion > DATABASE_SCHEMA_VERSION) {
    throw new Error(
      `Database schema version ${currentVersion} is newer than the app supports.`,
    );
  }

  if (currentVersion < 1) {
    await db.executeBatch(SCHEMA_COMMANDS);
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
