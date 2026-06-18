import { useMemo, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  openWorkingCalendarTelegram,
  shouldShowYearEndReminder,
  WORKING_CALENDAR_TELEGRAM_PATH,
  YearEndReminderCard,
} from '../../../features/year-end-reminder';
import {
  type CalendarDay,
  type CalendarMonthSummary,
  type CalendarYear,
  type DayType,
  getDayTypeColors,
  getDayTypeLabel,
  type DayTypeColors,
} from '../../../entities/calendar';
import type { VacationPeriod } from '../../../features/vacation/model';
import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import { getCompactWeekdayLabels } from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import { SettingsGearButton } from '../../../shared/ui/SettingsGearButton';
import { VacationButton } from '../../../shared/ui/VacationButton';
import { YearScreenCalendarMark } from '../../../shared/ui/icons/YearScreenCalendarMark';
import { getYearGridMetrics } from './yearGridMetrics';

function getVacationColorForDate(
  date: string,
  vacationPeriods: VacationPeriod[],
): string | undefined {
  for (const period of vacationPeriods) {
    if (date >= period.startDate && date <= period.endDate) {
      return period.color;
    }
  }
  return undefined;
}

type YearHomeScreenProps = {
  calendar: CalendarYear;
  monthSummaries: CalendarMonthSummary[];
  onOpenMonth: (month: number, origin: { x: number; y: number; width: number; height: number }) => void;
  onOpenSettings: () => void;
  onOpenVacation: () => void;
  vacationPeriods: VacationPeriod[];
};

