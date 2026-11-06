/**
 * Calendar reload when the user changes UI language or bundled region.
 *
 * The providers do not import screens. They call `notify…`. `useCalendarSession`
 * registers the handlers that actually read and write SQLite:
 * language change → bundled region → `syncActiveYearWithBundledRegion`.
 */
export {
  notifyCalendarSyncOnAppLanguageChange,
  registerCalendarSyncOnAppLanguageChange,
  type CalendarSyncOnAppLanguageChangeHandler,
} from './appLanguageChangeCalendarSyncRegistry';
export {
  notifyCalendarSyncOnBundledRegionChange,
  registerCalendarSyncOnBundledRegionChange,
  type BundledRegionChangeCause,
  type CalendarSyncOnBundledRegionChangeHandler,
} from './bundledRegionChangeRegistry';
export {
  BundledCalendarRegionProvider,
  useBundledCalendarRegion,
} from './BundledCalendarRegionProvider';
export {
  shouldApplyBundledCalendarOnRegionChange,
  syncActiveYearWithBundledRegion,
} from './syncActiveYearWithBundledRegion';
