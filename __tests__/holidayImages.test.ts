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
      buildDay({ date: '2026-01-01', type: 'holiday', workHours: 0 }),
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