export function YearHomeScreen({
  calendar,
  monthSummaries,
  onOpenMonth,
  onOpenSettings,
  onOpenVacation,
  vacationPeriods,
}: YearHomeScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight, fontScale } =
    useWindowDimensions();
  const { palette } = useAppTheme();
  const { language, t } = useAppLocalization();
  const columnsPerRow = useMemo(() => {
    const minDimension = Math.min(windowWidth, windowHeight);
    const isTablet = minDimension >= 600;
    const isLandscape = windowWidth > windowHeight;
    return isTablet || isLandscape ? 4 : 2;
  }, [windowHeight, windowWidth]);
  const monthSummaryRows = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(monthSummaries.length / columnsPerRow) },
        (_, index) =>
          monthSummaries.slice(
            index * columnsPerRow,
            index * columnsPerRow + columnsPerRow,
          ),
      ),
    [columnsPerRow, monthSummaries],
  );
  const weekdayLabels = getCompactWeekdayLabels(language);
  const showYearEndReminder = shouldShowYearEndReminder(calendar.year);
  const gridMetrics = useMemo(
    () => getYearGridMetrics(windowWidth, fontScale, columnsPerRow),
    [columnsPerRow, fontScale, windowWidth],
  );
  const vacationDaysCountByMonth = useMemo(() => {
    const counts = new Map<number, number>();
    for (const period of vacationPeriods) {
      for (const day of calendar.days) {
        if (
          day.type !== 'holiday' &&
          day.date >= period.startDate &&
          day.date <= period.endDate
        ) {
          counts.set(day.month, (counts.get(day.month) ?? 0) + 1);
        }
      }
    }
    return counts;
  }, [calendar.days, vacationPeriods]);
  const monthCardRefs = useRef<Map<number, View>>(new Map());

  const vacationDaysByMonth = useMemo(() => {
    const counts: Record<number, number> = {};
    const yearStr = String(calendar.year);

    for (const period of vacationPeriods) {
      const start = period.startDate > `${yearStr}-01-01` ? period.startDate : `${yearStr}-01-01`;
      const end = period.endDate < `${yearStr}-12-31` ? period.endDate : `${yearStr}-12-31`;

      if (start > end) continue;

      const startMonth = parseInt(start.split('-')[1], 10);
      const endMonth = parseInt(end.split('-')[1], 10);

      for (let m = startMonth; m <= endMonth; m++) {
        const monthStart = `${yearStr}-${String(m).padStart(2, '0')}-01`;
        const monthEnd = new Date(calendar.year, m, 0);
        const monthEndStr = `${yearStr}-${String(m).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;

        const rangeStart = start > monthStart ? start : monthStart;
        const rangeEnd = end < monthEndStr ? end : monthEndStr;

        if (rangeStart <= rangeEnd) {
          const s = new Date(rangeStart);
          const e = new Date(rangeEnd);
          const days = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          counts[m] = (counts[m] || 0) + days;
        }
      }
    }
    return counts;
  }, [vacationPeriods, calendar.year]);

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + layout.safeAreaTopExtra,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: safeAreaInsets.bottom + layout.yearMonthScrollBottom,
        },
      ]}
    >
      <View style={styles.appBar}>
        <View style={styles.appBarLeading}>
          <YearScreenCalendarMark
            size={36}
            accessibilityLabel={t('common.appName')}
          />
        </View>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {t('year.home.title', { year: calendar.year })}
        </Text>
        <View style={styles.appBarTrailing}>
          <VacationButton
            palette={palette}
            accessibilityLabel={t('year.menu.vacation')}
            onPress={onOpenVacation}
          />
          <SettingsGearButton
            palette={palette}
            accessibilityLabel={t('year.menu.settings')}
            onPress={onOpenSettings}
          />
        </View>
      </View>

      {showYearEndReminder ? (
        <YearEndReminderCard
          palette={palette}
          title={t('year.reminder.title')}
          body={t('year.reminder.body', { year: calendar.year + 1 })}
          actionLabel={t('year.reminder.action')}
          linkLabel={WORKING_CALENDAR_TELEGRAM_PATH}
          onPress={async () => {
            await openWorkingCalendarTelegram();
          }}
        />
      ) : null}

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
          { type: 'workday' as const },
          { type: 'weekend' as const },
          { type: 'holiday' as const },
          { type: 'shortened' as const },
        ].map(item => {
          const colors = getDayTypeColors(item.type, palette);
          const label = getDayTypeLabel(item.type, language);

          return (
            <View key={item.type} style={styles.legendItem}>
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
                {label}
              </Text>
            </View>
          );
        })}
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendSwatch,
              {
                backgroundColor: palette.vacationFill,
                borderColor: palette.vacationBorder,
              },
            ]}
          />
          <Text style={[styles.legendLabel, { color: palette.subtitle }]}>
            {t('vacation.legend.vacation')}
          </Text>
        </View>
      </View>

      <View style={styles.monthsGrid}>
        {monthSummaryRows.map((row, rowIndex) => (
          <View key={`month-row-${rowIndex}`} style={styles.monthRow}>
            {row.map(summary => (
              <Pressable
                key={summary.month}
                ref={ref => {
                  if (ref) {
                    monthCardRefs.current.set(summary.month, ref);
                  }
                }}
                onPress={() => {
                  const cardRef = monthCardRefs.current.get(summary.month);
                  cardRef?.measureInWindow((x, y, width, height) => {
                    onOpenMonth(summary.month, { x, y, width, height });
                  });
                }}
                style={({ pressed }) => [
                  styles.monthCard,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <View style={styles.monthCardHeader}>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={gridMetrics.minimumTextScale}
                    numberOfLines={1}
                    maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                    style={[
                      styles.monthTitle,
                      {
                        color: palette.title,
                        fontSize: gridMetrics.monthTitleFontSize,
                      },
                    ]}
                  >
                    {summary.label}
                  </Text>
                  {(vacationDaysCountByMonth.get(summary.month) ?? 0) > 0 ? (
                    <View
                      style={[
                        styles.vacationBadge,
                        { backgroundColor: '#2DD4BF' },
                      ]}
                    >
                      <Text
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.1}
                        style={styles.vacationBadgeText}
                      >
                        {vacationDaysCountByMonth.get(summary.month)}
                      </Text>
                    </View>
                  ) : null}
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={gridMetrics.minimumTextScale}
                    numberOfLines={1}
                    maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                    style={[
                      styles.monthMeta,
                      {
                        color: palette.subtitle,
                        fontSize: gridMetrics.monthMetaFontSize,
                      },
                    ]}
                  >
                    {summary.workHours} {t('common.hoursUnit')}
                  </Text>
                </View>

                <View style={styles.weekHeaderRow}>
                  <View style={styles.weekNumberColumn}>
                    <Text style={[styles.weekNumberLabel, { color: palette.subtitle }]}>
                      #
                    </Text>
                  </View>
                  <View style={styles.daysHeaderStrip}>
                    {weekdayLabels.map((label, index) => (
                      <View
                        key={`${summary.month}-${label}-${index}`}
                        style={styles.dayColumnHeader}
                      >
                        <Text
                          adjustsFontSizeToFit
                          minimumFontScale={gridMetrics.minimumTextScale}
                          numberOfLines={1}
                          maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                          style={[
                            styles.weekdayLabel,
                            {
                              color: palette.subtitle,
                              fontSize: gridMetrics.weekdayFontSize,
                            },
                          ]}
                        >
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.weeksList}>
                  {summary.weeks.map(week => (
                    <View key={`${summary.month}-${week.isoWeek}`} style={styles.weekRow}>
                      <View style={styles.weekNumberColumn}>
                        <Text
                          adjustsFontSizeToFit
                          minimumFontScale={gridMetrics.minimumTextScale}
                          numberOfLines={1}
                          maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                          style={[
                            styles.weekNumberValue,
                            {
                              color: palette.subtitle,
                              fontSize: gridMetrics.weekNumberFontSize,
                            },
                          ]}
                        >
                          {week.isoWeek}
                        </Text>
                      </View>
                      <View style={styles.daysStrip}>
                        {week.days.map((day, dayIndex) => (
                          <View
                            key={`${summary.month}-${week.isoWeek}-${dayIndex}`}
                            style={styles.dayColumn}
                          >
                            <MonthDayCell
                              day={day}
                              vacationColor={day?.date ? getVacationColorForDate(day.date, vacationPeriods) : undefined}
                              gridMetrics={gridMetrics}
                              resolveDayTypeColors={type =>
                                getDayTypeColors(type, palette)
                              }
                            />
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                <View
                  style={[styles.summaryRow, { backgroundColor: palette.surfaceMuted }]}
                >
                  <View style={styles.summaryItem}>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={gridMetrics.minimumTextScale}
                      numberOfLines={1}
                      maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                      style={[
                        styles.summaryLabel,
                        {
                          color: palette.subtitle,
                          fontSize: gridMetrics.summaryLabelFontSize,
                        },
                      ]}
                    >
                      {t('year.summary.work')}
                    </Text>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={gridMetrics.minimumTextScale}
                      numberOfLines={1}
                      maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                      style={[
                        styles.summaryValue,
                        {
                          color: palette.title,
                          fontSize: gridMetrics.summaryValueFontSize,
                        },
                      ]}
                    >
                      {summary.workingDays}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={gridMetrics.minimumTextScale}
                      numberOfLines={1}
                      maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                      style={[
                        styles.summaryLabel,
                        {
                          color: palette.subtitle,
                          fontSize: gridMetrics.summaryLabelFontSize,
                        },
                      ]}
                    >
                      {t('year.summary.off')}
                    </Text>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={gridMetrics.minimumTextScale}
                      numberOfLines={1}
                      maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                      style={[
                        styles.summaryValue,
                        {
                          color: palette.title,
                          fontSize: gridMetrics.summaryValueFontSize,
                        },
                      ]}
                    >
                      {summary.nonWorkingDays}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={gridMetrics.minimumTextScale}
                      numberOfLines={1}
                      maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                      style={[
                        styles.summaryLabel,
                        {
                          color: palette.subtitle,
                          fontSize: gridMetrics.summaryLabelFontSize,
                        },
                      ]}
                    >
                      {t('year.summary.days')}
                    </Text>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={gridMetrics.minimumTextScale}
                      numberOfLines={1}
                      maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                      style={[
                        styles.summaryValue,
                        {
                          color: palette.title,
                          fontSize: gridMetrics.summaryValueFontSize,
                        },
                      ]}
                    >
                      {summary.totalDays}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
            {Array.from({ length: columnsPerRow - row.length }).map(
              (_, spacerIndex) => (
                <View
                  key={`month-row-${rowIndex}-spacer-${spacerIndex}`}
                  style={styles.monthCardSpacer}
                />
              ),
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

type MonthDayCellProps = {
  day: CalendarDay | null;
  vacationColor?: string;
  gridMetrics: ReturnType<typeof getYearGridMetrics>;
  resolveDayTypeColors: (type: DayType) => DayTypeColors;
};

function MonthDayCell({ day, vacationColor, gridMetrics, resolveDayTypeColors }: MonthDayCellProps) {
  if (!day) {
    return <View style={styles.emptyDayCell} />;
  }

  const colors = resolveDayTypeColors(day.type);
  const showVacation = !!vacationColor;

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
      <Text
        adjustsFontSizeToFit
        minimumFontScale={gridMetrics.minimumTextScale}
        numberOfLines={1}
        maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
        style={[
          styles.dayCellText,
          {
            color: colors.color,
            fontSize: gridMetrics.dayFontSize,
          },
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    gap: layout.contentStackGap,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  /** Same width as trailing column so the year stays visually centered. */
  appBarLeading: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTrailing: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
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
    gap: 12,
  },
  monthRow: {
    flexDirection: 'row',
    gap: 12,
  },
  monthCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    gap: 8,
  },
  monthCardSpacer: {
    flex: 1,
  },
  monthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  vacationBadge: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  monthTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '700',
  },
  monthMeta: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '600',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: '100%',
    minWidth: 0,
  },
  weekNumberColumn: {
    width: 22,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumberLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  daysHeaderStrip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 0,
  },
  weekdayLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  weeksList: {
    gap: 4,
    width: '100%',
    minWidth: 0,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: '100%',
    minWidth: 0,
  },
  weekNumberValue: {
    fontSize: 9,
    textAlign: 'center',
  },
  daysStrip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 0,
  },
  dayColumnHeader: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  dayColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'stretch',
  },
  emptyDayCell: {
    height: 18,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  dayCell: {
    height: 18,
    minWidth: 0,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellText: {
    fontSize: 9,
    fontWeight: '600',
  },
  vacationBarSmall: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  summaryRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryItem: {
    flex: 1,
    minWidth: 0,
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
