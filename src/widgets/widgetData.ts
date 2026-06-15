import { open } from '@op-engineering/op-sqlite';

import { mapCalendarDayRow } from '../entities/calendar/model/mappers';
import type { CalendarDay } from '../entities/calendar/model/types';
import { getHolidayDisplayName } from '../entities/calendar/model/holiday-display-name';
import { initializeDatabase } from '../shared/lib/db/database';
import { DATABASE_NAME, ACTIVE_CALENDAR_SOURCE_METADATA_KEY } from '../shared/lib/db/schema';
import { detectDeviceLanguage, getMonthLabel, getShortWeekdayLabels } from '../shared/lib/i18n';
import type { AppLanguage } from '../shared/lib/i18n';
import { getDayDrawableResourceName, getVacationDrawableResourceName } from './imageMapping';

export interface WidgetDayData {
  date: string;
  dayType: CalendarDay['type'];
  isShortened: boolean;
  holidayName: string | null;
  imageResourceName: string;
  language: AppLanguage;
  monthLabel: string;
  dayNumber: number;
  year: number;
  weekdayLabel: string;
  isOnVacation: boolean;
  vacationColor: string | null;
}

function getLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function readMetadataValue(
  db: Awaited<ReturnType<typeof open>>,
  key: string,
): Promise<string | null> {
  const result = await db.execute(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
    [key],
  );
  const rawValue = result.rows[0]?.value;
  return typeof rawValue === 'string' ? rawValue : null;
}

export async function fetchTodayWidgetData(): Promise<WidgetDayData | null> {
  try {
    const db = open({ name: DATABASE_NAME });
    await initializeDatabase(db);

    const todayDate = getLocalIsoDate();

    const storedSource = await readMetadataValue(
      db,
      ACTIVE_CALENDAR_SOURCE_METADATA_KEY,
    );
    const source = storedSource === 'user_json_import' ? 'user_json_import' : 'bundled';

    const result = await db.execute(
      `SELECT
        date, year, month, day, weekday, type,
        holiday_name_ru, holiday_name_en, holiday_name_tr,
        holiday_name_id, holiday_name_ja, is_shortened, work_hours
      FROM calendar_days
      WHERE source = ? AND date = ?
      LIMIT 1`,
      [source, todayDate],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const day: CalendarDay = mapCalendarDayRow(result.rows[0]);

    const storedLanguage = await readMetadataValue(db, 'language');
    const validLanguages: AppLanguage[] = ['en', 'ru', 'tr', 'id', 'ja'];
    const language: AppLanguage =
      storedLanguage && validLanguages.includes(storedLanguage as AppLanguage)
        ? (storedLanguage as AppLanguage)
        : detectDeviceLanguage();

    const monthLabel = getMonthLabel(language, day.month);
    const weekdayLabels = getShortWeekdayLabels(language);
    const weekdayLabel = weekdayLabels[day.weekday - 1] ?? '';

    const holidayName = getHolidayDisplayName(day, language);
    const imageResourceName = getDayDrawableResourceName(day);

    let isOnVacation = false;
    let vacationColor: string | null = null;

    try {
      const vacationResult = await db.execute(
        'SELECT color FROM vacation_periods WHERE start_date <= ? AND end_date >= ? LIMIT 1',
        [todayDate, todayDate],
      );
      if (vacationResult.rows.length > 0) {
        isOnVacation = true;
        const colorVal = vacationResult.rows[0].color;
        vacationColor = typeof colorVal === 'string' ? colorVal : '#2DD4BF';
      }
    } catch {
      // Vacation table may not exist yet
    }

    const finalImageResourceName =
      isOnVacation && day.type !== 'holiday'
        ? getVacationDrawableResourceName()
        : imageResourceName;

    return {
      date: day.date,
      dayType: day.type,
      isShortened: day.isShortened,
      holidayName,
      imageResourceName: finalImageResourceName,
      language,
      monthLabel,
      dayNumber: day.day,
      year: day.year,
      weekdayLabel,
      isOnVacation,
      vacationColor,
    };
  } catch {
    return null;
  }
}
