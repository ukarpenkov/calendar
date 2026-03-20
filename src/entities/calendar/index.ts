export {
  createCalendarRepository,
  getActiveYear,
  getCalendarRepository,
  getMonthCalendar,
  getYearCalendar,
  replaceActiveYear,
  seedBundledYearIfNeeded,
  type CalendarRepository,
} from './model/repository';
export {
  buildMonthDetail,
  type CalendarMonthDetail,
} from './model/month-detail';
export type { CalendarMonthWeek } from './model/month-helpers';
export { buildYearMonthSummaries } from './model/year-summary';
export type { CalendarDay, CalendarYear, DayType } from './model/types';
export type { CalendarMonthSummary } from './model/year-summary';
export {
  getCalendarPalette,
  getDayTypeColors,
  getDayTypeLabel,
  type CalendarPalette,
  type DayTypeColors,
} from './lib/presentation';
