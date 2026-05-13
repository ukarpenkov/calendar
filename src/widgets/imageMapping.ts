import type { CalendarDay } from '../entities/calendar/model/types';

const WIDGET_IMAGE_BY_KEY: Record<string, string> = {
  '2025-01-01|Новый год': 'day_new_year_default',
  '2025-01-01|New Year\'s Day': 'day_new_year_default',
  '2025-01-02|Новогодние каникулы': 'day_new_year_default',
  '2025-01-03|Новогодние каникулы': 'day_new_year_default',
  '2025-01-04|Новогодние каникулы': 'day_new_year_default',
  '2025-01-05|Новогодние каникулы': 'day_new_year_default',
  '2025-01-06|Новогодние каникулы': 'day_new_year_default',
  '2025-01-07|Рождество Христово': 'day_7jan_christmas',
  '2025-01-08|Новогодние каникулы': 'day_new_year_default',
  '2025-02-23|Defender of the Fatherland Day': 'day_feb23_defender_day',
  '2025-03-08|International Women\'s Day': 'day_mar8',
  '2025-05-01|Spring and Labor Day': 'day_may1',
  '2025-05-01|Праздник Весны и Труда': 'day_may1',
  '2025-05-09|Victory Day': 'day_ru_9may',
  '2025-06-12|Russia Day': 'day_jun12_unity',
  '2025-11-04|National Unity Day': 'day_ru_4nov',
  '2025-12-31|Выходной за 5 января': 'day_new_year_default',
  '2026-01-01|Новый год': 'day_new_year_default',
  '2026-01-01|New Year\'s Day': 'day_new_year_default',
  '2026-01-01|元日': 'day_new_year_default',
  '2026-01-01|Yılbaşı Tatili': 'day_new_year_default',
  '2026-01-01|Tahun Baru Masehi': 'day_new_year_default',
  '2026-01-12|Coming of Age Day': 'day_jp_12jan',
  '2026-01-12|成人の日': 'day_jp_12jan',
  '2026-01-02|Новогодние каникулы': 'day_new_year_default',
  '2026-01-03|Новогодние каникулы': 'day_new_year_default',
  '2026-01-04|Новогодние каникулы': 'day_new_year_default',
  '2026-01-05|Новогодние каникулы': 'day_new_year_default',
  '2026-01-06|Новогодние каникулы': 'day_new_year_default',
  '2026-01-07|Рождество Христово': 'day_7jan_christmas',
  '2026-01-08|Новогодние каникулы': 'day_new_year_default',
  '2026-01-09|Выходной за новогодние каникулы': 'day_new_year_default',
  '2026-02-23|Defender of the Fatherland Day': 'day_feb23_defender_day',
  '2026-03-08|International Women\'s Day': 'day_mar8',
  '2026-05-01|Spring and Labor Day': 'day_may1',
  '2026-05-01|Праздник Весны и Труда': 'day_may1',
  '2026-05-01|Labour and Solidarity Day': 'day_may1',
  '2026-05-01|Emek ve Dayanışma Günü': 'day_may1',
  '2026-05-01|International Workers\' Day': 'day_may1',
  '2026-05-01|Hari Buruh Internasional': 'day_may1',
  '2026-05-09|Victory Day': 'day_ru_9may',
  '2026-06-12|Russia Day': 'day_jun12_unity',
  '2026-11-04|National Unity Day': 'day_ru_4nov',
  '2026-12-31|Выходной за 9 января': 'day_new_year_default',
  '2026-02-11|National Foundation Day': 'day_jp11_feb',
  '2025-02-23|Emperor\'s Birthday': 'day_jp_23feb',
  '2026-02-23|Emperor\'s Birthday': 'day_jp_23feb',
  '2025-03-20|Vernal Equinox Day': 'day_jp_20mar',
  '2026-03-20|Vernal Equinox Day': 'day_jp_20mar',
  '2026-04-29|Shōwa Day': 'day_jp_29apr',
  '2025-05-03|Constitution Memorial Day': 'day_jp_3may',
  '2026-05-03|Constitution Memorial Day': 'day_jp_3may',
  '2025-05-04|Greenery Day': 'day_jp_4may',
  '2026-05-04|Greenery Day': 'day_jp_4may',
  '2025-05-05|Children\'s Day': 'day_jp_5may',
  '2026-05-05|Children\'s Day': 'day_jp_5may',
  '2025-07-20|Marine Day': 'day_jp_20jul',
  '2026-07-20|Marine Day': 'day_jp_20jul',
  '2026-08-11|Mountain Day': 'day_jp_11aug',
  '2026-08-11|山の日': 'day_jp_11aug',
  '2026-09-21|Respect for the Aged Day': 'day_jp_21sep',
  '2026-09-23|Autumnal Equinox Day': 'day_jp_23sep',
  '2026-10-12|Sports Day': 'day_jp_12okt',
  '2026-11-03|Culture Day': 'day_jp_3now',
  '2026-11-03|文化の日': 'day_jp_3now',
  '2026-11-23|Labor Thanksgiving Day': 'day_jp_23now',
  '2026-11-23|勤労感謝の日': 'day_jp_23now',
  '2026-03-20|Eid al-Fitr (1st day)': 'day_tr_20match',
  '2026-03-21|Eid al-Fitr (2nd day)': 'day_tr_20match',
  '2026-03-22|Eid al-Fitr (3rd day)': 'day_tr_20match',
  '2026-04-23|National Sovereignty and Children\'s Day': 'day_tr_23apr',
  '2026-05-19|Commemoration of Atatürk, Youth and Sports Day': 'day_tr_19may',
  '2026-05-27|Eid al-Adha (1st day)': 'day_tr_kb',
  '2026-05-28|Eid al-Adha (2nd day)': 'day_tr_kb',
  '2026-05-29|Eid al-Adha (3rd day)': 'day_tr_kb',
  '2026-05-30|Eid al-Adha (4th day)': 'day_tr_kb',
  '2026-07-15|Democracy and National Unity Day': 'day_tr_15jul',
  '2026-08-30|Victory Day': 'day_tr_30aug',
  '2026-10-29|Republic Day': 'day_tr_29okt',
  '2026-01-16|Isra and Mi\'raj of Prophet Muhammad': 'day_id_16jan',
  '2026-02-16|Collective Leave for Chinese New Year': 'day_id_17feb',
  '2026-02-17|Chinese New Year 2577': 'day_id_17feb',
  '2026-03-18|Collective Leave for Nyepi': 'day_id_18_24march',
  '2026-03-18|Cuti Bersama Hari Suci Nyepi': 'day_id_18_24march',
  '2026-03-19|Day of Silence, Saka New Year': 'day_id_18_24march',
  '2026-03-19|Hari Suci Nyepi Tahun Baru Saka 1948': 'day_id_18_24march',
  '2026-03-20|Collective Leave for Eid al-Fitr': 'day_id_18_24march',
  '2026-03-20|Cuti Bersama Hari Raya Idul Fitri': 'day_id_18_24march',
  '2026-03-21|Eid al-Fitr 1447 H (Day 1)': 'day_id_18_24march',
  '2026-03-21|Hari Raya Idul Fitri 1447 H (Hari 1)': 'day_id_18_24march',
  '2026-03-22|Eid al-Fitr 1447 H (Day 2)': 'day_id_18_24march',
  '2026-03-22|Hari Raya Idul Fitri 1447 H (Hari 2)': 'day_id_18_24march',
  '2026-03-23|Collective Leave for Eid al-Fitr': 'day_id_18_24march',
  '2026-03-23|Cuti Bersama Hari Raya Idul Fitri': 'day_id_18_24march',
  '2026-03-24|Collective Leave for Eid al-Fitr': 'day_id_18_24march',
  '2026-03-24|Cuti Bersama Hari Raya Idul Fitri': 'day_id_18_24march',
  '2026-04-03|Good Friday': 'day_id_3apr',
  '2026-04-05|Easter Sunday': 'day_id_5apr',
  '2026-05-14|Ascension of Jesus Christ': 'day_id_14may',
  '2026-05-27|Eid al-Adha 1447 H': 'day_id_27may',
  '2026-05-27|Hari Raya Idul Adha 1447 H': 'day_id_27may',
  '2026-05-28|Collective Leave for Eid al-Adha': 'day_id_28may',
  '2026-05-28|Cuti Bersama Hari Raya Idul Adha': 'day_id_28may',
  '2026-05-31|Vesak Day 2570 BE': 'day_id_31may',
  '2026-05-31|Hari Raya Waisak 2570 BE': 'day_id_31may',
  '2026-06-01|Pancasila Day': 'day_id_1jun',
  '2026-06-16|Islamic New Year 1448 H': 'day_id_16jun',
  '2026-08-17|Independence Day of Indonesia': 'day_id_17aug',
  '2026-08-25|Birthday of Prophet Muhammad': 'day_id_24aug',
  '2026-12-24|Collective Leave for Christmas': 'day_7jan_christmas',
  '2026-12-25|Christmas Day': 'day_7jan_christmas',
};

