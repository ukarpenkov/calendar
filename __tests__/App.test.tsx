/**
 * @format
 */

declare function require(moduleName: string): unknown;

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/app/App';
import {
  getYearCalendar,
  replaceActiveYear,
  seedBundledYearIfNeeded,
} from '../src/entities/calendar';
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';
import { ImportEntryScreen } from '../src/pages/import-entry/ui/ImportEntryScreen';
import { MonthDetailScreen } from '../src/pages/month/ui/MonthDetailScreen';
import { SettingsScreen } from '../src/pages/settings/ui/SettingsScreen';
import { YearHomeScreen } from '../src/pages/year/ui/YearHomeScreen';

jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }),
  };
});

jest.mock('../src/entities/calendar', () => ({
  ...jest.requireActual('../src/entities/calendar'),
  getYearCalendar: jest.fn(),
  replaceActiveYear: jest.fn(),
  seedBundledYearIfNeeded: jest.fn(),
}));

jest.mock('../src/shared/lib/i18n', () => ({
  ...jest.requireActual('../src/shared/lib/i18n'),
  detectDeviceLanguage: () => 'en',
}));

jest.mock('../src/shared/lib/settings', () => ({
  getStoredLanguage: jest.fn().mockResolvedValue(null),
  setStoredLanguage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-documents/picker', () => ({
  keepLocalCopy: jest.fn(),
  pick: jest.fn(),
  types: {
    json: 'application/json',
    plainText: 'text/plain',
  },
  errorCodes: {
    OPERATION_CANCELED: 'OPERATION_CANCELED',
  },
  isErrorWithCode: (error: unknown) =>
    Boolean(
      error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof (error as { code?: unknown }).code === 'string',
    ),
}));

const bundledCalendar2026 = parseValidateAndNormalizeCalendarImport(
  require('../calendar2026.json'),
);

const mockedReplaceActiveYear = jest.mocked(replaceActiveYear);
const mockedSeedBundledYearIfNeeded = jest.mocked(seedBundledYearIfNeeded);
const mockedGetYearCalendar = jest.mocked(getYearCalendar);

beforeEach(() => {
  mockedReplaceActiveYear.mockReset();
  mockedSeedBundledYearIfNeeded.mockReset();
  mockedGetYearCalendar.mockReset();
});

test('shows splash while bootstrap is pending', () => {
  mockedSeedBundledYearIfNeeded.mockImplementation(
    () => new Promise(() => undefined),
  );

  let renderer: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Initializing local calendar data...',
  );
});

test('shows year home when bootstrap succeeds', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue({
    year: 2026,
    days: [],
  });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2026,
    days: [],
  });

  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain('2026');
  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Production calendar',
  );
  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Active year is loaded from local SQLite storage',
  );
});

test('opens month detail after the year screen requests a month', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue(bundledCalendar2026);
  mockedGetYearCalendar.mockResolvedValue(bundledCalendar2026);

  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByType(YearHomeScreen).props.onOpenMonth(1);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain('Month detail');
  expect(JSON.stringify(renderer!.toJSON())).toContain('January');
  expect(JSON.stringify(renderer!.toJSON())).toContain('Working days');
});

test('switches to the next month from month detail', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue(bundledCalendar2026);
  mockedGetYearCalendar.mockResolvedValue(bundledCalendar2026);

  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByType(YearHomeScreen).props.onOpenMonth(1);
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByType(MonthDetailScreen).props.onMonthChange(2);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain('February');
});

test('shows error state when bootstrap fails', async () => {
  mockedSeedBundledYearIfNeeded.mockRejectedValue(new Error('db failed'));

  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Failed to initialize local calendar data.',
  );
});

test('opens dedicated JSON import entry from settings', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue({
    year: 2026,
    days: [],
  });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2026,
    days: [],
  });

  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    renderer!.root.findByType(YearHomeScreen).props.onOpenSettings();
  });

  await ReactTestRenderer.act(async () => {
    renderer!.root.findByType(SettingsScreen).props.onOpenImportEntry();
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain('JSON import');
  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'dedicated entry point for replacing the active year',
  );
});

test('returns to year overview with the imported calendar after success', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue({
    year: 2026,
    days: [],
  });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2026,
    days: [],
  });

  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    renderer!.root.findByType(YearHomeScreen).props.onOpenSettings();
  });

  await ReactTestRenderer.act(async () => {
    renderer!.root.findByType(SettingsScreen).props.onOpenImportEntry();
  });

  await ReactTestRenderer.act(async () => {
    renderer!.root.findByType(ImportEntryScreen).props.onImportCompleted({
      year: 2025,
      days: [],
    });
  });

  expect(mockedReplaceActiveYear).not.toHaveBeenCalled();
  expect(JSON.stringify(renderer!.toJSON())).toContain('2025');
});
