import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  BackHandler,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Reanimated, {
  cancelAnimation,
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ReduceMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getDayTypeLabel,
  getDayImage,
  getHolidayDisplayName,
  getHolidayImageForMonth,
  isDateOnVacation,
  type CalendarPalette,
  type CalendarDay,
  type CalendarYearMonthDetails,
} from '../../../entities/calendar';
import type { VacationPeriod } from '../../../features/vacation/model';
import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import {
  getShortWeekdayLabels,
  type AppLanguage,
  type TranslationKey,
} from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import { motion } from '../../../shared/lib/ui/motion';
import { getMonthTransitionOrigin, type MonthOrigin } from './monthTransition';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
import {
  ArrowBackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../shared/ui/icons/NavigationIcons';
import { SettingsGearButton } from '../../../shared/ui/SettingsGearButton';

import { CalendarMonthGrid } from '../../../entities/calendar/ui/CalendarMonthGrid';

import { HolidayBanner } from './HolidayBanner';
import { MonthPageScrollView } from './MonthPageScrollView';
import { MonthResponsiveLayout } from './MonthResponsiveLayout';
import {
  MonthPagerViewport,
  type MonthPagerHandle,
} from './MonthPagerViewport';
import {
  getMonthCalendarScale,
  getMonthDetailLayoutMetrics,
  getMonthSideScale,
  type MonthDetailLayoutMetrics,
} from './monthDetailLayout';

type MonthDetailScreenProps = {
  monthDetails: CalendarYearMonthDetails;
  month: number;
  onBack: () => void;
  onOpenSettings: () => void;
  onMonthChange: (month: number) => void;
  originLayout?: MonthOrigin | null;
  visible?: boolean;
  covered?: boolean;
  vacationPeriods: VacationPeriod[];
};

const APP_BAR_TITLE_MIN_SCALE = 0.7;
const NOOP_SELECT_DAY = (_date: string) => {};

const selectedDayEnter = FadeInDown.duration(motion.change.duration)
  .withInitialValues({ transform: [{ translateY: 8 }] })
  .reduceMotion(ReduceMotion.System);

function getLocalIsoDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function MonthDetailScreen({
  monthDetails,
  month,
  onBack,
  onOpenSettings,
  onMonthChange,
  originLayout,
  visible = true,
  covered = false,
  vacationPeriods,
}: MonthDetailScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { palette } = useAppTheme();
  const { language, t } = useAppLocalization();
  const weekdayLabels = useMemo(
    () => getShortWeekdayLabels(language),
    [language],
  );

  const pagerRef = useRef<MonthPagerHandle>(null);
  const todayDate = getLocalIsoDate();

  const viewportKey = `${windowWidth}x${windowHeight}`;
  // A prepared month and the one actually opened can differ. Give each new
  // opening its matching native initial page; retain it through paging and rotation.
  const pagerSession = useRef({ visible, initialMonth: month });
  if (!visible || !pagerSession.current.visible) {
    pagerSession.current.initialMonth = month;
  }
  pagerSession.current.visible = visible;
  const pagerKey = `${pagerSession.current.initialMonth}`;
  const verticalOffsets = useRef(new Map<string, number>()).current;

  const monthLayoutMetrics = useMemo(
    () => getMonthDetailLayoutMetrics(windowWidth, windowHeight),
    [windowHeight, windowWidth],
  );

  const progress = useSharedValue(0);
  useEffect(() => () => cancelAnimation(progress), [progress]);
  const transitionOrigin = useSharedValue(
    getMonthTransitionOrigin(originLayout, windowWidth, windowHeight),
  );
  const isClosingRef = useRef(false);
  const onBackRef = useRef(onBack);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const openingViewport = useRef({ width: windowWidth, height: windowHeight });
  onBackRef.current = onBack;

  // The page is already mounted. Position it before starting the UI-thread
  // transform, rather than mounting a virtualized list after an empty sheet.
  useEffect(() => {
    if (!visible) {
      cancelAnimation(progress);
      progress.value = 0;
      isClosingRef.current = false;
      return;
    }
    openingViewport.current = { width: windowWidth, height: windowHeight };
    transitionOrigin.value = getMonthTransitionOrigin(
      originLayout,
      windowWidth,
      windowHeight,
    );
    isClosingRef.current = false;
    const frame = requestAnimationFrame(() => {
      if (!isClosingRef.current) progress.value = withTiming(1, motion.open);
    });
    return () => cancelAnimationFrame(frame);
    // Only visibility starts a transition. Paging and rotation keep it open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const origin = transitionOrigin.value;
    return {
      opacity: interpolate(p, [0, 0.04], [0, 1], 'clamp'),
      borderRadius: interpolate(p, [0, 1], [20, 0]),
      transform: [
        { translateX: origin.translateX * (1 - p) },
        { translateY: origin.translateY * (1 - p) },
        { scaleX: origin.scaleX + (1 - origin.scaleX) * p },
        { scaleY: origin.scaleY + (1 - origin.scaleY) * p },
      ],
    };
  });
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.12,
  }));

  const finishClose = useCallback(() => {
    if (visibleRef.current && isClosingRef.current) onBackRef.current();
  }, []);
  const handleBack = useCallback(() => {
    if (!visible || covered || isClosingRef.current) return;
    isClosingRef.current = true;
    // Reverse the same path, even if Back interrupts opening. After rotation,
    // the original card coordinates no longer describe the year layout.
    const viewport = openingViewport.current;
    if (viewport.width !== windowWidth || viewport.height !== windowHeight) {
      transitionOrigin.value = getMonthTransitionOrigin(
        null,
        windowWidth,
        windowHeight,
      );
    }
    progress.value = withTiming(0, motion.close, finished => {
      if (finished) runOnJS(finishClose)();
    });
  }, [
    finishClose,
    covered,
    progress,
    transitionOrigin,
    visible,
    windowHeight,
    windowWidth,
  ]);

  useEffect(() => {
    if (!visible || covered) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [covered, handleBack, visible]);

  // The parent month mirrors confirmed native selection, so the title and
  // interactive dates always describe the selected page.
  const activeMonth = month;
  const activeDetail = monthDetails[month];
  const prevMonth = month > 1 ? month - 1 : null;
  const nextMonth = month < 12 ? month + 1 : null;
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    monthDetails[month]?.days.some(day => day.date === todayDate)
      ? todayDate
      : null,
  );
  const previousVisible = useRef(false);

  const handleSelectDay = useCallback(
    (date: string) => setSelectedDate(date),
    [],
  );
  useLayoutEffect(() => {
    if (visible && !previousVisible.current) {
      setSelectedDate(
        monthDetails[month]?.days.some(day => day.date === todayDate)
          ? todayDate
          : null,
      );
    }
    previousVisible.current = visible;
  }, [month, monthDetails, todayDate, visible]);

  const previousViewport = useRef(viewportKey);
  useLayoutEffect(() => {
    if (previousViewport.current === viewportKey) return;
    previousViewport.current = viewportKey;
    if (visible && !isClosingRef.current) {
      cancelAnimation(progress);
      progress.value = 1;
    }
  }, [progress, viewportKey, visible]);

  useEffect(() => {
    if (!visible) return;
    const subscription = AppState.addEventListener('change', () => {
      if (isClosingRef.current) return;
      cancelAnimation(progress);
      progress.value = 1;
    });
    return () => subscription.remove();
  }, [progress, visible]);

  const moveMonth = (direction: number) =>
    pagerRef.current?.moveMonth(direction);

  // Each native page keeps its own month content, including during fast swipes.
  const renderPage = useCallback(
    (m: number) => {
      const detail = monthDetails[m];
      if (!detail) return null;

      const isActive = activeMonth === m;

      let resolvedSelectedDay: CalendarDay | null = null;
      if (isActive && selectedDate) {
        resolvedSelectedDay =
          detail.days.find(day => day.date === selectedDate) ?? null;
      }

      return (
        <View
          style={styles.page}
          pointerEvents={isActive ? 'auto' : 'none'}
          accessibilityElementsHidden={!isActive}
          importantForAccessibility={isActive ? 'auto' : 'no-hide-descendants'}
        >
          <MonthPageScrollView
            testID={`month-scroll-${m}`}
            nestedScrollEnabled
            removeClippedSubviews={false}
            offsetKey={`${viewportKey}:${m}`}
            savedOffsets={verticalOffsets}
            scrollEventThrottle={32}
            showsVerticalScrollIndicator={false}
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
            <MemoizedMonthDetailBody
              detail={detail}
              palette={palette}
              language={language}
              t={t}
              weekdayLabels={weekdayLabels}
              selectedDay={resolvedSelectedDay}
              selectedDayDate={isActive ? selectedDate ?? undefined : undefined}
              onSelectDay={isActive ? handleSelectDay : NOOP_SELECT_DAY}
              monthLayoutMetrics={monthLayoutMetrics}
              vacationPeriods={vacationPeriods}
            />
          </MonthPageScrollView>
        </View>
      );
    },
    [
      monthDetails,
      activeMonth,
      palette,
      language,
      t,
      weekdayLabels,
      selectedDate,
      handleSelectDay,
      monthLayoutMetrics,
      safeAreaInsets.bottom,
      vacationPeriods,
      verticalOffsets,
      viewportKey,
    ],
  );

  if (!activeDetail) {
    return null;
  }

  return (
    <View
      testID="month-layer"
      collapsable={false}
      style={styles.overlayRoot}
      pointerEvents={visible && !covered ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible || covered}
      importantForAccessibility={
        visible && !covered ? 'auto' : 'no-hide-descendants'
      }
    >
      <Reanimated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
        pointerEvents="none"
      />
      <Reanimated.View
        style={[
          styles.sheet,
          {
            backgroundColor: palette.background,
            paddingTop: safeAreaInsets.top + layout.safeAreaTopExtra,
          },
          sheetAnimatedStyle,
        ]}
      >
        <View style={styles.appBar}>
          <View style={[styles.appBarSide, styles.appBarSideStart]}>
            <IconCircleButton
              onPress={handleBack}
              palette={palette}
              accessibilityLabel={t('common.backToYear')}
              variant="back"
            >
              <ArrowBackIcon color={palette.icon} size={20} />
            </IconCircleButton>
          </View>
          <View style={styles.appBarTitleWrap}>
            <Text
              testID="month-title"
              adjustsFontSizeToFit
              minimumFontScale={APP_BAR_TITLE_MIN_SCALE}
              numberOfLines={1}
              maxFontSizeMultiplier={1}
              style={[styles.appBarTitle, { color: palette.title }]}
            >
              {activeDetail.shortLabel} {activeDetail.year}
            </Text>
          </View>
          <View style={[styles.appBarSide, styles.appBarActions]}>
            <IconCircleButton
              onPress={prevMonth !== null ? () => moveMonth(-1) : undefined}
              palette={palette}
              accessibilityLabel={t('month.nav.previousMonth')}
            >
              <ChevronLeftIcon
                color={prevMonth !== null ? palette.icon : palette.subtitle}
                size={20}
              />
            </IconCircleButton>
            <IconCircleButton
              onPress={nextMonth !== null ? () => moveMonth(1) : undefined}
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

        <MonthPagerViewport
          key={pagerKey}
          ref={pagerRef}
          month={month}
          visible={visible && !covered}
          onMonthChange={onMonthChange}
          isClosingRef={isClosingRef}
          renderPage={renderPage}
        />
      </Reanimated.View>
    </View>
  );
}

