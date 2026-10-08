import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getDayTypeColors,
  getDayTypeLabel,
  type CalendarPalette,
} from '../lib/presentation';
import type { CalendarDay } from '../model/types';
import type { CalendarMonthDetail } from '../model/month-detail';
import type { AppLanguage } from '../../../shared/lib/i18n';

type CalendarMonthGridProps = {
  detail: CalendarMonthDetail;
  palette: CalendarPalette;
  language: AppLanguage;
  weekdayLabels: readonly string[];
  calendarScale?: number;
  selectedDayDate?: string;
  onSelectDay: (date: string) => void;
  vacationColorByDate?: ReadonlyMap<string, string>;
  minDate?: string;
  preserveDayTypeOnSelection?: boolean;
};

export const CalendarMonthGrid = memo(function CalendarMonthGrid({
  detail,
  palette,
  language,
  weekdayLabels,
  calendarScale = 1,
  selectedDayDate,
  onSelectDay,
  vacationColorByDate,
  minDate,
  preserveDayTypeOnSelection = false,
}: CalendarMonthGridProps) {
  return (
    <View
      style={[
        styles.calendarCard,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={styles.weekHeaderRow}>
        {weekdayLabels.map(label => (
          <Text
            key={`${detail.month}-${label}`}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            numberOfLines={1}
            maxFontSizeMultiplier={1.15}
            style={[
              styles.weekdayLabel,
              {
                color: palette.subtitle,
                fontSize: 12 * calendarScale,
              },
            ]}
          >
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.weeksList}>
        {detail.weeks.map(week => (
          <View key={`${detail.month}-${week.isoWeek}`} style={styles.weekRow}>
            {week.days.map((day, dayIndex) => (
              <MemoizedCalendarDayCell
                key={`${detail.month}-${week.isoWeek}-${dayIndex}`}
                day={day}
                disabled={!!day && !!minDate && day.date < minDate}
                accessibilityLabel={
                  day
                    ? `${day.day} ${detail.label}, ${getDayTypeLabel(
                        day.type,
                        language,
                      )}`
                    : undefined
                }
                preserveDayTypeOnSelection={preserveDayTypeOnSelection}
                isSelected={day?.date === selectedDayDate}
                palette={palette}
                calendarScale={calendarScale}
                onSelectDay={onSelectDay}
                vacationColor={
                  day?.date ? vacationColorByDate?.get(day.date) : undefined
                }
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
});

type CalendarDayCellProps = {
  day: CalendarDay | null;
  isSelected: boolean;
  palette: CalendarPalette;
  calendarScale: number;
  onSelectDay: (date: string) => void;
  vacationColor?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  preserveDayTypeOnSelection?: boolean;
};

function CalendarDayCell({
  day,
  isSelected,
  palette,
  calendarScale,
  onSelectDay,
  vacationColor,
  disabled = false,
  accessibilityLabel,
  preserveDayTypeOnSelection = false,
}: CalendarDayCellProps) {
  const cellSize = Math.max(36, 42 * calendarScale);
  const onPress = useCallback(() => {
    if (day) {
      onSelectDay(day.date);
    }
  }, [day, onSelectDay]);

  if (!day) {
    return <View style={styles.emptyDayCell} />;
  }

  const colors = getDayTypeColors(day.type, palette);
  const showVacation = !!vacationColor;

  const bgColor =
    isSelected && !preserveDayTypeOnSelection
      ? palette.selectedFill
      : colors.backgroundColor;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? day.date}
      accessibilityState={{ selected: isSelected, disabled }}
      testID={`calendar-day-${day.date}`}
      style={({ pressed }) => [
        styles.dayCell,
        {
          minHeight: cellSize,
          borderRadius: Math.max(8, 12 * calendarScale),
          backgroundColor: bgColor,
          borderColor: isSelected ? palette.selectedBorder : colors.borderColor,
          opacity: disabled ? 0.35 : pressed ? 0.9 : 1,
        },
      ]}
    >
      {isSelected && preserveDayTypeOnSelection ? (
        <View
          pointerEvents="none"
          style={[
            styles.selectionRing,
            { borderColor: palette.selectedBorder },
          ]}
        />
      ) : null}
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.65}
        numberOfLines={1}
        maxFontSizeMultiplier={1.15}
        style={[
          styles.dayCellText,
          {
            color: isSelected ? palette.title : colors.color,
            fontSize: 14 * calendarScale,
          },
        ]}
      >
        {day.day}
      </Text>
      {showVacation ? (
        <View
          style={[
            styles.vacationBar,
            {
              backgroundColor: vacationColor,
              height: Math.max(2, 3 * calendarScale),
              borderBottomLeftRadius: Math.max(6, 8 * calendarScale),
              borderBottomRightRadius: Math.max(6, 8 * calendarScale),
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

export const MemoizedCalendarDayCell = memo(CalendarDayCell);

const styles = StyleSheet.create({
  calendarCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    gap: 12,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  weekdayLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  weeksList: {
    gap: 6,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 6,
  },
  emptyDayCell: {
    flex: 1,
    aspectRatio: 1,
  },
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
  selectionRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderRadius: 10,
  },
});
