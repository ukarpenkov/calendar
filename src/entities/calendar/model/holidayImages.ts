import type { ImageSourcePropType } from 'react-native';
import type { CalendarDay } from './types';

const calendarImageByDate: Record<string, ImageSourcePropType> = {
  '2026-05-01': require('../../../../assets/days_img/may1.webp'),
};

export function getCalendarImagesForDays(
  days: readonly CalendarDay[],
): ImageSourcePropType[] {
  const images = new Set<ImageSourcePropType>();

  for (const day of days) {
    const image = calendarImageByDate[day.date];
    if (image) {
      images.add(image);
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
  return null;
}
