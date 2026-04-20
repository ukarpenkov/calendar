import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  buildMonthDetail,
  getCalendarDaysForMonth,
  getDayTypeColors,
  getDayTypeLabel,
  getHolidayDisplayName,
  type CalendarPalette,
  type CalendarDay,
  type CalendarYear,
} from '../../../entities/calendar';
import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import {
  getShortWeekdayLabels,
  type AppLanguage,
  type TranslationKey,
} from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
import {
  ArrowBackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../shared/ui/icons/NavigationIcons';
import { SettingsGearButton } from '../../../shared/ui/SettingsGearButton';

import {
  getMonthCalendarScale,
  getMonthDetailLayoutMetrics,
  getMonthSideScale,
  MONTH_TOTALS_GAP,
  type MonthDetailLayoutMetrics,
} from './monthDetailLayout';

type MonthDetailScreenProps = {
  calendar: CalendarYear;
  month: number;
  onBack: () => void;
  onOpenSettings: () => void;
  onMonthChange: (month: number) => void;
};

const APP_BAR_TITLE_MIN_SCALE = 0.7;

export function MonthDetailScreen({
  calendar,
  month,
  onBack,
  onOpenSettings,
  onMonthChange,
}: MonthDetailScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { palette } = useAppTheme();
  const { language, t } = useAppLocalization();
  const weekdayLabels = getShortWeekdayLabels(language);

  const horizontalRef = useRef<ScrollView>(null);
  const [pagerReady, setPagerReady] = useState(false);

  const pageWidth = windowWidth;
  const monthLayoutMetrics = useMemo(
    () => getMonthDetailLayoutMetrics(windowWidth, windowHeight),
    [windowHeight, windowWidth],
  );

  const prevMonth = month > 1 ? month - 1 : null;
  const nextMonth = month < 12 ? month + 1 : null;

  const centerDays = useMemo(
    () => getCalendarDaysForMonth(calendar, month),
    [calendar, month],
  );
  const detail = useMemo(
    () => buildMonthDetail(calendar.year, month, centerDays, language),
    [calendar.year, centerDays, language, month],
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(detail.days[0]?.date ?? null);
  }, [detail.days]);

  const selectedDay =
    detail.days.find(day => day.date === selectedDate) ?? detail.days[0] ?? null;

  const scrollToCenter = useCallback(
    (animated: boolean) => {
      horizontalRef.current?.scrollTo({
        x: pageWidth,
        animated,
      });
    },
    [pageWidth],
  );

  useEffect(() => {
    if (pagerReady) {
      scrollToCenter(false);
    }
  }, [month, pagerReady, scrollToCenter]);

  const onHorizontalLayout = useCallback(() => {
    scrollToCenter(false);
    setPagerReady(true);
  }, [scrollToCenter]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      const page = Math.round(x / pageWidth);

      if (page === 0) {
        if (prevMonth !== null) {
          onMonthChange(prevMonth);
        } else {
          scrollToCenter(true);
        }
        return;
      }

      if (page === 2) {
        if (nextMonth !== null) {
          onMonthChange(nextMonth);
        } else {
          scrollToCenter(true);
        }
      }
    },
    [nextMonth, onMonthChange, pageWidth, prevMonth, scrollToCenter],
  );

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: palette.background,
            paddingTop: safeAreaInsets.top + layout.safeAreaTopExtra,
          },
        ]}
      >
        <View style={styles.appBar}>
          <View style={[styles.appBarSide, styles.appBarSideStart]}>
            <IconCircleButton
              onPress={onBack}
              palette={palette}
              accessibilityLabel={t('common.backToYear')}
            >
              <ArrowBackIcon color={palette.icon} size={20} />
            </IconCircleButton>
          </View>
          <View style={styles.appBarTitleWrap}>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={APP_BAR_TITLE_MIN_SCALE}
              numberOfLines={1}
              maxFontSizeMultiplier={1}
              style={[styles.appBarTitle, { color: palette.title }]}
            >
              {detail.shortLabel} {detail.year}
            </Text>
          </View>
          <View style={[styles.appBarSide, styles.appBarActions]}>
            <IconCircleButton
              onPress={
                prevMonth !== null ? () => onMonthChange(prevMonth) : undefined
              }
              palette={palette}
              accessibilityLabel={t('month.nav.previousMonth')}
            >
              <ChevronLeftIcon
                color={prevMonth !== null ? palette.icon : palette.subtitle}
                size={20}
              />
            </IconCircleButton>
            <IconCircleButton
              onPress={
                nextMonth !== null ? () => onMonthChange(nextMonth) : undefined
              }
              palette={palette}
              accessibilityLabel={t('month.nav.nextMonth')}
            >
              <ChevronRightIcon
                color={nextMonth !== null ? palette.icon : palette.subtitle}
                size={20}
              />
            </IconCircleButton>
            <SettingsGearButton
              palette={palette}
              accessibilityLabel={t('year.menu.settings')}
              onPress={onOpenSettings}
            />
          </View>
        </View>

        <ScrollView
          ref={horizontalRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          decelerationRate="fast"
          keyboardShouldPersistTaps="handled"
          onLayout={onHorizontalLayout}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalContent}
        >
          <View style={[styles.page, { width: pageWidth }]}>
            <MonthPageScroll
              calendar={calendar}
              month={prevMonth}
              palette={palette}
              language={language}
              t={t}
              weekdayLabels={weekdayLabels}
              bottomInset={safeAreaInsets.bottom + layout.yearMonthScrollBottom}
              monthLayoutMetrics={monthLayoutMetrics}
            />
          </View>
          <View style={[styles.page, { width: pageWidth }]}>
            <ScrollView
              nestedScrollEnabled
              style={styles.pageVertical}
              contentContainerStyle={[
                styles.pageVerticalContent,
                monthLayoutMetrics.layout === 'split'
                  ? styles.pageVerticalContentSplit
                  : null,
                {
                  paddingBottom:
                    safeAreaInsets.bottom + layout.yearMonthScrollBottom,
                },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <MonthDetailBody
                detail={detail}
                palette={palette}
                language={language}
                t={t}
                weekdayLabels={weekdayLabels}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDate}
                monthLayoutMetrics={monthLayoutMetrics}
              />
            </ScrollView>
          </View>
          <View style={[styles.page, { width: pageWidth }]}>
            <MonthPageScroll
              calendar={calendar}
              month={nextMonth}
              palette={palette}
              language={language}
              t={t}
              weekdayLabels={weekdayLabels}
              bottomInset={safeAreaInsets.bottom + layout.yearMonthScrollBottom}
              monthLayoutMetrics={monthLayoutMetrics}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

type LocalizationParams = Record<string, number | string>;

type MonthPageScrollProps = {
  calendar: CalendarYear;
  month: number | null;
  palette: CalendarPalette;
  language: AppLanguage;
  t: (key: TranslationKey, params?: LocalizationParams) => string;
  weekdayLabels: readonly string[];
  bottomInset: number;
  monthLayoutMetrics: MonthDetailLayoutMetrics;
};

function MonthPageScroll({
  calendar,
  month,
  palette,
  language,
  t,
  weekdayLabels,
  bottomInset,
  monthLayoutMetrics,
}: MonthPageScrollProps) {
  const detail = useMemo(() => {
    if (month === null) {
      return null;
    }
    const days = getCalendarDaysForMonth(calendar, month);
    if (days.length === 0) {
      return null;
    }
    return buildMonthDetail(calendar.year, month, days, language);
  }, [calendar, month, language]);

  if (!detail) {
    return (
      <View
        style={[
          styles.pageVertical,
          styles.placeholderPage,
          { backgroundColor: palette.background },
        ]}
      />
    );
  }

  return (
    <ScrollView
      nestedScrollEnabled
      style={styles.pageVertical}
      contentContainerStyle={[
        styles.pageVerticalContent,
        monthLayoutMetrics.layout === 'split'
          ? styles.pageVerticalContentSplit
          : null,
        { paddingBottom: bottomInset },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <MonthDetailBody
        detail={detail}
        palette={palette}
        language={language}
        t={t}
        weekdayLabels={weekdayLabels}
        selectedDay={null}
        onSelectDay={() => {}}
        monthLayoutMetrics={monthLayoutMetrics}
      />
    </ScrollView>
  );
}

type MonthDetailBodyProps = {
  detail: ReturnType<typeof buildMonthDetail>;
  palette: CalendarPalette;
  language: AppLanguage;
  t: (key: TranslationKey, params?: LocalizationParams) => string;
  weekdayLabels: readonly string[];
  selectedDay: CalendarDay | null;
  onSelectDay: (date: string) => void;
  monthLayoutMetrics: MonthDetailLayoutMetrics;
};

function MonthDetailBody({
  detail,
  palette,
  language,
  t,
  weekdayLabels,
  selectedDay,
  onSelectDay,
  monthLayoutMetrics,
}: MonthDetailBodyProps) {
  const selectedHolidayLabel =
    selectedDay !== null
      ? getHolidayDisplayName(selectedDay, language)
      : null;

  const calendarColumnWidth = monthLayoutMetrics.calendarColumnWidth;
  const totalCardWidth = monthLayoutMetrics.totalCardWidth;
  const calendarScale = useMemo(
    () => getMonthCalendarScale(calendarColumnWidth),
    [calendarColumnWidth],
  );
  const sideScale = useMemo(() => {
    if (monthLayoutMetrics.layout !== 'split') {
      return 1;
    }
    return getMonthSideScale(monthLayoutMetrics.sideColumnWidth);
  }, [monthLayoutMetrics]);

  const calendarCard = (
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
              <MonthDetailDayCell
                key={`${detail.month}-${week.isoWeek}-${dayIndex}`}
                day={day}
                isSelected={day?.date === selectedDay?.date}
                palette={palette}
                calendarScale={calendarScale}
                onPress={() => {
                  if (day) {
                    onSelectDay(day.date);
                  }
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );

  const sideBlocks = (
    <>
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
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            numberOfLines={1}
            maxFontSizeMultiplier={1.1}
            style={[
              styles.selectedDayEyebrow,
              {
                color: palette.subtitle,
                fontSize: 12 * sideScale,
              },
            ]}
          >
            {t('month.selectedDay.eyebrow')}
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            numberOfLines={2}
            maxFontSizeMultiplier={1.1}
            style={[
              styles.selectedDayTitle,
              {
                color: palette.title,
                fontSize: 20 * sideScale,
              },
            ]}
          >
            {detail.label} {selectedDay.day}
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            numberOfLines={2}
            maxFontSizeMultiplier={1.1}
            style={[
              styles.selectedDayMeta,
              {
                color: palette.subtitle,
                fontSize: 14 * sideScale,
                lineHeight: Math.round(20 * sideScale),
              },
            ]}
          >
            {getDayTypeLabel(selectedDay.type, language)} - {selectedDay.workHours}{' '}
            {t('common.hoursUnit')}
          </Text>
          {selectedHolidayLabel ? (
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              numberOfLines={3}
              maxFontSizeMultiplier={1.1}
              style={[
                styles.selectedDayHoliday,
                {
                  color: palette.title,
                  fontSize: 14 * sideScale,
                },
              ]}
            >
              {selectedHolidayLabel}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.totalsGrid,
          monthLayoutMetrics.layout === 'split' ? styles.totalsGridSplit : null,
        ]}
      >
        <TotalCard
          label={t('month.totals.totalDays')}
          value={String(detail.totalDays)}
          palette={palette}
          width={totalCardWidth}
          sideScale={sideScale}
        />
        <TotalCard
          label={t('month.totals.workingDays')}
          value={String(detail.workingDays)}
          palette={palette}
          width={totalCardWidth}
          sideScale={sideScale}
        />
        <TotalCard
          label={t('month.totals.nonWorkingDays')}
          value={String(detail.nonWorkingDays)}
          palette={palette}
          width={totalCardWidth}
          sideScale={sideScale}
        />
        <TotalCard
          label={t('month.totals.workHours')}
          value={`${detail.workHours} ${t('common.hoursUnit')}`}
          palette={palette}
          width={totalCardWidth}
          sideScale={sideScale}
        />
      </View>
    </>
  );

  if (monthLayoutMetrics.layout === 'split') {
    return (
      <View style={styles.monthSplitRow}>
        <View
          style={[styles.monthCalendarColumn, { width: calendarColumnWidth }]}
        >
          {calendarCard}
        </View>
        <View
          style={[
            styles.monthSideColumn,
            styles.monthSideColumnGrow,
            { marginLeft: monthLayoutMetrics.columnGap },
          ]}
        >
          {sideBlocks}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.monthContentColumn,
        { maxWidth: calendarColumnWidth },
      ]}
    >
      {calendarCard}
      {sideBlocks}
    </View>
  );
}

type MonthDetailDayCellProps = {
  day: CalendarDay | null;
  isSelected: boolean;
  palette: CalendarPalette;
  calendarScale: number;
  onPress: () => void;
};

function MonthDetailDayCell({
  day,
  isSelected,
  palette,
  calendarScale,
  onPress,
}: MonthDetailDayCellProps) {
  const cellSize = Math.max(36, 42 * calendarScale);

  if (!day) {
    return <View style={styles.emptyDayCell} />;
  }

  const colors = getDayTypeColors(day.type, palette);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayCell,
        {
          minHeight: cellSize,
          borderRadius: Math.max(8, 12 * calendarScale),
          backgroundColor: isSelected
            ? palette.selectedFill
            : colors.backgroundColor,
          borderColor: isSelected ? palette.selectedBorder : colors.borderColor,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
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
    </Pressable>
  );
}

type TotalCardProps = {
  label: string;
  value: string;
  palette: CalendarPalette;
  width: number;
  sideScale: number;
};

function TotalCard({ label, value, palette, width, sideScale }: TotalCardProps) {
  return (
    <View
      style={[
        styles.totalCard,
        {
          width,
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.55}
        numberOfLines={1}
        maxFontSizeMultiplier={1.1}
        style={[
          styles.totalLabel,
          {
            color: palette.subtitle,
            fontSize: 12 * sideScale,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.55}
        numberOfLines={1}
        maxFontSizeMultiplier={1.1}
        style={[
          styles.totalValue,
          {
            color: palette.title,
            fontSize: 22 * sideScale,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  horizontalScroll: {
    flex: 1,
  },
  horizontalContent: {
    flexGrow: 1,
  },
  page: {
    flexGrow: 1,
  },
  pageVertical: {
    flex: 1,
  },
  pageVerticalContent: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: layout.monthScrollPaddingTop,
    gap: layout.contentStackGap,
    alignItems: 'center',
  },
  pageVerticalContentSplit: {
    alignItems: 'stretch',
  },
  monthSplitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  monthCalendarColumn: {
    flexShrink: 0,
  },
  monthSideColumn: {
    gap: layout.contentStackGap,
  },
  monthSideColumnGrow: {
    flex: 1,
    minWidth: 0,
  },
  monthContentColumn: {
    width: '100%',
    gap: MONTH_TOTALS_GAP,
  },
  placeholderPage: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    gap: 12,
    paddingHorizontal: layout.screenPaddingH,
  },
  appBarSide: {
    minWidth: 80,
  },
  appBarSideStart: {
    alignItems: 'flex-start',
  },
  appBarTitleWrap: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  appBarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
    width: '100%',
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
    gap: MONTH_TOTALS_GAP,
    justifyContent: 'space-between',
  },
  totalsGridSplit: {
    width: '100%',
  },
  totalCard: {
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
