import type { ImageSourcePropType } from 'react-native';
import type { CalendarDay } from './types';

const newYearImage = require('../../../../assets/days_img/new_year_default.webp');
const selectedWorkdayImage = require('../../../../assets/days_img/work_default.webp');
const selectedWeekendImage = require('../../../../assets/days_img/holday_default.webp');
const christmasImage = require('../../../../assets/days_img/7jan_сristmas.webp');
const defenderDayImage = require('../../../../assets/days_img/feb23_defender_day.webp');
const june12Image = require('../../../../assets/days_img/jun12_unity.webp');
const trMarchImage = require('../../../../assets/days_img/Tr_20match.webp');
const trApril23Image = require('../../../../assets/days_img/tr_23apr.webp');
const trMay19Image = require('../../../../assets/days_img/tr_19may.webp');
const trKbImage = require('../../../../assets/days_img/tr_KB.webp');
const trJul15Image = require('../../../../assets/days_img/tr_15jul.webp');
const trAug30Image = require('../../../../assets/days_img/tr_30aug.webp');
const trOct29Image = require('../../../../assets/days_img/tr_29okt.webp');
const ruMay9Image = require('../../../../assets/days_img/ru_9may.webp');
const jpNationalFoundationImage = require('../../../../assets/days_img/jp11_feb.webp');
const jpEmperorBirthdayImage = require('../../../../assets/days_img/jp_23feb.webp');
const jpVernalEquinoxImage = require('../../../../assets/days_img/jp_20mar.webp');

const countrySpecificHolidayImageByKey: Record<string, ImageSourcePropType> = {
  '2025-02-23|Defender of the Fatherland Day': defenderDayImage,
  '2026-02-23|Defender of the Fatherland Day': defenderDayImage,
  '2026-02-11|National Foundation Day': jpNationalFoundationImage,
  '2025-02-23|Emperor\'s Birthday': jpEmperorBirthdayImage,
  '2026-02-23|Emperor\'s Birthday': jpEmperorBirthdayImage,
  '2025-03-20|Vernal Equinox Day': jpVernalEquinoxImage,
  '2026-03-20|Vernal Equinox Day': jpVernalEquinoxImage,
  '2026-03-20|Eid al-Fitr (1st day)': trMarchImage,
  '2026-03-21|Eid al-Fitr (2nd day)': trMarchImage,
  '2026-03-22|Eid al-Fitr (3rd day)': trMarchImage,
};

const calendarImageByDate: Record<string, ImageSourcePropType> = {
  '2026-05-01': require('../../../../assets/days_img/may1.webp'),
  '2026-03-08': require('../../../../assets/days_img/mar8.webp'),
  '2025-06-12': june12Image,
  '2026-06-12': june12Image,
  '2025-03-20': trMarchImage,
  '2025-03-21': trMarchImage,
  '2025-03-22': trMarchImage,
  '2025-04-23': trApril23Image,
  '2026-04-23': trApril23Image,
  '2025-05-19': trMay19Image,
  '2026-05-19': trMay19Image,
  '2025-05-27': trKbImage,
  '2025-05-28': trKbImage,
  '2025-05-29': trKbImage,
  '2025-05-30': trKbImage,
  '2026-05-27': trKbImage,
  '2026-05-28': trKbImage,
  '2026-05-29': trKbImage,
  '2026-05-30': trKbImage,
  '2025-07-15': trJul15Image,
  '2026-07-15': trJul15Image,
  '2025-08-30': trAug30Image,
  '2026-08-30': trAug30Image,
  '2025-10-29': trOct29Image,
  '2026-10-29': trOct29Image,
  '2025-05-09': ruMay9Image,
  '2026-05-09': ruMay9Image,
  '2025-07-12': june12Image,
  '2026-07-12': june12Image,
  '2025-11-04': require('../../../../assets/days_img/ru_4nov.webp'),
  '2026-11-04': require('../../../../assets/days_img/ru_4nov.webp'),
  '2025-01-16': require('../../../../assets/days_img/id_16jan.webp'),
  '2026-01-16': require('../../../../assets/days_img/id_16jan.webp'),
  '2025-02-16': require('../../../../assets/days_img/id_17feb.webp'),
  '2025-02-17': require('../../../../assets/days_img/id_17feb.webp'),
  '2026-02-16': require('../../../../assets/days_img/id_17feb.webp'),
  '2026-02-17': require('../../../../assets/days_img/id_17feb.webp'),
  '2025-06-01': require('../../../../assets/days_img/id_1jun.webp'),
  '2026-06-01': require('../../../../assets/days_img/id_1jun.webp'),
  '2025-06-16': require('../../../../assets/days_img/id_16jun.webp'),
  '2026-06-16': require('../../../../assets/days_img/id_16jun.webp'),
  '2025-08-17': require('../../../../assets/days_img/id_17aug.webp'),
  '2026-08-17': require('../../../../assets/days_img/id_17aug.webp'),
  '2025-03-18': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2025-03-19': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2025-03-20': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2025-03-21': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2025-03-22': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2025-03-23': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2025-03-24': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-18': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-19': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-20': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-21': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-22': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-23': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-24': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2025-04-03': require('../../../../assets/days_img/id_3apr.webp'),
  '2026-04-03': require('../../../../assets/days_img/id_3apr.webp'),
  '2025-04-05': require('../../../../assets/days_img/id_5apr.webp'),
  '2026-04-05': require('../../../../assets/days_img/id_5apr.webp'),
  '2025-01-13': require('../../../../assets/days_img/jp_12jan.webp'),
  '2026-01-12': require('../../../../assets/days_img/jp_12jan.webp'),
  '2025-10-13': require('../../../../assets/days_img/jp_12okt.webp'),
  '2026-10-12': require('../../../../assets/days_img/jp_12okt.webp'),
  '2025-09-15': require('../../../../assets/days_img/jp_21sep.webp'),
  '2026-09-21': require('../../../../assets/days_img/jp_21sep.webp'),
  '2025-09-23': require('../../../../assets/days_img/jp_23sep.webp'),
  '2026-09-23': require('../../../../assets/days_img/jp_23sep.webp'),
  '2025-04-29': require('../../../../assets/days_img/jp_29apr.webp'),
  '2026-04-29': require('../../../../assets/days_img/jp_29apr.webp'),

  // New Year holidays 2025 (Russia)
  '2025-01-01': newYearImage,
  '2025-01-02': newYearImage,
  '2025-01-03': newYearImage,
  '2025-01-04': newYearImage,
  '2025-01-05': newYearImage,
  '2025-01-06': newYearImage,
  '2025-01-07': christmasImage,
  '2025-01-08': newYearImage,
  '2025-12-31': newYearImage,

  // New Year holidays 2026 (Russia, Indonesia, Japan, Turkey)
  '2026-01-01': newYearImage,
  '2026-01-02': newYearImage,
  '2026-01-03': newYearImage,
  '2026-01-04': newYearImage,
  '2026-01-05': newYearImage,
  '2026-01-06': newYearImage,
  '2026-01-07': christmasImage,
  '2026-01-08': newYearImage,
  '2026-01-09': newYearImage,
  '2026-12-31': newYearImage,
  '2025-12-24': christmasImage,
  '2026-12-24': christmasImage,
  '2025-12-25': christmasImage,
  '2026-12-25': christmasImage,
};

