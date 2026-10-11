import {
  getCalendarImagesForDays,
  getDayImage,
} from '../src/entities/calendar/model/holidayImages';
import type { CalendarDay } from '../src/entities/calendar/model/types';
import { getDayDrawableResourceName } from '../src/widgets/imageMapping';

function day(date: string, type: CalendarDay['type'] = 'workday'): CalendarDay {
  const parsed = new Date(`${date}T12:00:00Z`);
  return {
    date,
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate(),
    weekday: parsed.getUTCDay() || 7,
    type,
    holidayNameRu: null,
    holidayNameEn: null,
    holidayNameTr: null,
    holidayNameId: null,
    holidayNameJa: null,
    holidayNameEs: null,
    isShortened: type === 'shortened',
    workHours: 8,
  };
}

const original = [
  require('../assets/days_img/default_work_mon.webp'),
  require('../assets/days_img/default_work_tue.webp'),
  require('../assets/days_img/default_work_wed.webp'),
  require('../assets/days_img/default_work_thu.webp'),
  require('../assets/days_img/default_work_fri.webp'),
];
const alternate = [
  require('../assets/days_img/default_work_mon_2.webp'),
  require('../assets/days_img/default_work_tue_2.webp'),
  require('../assets/days_img/default_work_wed_2.webp'),
  require('../assets/days_img/default_work_thu_2.webp'),
  require('../assets/days_img/default_work_fri_2.webp'),
];
const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];

describe('workday image rotation shared by app and widget', () => {
  it('alternates all five weekdays through five calendar weeks', () => {
    // June 2026 starts on Monday.
    for (let week = 0; week < 5; week++) {
      for (let weekday = 0; weekday < 5; weekday++) {
        const date = 1 + week * 7 + weekday;
        if (date > 30) continue;
        const selected = day(`2026-06-${String(date).padStart(2, '0')}`);
        expect(getDayImage(selected)).toEqual(
          (week % 2 ? alternate : original)[weekday],
        );
        expect(getDayDrawableResourceName(selected)).toBe(
          `day_default_work_${weekdays[weekday]}${week % 2 ? '_2' : ''}`,
        );
      }
    }
  });

  it.each([
    ['2026-10-01', 'thu', false], // Partial first week.
    ['2026-10-05', 'mon', true], // Second row begins before the 8th.
    ['2026-10-09', 'fri', true],
    ['2026-10-12', 'mon', false],
    ['2026-11-02', 'mon', true], // Month starts on Sunday.
    ['2026-08-31', 'mon', true], // Sixth calendar row.
    ['2026-09-01', 'tue', false], // Reset even within the same physical week.
    ['2027-01-01', 'fri', false], // Reset at year boundary.
    ['2028-02-29', 'tue', false], // Leap day.
  ])('uses the calendar row for %s', (date, weekday, second) => {
    const selected = day(date as string);
    expect(getDayDrawableResourceName(selected)).toBe(
      `day_default_work_${weekday}${second ? '_2' : ''}`,
    );
    expect(getDayImage(selected)).toEqual(
      (second ? alternate : original)[selected.weekday - 1],
    );
  });

  it('preloads both sets when dates from both weeks are present', () => {
    const dates = Array.from({ length: 12 }, (_, index) =>
      day(`2026-06-${String(index + 1).padStart(2, '0')}`),
    );
    const images = getCalendarImagesForDays(dates);
    for (const image of [...original, ...alternate])
      expect(images).toContainEqual(image);
  });

  it('preserves shortened, holiday, weekend, transferred workday and vacation images', () => {
    for (const type of ['shortened', 'holiday', 'weekend'] as const) {
      expect(getDayImage(day('2026-06-08', type))).toEqual(
        getDayImage(day('2026-06-01', type)),
      );
      expect(getDayDrawableResourceName(day('2026-06-08', type))).toBe(
        getDayDrawableResourceName(day('2026-06-01', type)),
      );
    }
    expect(getDayDrawableResourceName(day('2026-06-13'))).toBe(
      'day_work_default',
    );
    expect(getDayImage(day('2026-06-13'))).toEqual(
      require('../assets/days_img/work_default.webp'),
    );
    expect(
      getDayImage(
        day('2026-06-08'),
        [],
        [{ startDate: '2026-06-08', endDate: '2026-06-12' }],
      ),
    ).toEqual(require('../assets/days_img/default_vacancy_chill.webp'));
  });
});
