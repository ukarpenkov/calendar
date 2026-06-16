import type {
  CalendarDataSource,
  CalendarYear,
} from '../../entities/calendar';

/**
 * Discriminated union of screens shown after bootstrap (splash / DB ready).
 * Settings and import-entry are part of the same linear user flow as year/month.
 */
export type ReadyScreen =
  | { name: 'year' }
  | { name: 'settings' }
  | { name: 'import-entry' }
  | { name: 'vacation' }
  | { name: 'month-error'; month: number }
  | { name: 'month'; month: number };

export type AppContentStatus =
  | { kind: 'loading' }
  | {
      kind: 'ready';
      calendar: CalendarYear;
      activeCalendarSource: CalendarDataSource;
      screen: ReadyScreen;
    }
  | { kind: 'error' };
