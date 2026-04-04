import type { AppLanguage } from '../../shared/lib/i18n';

export type CalendarSyncOnAppLanguageChangeHandler = (
  previousLanguage: AppLanguage,
  nextLanguage: AppLanguage,
) => void | Promise<void>;

let handler: CalendarSyncOnAppLanguageChangeHandler | null = null;

export function registerCalendarSyncOnAppLanguageChange(
  nextHandler: CalendarSyncOnAppLanguageChangeHandler | null,
): void {
  handler = nextHandler;
}

export function notifyCalendarSyncOnAppLanguageChange(
  previousLanguage: AppLanguage,
  nextLanguage: AppLanguage,
): void {
  const current = handler;
  if (!current) {
    return;
  }
  void Promise.resolve(
    current(previousLanguage, nextLanguage),
  ).catch(() => {});
}
