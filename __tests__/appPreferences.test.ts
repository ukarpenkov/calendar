/**
 * @format
 */

import { open, type DB } from '@op-engineering/op-sqlite';

import {
  createAppPreferencesRepository,
  type AppPreferencesRepository,
} from '../src/shared/lib/settings';
import { initializeDatabase } from '../src/shared/lib/db';

describe('app preferences repository', () => {
  let db: DB;
  let repository: AppPreferencesRepository;

  beforeEach(async () => {
    db = open({ name: 'app-preferences-test.sqlite', location: ':memory:' });
    await initializeDatabase(db);
    repository = createAppPreferencesRepository(db);
  });

  afterEach(() => {
    db?.close();
  });

  it('stores and reads back the selected app language', async () => {
    expect(await repository.getLanguage()).toBeNull();

    await repository.setLanguage('ru');
    expect(await repository.getLanguage()).toBe('ru');

    await repository.setLanguage('en');
    expect(await repository.getLanguage()).toBe('en');
  });

  it('ignores invalid language values stored in metadata', async () => {
    await db.execute(
      'INSERT INTO app_metadata (key, value) VALUES (?, ?)',
      ['language', 'de'],
    );

    expect(await repository.getLanguage()).toBeNull();
  });

  it('stores and reads back the selected app theme', async () => {
    expect(await repository.getTheme()).toBeNull();

    await repository.setTheme('dark');
    expect(await repository.getTheme()).toBe('dark');

    await repository.setTheme('light');
    expect(await repository.getTheme()).toBe('light');
  });

  it('ignores invalid theme values stored in metadata', async () => {
    await db.execute(
      'INSERT INTO app_metadata (key, value) VALUES (?, ?)',
      ['theme', 'system'],
    );

    expect(await repository.getTheme()).toBeNull();
  });
});
