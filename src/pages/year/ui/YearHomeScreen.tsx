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
import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import { getCompactWeekdayLabels } from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import { AppLogo } from '../../../shared/ui/AppLogo';
import { SettingsGearButton } from '../../../shared/ui/SettingsGearButton';
import { getYearGridMetrics } from './yearGridMetrics';

type YearHomeScreenProps = {
  calendar: CalendarYear;
  monthSummaries: CalendarMonthSummary[];
  onOpenMonth: (month: number, origin: { x: number; y: number; width: number; height: number }) => void;
  onOpenSettings: () => void;
};

export function YearHomeScreen({
  calendar,
  monthSummaries,
  onOpenMonth,
  onOpenSettings,
}: YearHomeScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight, fontScale } =
    useWindowDimensions();
  const { isDarkMode, palette } = useAppTheme();
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
  const monthCardRefs = useRef<Map<number, View>>(new Map());

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
          <AppLogo
            isDarkMode={isDarkMode}
            size="toolbar"
            accessibilityLabel={t('common.appName')}
          />
        </View>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {t('year.home.title', { year: calendar.year })}
        </Text>
        <View style={styles.appBarTrailing}>
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
  gridMetrics: ReturnType<typeof getYearGridMetrics>;
  resolveDayTypeColors: (type: DayType) => DayTypeColors;
};

function MonthDayCell({ day, gridMetrics, resolveDayTypeColors }: MonthDayCellProps) {
  if (!day) {
    return <View style={styles.emptyDayCell} />;
  }

  const colors = resolveDayTypeColors(day.type);

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
    width: 32 + 8 + 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  appBarTrailing: {
    width: 32 + 8 + 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
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
