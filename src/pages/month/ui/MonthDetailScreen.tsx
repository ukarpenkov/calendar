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
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import Reanimated, {
  Easing as REasing,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getDayTypeColors,
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
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
import {
  ArrowBackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../shared/ui/icons/NavigationIcons';
import { SettingsGearButton } from '../../../shared/ui/SettingsGearButton';

import { HolidayBanner } from './HolidayBanner';
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
  originLayout?: { x: number; y: number; width: number; height: number } | null;
  vacationPeriods: VacationPeriod[];
};

const APP_BAR_TITLE_MIN_SCALE = 0.7;
const NOOP_SELECT_DAY = (_date: string) => {};

const PARALLAX_FACTOR = 0.15;
const PAGE_OPACITY_MIN = 0.85;
const PAGE_SCALE_MIN = 0.97;

const OPEN_DURATION_MS = 260;
const CLOSE_DURATION_MS = 180;
const CONTENT_REVEAL_MS = 170;
const ROTATION_SETTLE_DELAY_MS = 70;
const ROTATION_FADE_IN_MS = 240;
const ROTATION_GUARD_MS = 520;
const OPEN_EASING = REasing.bezier(0.2, 0.9, 0.2, 1);
const CLOSE_EASING = REasing.bezier(0.4, 0, 0.6, 1);
const ROTATION_EASING = REasing.out(REasing.cubic);
const FALLBACK_OPEN_SCALE = 0.96;
const MIN_ORIGIN_SCALE = 0.18;
const CORNER_COLLAPSE_SIZE = 92;

type TransitionTargetLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SheetCollapseTargets = {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
};

type MonthPageProps = {
  children: ReactNode;
  pageIndex: number;
  pageWidth: number;
  scrollX: SharedValue<number>;
};

type HolidayBannerTransitionProps = {
  source: ReturnType<typeof getHolidayImageForMonth>;
  visible: boolean;
  width: number;
};

function getBottomRightCollapseLayout(
  windowWidth: number,
  windowHeight: number,
  bottomInset: number,
): TransitionTargetLayout {
  const margin = layout.screenPaddingH;

  return {
    x: Math.max(0, windowWidth - CORNER_COLLAPSE_SIZE - margin),
    y: Math.max(0, windowHeight - CORNER_COLLAPSE_SIZE - bottomInset - margin),
    width: CORNER_COLLAPSE_SIZE,
    height: CORNER_COLLAPSE_SIZE,
  };
}

function buildOpenTargets(
  originLayout:
    | { x: number; y: number; width: number; height: number }
    | null
    | undefined,
  windowWidth: number,
  windowHeight: number,
): SheetCollapseTargets {
  if (originLayout) {
    return {
      translateX: originLayout.x + originLayout.width / 2 - windowWidth / 2,
      translateY: originLayout.y + originLayout.height / 2 - windowHeight / 2,
      scaleX: Math.max(
        originLayout.width / Math.max(windowWidth, 1),
        MIN_ORIGIN_SCALE,
      ),
      scaleY: Math.max(
        originLayout.height / Math.max(windowHeight, 1),
        MIN_ORIGIN_SCALE,
      ),
    };
  }

  return {
    translateX: 0,
    translateY: windowHeight * 0.08,
    scaleX: FALLBACK_OPEN_SCALE,
    scaleY: FALLBACK_OPEN_SCALE,
  };
}

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

  const flatListRef = useRef<FlatList>(null);
  const todayDate = useMemo(() => getLocalIsoDate(), []);

  const pageWidth = windowWidth;
  const initialScrollOffset = (month - 1) * pageWidth;
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

  const initialOpenTargets = buildOpenTargets(
    originLayout,
    windowWidth,
    windowHeight,
  );

  const progress = useSharedValue(0);
  const openContentOpacity = useSharedValue(0);
  const rotationContentOpacity = useSharedValue(1);
  const isClosingToCorner = useSharedValue(0);
  const openTargets = useSharedValue(initialOpenTargets);
  const collapseTargets = useSharedValue<SheetCollapseTargets>({
    translateX: 0,
    translateY: 0,
    scaleX: FALLBACK_OPEN_SCALE,
    scaleY: FALLBACK_OPEN_SCALE,
  });
  const isClosingRef = useRef(false);
  const onBackRef = useRef(onBack);
  const [isContentReady, setIsContentReady] = useState(false);
  onBackRef.current = onBack;

  useEffect(() => {
    progress.value = withTiming(
      1,
      {
        duration: OPEN_DURATION_MS,
        easing: OPEN_EASING,
      },
      finished => {
        if (finished) {
          runOnJS(setIsContentReady)(true);
        }
      },
    );
  }, [progress]);

  useEffect(() => {
    if (!isContentReady) return;

    openContentOpacity.value = withTiming(1, {
      duration: CONTENT_REVEAL_MS,
      easing: REasing.out(REasing.cubic),
    });
  }, [isContentReady, openContentOpacity]);

  useEffect(() => {
    openTargets.value = buildOpenTargets(
      originLayout,
      windowWidth,
      windowHeight,
    );
  }, [openTargets, originLayout, windowHeight, windowWidth]);

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    const transitionProgress = progress.value;
    const closing = isClosingToCorner.value === 1;
    const open = openTargets.value;
    const collapse = collapseTargets.value;

    const translateX = closing
      ? collapse.translateX * (1 - transitionProgress)
      : open.translateX * (1 - transitionProgress);
    const translateY = closing
      ? collapse.translateY * (1 - transitionProgress)
      : open.translateY * (1 - transitionProgress);
    const scaleX = closing
      ? collapse.scaleX + (1 - collapse.scaleX) * transitionProgress
      : open.scaleX + (1 - open.scaleX) * transitionProgress;
    const scaleY = closing
      ? collapse.scaleY + (1 - collapse.scaleY) * transitionProgress
      : open.scaleY + (1 - open.scaleY) * transitionProgress;

    return {
      transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }],
      // React unmounts the expensive month list once the close animation
      // finishes. Fade the final frames first so that work is not visible.
      opacity: closing
        ? interpolate(transitionProgress, [0, 0.08], [0, 1], 'clamp')
        : 1,
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    // Let the month content lead the transition instead of emerging from a
    // visibly darkened year screen.
    opacity: interpolate(
      progress.value,
      [0, 0.65, 1],
      [0, 0.02, 0.12],
      'clamp',
    ),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const rotationOpacity = rotationContentOpacity.value;
    const revealOpacity = openContentOpacity.value;

    return {
      opacity: rotationOpacity * revealOpacity,
      transform: [
        {
          translateY:
            interpolate(
              rotationOpacity,
              [0, 1],
              [8, 0],
              'clamp',
            ) +
            interpolate(revealOpacity, [0, 1], [6, 0], 'clamp'),
        },
        {
          scale: interpolate(
            rotationOpacity,
            [0, 1],
            [0.992, 1],
            'clamp',
          ),
        },
      ],
    };
  });

  const finishClose = useCallback(() => {
    onBackRef.current();
  }, []);

  const handleBack = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const corner = getBottomRightCollapseLayout(
      windowWidth,
      windowHeight,
      safeAreaInsets.bottom,
    );
    collapseTargets.value = {
      translateX: corner.x + corner.width / 2 - windowWidth / 2,
      translateY: corner.y + corner.height / 2 - windowHeight / 2,
      scaleX: Math.max(
        corner.width / Math.max(windowWidth, 1),
        MIN_ORIGIN_SCALE,
      ),
      scaleY: Math.max(
        corner.height / Math.max(windowHeight, 1),
        MIN_ORIGIN_SCALE,
      ),
    };
    isClosingToCorner.value = 1;

    progress.value = withTiming(
      0,
      { duration: CLOSE_DURATION_MS, easing: CLOSE_EASING },
      finished => {
        if (finished) {
          runOnJS(finishClose)();
        }
      },
    );
  }, [
    collapseTargets,
    finishClose,
    isClosingToCorner,
    progress,
    safeAreaInsets.bottom,
    windowHeight,
    windowWidth,
  ]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [handleBack]);

  // Internal tracking of the visible month -- source of truth for rendering
  const [activeMonth, setActiveMonth] = useState(month);
  const activeMonthRef = useRef(month);
  activeMonthRef.current = activeMonth;

  const activeDetail = monthDetails[activeMonth];
  // Chevron targets follow the parent `month`; `activeMonth` can lag after
  // programmatic scroll because viewability callbacks are suppressed once.
  const prevMonth = month > 1 ? month - 1 : null;
  const nextMonth = month < 12 ? month + 1 : null;

  // selectedDate only changes on manual day press, not on swipe
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Captures activeMonth at the moment dimensions change, before FlatList relayout.
  const orientationCorrectMonthRef = useRef(activeMonth);
  const pendingOrientationOffsetRef = useRef<number | null>(null);
  const isRotatingRef = useRef(false);

  // Stable callback for day selection -- does not depend on activeMonth state
  const handleSelectDay = useCallback(
    (date: string) => {
      setSelectedDate(date);
      onMonthChange(activeMonthRef.current);
    },
    [onMonthChange],
  );

  // FlatList configuration
  const MONTHS_DATA = useMemo(
    () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    [],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<number> | null | undefined, index: number) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth],
  );

  const keyExtractor = useCallback((item: number) => String(item), []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Rotation is a viewport resize, never a month navigation gesture.
      if (isRotatingRef.current) {
        return;
      }

      const pageIndex = Math.round(
        event.nativeEvent.contentOffset.x / Math.max(pageWidth, 1),
      );
      const newMonth = Math.min(12, Math.max(1, pageIndex + 1));

      if (newMonth !== activeMonthRef.current) {
        activeMonthRef.current = newMonth;
        setActiveMonth(newMonth);
        onMonthChange(newMonth);
      }
    },
    [onMonthChange, pageWidth],
  );

  // Sync: when parent changes month prop (e.g. chevron press), scroll FlatList
  useEffect(() => {
    if (month !== activeMonth) {
      activeMonthRef.current = month;
      setActiveMonth(month);
      flatListRef.current?.scrollToIndex({ index: month - 1, animated: true });
    }
  }, [month, activeMonth]);

  const applyPendingOrientationOffset = useCallback(() => {
    const offset = pendingOrientationOffsetRef.current;
    if (offset === null) return;

    scrollX.value = offset;
    flatListRef.current?.scrollToOffset({ offset, animated: false });
  }, [scrollX]);

  // Keep the same page aligned while Android replaces the viewport dimensions.
  // The relayout is hidden briefly because FlatList cannot atomically update
  // both its item widths and native content offset.
  const previousWindowSizeRef = useRef({
    width: windowWidth,
    height: windowHeight,
  });
  useLayoutEffect(() => {
    const previous = previousWindowSizeRef.current;
    if (previous.width === windowWidth && previous.height === windowHeight) {
      return;
    }

    previousWindowSizeRef.current = {
      width: windowWidth,
      height: windowHeight,
    };
    orientationCorrectMonthRef.current = activeMonthRef.current;
    isRotatingRef.current = true;
    pendingOrientationOffsetRef.current =
      (orientationCorrectMonthRef.current - 1) * windowWidth;

    // Hide the unavoidable native resize frame, then reveal the settled layout.
    rotationContentOpacity.value = 0;
    applyPendingOrientationOffset();

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      applyPendingOrientationOffset();
      secondFrame = requestAnimationFrame(() => {
        applyPendingOrientationOffset();
        pendingOrientationOffsetRef.current = null;
        rotationContentOpacity.value = withDelay(
          ROTATION_SETTLE_DELAY_MS,
          withTiming(1, {
            duration: ROTATION_FADE_IN_MS,
            easing: ROTATION_EASING,
          }),
        );
      });
    });

    const guardTimer = setTimeout(() => {
      isRotatingRef.current = false;
    }, ROTATION_GUARD_MS);

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(guardTimer);
    };
  }, [
    applyPendingOrientationOffset,
    rotationContentOpacity,
    windowHeight,
    windowWidth,
  ]);

  // Auto-select today on initial mount only
  useEffect(() => {
    const detail = monthDetails[month];
    if (detail) {
      const todayInMonth = detail.days.find(day => day.date === todayDate);
      if (todayInMonth) {
        setSelectedDate(todayDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // renderPage for FlatList
  const renderPage = useCallback(
    ({ item: m }: { item: number }) => {
      const detail = monthDetails[m];
      if (!detail) {
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
        <View style={[styles.page, styles.pageClipped, { width: pageWidth }]}>
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
    <View style={styles.overlayRoot} pointerEvents="box-none">
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

        <Reanimated.View
          style={[styles.contentFader, contentAnimatedStyle]}
        >
          {isContentReady ? (
            <Reanimated.FlatList
              ref={flatListRef}
              data={MONTHS_DATA}
              extraData={pageWidth}
              renderItem={renderPage}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              horizontal
              pagingEnabled
              initialScrollIndex={month - 1}
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              decelerationRate="fast"
              keyboardShouldPersistTaps="handled"
              initialNumToRender={1}
              windowSize={5}
              maxToRenderPerBatch={1}
              removeClippedSubviews={false}
              style={styles.horizontalScroll}
              onScroll={onScrollEvent}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              scrollEventThrottle={16}
              onLayout={applyPendingOrientationOffset}
            />
          ) : null}
        </Reanimated.View>
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
  const animatedStyle = useAnimatedStyle(() => {
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
  }, [pageIndex, pageWidth]);

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
              <MemoizedMonthDetailDayCell
                key={`${detail.month}-${week.isoWeek}-${dayIndex}`}
                day={day}
                isSelected={day?.date === selectedDayDate}
                palette={palette}
                calendarScale={calendarScale}
                onSelectDay={onSelectDay}
                vacationColor={
                  day?.date ? vacationColorByDate.get(day.date) : undefined
                }
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
        </View>
      ) : null}

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
    </>
  );

  return (
    <View
      style={[
        monthLayoutMetrics.layout === 'split'
          ? styles.monthSplitRowWrapper
          : styles.monthContentColumn,
        monthLayoutMetrics.layout === 'stack'
          ? { maxWidth: calendarColumnWidth }
          : null,
      ]}
    >
      <HolidayBannerTransition
        source={holidayImage}
        visible={monthLayoutMetrics.layout === 'stack'}
        width={calendarColumnWidth}
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
              { marginLeft: monthLayoutMetrics.columnGap },
            ]}
          >
            {sideBlocks}
          </View>
        </View>
      ) : (
        <>
          {calendarCard}
          {sideBlocks}
        </>
      )}
    </View>
  );
}

