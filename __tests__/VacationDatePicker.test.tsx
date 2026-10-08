import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

import { getCalendarPalette, type CalendarDay } from '../src/entities/calendar';
import { VacationDatePicker } from '../src/pages/vacation/ui/VacationDatePicker';
import { VacationForm } from '../src/pages/vacation/ui/VacationForm';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// A leap year different from the device year, with all seven weekday columns.
const year = 2028;
const calendarDays: CalendarDay[] = Array.from({ length: 366 }, (_, index) => {
  const date = new Date(Date.UTC(year, 0, index + 1));
  const iso = date.toISOString().slice(0, 10);
  const weekday = date.getUTCDay() || 7;
  const type =
    iso === '2028-01-01'
      ? 'holiday'
      : iso === '2028-01-07'
      ? 'shortened'
      : weekday >= 6
      ? 'weekend'
      : 'workday';
  return {
    date: iso,
    year,
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday,
    type,
    isShortened: type === 'shortened',
    workHours: type === 'workday' ? 8 : type === 'shortened' ? 7 : 0,
    holidayNameRu: null,
    holidayNameEn: null,
    holidayNameTr: null,
    holidayNameId: null,
    holidayNameJa: null,
  };
});
const palette = getCalendarPalette(false);

let renderer: ReactTestRenderer.ReactTestRenderer;
const render = (element: React.ReactElement) =>
  act(() => {
    renderer = ReactTestRenderer.create(element);
  });
const press = (testID: string) =>
  act(() => {
    renderer.root.findByProps({ testID }).props.onPress();
  });
const nav = (label: string) =>
  renderer.root
    .findAllByProps({ accessibilityLabel: label })
    .find(node => typeof node.props.disabled === 'boolean')!;
const save = () =>
  act(() =>
    renderer.root.findByProps({ accessibilityLabel: 'Save' }).props.onPress(),
  );

afterEach(() => act(() => renderer?.unmount()));

