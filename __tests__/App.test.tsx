/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/app/App';
import {
  getMonthCalendar,
  getYearCalendar,
  seedBundledYearIfNeeded,
} from '../src/entities/calendar';
import { MonthDetailScreen } from '../src/pages/month/ui/MonthDetailScreen';
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
  getMonthCalendar: jest.fn(),
  getYearCalendar: jest.fn(),
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

const mockedGetMonthCalendar = jest.mocked(getMonthCalendar);
const mockedSeedBundledYearIfNeeded = jest.mocked(seedBundledYearIfNeeded);
const mockedGetYearCalendar = jest.mocked(getYearCalendar);

beforeEach(() => {
  mockedGetMonthCalendar.mockReset();
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
  mockedSeedBundledYearIfNeeded.mockResolvedValue({
    year: 2026,
    days: [],
  });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2026,
    days: [],
  });
  mockedGetMonthCalendar.mockResolvedValue([
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
  ]);

  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByType(YearHomeScreen).props.onOpenMonth(1);
  });

  expect(mockedGetMonthCalendar).toHaveBeenCalledWith(2026, 1);
  expect(JSON.stringify(renderer!.toJSON())).toContain('Month detail');
  expect(JSON.stringify(renderer!.toJSON())).toContain('January');
  expect(JSON.stringify(renderer!.toJSON())).toContain('Working days');
});

test('switches to the next month from month detail', async () => {
  mockedSeedBundledYearIfNeeded.mockResolvedValue({
    year: 2026,
    days: [],
  });
  mockedGetYearCalendar.mockResolvedValue({
    year: 2026,
    days: [],
  });
  mockedGetMonthCalendar.mockImplementation(async (_year, month) => {
    if (month === 1) {
      return [
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
      ];
    }

    return [
      {
        date: '2026-02-01',
        year: 2026,
        month: 2,
        day: 1,
        weekday: 7,
        type: 'weekend',
        holidayNameRu: null,
        holidayNameEn: null,
        isShortened: false,
        workHours: 0,
      },
    ];
  });

  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByType(YearHomeScreen).props.onOpenMonth(1);
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByType(MonthDetailScreen).props.onOpenNextMonth();
  });

  expect(mockedGetMonthCalendar).toHaveBeenNthCalledWith(1, 2026, 1);
  expect(mockedGetMonthCalendar).toHaveBeenNthCalledWith(2, 2026, 2);
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
