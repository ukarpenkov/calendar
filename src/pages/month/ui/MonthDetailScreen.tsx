import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  buildMonthDetail,
  getCalendarPalette,
  getDayTypeColors,
  getDayTypeLabel,
  type CalendarDay,
} from '../../../entities/calendar';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type MonthDetailScreenProps = {
  year: number;
  month: number;
  days: CalendarDay[];
  isDarkMode: boolean;
  onBack: () => void;
  onOpenPreviousMonth?: () => void;
  onOpenNextMonth?: () => void;
};

export function MonthDetailScreen({
  year,
  month,
  days,
  isDarkMode,
  onBack,
  onOpenPreviousMonth,
  onOpenNextMonth,
}: MonthDetailScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const palette = getCalendarPalette(isDarkMode);
  const detail = useMemo(
    () => buildMonthDetail(year, month, days),
    [days, month, year],
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(detail.days[0]?.date ?? null);
  }, [detail.days]);

  const selectedDay =
    detail.days.find(day => day.date === selectedDate) ?? detail.days[0] ?? null;

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + 12,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: safeAreaInsets.bottom + 24,
        },
      ]}
    >
      <View style={styles.appBar}>
        <View style={[styles.appBarSide, styles.appBarSideStart]}>
          <Pressable
            onPress={onBack}
            style={[styles.iconButton, { borderColor: palette.border }]}
          >
            <Text style={[styles.iconButtonText, { color: palette.icon }]}>
              {'<'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.appBarTitleWrap}>
          <Text style={[styles.appBarTitle, { color: palette.title }]}>
            {detail.shortLabel} {detail.year}
          </Text>
        </View>
        <View style={[styles.appBarSide, styles.appBarActions]}>
          <MonthNavigationButton
            icon="<"
            isDarkMode={isDarkMode}
            onPress={onOpenPreviousMonth}
          />
          <MonthNavigationButton
            icon=">"
            isDarkMode={isDarkMode}
            onPress={onOpenNextMonth}
          />
        </View>
      </View>

      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.headerEyebrow, { color: palette.subtitle }]}>
          Month detail
        </Text>
        <Text style={[styles.headerTitle, { color: palette.title }]}>
          {detail.label} {detail.year}
        </Text>
        <Text style={[styles.headerSubtitle, { color: palette.subtitle }]}>
          Full month grid with stored day states and monthly totals from SQLite.
        </Text>
      </View>

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
          {WEEKDAY_LABELS.map(label => (
            <Text
              key={`${detail.month}-${label}`}
              style={[styles.weekdayLabel, { color: palette.subtitle }]}
            >
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.weeksList}>
          {detail.weeks.map(week => (
            <View key={`${detail.month}-${week.isoWeek}`} style={styles.weekRow}>
              {week.days.map((day, dayIndex) => (
                <MonthDetailDayCell
                  key={`${detail.month}-${week.isoWeek}-${dayIndex}`}
                  day={day}
                  isSelected={day?.date === selectedDay?.date}
                  isDarkMode={isDarkMode}
                  onPress={() => {
                    if (day) {
                      setSelectedDate(day.date);
                    }
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {selectedDay ? (
        <View
          style={[
            styles.selectedDayCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.selectedBorder,
            },
          ]}
        >
          <Text style={[styles.selectedDayEyebrow, { color: palette.subtitle }]}>
            Selected day
          </Text>
          <Text style={[styles.selectedDayTitle, { color: palette.title }]}>
            {detail.label} {selectedDay.day}
          </Text>
          <Text style={[styles.selectedDayMeta, { color: palette.subtitle }]}>
            {getDayTypeLabel(selectedDay.type)} - {selectedDay.workHours} h
          </Text>
          {selectedDay.holidayNameEn ? (
            <Text style={[styles.selectedDayHoliday, { color: palette.title }]}>
              {selectedDay.holidayNameEn}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.totalsGrid}>
        <TotalCard
          label="Total days"
          value={String(detail.totalDays)}
          palette={palette}
        />
        <TotalCard
          label="Working days"
          value={String(detail.workingDays)}
          palette={palette}
        />
        <TotalCard
          label="Non-working days"
          value={String(detail.nonWorkingDays)}
          palette={palette}
        />
        <TotalCard
          label="Work hours"
          value={`${detail.workHours} h`}
          palette={palette}
        />
      </View>
    </ScrollView>
  );
}

type MonthNavigationButtonProps = {
  icon: '<' | '>';
  isDarkMode: boolean;
  onPress?: () => void;
};

function MonthNavigationButton({
  icon,
  isDarkMode,
  onPress,
}: MonthNavigationButtonProps) {
  const palette = getCalendarPalette(isDarkMode);
  const isDisabled = !onPress;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.iconButton,
        {
          borderColor: palette.border,
          backgroundColor: isDisabled ? palette.surfaceMuted : palette.surface,
          opacity: isDisabled ? 0.45 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.iconButtonText,
          { color: isDisabled ? palette.subtitle : palette.icon },
        ]}
      >
        {icon}
      </Text>
    </Pressable>
  );
}

type MonthDetailDayCellProps = {
  day: CalendarDay | null;
  isSelected: boolean;
  isDarkMode: boolean;
  onPress: () => void;
};

function MonthDetailDayCell({
  day,
  isSelected,
  isDarkMode,
  onPress,
}: MonthDetailDayCellProps) {
  const palette = getCalendarPalette(isDarkMode);

  if (!day) {
    return <View style={styles.emptyDayCell} />;
  }

  const colors = getDayTypeColors(day.type, palette);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dayCell,
        {
          backgroundColor: isSelected
            ? palette.selectedFill
            : colors.backgroundColor,
          borderColor: isSelected ? palette.selectedBorder : colors.borderColor,
        },
      ]}
    >
      <Text
        style={[
          styles.dayCellText,
          {
            color: isSelected ? palette.title : colors.color,
          },
        ]}
      >
        {day.day}
      </Text>
    </Pressable>
  );
}

type TotalCardProps = {
  label: string;
  value: string;
  palette: ReturnType<typeof getCalendarPalette>;
};

function TotalCard({ label, value, palette }: TotalCardProps) {
  return (
    <View
      style={[
        styles.totalCard,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <Text style={[styles.totalLabel, { color: palette.subtitle }]}>{label}</Text>
      <Text style={[styles.totalValue, { color: palette.title }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    gap: 12,
  },
  appBarSide: {
    width: 80,
  },
  appBarSideStart: {
    alignItems: 'flex-start',
  },
  appBarTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  appBarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
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
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedDayCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  selectedDayEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  selectedDayTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  selectedDayMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedDayHoliday: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  totalCard: {
    width: '47%',
    minWidth: 160,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },
});
