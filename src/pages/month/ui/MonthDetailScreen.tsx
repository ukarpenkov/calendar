import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import Reanimated, {
  cancelAnimation,
  FadeInDown,
  LinearTransition,
  useReducedMotion,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ReduceMotion,
  type SharedValue,
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
import { createPagerNavigation } from '../../../shared/lib/ui/pagerNavigation';
import { getMonthTransitionOrigin, type MonthOrigin } from './monthTransition';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
import {
  ArrowBackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../shared/ui/icons/NavigationIcons';
import { SettingsGearButton } from '../../../shared/ui/SettingsGearButton';

import { CalendarMonthGrid } from '../../../entities/calendar/ui/CalendarMonthGrid';

import { HolidayBanner, HOLIDAY_BANNER_ASPECT_RATIO } from './HolidayBanner';
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
  vacationPeriods: VacationPeriod[];
};

const APP_BAR_TITLE_MIN_SCALE = 0.7;
const NOOP_SELECT_DAY = (_date: string) => {};

const PARALLAX_FACTOR = 0.15;
const PAGE_OPACITY_MIN = 0.85;
const PAGE_SCALE_MIN = 0.97;
const selectedDayEnter = FadeInDown.duration(motion.change.duration)
  .withInitialValues({ transform: [{ translateY: 8 }] })
  .reduceMotion(ReduceMotion.System);
const bannerReflow = LinearTransition.duration(240)
  .easing(motion.open.easing)
  .reduceMotion(ReduceMotion.System);

type MonthPageProps = {
  children: ReactNode;
  pageIndex: number;
  pageWidth: number;
  scrollX: SharedValue<number>;
};

type HolidayBannerTransitionProps = {
  source: ReturnType<typeof getHolidayImageForMonth>;
  width: number;
  left: number;
};

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

  const pagerRef = useRef<ScrollView>(null);
  const reduceMotion = useReducedMotion();
  const todayDate = getLocalIsoDate();

  const pageWidth = windowWidth;
  const initialScrollOffset = useRef((month - 1) * pageWidth).current;
  const scrollX = useSharedValue(initialScrollOffset);
  const onScrollEvent = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
  });

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
    if (!visible || isClosingRef.current) return;
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
    progress,
    transitionOrigin,
    visible,
    windowHeight,
    windowWidth,
  ]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [handleBack, visible]);

  // The parent month is the single source of truth for title, selection and
  // pager. Keeping a second React month state caused swipe/chevron races.
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
  const nativeMonth = useRef(month);
  const previousWidth = useRef(pageWidth);
  const resizing = useRef(false);
  const navigation = useRef(createPagerNavigation(month, 12)).current;

  const handleSelectDay = useCallback(
    (date: string) => setSelectedDate(date),
    [],
  );
  const alignPage = useCallback(() => {
    const offset = (month - 1) * pageWidth;
    scrollX.value = offset;
    pagerRef.current?.scrollTo({ x: offset, animated: false });
  }, [month, pageWidth, scrollX]);

  useLayoutEffect(() => {
    const opening = visible && !previousVisible.current;
    const resized = previousWidth.current !== pageWidth;
    previousVisible.current = visible;
    previousWidth.current = pageWidth;
    if (opening) {
      setSelectedDate(
        monthDetails[month]?.days.some(day => day.date === todayDate)
          ? todayDate
          : null,
      );
    }
    if (!visible || opening || resized) {
      nativeMonth.current = month;
      navigation.reset(month);
      resizing.current = resized;
      alignPage();
      // onLayout aligns again when the native viewport has its new size.
    } else if (nativeMonth.current !== month) {
      navigation.expect(month, !reduceMotion);
      nativeMonth.current = month;
      pagerRef.current?.scrollTo({
        x: (month - 1) * pageWidth,
        animated: !reduceMotion,
      });
      if (reduceMotion) scrollX.value = (month - 1) * pageWidth;
    }
  }, [
    alignPage,
    month,
    monthDetails,
    navigation,
    pageWidth,
    reduceMotion,
    scrollX,
    todayDate,
    visible,
  ]);

  const handlePagerLayout = useCallback(() => {
    navigation.reset(month);
    nativeMonth.current = month;
    alignPage();
    resizing.current = false;
  }, [alignPage, month, navigation]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!visible || resizing.current || isClosingRef.current) return;
      const next = Math.min(
        12,
        Math.max(
          1,
          Math.round(event.nativeEvent.contentOffset.x / pageWidth) + 1,
        ),
      );
      const target = navigation.settle(next, !reduceMotion);
      if (target === null) return;
      nativeMonth.current = next;
      if (target !== month) onMonthChange(target);
    },
    [month, navigation, onMonthChange, pageWidth, reduceMotion, visible],
  );

  const moveMonth = (direction: number) => {
    if (isClosingRef.current) return;
    const next = navigation.move(direction, !reduceMotion);
    if (next !== null) onMonthChange(next);
  };

  // Deterministic native pager: twelve light shells, only the current page
  // and its neighbours have calendar views. No delayed FlatList batches.
  const renderPage = useCallback(
    ({ item: m }: { item: number }) => {
      const detail = monthDetails[m];
      if (!detail || Math.abs(m - activeMonth) > 1) {
        return (
          <View
            style={[
              styles.page,
              { width: pageWidth, backgroundColor: palette.background },
            ]}
          />
        );
      }

      const pageIndex = m - 1;

      const isActive = activeMonth === m;

      let resolvedSelectedDay: CalendarDay | null = null;
      if (isActive && selectedDate) {
        resolvedSelectedDay =
          detail.days.find(day => day.date === selectedDate) ?? null;
      }

      return (
        <View
          style={[styles.page, styles.pageClipped, { width: pageWidth }]}
          pointerEvents={isActive ? 'auto' : 'none'}
          accessibilityElementsHidden={!isActive}
          importantForAccessibility={isActive ? 'auto' : 'no-hide-descendants'}
        >
          <MonthPage
            pageIndex={pageIndex}
            pageWidth={pageWidth}
            scrollX={scrollX}
          >
            <ScrollView
              nestedScrollEnabled
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
                selectedDayDate={
                  isActive ? selectedDate ?? undefined : undefined
                }
                onSelectDay={isActive ? handleSelectDay : NOOP_SELECT_DAY}
                monthLayoutMetrics={monthLayoutMetrics}
                vacationPeriods={vacationPeriods}
              />
            </ScrollView>
          </MonthPage>
        </View>
      );
    },
    [
      monthDetails,
      activeMonth,
      pageWidth,
      scrollX,
      palette,
      language,
      t,
      weekdayLabels,
      selectedDate,
      handleSelectDay,
      monthLayoutMetrics,
      safeAreaInsets.bottom,
      vacationPeriods,
    ],
  );

  if (!activeDetail) {
    return null;
  }

  return (
    <View
      style={styles.overlayRoot}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
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

        <Reanimated.ScrollView
          ref={pagerRef}
          testID="month-pager"
          horizontal
          pagingEnabled
          contentOffset={{ x: initialScrollOffset, y: 0 }}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          decelerationRate="fast"
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          style={styles.horizontalScroll}
          onScroll={onScrollEvent}
          onScrollBeginDrag={() => {
            navigation.beginDrag();
            resizing.current = false;
          }}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollEndDrag={event => {
            const offset = event.nativeEvent.contentOffset.x;
            if (
              !event.nativeEvent.velocity?.x &&
              Math.abs(offset / pageWidth - Math.round(offset / pageWidth)) <
                0.001
            ) {
              handleMomentumScrollEnd(event);
            }
          }}
          scrollEventThrottle={16}
          onLayout={handlePagerLayout}
        >
          {Array.from({ length: 12 }, (_, index) => (
            <View key={index + 1} style={[styles.page, { width: pageWidth }]}>
              {renderPage({ item: index + 1 })}
            </View>
          ))}
        </Reanimated.ScrollView>
      </Reanimated.View>
    </View>
  );
}

