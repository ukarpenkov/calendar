import {
  buildMonthDetail,
  buildYearMonthSummaries,
  getDayTypeLabel,
  type CalendarDay,
} from '../src/entities/calendar';
import {
  getCompactWeekdayLabels,
  getThemeModeLabel,
  getTranslation,
} from '../src/shared/lib/i18n';

const januaryDays: CalendarDay[] = [
  {
    date: '2026-01-01',
    year: 2026,
    month: 1,
    day: 1,
    weekday: 4,
    type: 'holiday',
    holidayNameRu: 'Новый год',
    holidayNameEn: "New Year's Day",
    isShortened: false,
    workHours: 0,
  },
  {
    date: '2026-01-02',
    year: 2026,
    month: 1,
    day: 2,
    weekday: 5,
    type: 'workday',
    holidayNameRu: null,
    holidayNameEn: null,
    isShortened: false,
    workHours: 8,
  },
];

test('builds localized month detail labels', () => {
  const detail = buildMonthDetail(2026, 1, januaryDays, 'ru');

  expect(detail.label).toBe('Январь');
  expect(detail.shortLabel).toBe('Янв');
});

test('builds localized year month summaries', () => {
  const summaries = buildYearMonthSummaries(
    {
      year: 2026,
      days: januaryDays,
    },
    'en',
  );

  expect(summaries[0]?.label).toBe('January');
  expect(summaries[0]?.shortLabel).toBe('Jan');
});

test('returns localized interface labels and day types', () => {
  expect(getTranslation('en', 'year.home.title', { year: 2026 })).toBe('Year 2026');
  expect(getTranslation('ru', 'year.home.title', { year: 2026 })).toBe('Год 2026');
  expect(getTranslation('ru', 'settings.title')).toBe('Настройки');
  expect(getThemeModeLabel('ru', 'dark')).toBe('Темная');
  expect(getCompactWeekdayLabels('en')).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  expect(getDayTypeLabel('holiday', 'ru')).toBe('Праздник');
});
