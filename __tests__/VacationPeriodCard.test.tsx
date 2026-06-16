/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { VacationPeriodCard } from '../src/pages/vacation/ui/VacationPeriodCard';
import type { VacationPeriod } from '../src/features/vacation/model';
import type { CalendarPalette } from '../src/entities/calendar';

const palette: CalendarPalette = {
  background: '#12141A',
  surface: '#1B1F27',
  surfaceMuted: '#232834',
  border: '#2C3442',
  title: '#E8EAEF',
  subtitle: '#9AA3B2',
  icon: '#D6DAE3',
  selectedFill: '#0F172A',
  selectedBorder: '#60A5FA',
  workdayFill: '#1B1F27',
  workdayBorder: '#3A4252',
  weekendFill: '#1E3A5F',
  weekendBorder: '#3B82F6',
  holidayFill: '#472326',
  holidayBorder: '#F87171',
  shortenedFill: '#4A371A',
  shortenedBorder: '#F59E0B',
  vacationFill: '#134E4A',
  vacationBorder: '#2DD4BF',
  workdayText: '#E8EAEF',
  accentText: '#F8FAFC',
};

const defaultPeriod: VacationPeriod = {
  id: 1,
  startDate: '2026-07-01',
  endDate: '2026-07-14',
  color: '#2DD4BF',
};

const defaultOnPress = jest.fn();

describe('VacationPeriodCard', () => {
  beforeEach(() => {
    defaultOnPress.mockClear();
  });

  it('renders with default props', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="en"
          palette={palette}
        />,
      );
    });

    expect(renderer!.toJSON()).toMatchSnapshot();
  });

  it('renders dates for Russian locale', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="ru"
          palette={palette}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('01.07.2026');
    expect(json).toContain('14.07.2026');
  });

  it('renders dates for Japanese locale', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="ja"
          palette={palette}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('2026年07月01日');
    expect(json).toContain('2026年07月14日');
  });

  it('renders workDays and totalDays summary', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="en"
          palette={palette}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('"10"');
    expect(json).toContain('" / "');
    expect(json).toContain('"14"');
  });

  it('calls onPress when pressed', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="en"
          palette={palette}
        />,
      );
    });

    const root = renderer!.root;
    const card = root.children[0] as ReactTestRenderer.ReactTestInstance;
    await ReactTestRenderer.act(async () => {
      card.props.onPress();
    });

    expect(defaultOnPress).toHaveBeenCalledWith(defaultPeriod);
  });
});
