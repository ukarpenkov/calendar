import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type CalendarMonthSummary,
  type CalendarYear,
  getDayTypeColors,
  getDayTypeLabel,
} from '../../../entities/calendar';
import type { VacationPeriod } from '../../../features/vacation/model';
import { getLocalIsoDate } from '../../../shared/lib/date/localIsoDate';
import { getVacationColorForDate } from '../../../shared/lib/date/vacationRange';
import { useAppLocalization } from '../../../shared/lib/localization';
import { useAppTheme } from '../../../shared/lib/theme';
import { getCompactWeekdayLabels } from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import { SettingsGearButton } from '../../../shared/ui/SettingsGearButton';
import { VacationButton } from '../../../shared/ui/VacationButton';
import { MotionPressable } from '../../../shared/ui/MotionPressable';
import { YearScreenCalendarMark } from '../../../shared/ui/icons/YearScreenCalendarMark';
import { getYearGridMetrics, getYearGridTextStyle } from './yearGridMetrics';
import { YearMonthDayCell as MonthDayCell } from './YearMonthDayCell';
import { styles } from './yearHomeStyles';

type YearHomeScreenProps = {
  calendar: CalendarYear;
  monthSummaries: CalendarMonthSummary[];
  onOpenMonth: (
    month: number,
    origin?: { x: number; y: number; width: number; height: number },
  ) => void;
  onPrepareMonth?: (month: number) => void;
  onOpenSettings: () => void;
  onOpenVacation: () => void;
  vacationPeriods: VacationPeriod[];
};

export function YearHomeScreen({
  calendar,
  monthSummaries,
  onOpenMonth,
  onPrepareMonth,
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
  const scrollViewRef = useRef<ScrollView>(null);
  const monthCardRefs = useRef<Map<number, View>>(new Map());
  const [containerHeight, setContainerHeight] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const todayDate = getLocalIsoDate();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    if (containerHeight <= 0 || cardHeight <= 0) return;
    const rowIndex = Math.floor((currentMonth - 1) / columnsPerRow);
    const gapHeight = 12;
    let targetY = rowIndex * (cardHeight + gapHeight) - containerHeight / 2 + cardHeight / 2;
    targetY = Math.max(0, targetY);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: targetY, animated: false });
    });
  }, [containerHeight, cardHeight, currentMonth, columnsPerRow]);

  return (
    <ScrollView
      ref={scrollViewRef}
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
      onLayout={e => setContainerHeight(e.nativeEvent.layout.height)}
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
              <View
                key={summary.month}
                style={styles.monthCardShell}
                collapsable={false}
                ref={ref => {
                  if (ref) {
                    monthCardRefs.current.set(summary.month, ref);
                  } else {
                    monthCardRefs.current.delete(summary.month);
                  }
                }}
              >
                <MotionPressable
                  accessibilityRole="button"
                  accessibilityLabel={summary.label}
                  onLayout={e => {
                    if (summary.month === 1 && cardHeight === 0) {
                      setCardHeight(e.nativeEvent.layout.height);
                    }
                  }}
                  onPressIn={() => onPrepareMonth?.(summary.month)}
                  onPress={() => {
                    const cardRef = monthCardRefs.current.get(summary.month);
                    if (!cardRef) {
                      onOpenMonth(summary.month);
                      return;
                    }
                    cardRef.measureInWindow((x, y, width, height) => {
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
                      getYearGridTextStyle(gridMetrics.monthTitleFontSize, {
                        fontWeight: '700',
                      }),
                      { color: palette.title },
                    ]}
                  >
                    {summary.label}
                  </Text>
                  {(vacationDaysCountByMonth.get(summary.month) ?? 0) > 0 ? (
                    <View style={styles.vacationBadge}>
                      <Text
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1}
                        style={[
                          styles.vacationBadgeText,
                          getYearGridTextStyle(10, { fontWeight: '700' }),
                        ]}
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
                      getYearGridTextStyle(gridMetrics.monthMetaFontSize, {
                        fontWeight: '600',
                      }),
                      { color: palette.subtitle },
                    ]}
                  >
                    {summary.workHours} {t('common.hoursUnit')}
                  </Text>
                </View>

                <View style={styles.weekHeaderRow}>
                  <View style={styles.weekNumberColumn}>
                    <Text
                      maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                      style={[
                        styles.weekNumberLabel,
                        getYearGridTextStyle(gridMetrics.weekNumberFontSize),
                        { color: palette.subtitle },
                      ]}
                    >
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
                            getYearGridTextStyle(gridMetrics.weekdayFontSize, {
                              fontWeight: '600',
                            }),
                            { color: palette.subtitle },
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
                    <View
                      key={`${summary.month}-${week.isoWeek}`}
                      style={[
                        styles.weekRow,
                        { minHeight: gridMetrics.dayCellSize },
                      ]}
                    >
                      <View
                        style={[
                          styles.weekNumberColumn,
                          { height: gridMetrics.dayCellSize },
                        ]}
                      >
                        <Text
                          adjustsFontSizeToFit
                          minimumFontScale={gridMetrics.minimumTextScale}
                          numberOfLines={1}
                          maxFontSizeMultiplier={gridMetrics.maxFontSizeMultiplier}
                          style={[
                            styles.weekNumberValue,
                            getYearGridTextStyle(gridMetrics.weekNumberFontSize),
                            { color: palette.subtitle },
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
                              isToday={day?.date === todayDate}
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
                        getYearGridTextStyle(gridMetrics.summaryLabelFontSize, {
                          fontWeight: '500',
                        }),
                        { color: palette.subtitle },
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
                        getYearGridTextStyle(gridMetrics.summaryValueFontSize, {
                          fontWeight: '700',
                        }),
                        { color: palette.title },
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
                        getYearGridTextStyle(gridMetrics.summaryLabelFontSize, {
                          fontWeight: '500',
                        }),
                        { color: palette.subtitle },
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
                        getYearGridTextStyle(gridMetrics.summaryValueFontSize, {
                          fontWeight: '700',
                        }),
                        { color: palette.title },
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
                        getYearGridTextStyle(gridMetrics.summaryLabelFontSize, {
                          fontWeight: '500',
                        }),
                        { color: palette.subtitle },
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
                        getYearGridTextStyle(gridMetrics.summaryValueFontSize, {
                          fontWeight: '700',
                        }),
                        { color: palette.title },
                      ]}
                    >
                      {summary.totalDays}
                    </Text>
                  </View>
                </View>
                </MotionPressable>
              </View>
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

