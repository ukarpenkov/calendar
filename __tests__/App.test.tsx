/**
 * @format
 */

declare function require(moduleName: string): unknown;

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/app/App';
import {
  activateUserJsonImport,
  getActiveCalendarIsUserJsonImport,
  getActiveCalendarSource,
  getYearCalendar,
  getUserJsonImportYear,
  saveUserJsonImport,
  seedBundledYearIfNeeded,
} from '../src/entities/calendar';
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';
import { ImportEntryScreen } from '../src/pages/import-entry/ui/ImportEntryScreen';
import { MonthDetailScreen } from '../src/pages/month/ui/MonthDetailScreen';
import { SettingsScreen } from '../src/pages/settings/ui/SettingsScreen';
import { YearHomeScreen } from '../src/pages/year/ui/YearHomeScreen';
import {
  getStoredLanguage,
  setStoredLanguage,
} from '../src/shared/lib/settings';

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
  activateUserJsonImport: jest.fn(),
  getActiveCalendarIsUserJsonImport: jest.fn().mockResolvedValue(false),
  getActiveCalendarSource: jest.fn(),
  getUserJsonImportYear: jest.fn().mockResolvedValue(null),
  getYearCalendar: jest.fn(),
  saveUserJsonImport: jest.fn(),
  seedBundledYearIfNeeded: jest.fn(),
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  getString: jest.fn().mockResolvedValue(''),
  setString: jest.fn(),
}));

jest.mock('../src/shared/lib/i18n', () => ({
  ...jest.requireActual('../src/shared/lib/i18n'),
  detectDeviceLanguage: () => 'en',
}));

jest.mock('../src/shared/lib/settings', () => ({
  getStoredLanguage: jest.fn().mockResolvedValue(null),
  getStoredBundledCalendarRegion: jest.fn().mockResolvedValue(null),
  getStoredTheme: jest.fn().mockResolvedValue(null),
  setStoredLanguage: jest.fn().mockResolvedValue(undefined),
  setStoredBundledCalendarRegion: jest.fn().mockResolvedValue(undefined),
  setStoredTheme: jest.fn().mockResolvedValue(undefined),
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

const bundledCalendar2027 = parseValidateAndNormalizeCalendarImport(
  require('../calendar2027.json'),
);

const mockedGetActiveCalendarSource = jest.mocked(getActiveCalendarSource);
const mockedActivateUserJsonImport = jest.mocked(activateUserJsonImport);
const mockedGetActiveCalendarIsUserJsonImport = jest.mocked(
  getActiveCalendarIsUserJsonImport,
);
const mockedGetUserJsonImportYear = jest.mocked(getUserJsonImportYear);
const mockedSaveUserJsonImport = jest.mocked(saveUserJsonImport);
const mockedSeedBundledYearIfNeeded = jest.mocked(seedBundledYearIfNeeded);
const mockedGetYearCalendar = jest.mocked(getYearCalendar);
const mockedGetStoredLanguage = jest.mocked(getStoredLanguage);
const mockedSetStoredLanguage = jest.mocked(setStoredLanguage);

let renderer: ReactTestRenderer.ReactTestRenderer;
afterEach(() => {
  ReactTestRenderer.act(() => renderer?.unmount());
});

beforeEach(() => {
  mockedActivateUserJsonImport.mockReset();
  mockedActivateUserJsonImport.mockResolvedValue(null);
  mockedGetActiveCalendarIsUserJsonImport.mockReset();
  mockedGetActiveCalendarIsUserJsonImport.mockResolvedValue(false);
  mockedGetActiveCalendarSource.mockReset();
  mockedGetActiveCalendarSource.mockResolvedValue('bundled');
  mockedGetUserJsonImportYear.mockReset();
  mockedGetUserJsonImportYear.mockResolvedValue(null);
  mockedSaveUserJsonImport.mockReset();
  mockedSeedBundledYearIfNeeded.mockReset();
  mockedGetYearCalendar.mockReset();
  mockedGetStoredLanguage.mockReset();
  mockedGetStoredLanguage.mockResolvedValue(null);
  mockedSetStoredLanguage.mockReset();
  mockedSetStoredLanguage.mockResolvedValue(undefined);
});

test('shows splash while bootstrap is pending', () => {
  mockedSeedBundledYearIfNeeded.mockImplementation(
    () => new Promise(() => undefined),
  );

  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Initializing local calendar data...',
  );
});

test('shows year home when bootstrap succeeds', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue(bundledCalendar2027);
  mockedGetYearCalendar.mockResolvedValue(bundledCalendar2027);

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain('Year 2027');
  expect(JSON.stringify(renderer!.toJSON())).toContain('January');
});

test('opens month detail after the year screen requests a month', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2027-01-15T12:00:00.000Z'));

  mockedSeedBundledYearIfNeeded.mockResolvedValue(bundledCalendar2027);
  mockedGetYearCalendar.mockResolvedValue(bundledCalendar2027);

  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    await ReactTestRenderer.act(async () => {
      await renderer!.root.findByType(YearHomeScreen).props.onOpenMonth(1);
    });

    expect(JSON.stringify(renderer!.toJSON())).toContain('Selected day');
    expect(JSON.stringify(renderer!.toJSON())).toContain('January');
    expect(JSON.stringify(renderer!.toJSON())).toContain('Working days');
  } finally {
    jest.useRealTimers();
  }
});

