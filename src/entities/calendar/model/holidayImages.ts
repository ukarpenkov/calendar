import type { ImageSourcePropType } from 'react-native';
import type { CalendarDay } from './types';

const calendarImageByDate: Record<string, ImageSourcePropType> = {
  '2026-05-01': require('../../../../assets/days_img/may1.webp'),
  '2026-03-08': require('../../../../assets/days_img/mar8.webp'),
};

const defaultImageByMonth: Record<number, ImageSourcePropType> = {
  6: require('../../../../assets/days_img/default_jun.webp'),
  7: require('../../../../assets/days_img/default_jul.webp'),
  8: require('../../../../assets/days_img/default_aug.webp'),
  9: require('../../../../assets/days_img/default_sep.webp'),
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

  return Array.from(images);
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
