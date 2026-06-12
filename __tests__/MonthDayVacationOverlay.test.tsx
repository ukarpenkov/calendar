/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { MemoizedMonthDetailDayCell } from '../src/pages/month/ui/MonthDetailScreen';
import type { CalendarDay } from '../src/entities/calendar/model/types';

jest.mock('../src/entities/calendar', () => ({
  ...jest.requireActual('../src/entities/calendar'),
  getDayTypeColors: jest.fn((type: string) => {
    const colors: Record<string, { backgroundColor: string; borderColor: string; color: string }> = {
      workday: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827' },
      weekend: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB', color: '#6B7280' },
      holiday: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', color: '#DC2626' },
      shortened: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', color: '#EA580C' },
    };
    return colors[type] ?? colors.workday;
  }),
}));

const mockPalette = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceMuted: '#F3F4F6',
  border: '#E5E7EB',
  selectedBorder: '#2DD4BF',
  selectedFill: '#F0FDFA',
  title: '#111827',
  subtitle: '#6B7280',
  icon: '#374151',
};

const workday: CalendarDay = {
  date: '2026-07-01',
  year: 2026,
  month: 7,
  day: 1,
  weekday: 3,
  type: 'workday',
  holidayNameRu: null,
  holidayNameEn: null,
  holidayNameTr: null,
  holidayNameId: null,
  holidayNameJa: null,
  isShortened: false,
  workHours: 8,
};

const holiday: CalendarDay = {
  ...workday,
  date: '2026-07-04',
  day: 4,
  type: 'holiday',
  holidayNameRu: 'Independence Day',
  holidayNameEn: 'Independence Day',
};

const defaultOnSelectDay = jest.fn();

describe('MonthDetailDayCell vacation overlay', () => {
  beforeEach(() => {
    defaultOnSelectDay.mockClear();
  });

  it('renders vacation strip when vacationColor is provided for workday', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <MemoizedMonthDetailDayCell
          day={workday}
          isSelected={false}
          palette={mockPalette as any}
          calendarScale={1}
          onSelectDay={defaultOnSelectDay}
          vacationColor="#2DD4BF"
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('#2DD4BF');
  });

  it('renders without vacation strip when vacationColor is not provided', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <MemoizedMonthDetailDayCell
          day={workday}
          isSelected={false}
          palette={mockPalette as any}
          calendarScale={1}
          onSelectDay={defaultOnSelectDay}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).not.toContain('#2DD4BF');
  });

  it('does not render vacation strip for holiday type even with vacationColor', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <MemoizedMonthDetailDayCell
          day={holiday}
          isSelected={false}
          palette={mockPalette as any}
          calendarScale={1}
          onSelectDay={defaultOnSelectDay}
          vacationColor="#2DD4BF"
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).not.toContain('#2DD4BF');
  });
});