test('switches to the next month from month detail', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue(bundledCalendar2027);
  mockedGetYearCalendar.mockResolvedValue(bundledCalendar2027);

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

test('prepares real month content before opening and reuses it without reading SQL again', async () => {
  jest.useFakeTimers();
  mockedSeedBundledYearIfNeeded.mockResolvedValue(bundledCalendar2027);
  mockedGetYearCalendar.mockResolvedValue(bundledCalendar2027);
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });
    const yearScreen = renderer.root.findByType(YearHomeScreen);
    ReactTestRenderer.act(() => yearScreen.props.onPrepareMonth(7));
    const prepared = renderer.root.findByType(MonthDetailScreen);
    expect(prepared.props.visible).toBe(false);
    expect(
      prepared.findAllByProps({ testID: 'calendar-day-2027-07-15' }).length,
    ).toBeGreaterThan(0);
    expect(
      prepared.findAllByProps({ testID: 'calendar-day-2027-08-15' }).length,
    ).toBeGreaterThan(0);
    expect(
      prepared.findAllByProps({ testID: 'calendar-day-2027-01-15' }),
    ).toHaveLength(0);

    ReactTestRenderer.act(() => yearScreen.props.onOpenMonth(7));
    // No animation timers were advanced: the opening frame already has days.
    expect(renderer.root.findByType(MonthDetailScreen)).toBe(prepared);
    expect(prepared.props.visible).toBe(true);
    ReactTestRenderer.act(() => prepared.props.onMonthChange(8));
    ReactTestRenderer.act(() => prepared.props.onBack());
    expect(prepared.props.visible).toBe(false);
    ReactTestRenderer.act(() => yearScreen.props.onOpenMonth(12));
    expect(renderer.root.findByType(MonthDetailScreen)).toBe(prepared);
    expect(
      prepared.findAllByProps({ testID: 'calendar-day-2027-12-31' }).length,
    ).toBeGreaterThan(0);
    expect(mockedGetYearCalendar).toHaveBeenCalledTimes(1);
    expect(mockedSeedBundledYearIfNeeded).toHaveBeenCalledTimes(1);
  } finally {
    ReactTestRenderer.act(() => renderer.unmount());
    jest.useRealTimers();
  }
});

test('retains the year and settings while navigating into and back from import', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue(bundledCalendar2027);
  mockedGetYearCalendar.mockResolvedValue(bundledCalendar2027);
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  const yearScreen = renderer.root.findByType(YearHomeScreen);
  await ReactTestRenderer.act(async () => yearScreen.props.onOpenSettings());
  const settings = renderer.root.findByType(SettingsScreen);
  ReactTestRenderer.act(() => settings.props.onOpenImportEntry());
  expect(renderer.root.findByType(YearHomeScreen)).toBe(yearScreen);
  expect(renderer.root.findByType(SettingsScreen)).toBe(settings);
  ReactTestRenderer.act(() =>
    renderer.root.findByType(ImportEntryScreen).props.onBack(),
  );
  expect(renderer.root.findByType(SettingsScreen)).toBe(settings);
  ReactTestRenderer.act(() => settings.props.onBack());
  expect(renderer.root.findByType(YearHomeScreen)).toBe(yearScreen);
});

