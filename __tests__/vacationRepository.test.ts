/**
 * @format
 */

import { open, type DB } from '@op-engineering/op-sqlite';

import { initializeDatabase } from '../src/shared/lib/db';
import { createVacationRepository } from '../src/features/vacation/model/repository';
import type { VacationRepository } from '../src/features/vacation/model/repository';

describe('vacation_periods table', () => {
  let db: DB;

  beforeEach(async () => {
    db = open({ name: 'vacation-test.sqlite', location: ':memory:' });
    await initializeDatabase(db);
  });

  afterEach(() => {
    db?.close();
  });

  it('creates vacation_periods table after database initialization', async () => {
    await expect(
      db.execute(
        `INSERT INTO vacation_periods (start_date, end_date, color)
         VALUES (?, ?, ?)`,
        ['2026-07-01', '2026-07-14', '#2DD4BF'],
      ),
    ).resolves.toBeDefined();
  });

  it('inserts a record with start_date, end_date, and color', async () => {
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      ['2026-07-01', '2026-07-14', '#FF6B6B'],
    );

    const result = await db.execute('SELECT * FROM vacation_periods');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      start_date: '2026-07-01',
      end_date: '2026-07-14',
      color: '#FF6B6B',
    });
  });

  it('reads records back', async () => {
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      ['2026-08-01', '2026-08-10', '#2DD4BF'],
    );
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      ['2026-12-20', '2026-12-31', '#FF6B6B'],
    );

    const result = await db.execute(
      'SELECT * FROM vacation_periods ORDER BY start_date',
    );
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toMatchObject({ start_date: '2026-08-01' });
    expect(result.rows[1]).toMatchObject({ start_date: '2026-12-20' });
  });

  it('deletes a record by id', async () => {
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      ['2026-07-01', '2026-07-14', '#2DD4BF'],
    );

    const inserted = await db.execute('SELECT id FROM vacation_periods');
    const id = inserted.rows[0].id as number;

    await db.execute('DELETE FROM vacation_periods WHERE id = ?', [id]);

    const result = await db.execute('SELECT * FROM vacation_periods');
    expect(result.rows).toHaveLength(0);
  });

  it('updates color by id', async () => {
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      ['2026-07-01', '2026-07-14', '#2DD4BF'],
    );

    const inserted = await db.execute('SELECT id FROM vacation_periods');
    const id = inserted.rows[0].id as number;

    await db.execute('UPDATE vacation_periods SET color = ? WHERE id = ?', [
      '#FF6B6B',
      id,
    ]);

    const result = await db.execute(
      'SELECT color FROM vacation_periods WHERE id = ?',
      [id],
    );
    expect(result.rows[0].color).toBe('#FF6B6B');
  });

  it('auto-increments id', async () => {
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      ['2026-07-01', '2026-07-14', '#2DD4BF'],
    );
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date, color)
       VALUES (?, ?, ?)`,
      ['2026-08-01', '2026-08-10', '#FF6B6B'],
    );

    const result = await db.execute(
      'SELECT id FROM vacation_periods ORDER BY id',
    );
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].id).toBe(1);
    expect(result.rows[1].id).toBe(2);
  });

  it('uses default color #2DD4BF when color is not specified', async () => {
    await db.execute(
      `INSERT INTO vacation_periods (start_date, end_date)
       VALUES (?, ?)`,
      ['2026-07-01', '2026-07-14'],
    );

    const result = await db.execute('SELECT color FROM vacation_periods');
    expect(result.rows[0].color).toBe('#2DD4BF');
  });
});

describe('VacationRepository', () => {
  let db: DB;
  let repo: VacationRepository;

  beforeEach(async () => {
    db = open({ name: 'vacation-repo-test.sqlite', location: ':memory:' });
    await initializeDatabase(db);
    repo = createVacationRepository(db);
  });

  afterEach(() => {
    db?.close();
  });

  describe('create', () => {
    it('creates a vacation period and returns it', async () => {
      const period = await repo.create('2026-07-01', '2026-07-14', '#FF6B6B');

      expect(period).toEqual({
        id: expect.any(Number),
        startDate: '2026-07-01',
        endDate: '2026-07-14',
        color: '#FF6B6B',
      });
      expect(period.id).toBeGreaterThan(0);
    });

    it('uses default color when color is not provided', async () => {
      const period = await repo.create('2026-07-01', '2026-07-14');

      expect(period.color).toBe('#2DD4BF');
    });

    it('auto-increments id', async () => {
      const first = await repo.create('2026-07-01', '2026-07-14');
      const second = await repo.create('2026-08-01', '2026-08-10');

      expect(second.id).toBe(first.id + 1);
    });
  });

  describe('getAll', () => {
    it('returns empty array when no records exist', async () => {
      const result = await repo.getAll();

      expect(result).toEqual([]);
    });

    it('returns all periods sorted by start_date DESC', async () => {
      await repo.create('2026-07-01', '2026-07-14');
      await repo.create('2026-12-20', '2026-12-31');
      await repo.create('2026-03-01', '2026-03-10');

      const result = await repo.getAll();

      expect(result).toHaveLength(3);
      expect(result[0].startDate).toBe('2026-12-20');
      expect(result[1].startDate).toBe('2026-07-01');
      expect(result[2].startDate).toBe('2026-03-01');
    });
  });

  describe('update', () => {
    it('updates an existing period', async () => {
      const created = await repo.create('2026-07-01', '2026-07-14', '#FF6B6B');

      await repo.update(created.id, '2026-07-05', '2026-07-20', '#4FC3F7');

      const all = await repo.getAll();
      const updated = all.find(p => p.id === created.id);

      expect(updated).toEqual({
        id: created.id,
        startDate: '2026-07-05',
        endDate: '2026-07-20',
        color: '#4FC3F7',
      });
    });
  });

  describe('remove', () => {
    it('deletes a period by id', async () => {
      const created = await repo.create('2026-07-01', '2026-07-14');

      await repo.remove(created.id);

      const result = await repo.getAll();
      expect(result).toHaveLength(0);
    });

    it('does not throw when removing non-existent id', async () => {
      await expect(repo.remove(999)).resolves.toBeUndefined();
    });
  });
});
