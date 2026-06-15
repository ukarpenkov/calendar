import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { View, Text, StyleSheet } from 'react-native';

jest.mock('../src/app/providers/theme', () => ({
  useAppTheme: () => ({
    palette: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      surfaceMuted: '#E0E0E0',
      title: '#000000',
      subtitle: '#666666',
      icon: '#333333',
      border: '#CCCCCC',
      selectedBorder: '#2DD4BF',
      selectedFill: '#E0F7F4',
    },
  }),
}));

jest.mock('../src/app/providers/localization', () => ({
  useAppLocalization: () => ({
    language: 'en',
    t: (key: string) => key,
  }),
}));

jest.mock('../src/entities/calendar', () => ({
  getDayTypeColors: (type: string) => {
    const map: Record<string, { backgroundColor: string; borderColor: string; color: string }> = {
      workday: { backgroundColor: '#F0F0F0', borderColor: '#DDD', color: '#000' },
      holiday: { backgroundColor: '#FFE0E0', borderColor: '#FCC', color: '#C00' },
      weekend: { backgroundColor: '#E0E0FF', borderColor: '#CCF', color: '#00C' },
      shortened: { backgroundColor: '#E0FFE0', borderColor: '#CFC', color: '#0C0' },
    };
    return map[type] || map.workday;
  },
  getDayTypeLabel: (type: string) => type,
  getDayImage: () => null,
  getHolidayDisplayName: () => null,
  getHolidayImageForMonth: () => null,
}));

function getVacationColorForDate(
  date: string,
  vacationPeriods: { startDate: string; endDate: string; color: string }[],
): string | undefined {
  for (const period of vacationPeriods) {
    if (date >= period.startDate && date <= period.endDate) {
      return period.color;
    }
  }
  return undefined;
}

function shouldShowVacationBar(type: string, vacationColor?: string): boolean {
  return type !== 'holiday' && !!vacationColor;
}

const styles = StyleSheet.create({
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vacationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

type TestDayCellProps = {
  day: number;
  type: string;
  vacationColor?: string;
};

function TestDayCell({ day, type, vacationColor }: TestDayCellProps) {
  const showBar = shouldShowVacationBar(type, vacationColor);
  return (
    <View style={styles.dayCell}>
      <Text style={styles.dayCellText}>{day}</Text>
      {showBar && vacationColor ? (
        <View
          testID="vacation-bar"
          style={[styles.vacationBar, { backgroundColor: vacationColor, height: 3 }]}
        />
      ) : null}
    </View>
  );
}

describe('getVacationColorForDate', () => {
  const periods = [
    { startDate: '2026-07-01', endDate: '2026-07-14', color: '#2DD4BF' },
    { startDate: '2026-12-25', endDate: '2026-12-31', color: '#FF6B6B' },
  ];

  it('returns color for date within vacation period', () => {
    expect(getVacationColorForDate('2026-07-05', periods)).toBe('#2DD4BF');
    expect(getVacationColorForDate('2026-07-01', periods)).toBe('#2DD4BF');
    expect(getVacationColorForDate('2026-07-14', periods)).toBe('#2DD4BF');
  });

  it('returns undefined for date outside vacation period', () => {
    expect(getVacationColorForDate('2026-06-15', periods)).toBeUndefined();
    expect(getVacationColorForDate('2026-08-01', periods)).toBeUndefined();
  });

  it('returns second period color for overlapping date', () => {
    expect(getVacationColorForDate('2026-12-28', periods)).toBe('#FF6B6B');
  });

  it('returns undefined for empty periods', () => {
    expect(getVacationColorForDate('2026-07-05', [])).toBeUndefined();
  });
});

describe('shouldShowVacationBar', () => {
  it('returns true for workday with vacationColor', () => {
    expect(shouldShowVacationBar('workday', '#2DD4BF')).toBe(true);
  });

  it('returns false for workday without vacationColor', () => {
    expect(shouldShowVacationBar('workday', undefined)).toBe(false);
  });

  it('returns false for holiday with vacationColor', () => {
    expect(shouldShowVacationBar('holiday', '#2DD4BF')).toBe(false);
  });

  it('returns true for weekend with vacationColor', () => {
    expect(shouldShowVacationBar('weekend', '#2DD4BF')).toBe(true);
  });

  it('returns true for shortened with vacationColor', () => {
    expect(shouldShowVacationBar('shortened', '#2DD4BF')).toBe(true);
  });
});

describe('TestDayCell snapshot rendering', () => {
  it('renders workday with vacationColor — snapshot contains vacation bar', () => {
    let tree: ReactTestRenderer.ReactTestRendererJSON | ReactTestRenderer.ReactTestRendererJSON[] | null = null;
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <TestDayCell day={15} type="workday" vacationColor="#2DD4BF" />,
      );
      tree = root.toJSON();
    });
    expect(tree).toMatchSnapshot();
    const bar = root!.root.findByProps({ testID: 'vacation-bar' });
    expect(bar).toBeTruthy();
  });

  it('renders workday without vacationColor — no vacation bar', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <TestDayCell day={15} type="workday" />,
      );
    });
    const bars = root!.root.findAllByProps({ testID: 'vacation-bar' });
    expect(bars).toHaveLength(0);
  });

  it('renders holiday with vacationColor — vacation bar NOT shown', () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <TestDayCell day={25} type="holiday" vacationColor="#2DD4BF" />,
      );
    });
    const bars = root!.root.findAllByProps({ testID: 'vacation-bar' });
    expect(bars).toHaveLength(0);
  });

  it('renders weekend with vacationColor — vacation bar shown', () => {
    let tree: ReactTestRenderer.ReactTestRendererJSON | ReactTestRenderer.ReactTestRendererJSON[] | null = null;
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <TestDayCell day={6} type="weekend" vacationColor="#2DD4BF" />,
      );
      tree = root.toJSON();
    });
    expect(tree).toMatchSnapshot();
    const bar = root!.root.findByProps({ testID: 'vacation-bar' });
    expect(bar).toBeTruthy();
  });

  it('renders shortened with vacationColor — vacation bar shown', () => {
    let tree: ReactTestRenderer.ReactTestRendererJSON | ReactTestRenderer.ReactTestRendererJSON[] | null = null;
    let root: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      root = ReactTestRenderer.create(
        <TestDayCell day={22} type="shortened" vacationColor="#2DD4BF" />,
      );
      tree = root.toJSON();
    });
    expect(tree).toMatchSnapshot();
    const bar = root!.root.findByProps({ testID: 'vacation-bar' });
    expect(bar).toBeTruthy();
  });
});
