/**
 * Согласованность цепочки «системная локаль → AppLanguage → регион сида → JSON» при отсутствии
 * сохранённых настроек (как на первом запуске: `detectDeviceLanguage` + `appLanguageToDefaultBundledRegion`).
 */
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';
import { getBundledCalendarJsonForRegion } from '../src/entities/calendar/model/bundledCalendarJsonByLanguage';
import type { BundledCalendarRegionCode } from '../src/shared/config/agreedLanguagesAndBundledCalendars';
import { appLanguageToDefaultBundledRegion } from '../src/shared/lib/bundledCalendarRegion';
import { mapLocaleStringToAppLanguage, type AppLanguage } from '../src/shared/lib/i18n';

function seedRegionForDeviceLocale(locale: string): BundledCalendarRegionCode {
  return appLanguageToDefaultBundledRegion(mapLocaleStringToAppLanguage(locale));
}

test('ICU locales map to the same bundled region as first-launch seed resolver logic', () => {
  expect(seedRegionForDeviceLocale('tr-TR')).toBe('tr');
  expect(seedRegionForDeviceLocale('id-ID')).toBe('id');
  expect(seedRegionForDeviceLocale('ja-JP')).toBe('ja');
  expect(seedRegionForDeviceLocale('ru-RU')).toBe('ru');
  expect(seedRegionForDeviceLocale('en-US')).toBe('ru');
  expect(seedRegionForDeviceLocale('de-DE')).toBe('ru');
});

test('each mapped region loads a distinct validated bundled calendar for 2026', () => {
  const cases: {
    locale: string;
    assert: (language: AppLanguage, cal: ReturnType<typeof parseValidateAndNormalizeCalendarImport>) => void;
  }[] = [
    {
      locale: 'tr-TR',
      assert: (_lang, cal) => {
        const d = cal.days.find(x => x.date === '2026-01-01');
        expect(d?.holidayNameTr).toBe('Yılbaşı Tatili');
      },
    },
    {
      locale: 'id-ID',
      assert: (_lang, cal) => {
        const d = cal.days.find(x => x.date === '2026-01-01');
        expect(d?.holidayNameId).toBe('Tahun Baru Masehi');
      },
    },
    {
      locale: 'ja-JP',
      assert: (_lang, cal) => {
        const d = cal.days.find(x => x.date === '2026-01-12');
        expect(d?.holidayNameJa).toBe('成人の日');
      },
    },
    {
      locale: 'ru-RU',
      assert: (_lang, cal) => {
        const d = cal.days.find(x => x.date === '2026-01-07');
        expect(d?.holidayNameRu).toBe('Рождество Христово');
      },
    },
    {
      locale: 'en-GB',
      assert: (_lang, cal) => {
        const d = cal.days.find(x => x.date === '2026-01-07');
        expect(d?.holidayNameRu).toBe('Рождество Христово');
      },
    },
  ];

  for (const { locale, assert } of cases) {
    const language = mapLocaleStringToAppLanguage(locale);
    const region = appLanguageToDefaultBundledRegion(language);
    const raw = getBundledCalendarJsonForRegion(region);
    const cal = parseValidateAndNormalizeCalendarImport(raw);
    expect(cal.year).toBe(2026);
    assert(language, cal);
  }
});
