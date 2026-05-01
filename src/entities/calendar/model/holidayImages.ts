import type { ImageSourcePropType } from 'react-native';
import type { CalendarDay } from './types';

const holidayImageByDate: Record<string, ImageSourcePropType> = {
  '2026-05-01': require('../../../../assets/days_img/may1.webp'),
};

export function getHolidayImageForMonth(
  days: readonly CalendarDay[],
): ImageSourcePropType | null {
  for (const day of days) {
    if (day.type === 'holiday') {
      const image = holidayImageByDate[day.date];
      if (image) {
        return image;
      }
    }
  }
  return null;
}