function HolidayBannerTransition({
  source,
  visible,
  width,
}: HolidayBannerTransitionProps) {
  const [isMounted, setIsMounted] = useState(visible && source !== null);
  const visibility = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (!source) {
      setIsMounted(false);
      return;
    }

    if (visible) {
      setIsMounted(true);
      visibility.value = withTiming(1, {
        duration: 120,
        easing: REasing.out(REasing.cubic),
      });
      return;
    }

    visibility.value = withTiming(
      0,
      {
        duration: 110,
        easing: REasing.in(REasing.cubic),
      },
      finished => {
        if (finished) {
          runOnJS(setIsMounted)(false);
        }
      },
    );
  }, [source, visible, visibility]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
    transform: [
      {
        translateX: interpolate(visibility.value, [0, 1], [120, 0], 'clamp'),
      },
    ],
  }));

  if (!isMounted || !source) {
    return null;
  }

  return (
    <Reanimated.View
      style={[{ alignSelf: 'flex-start', width }, animatedStyle]}
    >
      <HolidayBanner source={source} />
    </Reanimated.View>
  );
}

type MonthDetailDayCellProps = {
  day: CalendarDay | null;
  isSelected: boolean;
  palette: CalendarPalette;
  calendarScale: number;
  onSelectDay: (date: string) => void;
  vacationColor?: string;
};

function MonthDetailDayCell({
  day,
  isSelected,
  palette,
  calendarScale,
  onSelectDay,
  vacationColor,
}: MonthDetailDayCellProps) {
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

  const bgColor = isSelected ? palette.selectedFill : colors.backgroundColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayCell,
        {
          minHeight: cellSize,
          borderRadius: Math.max(8, 12 * calendarScale),
          backgroundColor: bgColor,
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
export const MemoizedMonthDetailDayCell = memo(MonthDetailDayCell);
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
  monthSplitRowWrapper: {
    gap: layout.holidayBannerGap,
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
});
