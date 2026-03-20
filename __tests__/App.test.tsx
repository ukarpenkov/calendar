/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/app/App';
import {
  getYearCalendar,
  seedBundledYearIfNeeded,
} from '../src/entities/calendar';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');

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
  seedBundledYearIfNeeded: jest.fn(),
}));

const mockedSeedBundledYearIfNeeded = jest.mocked(seedBundledYearIfNeeded);
const mockedGetYearCalendar = jest.mocked(getYearCalendar);

beforeEach(() => {
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
