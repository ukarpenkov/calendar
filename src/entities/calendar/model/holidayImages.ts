import type { ImageSourcePropType } from 'react-native';
import type { CalendarDay } from './types';

const newYearImage = require('../../../../assets/days_img/new_year_default.webp');
const selectedWorkdayImage = require('../../../../assets/days_img/work_default.webp');
const selectedWeekendImage = require('../../../../assets/days_img/holday_default.webp');
const christmasImage = require('../../../../assets/days_img/7jan_сristmas.webp');
const defenderDayImage = require('../../../../assets/days_img/feb23_defender_day.webp');
const march8Image = require('../../../../assets/days_img/mar8.webp');
const may1Image = require('../../../../assets/days_img/may1.webp');
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
  '2025-01-01|Новый год': newYearImage,
  '2025-01-02|Новогодние каникулы': newYearImage,
  '2025-01-03|Новогодние каникулы': newYearImage,
  '2025-01-04|Новогодние каникулы': newYearImage,
  '2025-01-05|Новогодние каникулы': newYearImage,
  '2025-01-06|Новогодние каникулы': newYearImage,
  '2025-01-07|Рождество Христово': christmasImage,
  '2025-01-08|Новогодние каникулы': newYearImage,
  '2025-02-23|Defender of the Fatherland Day': defenderDayImage,
  '2025-03-08|International Women\'s Day': march8Image,
  '2025-05-01|Spring and Labor Day': may1Image,
  '2025-05-09|Victory Day': ruMay9Image,
  '2025-06-12|Russia Day': june12Image,
  '2025-11-04|National Unity Day': require('../../../../assets/days_img/ru_4nov.webp'),
  '2025-12-31|Выходной за 5 января': newYearImage,
  '2026-01-01|Новый год': newYearImage,
  '2026-01-02|Новогодние каникулы': newYearImage,
  '2026-01-03|Новогодние каникулы': newYearImage,
  '2026-01-04|Новогодние каникулы': newYearImage,
  '2026-01-05|Новогодние каникулы': newYearImage,
  '2026-01-06|Новогодние каникулы': newYearImage,
  '2026-01-07|Рождество Христово': christmasImage,
  '2026-01-08|Новогодние каникулы': newYearImage,
  '2026-01-09|Выходной за новогодние каникулы': newYearImage,
  '2026-02-23|Defender of the Fatherland Day': defenderDayImage,
  '2026-03-08|International Women\'s Day': march8Image,
  '2026-05-01|Spring and Labor Day': may1Image,
  '2026-05-09|Victory Day': ruMay9Image,
  '2026-06-12|Russia Day': june12Image,
  '2026-11-04|National Unity Day': require('../../../../assets/days_img/ru_4nov.webp'),
  '2026-12-31|Выходной за 9 января': newYearImage,
  '2026-02-11|National Foundation Day': jpNationalFoundationImage,
  '2025-02-23|Emperor\'s Birthday': jpEmperorBirthdayImage,
  '2026-02-23|Emperor\'s Birthday': jpEmperorBirthdayImage,
  '2025-03-20|Vernal Equinox Day': jpVernalEquinoxImage,
  '2026-03-20|Vernal Equinox Day': jpVernalEquinoxImage,
  '2026-04-29|Shōwa Day': require('../../../../assets/days_img/jp_29apr.webp'),
  '2025-05-03|Constitution Memorial Day': require('../../../../assets/days_img/jp_3may.webp'),
  '2026-05-03|Constitution Memorial Day': require('../../../../assets/days_img/jp_3may.webp'),
  '2025-05-04|Greenery Day': require('../../../../assets/days_img/jp_4may.webp'),
  '2026-05-04|Greenery Day': require('../../../../assets/days_img/jp_4may.webp'),
  '2025-05-05|Children\'s Day': require('../../../../assets/days_img/jp_5may.webp'),
  '2026-05-05|Children\'s Day': require('../../../../assets/days_img/jp_5may.webp'),
  '2025-07-20|Marine Day': require('../../../../assets/days_img/jp_20jul.webp'),
  '2026-07-20|Marine Day': require('../../../../assets/days_img/jp_20jul.webp'),
  '2026-09-21|Respect for the Aged Day': require('../../../../assets/days_img/jp_21sep.webp'),
  '2026-09-23|Autumnal Equinox Day': require('../../../../assets/days_img/jp_23sep.webp'),
  '2026-10-12|Sports Day': require('../../../../assets/days_img/jp_12okt.webp'),
  '2026-03-20|Eid al-Fitr (1st day)': trMarchImage,
  '2026-03-21|Eid al-Fitr (2nd day)': trMarchImage,
  '2026-03-22|Eid al-Fitr (3rd day)': trMarchImage,
  '2026-04-23|National Sovereignty and Children\'s Day': trApril23Image,
  '2026-05-19|Commemoration of Atatürk, Youth and Sports Day': trMay19Image,
  '2026-05-27|Eid al-Adha (1st day)': trKbImage,
  '2026-05-28|Eid al-Adha (2nd day)': trKbImage,
  '2026-05-29|Eid al-Adha (3rd day)': trKbImage,
  '2026-05-30|Eid al-Adha (4th day)': trKbImage,
  '2026-07-15|Democracy and National Unity Day': trJul15Image,
  '2026-08-30|Victory Day': trAug30Image,
  '2026-10-29|Republic Day': trOct29Image,
  '2026-01-16|Isra and Mi\'raj of Prophet Muhammad': require('../../../../assets/days_img/id_16jan.webp'),
  '2026-02-16|Collective Leave for Chinese New Year': require('../../../../assets/days_img/id_17feb.webp'),
  '2026-02-17|Chinese New Year 2577': require('../../../../assets/days_img/id_17feb.webp'),
  '2026-03-18|Collective Leave for Nyepi': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-19|Day of Silence, Saka New Year': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-20|Collective Leave for Eid al-Fitr': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-21|Eid al-Fitr 1447 H (Day 1)': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-22|Eid al-Fitr 1447 H (Day 2)': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-23|Collective Leave for Eid al-Fitr': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-03-24|Collective Leave for Eid al-Fitr': require('../../../../assets/days_img/id_18-24mar.webp'),
  '2026-04-03|Good Friday': require('../../../../assets/days_img/id_3apr.webp'),
  '2026-04-05|Easter Sunday': require('../../../../assets/days_img/id_5apr.webp'),
  '2026-05-14|Ascension of Jesus Christ': require('../../../../assets/days_img/id_14may.webp'),
  '2026-06-01|Pancasila Day': require('../../../../assets/days_img/id_1jun.webp'),
  '2026-06-16|Islamic New Year 1448 H': require('../../../../assets/days_img/id_16jun.webp'),
  '2026-08-17|Independence Day of Indonesia': require('../../../../assets/days_img/id_17aug.webp'),
  '2026-08-25|Birthday of Prophet Muhammad': require('../../../../assets/days_img/id_24aug.webp'),
  '2026-12-24|Collective Leave for Christmas': christmasImage,
  '2026-12-25|Christmas Day': christmasImage,
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
  return getCountrySpecificHolidayImage(day);
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
  _allDays?: readonly CalendarDay[],
): ImageSourcePropType | null {
  if (day.type === 'workday' || day.type === 'shortened') {
    return selectedWorkdayImage;
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
