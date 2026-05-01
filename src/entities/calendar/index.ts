export {
  createCalendarRepository,
  getActiveCalendarIsUserJsonImport,
  getActiveYear,
  getCalendarRepository,
  getMonthCalendar,
  getYearCalendar,
  replaceActiveYear,
  seedBundledYearIfNeeded,
  type CalendarRepository,
  type CalendarRepositoryDependencies,
  type ReplaceActiveYearSource,
} from './model/repository';
export {
  buildMonthDetail,
  type CalendarMonthDetail,
} from './model/month-detail';
export {
  getCalendarDaysForMonth,
  getUtcDaysInMonth,
} from './model/month-from-year';
export type { CalendarMonthWeek } from './model/month-helpers';
export { buildYearMonthSummaries } from './model/year-summary';
export type { CalendarDay, CalendarYear, DayType } from './model/types';
export { getHolidayDisplayName } from './model/holiday-display-name';
export { getHolidayImageForMonth } from './model/holidayImages';
export type { CalendarMonthSummary } from './model/year-summary';
export {
  getCalendarPalette,
  getDayTypeColors,
  getDayTypeLabel,
  type CalendarPalette,
  type DayTypeColors,
} from './lib/presentation';
