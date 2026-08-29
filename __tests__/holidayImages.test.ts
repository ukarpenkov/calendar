/**
 * @format
 */

import {
  getCalendarImagesForDays,
  getDayImage,
  getHolidayImageForMonth,
} from '../src/entities/calendar';
import type { CalendarDay } from '../src/entities/calendar';
import { getBundledCalendarJsonForRegion } from '../src/entities/calendar/model/bundledCalendarJsonByLanguage';
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';
import { BUNDLED_CALENDAR_REGION_CODES } from '../src/shared/config/agreedLanguagesAndBundledCalendars';

function buildDay(overrides: Partial<CalendarDay>): CalendarDay {
  return {
    date: '2026-02-02',
    year: 2026,
    month: 2,
    day: 2,
    weekday: 4,
    type: 'workday',
    holidayNameRu: null,
    holidayNameEn: null,
    holidayNameTr: null,
    holidayNameId: null,
    holidayNameJa: null,
    isShortened: false,
    workHours: 8,
    ...overrides,
  };
}

describe('holidayImages', () => {
  it('uses January default image for the month without a selected date', () => {
    const januaryDefaultImage = getHolidayImageForMonth([
      buildDay({ date: '2026-01-01', type: 'holiday', workHours: 0 }),
    ]);
    const selectedNewYearImage = getDayImage(
      buildDay({
        date: '2026-01-01',
        type: 'holiday',
        holidayNameRu: 'Новый год',
        holidayNameEn: "New Year's Day",
        workHours: 0,
      }),
    );

    expect(januaryDefaultImage).not.toBeNull();
    expect(januaryDefaultImage).not.toBe(selectedNewYearImage);
  });

  it('resolves selected day images by calendar day type', () => {
    const workdayImage = getDayImage(buildDay({ type: 'workday' }));
    const shortenedImage = getDayImage(
      buildDay({ type: 'shortened', isShortened: true, workHours: 7 }),
    );
    const weekendImage = getDayImage(
      buildDay({ date: '2026-01-10', type: 'weekend', workHours: 0 }),
    );
    const holidayImage = getDayImage(
      buildDay({ date: '2026-03-08', month: 3, type: 'holiday', workHours: 0 }),
    );
    const defaultHolidayImage = getDayImage(
      buildDay({ date: '2026-02-23', month: 2, type: 'holiday', workHours: 0 }),
    );

    expect(workdayImage).not.toBeNull();
    expect(shortenedImage).not.toBeNull();
    expect(shortenedImage).not.toBe(workdayImage);
    expect(weekendImage).not.toBe(workdayImage);
    expect(holidayImage).not.toBeNull();
    expect(defaultHolidayImage).not.toBeNull();
  });

  it('uses the fiesta fallback for holidays without a dedicated image', () => {
    const februaryFallback = getDayImage(
      buildDay({ date: '2026-02-24', month: 2, type: 'holiday', workHours: 0 }),
    );
    const aprilFallback = getDayImage(
      buildDay({ date: '2026-04-06', month: 4, type: 'holiday', workHours: 0 }),
    );
    const monthDefault = getHolidayImageForMonth([
      buildDay({ date: '2026-02-01', month: 2, type: 'workday' }),
    ]);

    expect(februaryFallback).not.toBeNull();
    expect(februaryFallback).toBe(aprilFallback);
    expect(februaryFallback).not.toBe(monthDefault);
  });

  it('keeps weekend images separate from adjacent holidays', () => {
    const march8 = buildDay({
      date: '2026-03-08',
      month: 3,
      day: 8,
      type: 'holiday',
      holidayNameRu: 'Международный женский день',
      workHours: 0,
    });
    const march9 = buildDay({
      date: '2026-03-09',
      month: 3,
      day: 9,
      type: 'weekend',
      workHours: 0,
    });
    const days = [march8, march9];

    const image = getDayImage(march9, days);
    const holidayImage = getDayImage(march8, days);

    expect(image).not.toBe(holidayImage);
  });

  it('does not leak Russian Victory Day image into Japan weekends', () => {
    const japaneseWeekend = buildDay({
      date: '2026-05-09',
      month: 5,
      day: 9,
      weekday: 6,
      type: 'weekend',
      workHours: 0,
    });
    const russianVictoryDay = buildDay({
      date: '2026-05-09',
      month: 5,
      day: 9,
      weekday: 6,
      type: 'holiday',
      holidayNameRu: 'День Победы',
      holidayNameEn: 'Victory Day',
      workHours: 0,
    });

    expect(getDayImage(japaneseWeekend)).not.toBe(
      getDayImage(russianVictoryDay),
    );
  });

  it('uses the Japanese Constitution image only on the holiday date', () => {
    const may2 = buildDay({
      date: '2026-05-02',
      month: 5,
      day: 2,
      weekday: 6,
      type: 'weekend',
      workHours: 0,
    });
    const constitutionDay = buildDay({
      date: '2026-05-03',
      month: 5,
      day: 3,
      weekday: 7,
      type: 'holiday',
      holidayNameEn: 'Constitution Memorial Day',
      holidayNameJa: '憲法記念日',
      workHours: 0,
    });
    const days = [may2, constitutionDay];

    expect(getDayImage(may2, days)).not.toBe(
      getDayImage(constitutionDay, days),
    );
  });

  it('maps bundled January 1 titles (RU/JP/TR/ID) to new_year_default via explicit keys', () => {
    const jp = buildDay({
      date: '2026-01-01',
      month: 1,
      day: 1,
      type: 'holiday',
      holidayNameEn: "New Year's Day",
      holidayNameRu: '元日',
      holidayNameJa: '元日',
      workHours: 0,
    });
    const tr = buildDay({
      date: '2026-01-01',
      month: 1,
      day: 1,
      type: 'holiday',
      holidayNameEn: "New Year's Day",
      holidayNameRu: 'Yılbaşı Tatili',
      holidayNameTr: 'Yılbaşı Tatili',
      workHours: 0,
    });
    const id = buildDay({
      date: '2026-01-01',
      month: 1,
      day: 1,
      type: 'holiday',
      holidayNameEn: "New Year's Day",
      holidayNameRu: 'Tahun Baru Masehi',
      holidayNameId: 'Tahun Baru Masehi',
      workHours: 0,
    });
    const ru = buildDay({
      date: '2026-01-01',
      month: 1,
      day: 1,
      type: 'holiday',
      holidayNameRu: 'Новый год',
      holidayNameEn: "New Year's Day",
      workHours: 0,
    });

    const expected = getDayImage(ru);
    expect(getDayImage(jp)).toBe(expected);
    expect(getDayImage(tr)).toBe(expected);
    expect(getDayImage(id)).toBe(expected);
  });

  it('maps bundled 2027 January 1 titles (RU/JP/TR/ID) to the same new-year image', () => {
    const jp = buildDay({
      date: '2027-01-01',
      month: 1,
      day: 1,
      type: 'holiday',
      holidayNameEn: "New Year's Day",
      holidayNameRu: '元日',
      holidayNameJa: '元日',
      workHours: 0,
    });
    const tr = buildDay({
      date: '2027-01-01',
      month: 1,
      day: 1,
      type: 'holiday',
      holidayNameEn: "New Year's Day",
      holidayNameRu: 'Yılbaşı Tatili',
      holidayNameTr: 'Yılbaşı Tatili',
      workHours: 0,
    });
    const id = buildDay({
      date: '2027-01-01',
      month: 1,
      day: 1,
      type: 'holiday',
      holidayNameEn: "New Year's Day",
      holidayNameRu: 'Tahun Baru Masehi',
      holidayNameId: 'Tahun Baru Masehi',
      workHours: 0,
    });
    const ru = buildDay({
      date: '2027-01-01',
      month: 1,
      day: 1,
      type: 'holiday',
      holidayNameRu: 'Новый год',
      holidayNameEn: "New Year's Day",
      workHours: 0,
    });

    const expected = getDayImage(ru);
    expect(getDayImage(jp)).toBe(expected);
    expect(getDayImage(tr)).toBe(expected);
    expect(getDayImage(id)).toBe(expected);
  });

  it('maps bundled May 1 labour holidays for RU/TR/ID to may1.webp; JP uses other May assets', () => {
    const ruMay1 = buildDay({
      date: '2026-05-01',
      month: 5,
      day: 1,
      type: 'holiday',
      holidayNameEn: 'Spring and Labor Day',
      holidayNameRu: 'Праздник Весны и Труда',
      workHours: 0,
    });
    const trMay1 = buildDay({
      date: '2026-05-01',
      month: 5,
      day: 1,
      type: 'holiday',
      holidayNameEn: 'Labour and Solidarity Day',
      holidayNameRu: 'Emek ve Dayanışma Günü',
      holidayNameTr: 'Emek ve Dayanışma Günü',
      workHours: 0,
    });
    const idMay1 = buildDay({
      date: '2026-05-01',
      month: 5,
      day: 1,
      type: 'holiday',
      holidayNameEn: "International Workers' Day",
      holidayNameRu: 'Hari Buruh Internasional',
      holidayNameId: 'Hari Buruh Internasional',
      workHours: 0,
    });
    const jpConstitution = buildDay({
      date: '2026-05-03',
      month: 5,
      day: 3,
      type: 'holiday',
      holidayNameEn: 'Constitution Memorial Day',
      holidayNameJa: '憲法記念日',
      workHours: 0,
    });

    const may1 = getDayImage(ruMay1);
    expect(getDayImage(trMay1)).toBe(may1);
    expect(getDayImage(idMay1)).toBe(may1);
    expect(getDayImage(jpConstitution)).not.toBe(may1);
  });

  it('maps Japan Coming of Age Day (2027-01-11) to jp_12jan.webp', () => {
    const comingOfAge = buildDay({
      date: '2027-01-11',
      month: 1,
      day: 11,
      type: 'holiday',
      holidayNameEn: 'Coming of Age Day',
      holidayNameRu: '成人の日',
      holidayNameJa: '成人の日',
      workHours: 0,
    });
    const otherJanuaryHoliday = buildDay({
      date: '2027-01-01',
      month: 1,
      day: 1,
      type: 'holiday',
      holidayNameEn: "New Year's Day",
      holidayNameRu: '元日',
      workHours: 0,
    });

    expect(getDayImage(comingOfAge)).not.toBe(getDayImage(otherJanuaryHoliday));
  });

  it('maps Japan Mountain Day (2026-08-11) to jp_11aug.webp', () => {
    const mountainDay = buildDay({
      date: '2026-08-11',
      month: 8,
      day: 11,
      type: 'holiday',
      holidayNameEn: 'Mountain Day',
      holidayNameRu: '山の日',
      holidayNameJa: '山の日',
      workHours: 0,
    });
    const marineDay = buildDay({
      date: '2026-07-20',
      month: 7,
      day: 20,
      type: 'holiday',
      holidayNameEn: 'Marine Day',
      holidayNameRu: '海の日',
      workHours: 0,
    });

    expect(getDayImage(mountainDay)).not.toBe(getDayImage(marineDay));
  });

  it('maps Japan Marine Day (2027-07-19) separately from Mountain Day', () => {
    const mountainDay = buildDay({
      date: '2027-08-11',
      month: 8,
      day: 11,
      type: 'holiday',
      holidayNameEn: 'Mountain Day',
      holidayNameRu: '山の日',
      holidayNameJa: '山の日',
      workHours: 0,
    });
    const marineDay = buildDay({
      date: '2027-07-19',
      month: 7,
      day: 19,
      type: 'holiday',
      holidayNameEn: 'Marine Day',
      holidayNameRu: '海の日',
      workHours: 0,
    });

    expect(getDayImage(mountainDay)).not.toBe(getDayImage(marineDay));
  });

  it('maps Japan Labor Thanksgiving Day (2026-11-23) to jp_23now.webp', () => {
    const laborThanksgiving = buildDay({
      date: '2026-11-23',
      month: 11,
      day: 23,
      type: 'holiday',
      holidayNameEn: 'Labor Thanksgiving Day',
      holidayNameRu: '勤労感謝の日',
      holidayNameJa: '勤労感謝の日',
      workHours: 0,
    });
    const cultureDay = buildDay({
      date: '2026-11-03',
      month: 11,
      day: 3,
      type: 'holiday',
      holidayNameEn: 'Culture Day',
      holidayNameRu: '文化の日',
      holidayNameJa: '文化の日',
      workHours: 0,
    });

    expect(getDayImage(laborThanksgiving)).not.toBe(getDayImage(cultureDay));
  });

  it('maps Japan Culture Day (2026-11-03) to jp_3now.webp', () => {
    const cultureDayNov = buildDay({
      date: '2026-11-03',
      month: 11,
      day: 3,
      type: 'holiday',
      holidayNameEn: 'Culture Day',
      holidayNameRu: '文化の日',
      holidayNameJa: '文化の日',
      workHours: 0,
    });
    const laborThanksgiving = buildDay({
      date: '2026-11-23',
      month: 11,
      day: 23,
      type: 'holiday',
      holidayNameEn: 'Labor Thanksgiving Day',
      holidayNameRu: '勤労感謝の日',
      holidayNameJa: '勤労感謝の日',
      workHours: 0,
    });

    expect(getDayImage(cultureDayNov)).not.toBe(getDayImage(laborThanksgiving));
  });

  it('maps Indonesia Eid al-Adha 2026-05-27 to id_27may.webp, distinct from TR wording', () => {
    const idnMay27 = buildDay({
      date: '2026-05-27',
      month: 5,
      day: 27,
      type: 'holiday',
      holidayNameEn: 'Eid al-Adha 1447 H',
      holidayNameRu: 'Hari Raya Idul Adha 1447 H',
      holidayNameId: 'Hari Raya Idul Adha 1447 H',
      workHours: 0,
    });
    const trMay27 = buildDay({
      date: '2026-05-27',
      month: 5,
      day: 27,
      type: 'holiday',
      holidayNameEn: 'Eid al-Adha (1st day)',
      workHours: 0,
    });

    expect(getDayImage(idnMay27)).not.toBe(getDayImage(trMay27));
  });

  it('maps Indonesia collective leave 2026-05-28 (Eid al-Adha) to id_28may.webp', () => {
    const may28Leave = buildDay({
      date: '2026-05-28',
      month: 5,
      day: 28,
      type: 'holiday',
      holidayNameEn: 'Collective Leave for Eid al-Adha',
      holidayNameRu: 'Cuti Bersama Hari Raya Idul Adha',
      holidayNameId: 'Cuti Bersama Hari Raya Idul Adha',
      workHours: 0,
    });
    const may27Eid = buildDay({
      date: '2026-05-27',
      month: 5,
      day: 27,
      type: 'holiday',
      holidayNameEn: 'Eid al-Adha 1447 H',
      holidayNameRu: 'Hari Raya Idul Adha 1447 H',
      holidayNameId: 'Hari Raya Idul Adha 1447 H',
      workHours: 0,
    });

    expect(getDayImage(may28Leave)).not.toBe(getDayImage(may27Eid));
  });

  it('maps Indonesia Vesak Day (2026-05-31) to id_31may.webp', () => {
    const vesak = buildDay({
      date: '2026-05-31',
      month: 5,
      day: 31,
      type: 'holiday',
      holidayNameEn: 'Vesak Day 2570 BE',
      holidayNameRu: 'Hari Raya Waisak 2570 BE',
      holidayNameId: 'Hari Raya Waisak 2570 BE',
      workHours: 0,
    });
    const pancasila = buildDay({
      date: '2026-06-01',
      month: 6,
      day: 1,
      type: 'holiday',
      holidayNameEn: 'Pancasila Day',
      workHours: 0,
    });

    expect(getDayImage(vesak)).not.toBe(getDayImage(pancasila));
  });

  it('maps Indonesia bundled 2026-03-18 … 03-24 cluster to id_18-24march.webp', () => {
    const nyepiLeaveIdOnly = buildDay({
      date: '2026-03-18',
      month: 3,
      day: 18,
      type: 'holiday',
      holidayNameEn: null,
      holidayNameRu: 'Cuti Bersama Hari Suci Nyepi',
      holidayNameId: 'Cuti Bersama Hari Suci Nyepi',
      workHours: 0,
    });
    const nyepiLeaveEn = buildDay({
      date: '2026-03-18',
      month: 3,
      day: 18,
      type: 'holiday',
      holidayNameEn: 'Collective Leave for Nyepi',
      holidayNameRu: 'Cuti Bersama Hari Suci Nyepi',
      holidayNameId: 'Cuti Bersama Hari Suci Nyepi',
      workHours: 0,
    });
    const goodFriday = buildDay({
      date: '2026-04-03',
      month: 4,
      day: 3,
      type: 'holiday',
      holidayNameEn: 'Good Friday',
      holidayNameId: 'Wafat Isa Al Masih',
      workHours: 0,
    });

    expect(getDayImage(nyepiLeaveIdOnly)).toBe(getDayImage(nyepiLeaveEn));
    expect(getDayImage(nyepiLeaveEn)).not.toBe(getDayImage(goodFriday));
  });

  it('prepares images for month defaults and selectable day states', () => {
    const images = getCalendarImagesForDays([
      buildDay({ date: '2026-02-02', month: 2, type: 'workday' }),
      buildDay({
        date: '2026-02-22',
        month: 2,
        day: 22,
        weekday: 7,
        type: 'weekend',
        workHours: 0,
      }),
      buildDay({
        date: '2026-02-23',
        month: 2,
        day: 23,
        weekday: 1,
        type: 'holiday',
        holidayNameRu: 'День защитника Отечества',
        holidayNameEn: 'Defender of the Fatherland Day',
        workHours: 0,
      }),
    ]);

    expect(images.length).toBeGreaterThanOrEqual(3);
  });

  it('maps every 2027 bundled holiday to a dedicated image, not the fiesta fallback', () => {
    const fallback = getDayImage(
      buildDay({
        date: '2027-02-24',
        month: 2,
        type: 'holiday',
        workHours: 0,
      }),
    );

    for (const region of BUNDLED_CALENDAR_REGION_CODES) {
      const calendar = parseValidateAndNormalizeCalendarImport(
        getBundledCalendarJsonForRegion(region),
      );
      const holidays = calendar.days.filter(day => day.type === 'holiday');
      expect(holidays.length).toBeGreaterThan(0);
      for (const day of holidays) {
        expect(getDayImage(day)).not.toBe(fallback);
      }
    }
  });
});
