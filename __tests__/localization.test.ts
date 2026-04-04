import {
  buildMonthDetail,
  buildYearMonthSummaries,
  getDayTypeLabel,
  type CalendarDay,
} from '../src/entities/calendar';
import {
  getCompactWeekdayLabels,
  getLanguageNativeLabel,
  getThemeModeLabel,
  getTranslation,
  mapLocaleStringToAppLanguage,
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
  expect(getTranslation('tr', 'settings.title')).toBe('Ayarlar');
  expect(getTranslation('ja', 'common.appName')).toBe('カレンダー');
  expect(getThemeModeLabel('ru', 'dark')).toBe('Темная');
  expect(getThemeModeLabel('ja', 'light')).toBe('ライト');
  expect(getCompactWeekdayLabels('en')).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  expect(getDayTypeLabel('holiday', 'ru')).toBe('Праздник');
  expect(getDayTypeLabel('holiday', 'id')).toBe('Hari libur');
});

test('getLanguageNativeLabel returns autonyms for language picker', () => {
  expect(getLanguageNativeLabel('ru')).toBe('Русский');
  expect(getLanguageNativeLabel('en')).toBe('English');
  expect(getLanguageNativeLabel('tr')).toBe('Türkçe');
  expect(getLanguageNativeLabel('id')).toBe('Bahasa Indonesia');
  expect(getLanguageNativeLabel('ja')).toBe('日本語');
});

test('mapLocaleStringToAppLanguage maps ICU-style locales', () => {
  expect(mapLocaleStringToAppLanguage('ru-RU')).toBe('ru');
  expect(mapLocaleStringToAppLanguage('tr-TR')).toBe('tr');
  expect(mapLocaleStringToAppLanguage('id-ID')).toBe('id');
  expect(mapLocaleStringToAppLanguage('ja-JP')).toBe('ja');
  expect(mapLocaleStringToAppLanguage('en-US')).toBe('en');
  expect(mapLocaleStringToAppLanguage('de-DE')).toBe('en');
  expect(mapLocaleStringToAppLanguage('  JA-jp  ')).toBe('ja');
});