const defaultImageByMonth: Record<number, ImageSourcePropType> = {
  1: require('../../../../assets/days_img/default_jan.webp'),
  2: require('../../../../assets/days_img/default_feb.webp'),
  3: require('../../../../assets/days_img/default_march.webp'),
  4: require('../../../../assets/days_img/default_april.webp'),
  5: require('../../../../assets/days_img/default_may.webp'),
  6: require('../../../../assets/days_img/default_jun.webp'),
  7: require('../../../../assets/days_img/default_jul.webp'),
  8: require('../../../../assets/days_img/default_aug.webp'),
  9: require('../../../../assets/days_img/default_sep.webp'),
  10: require('../../../../assets/days_img/default_okt.webp'),
  11: require('../../../../assets/days_img/default_now.webp'),
  12: require('../../../../assets/days_img/default_dec.webp'),
};

function getCountrySpecificHolidayImage(
  day: CalendarDay,
): ImageSourcePropType | null {
  const holidayNames = [
    day.holidayNameEn,
    day.holidayNameRu,
    day.holidayNameTr,
    day.holidayNameId,
    day.holidayNameJa,
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
  return (
    getCountrySpecificHolidayImage(day) ?? calendarImageByDate[day.date] ?? null
  );
}

export function getCalendarImagesForDays(
  days: readonly CalendarDay[],
): ImageSourcePropType[] {
  const images = new Set<ImageSourcePropType>();
  const monthsWithHolidayImage = new Set<number>();

  for (const day of days) {
    const image = getCalendarImageForDay(day);
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

  return Array.from(images);
}

function getHolidayImageForDay(day: CalendarDay): ImageSourcePropType | null {
  const image = getCalendarImageForDay(day);
  if (image) {
    return image;
  }

  return defaultImageByMonth[day.month] ?? null;
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

export function getDayImage(
  day: CalendarDay,
  allDays?: readonly CalendarDay[],
): ImageSourcePropType | null {
  if (day.type === 'workday' || day.type === 'shortened') {
    return selectedWorkdayImage;
  }
  if (day.type === 'weekend') {
    const dayImage = getCalendarImageForDay(day);
    if (dayImage) return dayImage;

    if (allDays) {
      const idx = allDays.indexOf(day);
      if (idx > 0) {
        const prev = allDays[idx - 1];
        const prevImage = getCalendarImageForDay(prev);
        if (prevImage && prev.type === 'holiday') return prevImage;
      }
      if (idx < allDays.length - 1) {
        const next = allDays[idx + 1];
        const nextImage = getCalendarImageForDay(next);
        if (nextImage && next.type === 'holiday') return nextImage;
      }
    }

    return selectedWeekendImage;
  }
  if (day.type === 'holiday') {
    return getHolidayImageForDay(day);
  }
  return null;
}
