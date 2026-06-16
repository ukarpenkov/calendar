export {
  activateUserJsonImport,
  createCalendarRepository,
  getActiveCalendarSource,
  getActiveCalendarIsUserJsonImport,
  getActiveYear,
  getCalendarRepository,
  getMonthCalendar,
  getUserJsonImportYear,
  getYearCalendar,
  replaceActiveYear,
  saveUserJsonImport,
  seedBundledYearIfNeeded,
  type CalendarDataSource,
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
export {
  buildCalendarYearViewCache,
  type CalendarYearMonthDetails,
  type CalendarYearViewCache,
} from './model/year-view-cache';
export type { CalendarMonthWeek } from './model/month-helpers';
export { buildYearMonthSummaries } from './model/year-summary';
export type { CalendarDay, CalendarYear, DayType } from './model/types';
export { getHolidayDisplayName } from './model/holiday-display-name';
export {
  getCalendarImagesForDays,
  getDayImage,
  getHolidayImageForMonth,
  isDateOnVacation,
  getVacationImage,
} from './model/holidayImages';
export type { CalendarMonthSummary } from './model/year-summary';
export {
  getCalendarPalette,
  getDayTypeColors,
  getDayTypeLabel,
  type CalendarPalette,
  type DayTypeColors,
} from './lib/presentation';
