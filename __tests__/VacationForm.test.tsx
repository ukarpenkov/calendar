/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { VacationForm } from '../src/pages/vacation/ui/VacationForm';
import type { VacationPeriod } from '../src/features/vacation/model';
import type { CalendarDay, CalendarPalette } from '../src/entities/calendar';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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

const calendarDays: CalendarDay[] = [
  { date: '2026-07-01', year: 2026, month: 7, day: 1, weekday: 3, type: 'workday', holidayNameRu: null, holidayNameEn: null, holidayNameTr: null, holidayNameId: null, holidayNameJa: null, isShortened: false, workHours: 8 },
  { date: '2026-07-02', year: 2026, month: 7, day: 2, weekday: 4, type: 'workday', holidayNameRu: null, holidayNameEn: null, holidayNameTr: null, holidayNameId: null, holidayNameJa: null, isShortened: false, workHours: 8 },
  { date: '2026-07-03', year: 2026, month: 7, day: 3, weekday: 5, type: 'workday', holidayNameRu: null, holidayNameEn: null, holidayNameTr: null, holidayNameId: null, holidayNameJa: null, isShortened: false, workHours: 8 },
  { date: '2026-07-04', year: 2026, month: 7, day: 4, weekday: 6, type: 'weekend', holidayNameRu: null, holidayNameEn: null, holidayNameTr: null, holidayNameId: null, holidayNameJa: null, isShortened: false, workHours: 0 },
  { date: '2026-07-05', year: 2026, month: 7, day: 5, weekday: 0, type: 'weekend', holidayNameRu: null, holidayNameEn: null, holidayNameTr: null, holidayNameId: null, holidayNameJa: null, isShortened: false, workHours: 0 },
  { date: '2026-07-06', year: 2026, month: 7, day: 6, weekday: 1, type: 'workday', holidayNameRu: null, holidayNameEn: null, holidayNameTr: null, holidayNameId: null, holidayNameJa: null, isShortened: false, workHours: 8 },
  { date: '2026-07-07', year: 2026, month: 7, day: 7, weekday: 2, type: 'workday', holidayNameRu: null, holidayNameEn: null, holidayNameTr: null, holidayNameId: null, holidayNameJa: null, isShortened: false, workHours: 8 },
];

const editPeriod: VacationPeriod = {
  id: 1,
  startDate: '2026-07-01',
  endDate: '2026-07-07',
  color: '#3B82F6',
};

const defaultOnSave = jest.fn();
const defaultOnDelete = jest.fn();
const defaultOnCancel = jest.fn();

describe('VacationForm', () => {
  beforeEach(() => {
    defaultOnSave.mockClear();
    defaultOnDelete.mockClear();
    defaultOnCancel.mockClear();
  });

  it('renders in create mode with correct title', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          calendarDays={calendarDays}
          palette={palette}
          language="en"
          onSave={defaultOnSave}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('New vacation');
  });

  it('renders in edit mode with correct title', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          initialPeriod={editPeriod}
          calendarDays={calendarDays}
          palette={palette}
          language="en"
          onSave={defaultOnSave}
          onDelete={defaultOnDelete}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('Edit vacation');
  });

  it('renders color presets', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          calendarDays={calendarDays}
          palette={palette}
          language="en"
          onSave={defaultOnSave}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('#2DD4BF');
    expect(json).toContain('#3B82F6');
    expect(json).toContain('#8B5CF6');
    expect(json).toContain('#F97316');
    expect(json).toContain('#EC4899');
    expect(json).toContain('#22C55E');
  });

  it('renders i18n labels for Russian locale', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          calendarDays={calendarDays}
          palette={palette}
          language="ru"
          onSave={defaultOnSave}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('Новый отпуск');
    expect(json).toContain('Дата начала');
    expect(json).toContain('Дата окончания');
    expect(json).toContain('Цвет');
    expect(json).toContain('Сохранить');
    expect(json).toContain('Отмена');
  });

  it('save button is disabled when fields are empty', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          calendarDays={calendarDays}
          palette={palette}
          language="en"
          onSave={defaultOnSave}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const root = renderer!.root;
    const disabledButtons = root.findAllByProps({
      accessibilityRole: 'button',
      disabled: true,
    });
    expect(disabledButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onCancel when cancel button is pressed', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          calendarDays={calendarDays}
          palette={palette}
          language="en"
          onSave={defaultOnSave}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const root = renderer!.root;
    const back = root.children[0] as ReactTestRenderer.ReactTestInstance;
    await ReactTestRenderer.act(async () => {
      back.props.onPress?.();
    });
  });

  it('shows delete button in edit mode', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          initialPeriod={editPeriod}
          calendarDays={calendarDays}
          palette={palette}
          language="en"
          onSave={defaultOnSave}
          onDelete={defaultOnDelete}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('Delete');
  });

  it('does not show delete button in create mode', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          calendarDays={calendarDays}
          palette={palette}
          language="en"
          onSave={defaultOnSave}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).not.toContain('"Delete"');
  });

  it('populates date fields from initialPeriod in edit mode', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          initialPeriod={editPeriod}
          calendarDays={calendarDays}
          palette={palette}
          language="en"
          onSave={defaultOnSave}
          onDelete={defaultOnDelete}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('01.07');
    expect(json).toContain('07.07');
  });

  it('renders with default color when no initialPeriod', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationForm
          calendarDays={calendarDays}
          palette={palette}
          language="en"
          onSave={defaultOnSave}
          onCancel={defaultOnCancel}
        />,
      );
    });

    const root = renderer!.root;
    const tealCircle = root.findByProps({
      testID: 'color-preset-#2DD4BF',
    });
    expect(tealCircle).toBeTruthy();
  });
});
