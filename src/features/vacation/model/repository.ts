import type { DB } from '@op-engineering/op-sqlite';
import type { Scalar } from '@op-engineering/op-sqlite';

import type { VacationPeriod } from './types';

export interface VacationRepository {
  getAll(): Promise<VacationPeriod[]>;
  create(
    startDate: string,
    endDate: string,
    color?: string,
  ): Promise<VacationPeriod>;
  update(
    id: number,
    startDate: string,
    endDate: string,
    color: string,
  ): Promise<void>;
  remove(id: number): Promise<void>;
}

interface VacationPeriodRow {
  id: number;
  start_date: string;
  end_date: string;
  color: string;
}

function mapVacationPeriodRow(row: Record<string, Scalar>): VacationPeriod {
  const id = row.id;
  const startDate = row.start_date;
  const endDate = row.end_date;
  const color = row.color;

  if (typeof id !== 'number') {
    throw new Error('Expected "id" to be a number.');
  }
  if (typeof startDate !== 'string') {
    throw new Error('Expected "start_date" to be a string.');
  }
  if (typeof endDate !== 'string') {
    throw new Error('Expected "end_date" to be a string.');
  }
  if (typeof color !== 'string') {
    throw new Error('Expected "color" to be a string.');
  }

  return { id, startDate, endDate, color };
}

export function createVacationRepository(db: DB): VacationRepository {
  return {
    async getAll(): Promise<VacationPeriod[]> {
      const result = await db.execute(
        'SELECT id, start_date, end_date, color FROM vacation_periods ORDER BY start_date DESC',
      );

      return result.rows.map(mapVacationPeriodRow);
    },

    async create(
      startDate: string,
      endDate: string,
      color: string = '#2DD4BF',
    ): Promise<VacationPeriod> {
      const result = await db.execute(
        `INSERT INTO vacation_periods (start_date, end_date, color)
         VALUES (?, ?, ?)`,
        [startDate, endDate, color],
      );

      const insertedId = result.insertId;

      if (typeof insertedId !== 'number') {
        throw new Error('Failed to get inserted id.');
      }

      return {
        id: insertedId,
        startDate,
        endDate,
        color,
      };
    },

    async update(
      id: number,
      startDate: string,
      endDate: string,
      color: string,
    ): Promise<void> {
      await db.execute(
        `UPDATE vacation_periods
         SET start_date = ?, end_date = ?, color = ?
         WHERE id = ?`,
        [startDate, endDate, color, id],
      );
    },

    async remove(id: number): Promise<void> {
      await db.execute('DELETE FROM vacation_periods WHERE id = ?', [id]);
    },
  };
}