describe('VacationDatePicker', () => {
  const renderPicker = (
    overrides: Partial<React.ComponentProps<typeof VacationDatePicker>> = {},
  ) => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(
      <VacationDatePicker
        year={year}
        calendarDays={calendarDays}
        selectedDate="2028-01-07"
        initialDate={null}
        title="Start date"
        palette={palette}
        language="en"
        onSelect={onSelect}
        onClose={onClose}
        {...overrides}
      />,
    );
    return { onSelect, onClose };
  };

  it('opens the selected month and bounds arrows and swipe pages to the active year', () => {
    renderPicker();
    const scrollToOffset = jest.spyOn(
      renderer.root.findByType(FlatList).instance,
      'scrollToOffset',
    );
    expect(nav('Previous month').props.disabled).toBe(true);
    act(() => nav('Next month').props.onPress());
    expect(scrollToOffset).toHaveBeenLastCalledWith(
      expect.objectContaining({ animated: true }),
    );
    expect(renderer.root.findByType(FlatList).props.initialScrollIndex).toBe(1);
    const list = renderer.root.findByType(FlatList);
    expect(list.props.data).toHaveLength(12);
    expect(
      list.props.data.every((month: { year: number }) => month.year === year),
    ).toBe(true);
    const { length: pageWidth } = list.props.getItemLayout(null, 0);
    act(() =>
      list.props.onMomentumScrollEnd({
        nativeEvent: { contentOffset: { x: pageWidth * 11 } },
      }),
    );
    expect(nav('Next month').props.disabled).toBe(true);
    expect(nav('Previous month').props.disabled).toBe(false);
  });

  it('uses the shared month grid and retains holiday, weekend and shortened colors', () => {
    renderPicker();
    expect(
      renderer.root.findAll(
        node => node.props.detail && node.props.weekdayLabels,
      ).length,
    ).toBeGreaterThan(0);
    const colorFor = (date: string) => {
      const day = renderer.root.findByProps({ testID: `calendar-day-${date}` });
      return StyleSheet.flatten(day.props.style({ pressed: false }))
        .backgroundColor;
    };
    expect(colorFor('2028-01-01')).toBe(palette.holidayFill);
    expect(colorFor('2028-01-07')).toBe(palette.shortenedFill);
    expect(colorFor('2028-01-08')).toBe(palette.weekendFill);
    expect(renderer.root.findAllByType(TextInput)).toHaveLength(0);
  });

  it('disables end dates before the start and accepts the same day', () => {
    const { onSelect } = renderPicker({ minDate: '2028-01-07' });
    expect(
      renderer.root.findByProps({ testID: 'calendar-day-2028-01-06' }).props
        .disabled,
    ).toBe(true);
    press('calendar-day-2028-01-07');
    expect(onSelect).toHaveBeenCalledWith('2028-01-07');
  });

  it('closes on Android Back or backdrop without selecting a date', () => {
    const { onClose, onSelect } = renderPicker();
    act(() => renderer.root.findByType(Modal).props.onRequestClose());
    press('date-picker-backdrop');
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('includes February 29 in the active leap year', () => {
    const { onSelect } = renderPicker({ selectedDate: '2028-02-29' });
    press('calendar-day-2028-02-29');
    expect(onSelect).toHaveBeenCalledWith('2028-02-29');
  });
});

describe('VacationForm date selection', () => {
  const renderForm = (
    initialPeriod?: React.ComponentProps<typeof VacationForm>['initialPeriod'],
  ) => {
    const onSave = jest.fn();
    render(
      <VacationForm
        year={year}
        initialPeriod={initialPeriod}
        calendarDays={calendarDays}
        palette={palette}
        language="en"
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );
    return onSave;
  };

  it('creates a vacation in the calendar year, recalculates days, and reopens at the chosen month', () => {
    const onSave = renderForm();
    expect(renderer.root.findAllByType(TextInput)).toHaveLength(1);
    press('vacation-start-date');
    press('calendar-day-2028-01-07');
    expect(renderer.root.findAllByType(VacationDatePicker)).toHaveLength(0);
    press('vacation-end-date');
    press('calendar-day-2028-01-08');
    expect(renderer.root.findByType(TextInput).props.value).toBe('2');
    save();
    expect(onSave).toHaveBeenLastCalledWith(
      '2028-01-07',
      '2028-01-08',
      '#2DD4BF',
    );
    press('vacation-start-date');
    expect(renderer.root.findByType(FlatList).props.initialScrollIndex).toBe(0);
    expect(
      renderer.root.findByType(VacationDatePicker).props.selectedDate,
    ).toBe('2028-01-07');
  });

  it('preserves duration when moving the start and clamps days and increment at December 31', () => {
    const onSave = renderForm({
      id: 1,
      startDate: '2028-12-20',
      endDate: '2028-12-26',
      color: '#3B82F6',
    });
    press('vacation-start-date');
    press('calendar-day-2028-12-29');
    expect(renderer.root.findByType(TextInput).props.value).toBe('3');
    act(() => renderer.root.findByType(TextInput).props.onChangeText('99'));
    press('increment-day-button');
    expect(renderer.root.findByType(TextInput).props.value).toBe('3');
    save();
    expect(onSave).toHaveBeenLastCalledWith(
      '2028-12-29',
      '2028-12-31',
      '#3B82F6',
    );
  });

  it('counts February 29 when entering duration and incrementing it', () => {
    const onSave = renderForm({
      id: 1,
      startDate: '2028-02-28',
      endDate: '2028-02-28',
      color: '#3B82F6',
    });
    act(() => renderer.root.findByType(TextInput).props.onChangeText('2'));
    save();
    expect(onSave).toHaveBeenLastCalledWith(
      '2028-02-28',
      '2028-02-29',
      '#3B82F6',
    );
    press('increment-day-button');
    save();
    expect(onSave).toHaveBeenLastCalledWith(
      '2028-02-28',
      '2028-03-01',
      '#3B82F6',
    );
  });
});
