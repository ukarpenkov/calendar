import type { BundledCalendarRegionCode } from '../../shared/config/agreedLanguagesAndBundledCalendars';

export type CalendarSyncOnBundledRegionChangeHandler = (
  previousRegion: BundledCalendarRegionCode,
  nextRegion: BundledCalendarRegionCode,
) => void | Promise<void>;

let handler: CalendarSyncOnBundledRegionChangeHandler | null = null;

export function registerCalendarSyncOnBundledRegionChange(
  nextHandler: CalendarSyncOnBundledRegionChangeHandler | null,
): void {
  handler = nextHandler;
}

export function notifyCalendarSyncOnBundledRegionChange(
  previousRegion: BundledCalendarRegionCode,
  nextRegion: BundledCalendarRegionCode,
): void {
  const current = handler;
  if (!current) {
    return;
  }
  void Promise.resolve(current(previousRegion, nextRegion)).catch(() => {
    // Ошибки обрабатывает зарегистрированный обработчик; страховка от unhandled rejection.
  });
}
