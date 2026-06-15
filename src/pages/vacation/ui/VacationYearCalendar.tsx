import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { CalendarDay, CalendarPalette } from '../../../entities/calendar';
import type { VacationPeriod } from '../../../features/vacation/model';
import type { AppLanguage } from '../../../shared/lib/i18n';
import { getMonthShortLabel } from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';

type VacationYearCalendarProps = {
  year: number;
  calendarDays: CalendarDay[];
  vacationPeriods: VacationPeriod[];
  palette: CalendarPalette;
  language: AppLanguage;
  onDayPress?: (date: string) => void;
};

type DayCellData = {
  day: number;
  type: CalendarDay['type'];
  date: string;
  vacationColor: string | null;
};

function buildMonthGrid(
  year: number,
  month: number,
  calendarDays: CalendarDay[],
  vacationPeriods: VacationPeriod[],
): DayCellData[][] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const mondayOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const dayMap = new Map<string, CalendarDay>();
  for (const d of calendarDays) {
    if (d.year === year && d.month === month) {
      dayMap.set(String(d.day), d);
    }
  }

  const cells: (DayCellData | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cal = dayMap.get(String(day));
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    let vacationColor: string | null = null;
    if (cal?.type === 'workday' || cal?.type === 'holiday') {
      for (const p of vacationPeriods) {
        if (dateStr >= p.startDate && dateStr <= p.endDate) {
          vacationColor = p.color;
          break;
        }
      }
    }

    cells.push({
      day,
      type: cal?.type ?? 'workday',
      date: dateStr,
      vacationColor,
    });
  }

  const rows: DayCellData[][] = [];
  let row: DayCellData[] = [];
  for (const cell of cells) {
    if (cell === null) {
      row.push({
        day: 0,
        type: 'workday',
        date: '',
        vacationColor: null,
      });
    } else {
      row.push(cell);
    }
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) {
    while (row.length < 7) {
      row.push({ day: 0, type: 'workday', date: '', vacationColor: null });
    }
    rows.push(row);
  }

  return rows;
}

function getDayBackgroundColor(
  type: CalendarDay['type'],
  vacationColor: string | null,
  palette: CalendarPalette,
): string | null {
  if (vacationColor) {
    return vacationColor + '4D';
  }
  switch (type) {
    case 'holiday':
      return palette.holidayFill;
    case 'weekend':
      return palette.weekendFill;
    case 'shortened':
      return palette.shortenedFill;
    default:
      return null;
  }
}

function getDayTextColor(
  type: CalendarDay['type'],
  vacationColor: string | null,
  palette: CalendarPalette,
): string {
  if (vacationColor) {
    return palette.title;
  }
  switch (type) {
    case 'holiday':
      return palette.holidayBorder;
    case 'weekend':
      return palette.weekendBorder;
    case 'shortened':
      return palette.shortenedBorder;
    default:
      return palette.title;
  }
}

export function VacationYearCalendar({
  year,
  calendarDays,
  vacationPeriods,
  palette,
  language,
}: VacationYearCalendarProps) {
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        month,
        label: getMonthShortLabel(language, month),
        rows: buildMonthGrid(year, month, calendarDays, vacationPeriods),
      };
    });
  }, [year, calendarDays, vacationPeriods, language]);

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: layout.screenPaddingH },
      ]}
    >
      <View style={styles.grid}>
        {months.map(({ month, label, rows }) => (
          <View key={month} style={styles.monthBlock}>
            <Text style={[styles.monthLabel, { color: palette.subtitle }]}>
              {label}
            </Text>
            {rows.map((row, ri) => (
              <View key={ri} style={styles.weekRow}>
                {row.map((cell, ci) => {
                  const bg = getDayBackgroundColor(
                    cell.type,
                    cell.vacationColor,
                    palette,
                  );
                  const fg = getDayTextColor(
                    cell.type,
                    cell.vacationColor,
                    palette,
                  );
                  return (
                    <View
                      key={ci}
                      style={[
                        styles.dayCell,
                        bg ? { backgroundColor: bg } : undefined,
                      ]}
                    >
                      <Text style={[styles.dayText, { color: fg }]}>
                        {cell.day > 0 ? cell.day : ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthBlock: {
    width: '22%',
    minWidth: 72,
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
    margin: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 6,
  },
});
