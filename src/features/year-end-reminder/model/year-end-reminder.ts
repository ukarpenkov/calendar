import { Linking } from 'react-native';

export const WORKING_CALENDAR_TELEGRAM_HANDLE = 'workingcalendar';
export const WORKING_CALENDAR_TELEGRAM_PATH = `t.me/${WORKING_CALENDAR_TELEGRAM_HANDLE}`;
export const WORKING_CALENDAR_TELEGRAM_WEB_URL = `https://${WORKING_CALENDAR_TELEGRAM_PATH}`;

const WORKING_CALENDAR_TELEGRAM_APP_URL = `tg://resolve?domain=${WORKING_CALENDAR_TELEGRAM_HANDLE}`;

export function shouldShowYearEndReminder(
  activeYear: number,
  now: Date = new Date(),
): boolean {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return currentYear === activeYear && currentMonth >= 10;
}

export async function openWorkingCalendarTelegram(): Promise<void> {
  const canOpenTelegramApp = await Linking.canOpenURL(
    WORKING_CALENDAR_TELEGRAM_APP_URL,
  );

  await Linking.openURL(
    canOpenTelegramApp
      ? WORKING_CALENDAR_TELEGRAM_APP_URL
      : WORKING_CALENDAR_TELEGRAM_WEB_URL,
  );
}
