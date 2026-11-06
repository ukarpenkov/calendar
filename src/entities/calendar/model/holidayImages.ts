import type { ImageSourcePropType } from 'react-native';

import { isDateOnVacation } from '../../../shared/lib/date/vacationRange';
import type { CalendarDay } from './types';
import { countrySpecificHolidayImageByKey } from './holiday-images/catalog';
import {
  defaultImageByMonth,
  fallbackHolidayImage,
  getWorkdayImage,
  selectedWeekendImage,
  shortenedDayImage,
  vacationImage,
} from './holiday-images/holidayImageAssets';

function getCountrySpecificHolidayImage(
  day: CalendarDay,
): ImageSourcePropType | null {
  const holidayNames = [
    day.holidayNameEn,
    day.holidayNameRu,
    day.holidayNameTr,
    day.holidayNameId,
    day.holidayNameJa,
    day.holidayNameEs,
  ];

  for (const holidayName of holidayNames) {
    if (!holidayName) continue;

    const image =
      countrySpecificHolidayImageByKey[`${day.date}|${holidayName}`];
    if (image) return image;
  }

  return null;
}

function getCalendarImageForDay(day: CalendarDay): ImageSourcePropType | null {
  return getCountrySpecificHolidayImage(day);
}

export function getCalendarImagesForDays(
  days: readonly CalendarDay[],
): ImageSourcePropType[] {
  const images = new Set<ImageSourcePropType>();

  // The month screen starts with its monthly illustration even when that
  // month contains holidays. Prepare those first, then day-specific images.
  for (const day of days) {
    const image = defaultImageByMonth[day.month];
    if (image) images.add(image);
  }

  for (const day of days) {
    const image = getCalendarImageForDay(day);
    if (image) {
      images.add(image);
    } else if (day.type === 'holiday') {
      images.add(fallbackHolidayImage);
    }
  }

  for (const day of days) {
    if (day.type === 'workday') {
      images.add(getWorkdayImage(day));
    }
  }

  if (days.some(d => d.type === 'shortened')) {
    images.add(shortenedDayImage);
  }

  if (days.some(d => d.type === 'weekend')) {
    images.add(selectedWeekendImage);
  }

  images.add(getVacationImage());

  return Array.from(images);
}

function getHolidayImageForDay(day: CalendarDay): ImageSourcePropType | null {
  const image = getCalendarImageForDay(day);
  if (image) {
    return image;
  }

  return fallbackHolidayImage;
}

export function getHolidayImageForMonth(
  days: readonly CalendarDay[],
): ImageSourcePropType | null {
  if (days.length > 0) {
    const fallback = defaultImageByMonth[days[0].month];
    if (fallback) {
      return fallback;
    }
  }

  for (const day of days) {
    if (day.type === 'holiday') {
      const image = getCalendarImageForDay(day);
      if (image) {
        return image;
      }
    }
  }

  return null;
}

export { isDateOnVacation };

export function getVacationImage(): ImageSourcePropType {
  return vacationImage;
}

export function getDayImage(
  day: CalendarDay,
  _allDays?: readonly CalendarDay[],
  vacationPeriods?: readonly { startDate: string; endDate: string }[],
): ImageSourcePropType | null {
  const onVacation =
    vacationPeriods != null && isDateOnVacation(day.date, vacationPeriods);

  if (onVacation && day.type !== 'holiday') {
    return vacationImage;
  }

  if (day.type === 'shortened') {
    return shortenedDayImage;
  }
  if (day.type === 'workday') {
    return getWorkdayImage(day);
  }
  if (day.type === 'weekend') {
    const dayImage = getCalendarImageForDay(day);
    if (dayImage) return dayImage;

    return selectedWeekendImage;
  }
  if (day.type === 'holiday') {
    return getHolidayImageForDay(day);
  }
  return null;
}
