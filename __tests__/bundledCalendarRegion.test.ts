import {
  appLanguageToDefaultBundledRegion,
  getBundledRegionToApplyOnManualAppLanguageChange,
} from '../src/shared/lib/bundledCalendarRegion';

test('appLanguageToDefaultBundledRegion maps en to ru bundled file region', () => {
  expect(appLanguageToDefaultBundledRegion('en')).toBe('ru');
});

test('appLanguageToDefaultBundledRegion keeps regional language codes', () => {
  expect(appLanguageToDefaultBundledRegion('ru')).toBe('ru');
  expect(appLanguageToDefaultBundledRegion('tr')).toBe('tr');
  expect(appLanguageToDefaultBundledRegion('id')).toBe('id');
  expect(appLanguageToDefaultBundledRegion('ja')).toBe('ja');
});

test('getBundledRegionToApplyOnManualAppLanguageChange skips calendar replace for English UI', () => {
  expect(getBundledRegionToApplyOnManualAppLanguageChange('en')).toBeNull();
});

test('getBundledRegionToApplyOnManualAppLanguageChange matches default bundled region for non-en', () => {
  expect(getBundledRegionToApplyOnManualAppLanguageChange('ru')).toBe('ru');
  expect(getBundledRegionToApplyOnManualAppLanguageChange('tr')).toBe('tr');
  expect(getBundledRegionToApplyOnManualAppLanguageChange('id')).toBe('id');
  expect(getBundledRegionToApplyOnManualAppLanguageChange('ja')).toBe('ja');
});
