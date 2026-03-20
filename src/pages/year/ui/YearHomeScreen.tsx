import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  buildYearMonthSummaries,
  type CalendarDay,
  type CalendarYear,
  type DayType,
  getCalendarPalette,
  getDayTypeColors,
  type DayTypeColors,
} from '../../../entities/calendar';
import { AppLogo } from '../../../shared/ui/AppLogo';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type YearHomeScreenProps = {
  calendar: CalendarYear;
  isDarkMode: boolean;
  onOpenMonth: (month: number) => void;
};

export function YearHomeScreen({
  calendar,
  isDarkMode,
  onOpenMonth,
}: YearHomeScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const palette = getCalendarPalette(isDarkMode);
  const monthSummaries = buildYearMonthSummaries(calendar);

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
        <View style={[styles.iconButton, { borderColor: palette.border }]}>
          <Text style={[styles.iconButtonText, { color: palette.icon }]}>≡</Text>
        </View>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {calendar.year}
        </Text>
        <View style={[styles.iconButton, { borderColor: palette.border }]}>
          <Text style={[styles.iconButtonText, { color: palette.icon }]}>⋮</Text>
        </View>
      </View>

      <View style={styles.header}>
        <AppLogo isDarkMode={isDarkMode} size="small" />
        <Text style={[styles.eyebrow, { color: palette.subtitle }]}>
          Production calendar
        </Text>
        <Text style={[styles.subtitle, { color: palette.subtitle }]}>
          Active year is loaded from local SQLite storage and rendered as a
          month-by-month overview.
        </Text>
      </View>

      <View
        style={[
          styles.legendCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        {[
          { label: 'Workday', type: 'workday' as const },
          { label: 'Weekend', type: 'weekend' as const },
          { label: 'Holiday', type: 'holiday' as const },
          { label: 'Shortened', type: 'shortened' as const },
        ].map(item => {
          const colors = getDayTypeColors(item.type, palette);

          return (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[
                  styles.legendSwatch,
                  {
                    backgroundColor: colors.backgroundColor,
                    borderColor: colors.borderColor,
                  },
                ]}
              />
              <Text style={[styles.legendLabel, { color: palette.subtitle }]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.monthsGrid}>
        {monthSummaries.map(summary => (
          <Pressable
            key={summary.month}
            onPress={() => onOpenMonth(summary.month)}
            style={[
              styles.monthCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.monthCardHeader}>
              <Text style={[styles.monthTitle, { color: palette.title }]}>
                {summary.label}
              </Text>
              <Text style={[styles.monthMeta, { color: palette.subtitle }]}>
                {summary.workHours} h
              </Text>
            </View>

            <View style={styles.weekHeaderRow}>
              <Text style={[styles.weekNumberLabel, { color: palette.subtitle }]}>
                #
              </Text>
              {WEEKDAY_LABELS.map((label, index) => (
                <Text
                  key={`${summary.month}-${label}-${index}`}
                  style={[styles.weekdayLabel, { color: palette.subtitle }]}
                >
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.weeksList}>
              {summary.weeks.map(week => (
                <View key={`${summary.month}-${week.isoWeek}`} style={styles.weekRow}>
                  <Text
                    style={[styles.weekNumberValue, { color: palette.subtitle }]}
                  >
                    {week.isoWeek}
                  </Text>
                  {week.days.map((day, dayIndex) => (
                    <MonthDayCell
                      key={`${summary.month}-${week.isoWeek}-${dayIndex}`}
                      day={day}
                      getDayTypeColors={type =>
                        getDayTypeColors(type, palette)
                      }
                    />
                  ))}
                </View>
              ))}
            </View>

            <View style={[styles.summaryRow, { backgroundColor: palette.surfaceMuted }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: palette.subtitle }]}>
                  Work
                </Text>
                <Text style={[styles.summaryValue, { color: palette.title }]}>
                  {summary.workingDays}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: palette.subtitle }]}>
                  Off
                </Text>
                <Text style={[styles.summaryValue, { color: palette.title }]}>
                  {summary.nonWorkingDays}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: palette.subtitle }]}>
                  Days
                </Text>
                <Text style={[styles.summaryValue, { color: palette.title }]}>
                  {summary.totalDays}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

type MonthDayCellProps = {
  day: CalendarDay | null;
  getDayTypeColors: (type: DayType) => DayTypeColors;
};

function MonthDayCell({ day, getDayTypeColors }: MonthDayCellProps) {
  if (!day) {
    return <View style={styles.emptyDayCell} />;
  }

  const colors = getDayTypeColors(day.type);

  return (
    <View
      style={[
        styles.dayCell,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <Text style={[styles.dayCellText, { color: colors.color }]}>
        {day.day}
      </Text>
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
    justifyContent: 'space-between',
    minHeight: 56,
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
  header: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  eyebrow: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subtitle: {
    maxWidth: 340,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  legendCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthCard: {
    width: '47%',
    minWidth: 168,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    gap: 8,
  },
  monthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  monthMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  weekNumberLabel: {
    width: 16,
    fontSize: 9,
    textAlign: 'center',
  },
  weekdayLabel: {
    width: 18,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  weeksList: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  weekNumberValue: {
    width: 16,
    fontSize: 9,
    textAlign: 'center',
  },
  emptyDayCell: {
    width: 18,
    height: 18,
  },
  dayCell: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellText: {
    fontSize: 9,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
