import type { ImageSourcePropType } from 'react-native';

import type { CalendarDay } from '../types';
import type { WorkdayImageKey } from '../workdayImage';
import { getWorkdayImageKey } from '../workdayImage';

export const newYearImage = require('../../../../../assets/days_img/new_year_default.webp');
export const selectedWorkdayImage = require('../../../../../assets/days_img/work_default.webp');
export const workdayImages: Record<WorkdayImageKey, ImageSourcePropType> = {
  default_work_mon: require('../../../../../assets/days_img/default_work_mon.webp'),
  default_work_tue: require('../../../../../assets/days_img/default_work_tue.webp'),
  default_work_wed: require('../../../../../assets/days_img/default_work_wed.webp'),
  default_work_thu: require('../../../../../assets/days_img/default_work_thu.webp'),
  default_work_fri: require('../../../../../assets/days_img/default_work_fri.webp'),
  default_work_mon_2: require('../../../../../assets/days_img/default_work_mon_2.webp'),
  default_work_tue_2: require('../../../../../assets/days_img/default_work_tue_2.webp'),
  default_work_wed_2: require('../../../../../assets/days_img/default_work_wed_2.webp'),
  default_work_thu_2: require('../../../../../assets/days_img/default_work_thu_2.webp'),
  default_work_fri_2: require('../../../../../assets/days_img/default_work_fri_2.webp'),
};

export function getWorkdayImage(day: CalendarDay): ImageSourcePropType {
  const key = getWorkdayImageKey(day);
  return key ? workdayImages[key] : selectedWorkdayImage;
}

export const shortenedDayImage = require('../../../../../assets/days_img/default_short_day.webp');
export const selectedWeekendImage = require('../../../../../assets/days_img/holday_default.webp');
export const fallbackHolidayImage = require('../../../../../assets/days_img/default_fiesta_fallback.webp');
export const christmasImage = require('../../../../../assets/days_img/7jan_сristmas.webp');
export const defenderDayImage = require('../../../../../assets/days_img/feb23_defender_day.webp');
export const march8Image = require('../../../../../assets/days_img/mar8.webp');
export const may1Image = require('../../../../../assets/days_img/may1.webp');
export const june12Image = require('../../../../../assets/days_img/jun12_unity.webp');
export const trMarchImage = require('../../../../../assets/days_img/Tr_20match.webp');
export const trApril23Image = require('../../../../../assets/days_img/tr_23apr.webp');
export const trMay19Image = require('../../../../../assets/days_img/tr_19may.webp');
export const trKbImage = require('../../../../../assets/days_img/tr_KB.webp');
export const trJul15Image = require('../../../../../assets/days_img/tr_15jul.webp');
export const trAug30Image = require('../../../../../assets/days_img/tr_30aug.webp');
export const trOct29Image = require('../../../../../assets/days_img/tr_29okt.webp');
export const ruMay9Image = require('../../../../../assets/days_img/ru_9may.webp');
export const jpNationalFoundationImage = require('../../../../../assets/days_img/jp11_feb.webp');
export const jpEmperorBirthdayImage = require('../../../../../assets/days_img/jp_23feb.webp');
export const jpVernalEquinoxImage = require('../../../../../assets/days_img/jp_20mar.webp');
export const jpComingOfAgeDayImage = require('../../../../../assets/days_img/jp_12jan.webp');
export const jpMountainDayImage = require('../../../../../assets/days_img/jp_11aug.webp');
export const jpLaborThanksgivingDayImage = require('../../../../../assets/days_img/jp_23now.webp');
export const jpCultureDayImage = require('../../../../../assets/days_img/jp_3now.webp');
/** Bundled IDN Nyepi + Idul Fitri cluster image (reused when those dates move). */
export const idNyepiEidFitrMarchClusterImage = require('../../../../../assets/days_img/id_18-24march.webp');
/** IDN Vesak / Waisak image (reused when the date moves). */
export const idMay31WaisakImage = require('../../../../../assets/days_img/id_31may.webp');
/** IDN Eid al-Adha image (reused when the date moves). */
export const idMay27IdulAdhaImage = require('../../../../../assets/days_img/id_27may.webp');
/** IDN collective leave for Eid al-Adha image (reused when SKB adds that day). */
export const idMay28CollectiveLeaveAdhaImage = require('../../../../../assets/days_img/id_28may.webp');
export const vacationImage = require('../../../../../assets/days_img/default_vacancy_chill.webp');


export const defaultImageByMonth: Record<number, ImageSourcePropType> = {
  1: require('../../../../../assets/days_img/default_jan.webp'),
  2: require('../../../../../assets/days_img/default_feb.webp'),
  3: require('../../../../../assets/days_img/default_march.webp'),
  4: require('../../../../../assets/days_img/default_april.webp'),
  5: require('../../../../../assets/days_img/default_may.webp'),
  6: require('../../../../../assets/days_img/default_jun.webp'),
  7: require('../../../../../assets/days_img/default_jul.webp'),
  8: require('../../../../../assets/days_img/default_aug.webp'),
  9: require('../../../../../assets/days_img/default_sep.webp'),
  10: require('../../../../../assets/days_img/default_okt.webp'),
  11: require('../../../../../assets/days_img/default_now.webp'),
  12: require('../../../../../assets/days_img/default_dec.webp'),
};

