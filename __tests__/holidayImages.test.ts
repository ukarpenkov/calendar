/**
 * @format
 */

import {
  getCalendarImagesForDays,
  getDayImage,
  getHolidayImageForMonth,
} from '../src/entities/calendar';
import type { CalendarDay } from '../src/entities/calendar';

function buildDay(overrides: Partial<CalendarDay>): CalendarDay {
  return {
    date: '2026-01-01',
    year: 2026,
    month: 1,
    day: 1,
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
    expect(shortenedImage).toBe(workdayImage);
    expect(weekendImage).not.toBe(workdayImage);
    expect(holidayImage).not.toBeNull();
    expect(defaultHolidayImage).not.toBeNull();
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
});
