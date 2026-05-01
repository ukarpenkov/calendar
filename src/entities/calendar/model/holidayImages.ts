import type { ImageSourcePropType } from 'react-native';
import type { CalendarDay } from './types';

const newYearImage = require('../../../../assets/days_img/new_year_default.webp');
const holidayFallbackImage = require('../../../../assets/days_img/1777636821.png');
const observedHolidayFallbackImage = holidayFallbackImage;
const selectedWorkdayImage = require('../../../../assets/days_img/work_default.webp');
const selectedWeekendImage = require('../../../../assets/days_img/holday_default.webp');

const calendarImageByDate: Record<string, ImageSourcePropType> = {
  '2026-05-01': require('../../../../assets/days_img/may1.webp'),
  '2026-03-08': require('../../../../assets/days_img/mar8.webp'),

  // New Year holidays 2025 (Russia)
  '2025-01-01': newYearImage,
  '2025-01-02': newYearImage,
  '2025-01-03': newYearImage,
  '2025-01-04': newYearImage,
  '2025-01-05': newYearImage,
  '2025-01-06': newYearImage,
  '2025-01-07': newYearImage,
  '2025-01-08': newYearImage,
  '2025-12-31': newYearImage,

  // New Year holidays 2026 (Russia, Indonesia, Japan, Turkey)
  '2026-01-01': newYearImage,
  '2026-01-02': newYearImage,
  '2026-01-03': newYearImage,
  '2026-01-04': newYearImage,
  '2026-01-05': newYearImage,
  '2026-01-06': newYearImage,
  '2026-01-07': newYearImage,
  '2026-01-08': newYearImage,
  '2026-01-09': newYearImage,
  '2026-12-31': newYearImage,
};

const defaultImageByMonth: Record<number, ImageSourcePropType> = {
  1: require('../../../../assets/days_img/default_jan.webp'),
  2: require('../../../../assets/days_img/default_feb.webp'),
  6: require('../../../../assets/days_img/default_jun.webp'),
  7: require('../../../../assets/days_img/default_jul.webp'),
  8: require('../../../../assets/days_img/default_aug.webp'),
  9: require('../../../../assets/days_img/default_sep.webp'),
  10: require('../../../../assets/days_img/default_okt.webp'),
  11: require('../../../../assets/days_img/default_now.webp'),
  12: require('../../../../assets/days_img/default_dec.webp'),
};

export function getCalendarImagesForDays(
  days: readonly CalendarDay[],
): ImageSourcePropType[] {
  const images = new Set<ImageSourcePropType>();
  const monthsWithHolidayImage = new Set<number>();

  for (const day of days) {
    const image = calendarImageByDate[day.date];
    if (image) {
      images.add(image);
      monthsWithHolidayImage.add(day.month);
    }
  }

  for (const day of days) {
    if (!monthsWithHolidayImage.has(day.month)) {
      const fallback = defaultImageByMonth[day.month];
      if (fallback) {
        images.add(fallback);
        monthsWithHolidayImage.add(day.month);
      }
    }
  }

  if (days.some(d => d.type === 'workday' || d.type === 'shortened')) {
    images.add(selectedWorkdayImage);
  }

  if (days.some(d => d.type === 'weekend')) {
    images.add(selectedWeekendImage);
  }

  if (days.some(d => d.type === 'holiday')) {
    images.add(holidayFallbackImage);
  }

  return Array.from(images);
}

function isObservedHolidayDayOff(day: CalendarDay): boolean {
  return [
    day.holidayNameRu,
    day.holidayNameEn,
    day.holidayNameTr,
    day.holidayNameId,
    day.holidayNameJa,
  ].some(name => {
    const normalized = name?.toLowerCase() ?? '';

    return (
      normalized.includes('выходной за') ||
      normalized.includes('day off for')
    );
  });
}

function getHolidayImageForDay(day: CalendarDay): ImageSourcePropType {
  const image = calendarImageByDate[day.date];
  if (image) {
    return image;
  }

  return isObservedHolidayDayOff(day)
    ? observedHolidayFallbackImage
    : holidayFallbackImage;
}

export function getHolidayImageForMonth(
  days: readonly CalendarDay[],
): ImageSourcePropType | null {
  for (const day of days) {
    if (day.type === 'holiday') {
      const image = calendarImageByDate[day.date];
      if (image) {
        return image;
      }
    }
  }

  if (days.length > 0) {
    return defaultImageByMonth[days[0].month] ?? null;
  }

  return null;
}

export function getDayImage(day: CalendarDay): ImageSourcePropType | null {
  if (day.type === 'workday' || day.type === 'shortened') {
    return selectedWorkdayImage;
  }
  if (day.type === 'weekend') {
    return selectedWeekendImage;
  }
  if (day.type === 'holiday') {
    return getHolidayImageForDay(day);
  }
  return null;
}
