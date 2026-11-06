import { memo } from 'react';
import { Text, View } from 'react-native';

import {
  getDayTypeColors,
  type CalendarDay,
  type CalendarPalette,
} from '../../../entities/calendar';
import { getYearGridMetrics, getYearGridTextStyle } from './yearGridMetrics';
import { styles } from './yearHomeStyles';

type MonthDayCellProps = {
  day: CalendarDay | null;
  vacationColor?: string;
  isToday?: boolean;
  gridMetrics: ReturnType<typeof getYearGridMetrics>;
  palette: CalendarPalette;
};

const cellSizeStyle = { width: '100%' as const, aspectRatio: 1 };

function YearMonthDayCellView({
  day,
  vacationColor,
  isToday,
  gridMetrics,
  palette,
}: MonthDayCellProps) {
  if (!day) {
    return <View style={[styles.emptyDayCell, cellSizeStyle]} />;
  }

  const colors = getDayTypeColors(day.type, palette);
  const showVacation = !!vacationColor;

  return (
    <View
      style={[
        styles.dayCell,
        cellSizeStyle,
        isToday ? styles.dayCellToday : null,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: isToday ? palette.selectedBorder : colors.borderColor,
          borderRadius: Math.max(4, Math.round(gridMetrics.dayCellSize * 0.28)),
        },
      ]}
    >
      <Text
        adjustsFontSizeToFit
        minimumFontScale={gridMetrics.minimumTextScale}
        numberOfLines={1}
        maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
        style={[
          styles.dayCellText,
          getYearGridTextStyle(gridMetrics.dayFontSize, { fontWeight: '600' }),
          { color: colors.color },
        ]}
      >
        {day.day}
      </Text>
      {showVacation ? (
        <View
          style={[
            styles.vacationBarSmall,
            { backgroundColor: vacationColor },
          ]}
        />
      ) : null}
    </View>
  );
}

export const YearMonthDayCell = memo(YearMonthDayCellView);