const WIDGET_DEFAULT_IMAGE_BY_MONTH: Record<number, string> = {
  1: 'day_default_jan',
  2: 'day_default_feb',
  3: 'day_default_march',
  4: 'day_default_april',
  5: 'day_default_may',
  6: 'day_default_jun',
  7: 'day_default_jul',
  8: 'day_default_aug',
  9: 'day_default_sep',
  10: 'day_default_okt',
  11: 'day_default_now',
  12: 'day_default_dec',
};

function getCountrySpecificDrawable(day: CalendarDay): string | null {
  const holidayNames = [
    day.holidayNameEn,
    day.holidayNameRu,
    day.holidayNameTr,
    day.holidayNameId,
    day.holidayNameJa,
  ];

  for (const holidayName of holidayNames) {
    if (!holidayName) continue;

    const image = WIDGET_IMAGE_BY_KEY[`${day.date}|${holidayName}`];
    if (image) return image;
  }

  return null;
}

export function getDayDrawableResourceName(day: CalendarDay): string {
  if (day.type === 'shortened') {
    return 'day_default_short_day';
  }
  if (day.type === 'workday') {
    return 'day_work_default';
  }
  if (day.type === 'weekend') {
    const specific = getCountrySpecificDrawable(day);
    if (specific) return specific;
    return 'day_holday_default';
  }
  if (day.type === 'holiday') {
    const specific = getCountrySpecificDrawable(day);
    if (specific) return specific;
    return 'day_default_fiesta_fallback';
  }

  return 'day_work_default';
}

export { WIDGET_IMAGE_BY_KEY, WIDGET_DEFAULT_IMAGE_BY_MONTH };
