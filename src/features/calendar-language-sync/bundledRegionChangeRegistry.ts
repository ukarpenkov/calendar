import type { BundledCalendarRegionCode } from '../../shared/config/agreedLanguagesAndBundledCalendars';

/** Откуда пришла смена региона bundled: из настроек или привязка к смене языка интерфейса. */
export type BundledRegionChangeCause = 'settings' | 'app_language';

export type CalendarSyncOnBundledRegionChangeHandler = (
  previousRegion: BundledCalendarRegionCode,
  nextRegion: BundledCalendarRegionCode,
  cause: BundledRegionChangeCause,
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
  cause: BundledRegionChangeCause = 'settings',
): void {
  const current = handler;
  if (!current) {
    return;
  }
  void Promise.resolve(current(previousRegion, nextRegion, cause)).catch(() => {
    // Ошибки обрабатывает зарегистрированный обработчик; страховка от unhandled rejection.
  });
}
