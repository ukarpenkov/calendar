import {
  getActiveCalendarIsUserJsonImport,
  getYearCalendar,
  replaceActiveYear,
} from '../src/entities/calendar';
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';
import {
  shouldApplyBundledCalendarOnRegionChange,
  syncActiveYearWithBundledRegion,
} from '../src/features/calendar-language-sync';

jest.mock('../src/entities/calendar', () => ({
  ...jest.requireActual('../src/entities/calendar'),
  getActiveCalendarIsUserJsonImport: jest.fn(),
  getYearCalendar: jest.fn(),
  replaceActiveYear: jest.fn(),
}));

const mockedReplaceActiveYear = jest.mocked(replaceActiveYear);
const mockedGetYearCalendar = jest.mocked(getYearCalendar);
const mockedGetActiveCalendarIsUserJsonImport = jest.mocked(
  getActiveCalendarIsUserJsonImport,
);

const calendar2026 = parseValidateAndNormalizeCalendarImport(
  require('../calendar2026.json'),
);

beforeEach(() => {
  mockedReplaceActiveYear.mockReset();
  mockedGetYearCalendar.mockReset();
  mockedGetActiveCalendarIsUserJsonImport.mockReset();
  mockedGetActiveCalendarIsUserJsonImport.mockResolvedValue(false);
});

test('shouldApplyBundledCalendarOnRegionChange is false when year has no bundled preset', () => {
  expect(shouldApplyBundledCalendarOnRegionChange(2025)).toBe(false);
});

test('shouldApplyBundledCalendarOnRegionChange is true for bundled year', () => {
  expect(shouldApplyBundledCalendarOnRegionChange(2026)).toBe(true);
});

test('syncActiveYearWithBundledRegion skips replace when active year is not bundled', async () => {
  const result = await syncActiveYearWithBundledRegion({
    region: 'tr',
    activeCalendarYear: 2025,
  });
  expect(result).toBeNull();
  expect(mockedReplaceActiveYear).not.toHaveBeenCalled();
});

test('syncActiveYearWithBundledRegion skips replace on app_language when user JSON import is active', async () => {
  mockedGetActiveCalendarIsUserJsonImport.mockResolvedValue(true);

  const result = await syncActiveYearWithBundledRegion({
    region: 'tr',
    activeCalendarYear: 2026,
    changeCause: 'app_language',
  });

  expect(result).toBeNull();
  expect(mockedReplaceActiveYear).not.toHaveBeenCalled();
});

test('syncActiveYearWithBundledRegion replaces on settings even when user JSON import is active', async () => {
  mockedGetActiveCalendarIsUserJsonImport.mockResolvedValue(true);
  mockedReplaceActiveYear.mockResolvedValue(undefined);
  mockedGetYearCalendar.mockResolvedValue(calendar2026);

  const result = await syncActiveYearWithBundledRegion({
    region: 'ja',
    activeCalendarYear: 2026,
    changeCause: 'settings',
  });

  expect(mockedReplaceActiveYear).toHaveBeenCalledTimes(1);
  expect(mockedReplaceActiveYear.mock.calls[0][1]).toBe('bundled');
  expect(result).toBe(calendar2026);
});

test('syncActiveYearWithBundledRegion replaces and returns calendar from DB for tr', async () => {
  mockedReplaceActiveYear.mockResolvedValue(undefined);
  mockedGetYearCalendar.mockResolvedValue(calendar2026);

  const result = await syncActiveYearWithBundledRegion({
    region: 'tr',
    activeCalendarYear: 2026,
  });

  expect(mockedReplaceActiveYear).toHaveBeenCalledTimes(1);
  const replaced = mockedReplaceActiveYear.mock.calls[0][0];
  expect(replaced.year).toBe(2026);
  expect(replaced.days).toHaveLength(365);
  expect(mockedGetYearCalendar).toHaveBeenCalledWith(2026);
  expect(result).toBe(calendar2026);
});