function MonthPage({
  children,
  pageIndex,
  pageWidth,
  scrollX,
}: MonthPageProps) {
  const reduceMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: 1, transform: [{ translateX: 0 }, { scale: 1 }] };
    }
    const centerOffset = pageIndex * pageWidth;
    const inputRange = [
      (pageIndex - 1) * pageWidth,
      centerOffset,
      (pageIndex + 1) * pageWidth,
    ];

    return {
      opacity: interpolate(
        scrollX.value,
        inputRange,
        [PAGE_OPACITY_MIN, 1, PAGE_OPACITY_MIN],
        'clamp',
      ),
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            inputRange,
            [PARALLAX_FACTOR * pageWidth, 0, -PARALLAX_FACTOR * pageWidth],
            'clamp',
          ),
        },
        {
          scale: interpolate(
            scrollX.value,
            inputRange,
            [PAGE_SCALE_MIN, 1, PAGE_SCALE_MIN],
            'clamp',
          ),
        },
      ],
    };
  }, [pageIndex, pageWidth, reduceMotion]);

  return (
    <Reanimated.View style={[styles.pageAnimatedContent, animatedStyle]}>
      {children}
    </Reanimated.View>
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

  const bannerWidth =
    monthLayoutMetrics.layout === 'split'
      ? monthLayoutMetrics.sideColumnWidth
      : calendarColumnWidth;
  const bannerSpace = holidayImage
    ? bannerWidth / HOLIDAY_BANNER_ASPECT_RATIO + layout.holidayBannerGap
    : 0;

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
    <View
      style={[
        styles.monthContent,
        monthLayoutMetrics.layout === 'stack'
          ? { maxWidth: calendarColumnWidth }
          : null,
      ]}
    >
      <HolidayBannerTransition
        source={holidayImage}
        width={bannerWidth}
        left={
          monthLayoutMetrics.layout === 'split'
            ? calendarColumnWidth + monthLayoutMetrics.columnGap
            : 0
        }
      />
      {monthLayoutMetrics.layout === 'split' ? (
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
              {
                marginLeft: monthLayoutMetrics.columnGap,
                paddingTop: bannerSpace,
              },
            ]}
          >
            {totalsCard}
            {selectedDayCard}
          </View>
        </View>
      ) : (
        <View style={[styles.monthContentColumn, { paddingTop: bannerSpace }]}>
          {calendarCard}
          {selectedDayCard}
          {totalsCard}
        </View>
      )}
    </View>
  );
}

function HolidayBannerTransition({
  source,
  width,
  left,
}: HolidayBannerTransitionProps) {
  if (!source) return null;
  return (
    // Keep the decoded image mounted while moving between the portrait header
    // and the landscape side column. The content reserves its final height.
    <Reanimated.View
      layout={bannerReflow}
      pointerEvents="none"
      style={[styles.holidayBanner, { width, left }]}
    >
      <HolidayBanner source={source} />
    </Reanimated.View>
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
  horizontalScroll: {
    flex: 1,
  },
  contentFader: {
    flex: 1,
  },
  page: {
    flexGrow: 1,
  },
  pageClipped: {
    overflow: 'hidden',
  },
  pageAnimatedContent: {
    flex: 1,
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
  monthContent: {
    width: '100%',
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
    gap: 12,
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
    position: 'absolute',
    top: 0,
    zIndex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
