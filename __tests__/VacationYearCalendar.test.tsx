import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { VacationYearCalendar } from '../src/pages/vacation/ui/VacationYearCalendar';
import type { VacationPeriod } from '../src/features/vacation/model';
import type { CalendarDay, CalendarPalette } from '../src/entities/calendar';

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

function makeDay(
  date: string,
  month: number,
  day: number,
  weekday: number,
  type: CalendarDay['type'] = 'workday',
): CalendarDay {
  return {
    date,
    year: 2026,
    month,
    day,
    weekday,
    type,
    holidayNameRu: null,
    holidayNameEn: null,
    holidayNameTr: null,
    holidayNameId: null,
    holidayNameJa: null,
    isShortened: type === 'shortened',
    workHours: type === 'workday' ? 8 : type === 'shortened' ? 7 : 0,
  };
}

const calendarDays: CalendarDay[] = [
  makeDay('2026-06-01', 6, 1, 1),
  makeDay('2026-06-02', 6, 2, 2),
  makeDay('2026-06-03', 6, 3, 3),
  makeDay('2026-06-04', 6, 4, 4),
  makeDay('2026-06-05', 6, 5, 5),
  makeDay('2026-06-06', 6, 6, 6, 'weekend'),
  makeDay('2026-06-07', 6, 7, 0, 'weekend'),
  makeDay('2026-06-08', 6, 8, 1),
  makeDay('2026-06-09', 6, 9, 2),
  makeDay('2026-06-10', 6, 10, 3),
  makeDay('2026-06-11', 6, 11, 4),
  makeDay('2026-06-12', 6, 12, 5),
  makeDay('2026-06-13', 6, 13, 6, 'weekend'),
  makeDay('2026-06-14', 6, 14, 0, 'weekend'),
  makeDay('2026-06-15', 6, 15, 1),
];

const vacationPeriods: VacationPeriod[] = [
  { id: 1, startDate: '2026-06-01', endDate: '2026-06-15', color: '#2DD4BF' },
];

describe('VacationYearCalendar', () => {
  it('renders with vacation period — snapshot', () => {
    const renderer = ReactTestRenderer.create(
      <VacationYearCalendar
        year={2026}
        calendarDays={calendarDays}
        vacationPeriods={vacationPeriods}
        palette={palette}
        language="en"
      />,
    );
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it('renders without vacation periods — snapshot', () => {
    const renderer = ReactTestRenderer.create(
      <VacationYearCalendar
        year={2026}
        calendarDays={calendarDays}
        vacationPeriods={[]}
        palette={palette}
        language="en"
      />,
    );
    expect(renderer.toJSON()).toMatchSnapshot();
  });
});