type LocalizationParams = Record<string, number | string>;

type MonthDetailBodyProps = {
  detail: NonNullable<CalendarYearMonthDetails[number]>;
  palette: CalendarPalette;
  language: AppLanguage;
  t: (key: TranslationKey, params?: LocalizationParams) => string;
  weekdayLabels: readonly string[];
  selectedDay: CalendarDay | null;
  selectedDayDate?: string;
  onSelectDay: (date: string) => void;
  monthLayoutMetrics: MonthDetailLayoutMetrics;
  vacationPeriods: VacationPeriod[];
};

function MonthDetailBody({
  detail,
  palette,
  language,
  t,
  weekdayLabels,
  selectedDay,
  selectedDayDate,
  onSelectDay,
  monthLayoutMetrics,
  vacationPeriods,
}: MonthDetailBodyProps) {
  const selectedHolidayLabel =
    selectedDay !== null ? getHolidayDisplayName(selectedDay, language) : null;

  const isSelectedDayOnVacation =
    selectedDay !== null && isDateOnVacation(selectedDay.date, vacationPeriods);

  const vacationColorByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const period of vacationPeriods) {
      for (const day of detail.days) {
        if (day.date >= period.startDate && day.date <= period.endDate) {
          map.set(day.date, period.color);
        }
      }
    }
    return map;
  }, [detail.days, vacationPeriods]);

  const calendarColumnWidth = monthLayoutMetrics.calendarColumnWidth;
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

  const holidayImage = useMemo(() => {
    if (selectedDay) {
      const dayImg = getDayImage(selectedDay, detail.days, vacationPeriods);
      if (dayImg) return dayImg;
    }
    return getHolidayImageForMonth(detail.days);
  }, [selectedDay, detail.days, vacationPeriods]);

  const banner = holidayImage ? (
    <View
      testID="month-holiday-banner"
      pointerEvents="none"
      style={styles.holidayBanner}
    >
      <HolidayBanner source={holidayImage} />
    </View>
  ) : null;

  const calendarCard = (
    <CalendarMonthGrid
      detail={detail}
      palette={palette}
      language={language}
      weekdayLabels={weekdayLabels}
      calendarScale={calendarScale}
      selectedDayDate={selectedDayDate}
      onSelectDay={onSelectDay}
      vacationColorByDate={vacationColorByDate}
    />
  );

  const selectedDayCard = selectedDay ? (
    <Reanimated.View
      key={selectedDay.date}
      entering={selectedDayEnter}
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
            lineHeight: Math.round(14 * sideScale),
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
            lineHeight: Math.round(24 * sideScale),
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
        {isSelectedDayOnVacation
          ? t('vacation.legend.vacation')
          : selectedDay.workHours === 0
          ? getDayTypeLabel(selectedDay.type, language)
          : `${getDayTypeLabel(selectedDay.type, language)} - ${
              selectedDay.workHours
            } ${t('common.hoursUnit')}`}
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
              lineHeight: Math.round(18 * sideScale),
            },
          ]}
        >
          {selectedHolidayLabel}
        </Text>
      ) : null}
    </Reanimated.View>
  ) : null;

  const totalsCard = (
    <View
      testID="month-totals"
      style={[
        styles.totalsCard,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={styles.totalsRow}>
        <MemoizedTotalItem
          label={t('month.totals.totalDays')}
          value={String(detail.totalDays)}
          palette={palette}
          sideScale={sideScale}
        />
        <MemoizedTotalItem
          label={t('month.totals.workingDays')}
          value={String(detail.workingDays)}
          palette={palette}
          sideScale={sideScale}
        />
        <MemoizedTotalItem
          label={t('month.totals.nonWorkingDays')}
          value={String(detail.nonWorkingDays)}
          palette={palette}
          sideScale={sideScale}
        />
        <MemoizedTotalItem
          label={t('month.totals.workHours')}
          value={String(detail.workHours)}
          palette={palette}
          sideScale={sideScale}
        />
      </View>
    </View>
  );

  return (
    <MonthResponsiveLayout
      month={detail.month}
      metrics={monthLayoutMetrics}
      banner={banner}
      calendar={calendarCard}
      summary={
        <>
          {totalsCard}
          {selectedDayCard}
        </>
      }
    />
  );
}

type TotalItemProps = {
  label: string;
  value: string;
  palette: CalendarPalette;
  sideScale: number;
};

function TotalItem({ label, value, palette, sideScale }: TotalItemProps) {
  return (
    <View style={styles.totalItem}>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        numberOfLines={1}
        maxFontSizeMultiplier={1}
        style={[
          styles.totalLabel,
          {
            color: palette.subtitle,
            fontSize: 11.25 * sideScale,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        numberOfLines={1}
        maxFontSizeMultiplier={1}
        style={[
          styles.dayCellText,
          styles.totalValue,
          {
            color: palette.title,
            fontSize: 16 * sideScale,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const MemoizedMonthDetailBody = memo(MonthDetailBody);
export { MemoizedCalendarDayCell as MemoizedMonthDetailDayCell } from '../../../entities/calendar/ui/CalendarMonthGrid';
const MemoizedTotalItem = memo(TotalItem);

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  page: {
    flex: 1,
    overflow: 'hidden',
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
  dayCellText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedDayCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
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
  totalsCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  totalsRow: {
    flexDirection: 'row',
    minHeight: 44,
    alignItems: 'center',
  },
  totalItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  totalLabel: {
    width: '100%',
    fontSize: 11.25,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalValue: {
    width: '100%',
    textAlign: 'center',
  },
  holidayBanner: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
});