test('month arrows queue fast taps and ignore stale native scroll completions', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue(bundledCalendar2027);
  mockedGetYearCalendar.mockResolvedValue(bundledCalendar2027);
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  ReactTestRenderer.act(() =>
    renderer.root.findByType(YearHomeScreen).props.onOpenMonth(5),
  );
  const monthScreen = renderer.root.findByType(MonthDetailScreen);
  const nextButton = () =>
    monthScreen
      .findAllByProps({
        accessibilityLabel: 'Next month',
      })
      .find(node => typeof node.props.disabled === 'boolean')!;
  const pager = monthScreen.findByProps({ testID: 'month-pager' });
  const width = pager.props.contentOffset.x / 4;
  for (let i = 0; i < 3; i++) {
    ReactTestRenderer.act(() => nextButton().props.onPress());
  }
  expect(monthScreen.props.month).toBe(6);
  for (const month of [6, 7]) {
    ReactTestRenderer.act(() =>
      pager.props.onMomentumScrollEnd({
        nativeEvent: { contentOffset: { x: (month - 1) * width } },
      }),
    );
  }
  expect(monthScreen.props.month).toBe(8);
  ReactTestRenderer.act(() =>
    pager.props.onMomentumScrollEnd({
      nativeEvent: { contentOffset: { x: 5 * width } },
    }),
  );
  expect(monthScreen.props.month).toBe(8);
  ReactTestRenderer.act(() => pager.props.onScrollBeginDrag());
  ReactTestRenderer.act(() =>
    pager.props.onMomentumScrollEnd({
      nativeEvent: { contentOffset: { x: 6 * width } },
    }),
  );
  expect(monthScreen.props.month).toBe(7);
});

test('shows error state when bootstrap fails', async () => {
  mockedSeedBundledYearIfNeeded.mockRejectedValue(new Error('db failed'));

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Failed to initialize local calendar data.',
  );
});

test('retries bootstrap from the error screen', async () => {
  mockedSeedBundledYearIfNeeded
    .mockRejectedValueOnce(new Error('db failed'))
    .mockResolvedValueOnce({
      year: 2027,
      days: [],
    });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2027,
    days: [],
  });

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Failed to initialize local calendar data.',
  );

  await ReactTestRenderer.act(async () => {
    renderer!.root
      .findByProps({ testID: 'app-bootstrap-retry' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain('Year 2027');
});

test('shows month error when stored days do not match the calendar month', async () => {
  const corruptCalendar = {
    ...bundledCalendar2027,
    days: bundledCalendar2027.days.filter(day => day.date !== '2027-02-28'),
  };

  mockedSeedBundledYearIfNeeded.mockResolvedValue(corruptCalendar);
  mockedGetYearCalendar.mockResolvedValue(corruptCalendar);

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByType(YearHomeScreen).props.onOpenMonth(2);
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Failed to open the selected month.',
  );

  await ReactTestRenderer.act(async () => {
    renderer!.root
      .findByProps({ testID: 'app-month-error-back' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain('Year 2027');
});

test('opens dedicated JSON import entry from settings', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue({
    year: 2027,
    days: [],
  });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2027,
    days: [],
  });

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
    'Load a calendar year from a JSON file',
  );
});

test('does not show Telegram link in the settings about section', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue({
    year: 2027,
    days: [],
  });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2027,
    days: [],
  });

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    renderer!.root.findByType(YearHomeScreen).props.onOpenSettings();
  });

  expect(JSON.stringify(renderer!.toJSON())).not.toContain(
    't.me/workingcalendar',
  );
});

test('shows year-end reminder with Telegram link late in the active year', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2027-11-15T12:00:00.000Z'));

  mockedSeedBundledYearIfNeeded.mockResolvedValue({
    year: 2027,
    days: [],
  });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2027,
    days: [],
  });

  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    expect(JSON.stringify(renderer!.toJSON())).toContain(
      'Next year JSON template',
    );
    expect(JSON.stringify(renderer!.toJSON())).toContain(
      't.me/workingcalendar',
    );
  } finally {
    jest.useRealTimers();
  }
});

test('activates the JSON calendar and switches to English after JSON import', async () => {
  const importedCalendar = {
    year: 2025,
    days: [],
  };

  mockedGetStoredLanguage.mockResolvedValue('ru');
  mockedSeedBundledYearIfNeeded.mockResolvedValue({
    year: 2027,
    days: [],
  });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2027,
    days: [],
  });
  mockedActivateUserJsonImport.mockResolvedValue(importedCalendar);
  mockedGetActiveCalendarIsUserJsonImport.mockResolvedValue(true);
  mockedGetUserJsonImportYear.mockResolvedValue(2025);

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
    renderer!.root
      .findByType(ImportEntryScreen)
      .props.onImportCompleted(importedCalendar);
  });

  expect(mockedSaveUserJsonImport).not.toHaveBeenCalled();
  expect(mockedActivateUserJsonImport).toHaveBeenCalledTimes(1);
  expect(mockedSetStoredLanguage).toHaveBeenCalledWith('en');
  expect(JSON.stringify(renderer!.toJSON())).toContain('Settings');
  expect(JSON.stringify(renderer!.toJSON())).toContain('2025');
  expect(JSON.stringify(renderer!.toJSON())).toContain('JSON calendar');
});
