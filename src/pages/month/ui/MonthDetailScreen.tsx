import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewToken,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getDayTypeColors,
  getDayTypeLabel,
  getDayImage,
  getHolidayDisplayName,
  getHolidayImageForMonth,
  type CalendarPalette,
  type CalendarDay,
  type CalendarYearMonthDetails,
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
};

const APP_BAR_TITLE_MIN_SCALE = 0.7;
const NOOP_SELECT_DAY = (_date: string) => {};

const PARALLAX_FACTOR = 0.15;
const PAGE_OPACITY_MIN = 0.85;
const PAGE_SCALE_MIN = 0.97;

const OPEN_EASING = Easing.bezier(0.2, 0.85, 0.25, 1);
const CLOSE_EASING = Easing.bezier(0.4, 0, 0.6, 1);
const FALLBACK_OPEN_SCALE = 0.96;
const MIN_ORIGIN_SCALE = 0.18;
const CORNER_COLLAPSE_SIZE = 92;

type TransitionTargetLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
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

  const scrollX = useRef(new Animated.Value(0)).current;
  const onScrollEvent = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true },
      ),
    [scrollX],
  );

  const pageWidth = windowWidth;
  const monthLayoutMetrics = useMemo(
    () => getMonthDetailLayoutMetrics(windowWidth, windowHeight),
    [windowHeight, windowWidth],
  );

  // --- Transition animation ---
  const animProgress = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);
  const [isClosingToCorner, setIsClosingToCorner] = useState(false);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const transitionTargetLayout = isClosingToCorner
    ? getBottomRightCollapseLayout(
        windowWidth,
        windowHeight,
        safeAreaInsets.bottom,
      )
    : originLayout;
  const targetTranslateX = transitionTargetLayout
    ? transitionTargetLayout.x +
      transitionTargetLayout.width / 2 -
      windowWidth / 2
    : 0;
  const targetTranslateY = transitionTargetLayout
    ? transitionTargetLayout.y +
      transitionTargetLayout.height / 2 -
      windowHeight / 2
    : windowHeight * 0.08;
  const targetScaleX = transitionTargetLayout
    ? Math.max(
        transitionTargetLayout.width / Math.max(windowWidth, 1),
        MIN_ORIGIN_SCALE,
      )
    : FALLBACK_OPEN_SCALE;
  const targetScaleY = transitionTargetLayout
    ? Math.max(
        transitionTargetLayout.height / Math.max(windowHeight, 1),
        MIN_ORIGIN_SCALE,
      )
    : FALLBACK_OPEN_SCALE;
  const sheetTranslateX = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [targetTranslateX, 0],
  });
  const sheetTranslateY = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [targetTranslateY, 0],
  });
  const sheetScaleX = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [targetScaleX, 1],
  });
  const sheetScaleY = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [targetScaleY, 1],
  });
  const sheetOpacity = animProgress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0.88, 1, 1],
  });
  const backdropOpacity = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 260,
      easing: OPEN_EASING,
      useNativeDriver: true,
    }).start();
  }, [animProgress]);

  const handleBack = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosingToCorner(true);

    requestAnimationFrame(() => {
      Animated.timing(animProgress, {
        toValue: 0,
        duration: 220,
        easing: CLOSE_EASING,
        useNativeDriver: true,
      }).start(() => {
        onBackRef.current();
      });
    });
  }, [animProgress]);

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

  // Flag to prevent onViewableItemsChanged from firing during programmatic scroll
  const isScrollingToRef = useRef(false);
  const programmaticTargetMonthRef = useRef<number | null>(null);

  // Stable callback for day selection -- does not depend on activeMonth state
  const handleSelectDay = useCallback(
    (date: string) => {
      setSelectedDate(date);
      onMonthChange(activeMonthRef.current);
    },
    [onMonthChange],
  );

  // FlatList configuration
  const MONTHS_DATA = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<number> | null | undefined, index: number) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth],
  );

  const keyExtractor = useCallback((item: number) => String(item), []);

  const viewabilityConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 50 }),
    [],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (isScrollingToRef.current) {
        isScrollingToRef.current = false;
        const target = programmaticTargetMonthRef.current;
        programmaticTargetMonthRef.current = null;
        if (target != null && target !== activeMonthRef.current) {
          activeMonthRef.current = target;
          setActiveMonth(target);
        }
        return;
      }
      const firstVisible = viewableItems[0];
      if (firstVisible && typeof firstVisible.item === 'number') {
        const newMonth = firstVisible.item;
        if (newMonth !== activeMonthRef.current) {
          activeMonthRef.current = newMonth;
          setActiveMonth(newMonth);
          onMonthChange(newMonth);
        }
      }
    },
    [onMonthChange],
  );

  // Sync: when parent changes month prop (e.g. chevron press), scroll FlatList
  useEffect(() => {
    if (month !== activeMonth) {
      isScrollingToRef.current = true;
      programmaticTargetMonthRef.current = month;
      flatListRef.current?.scrollToIndex({ index: month - 1, animated: true });
    }
  }, [month, activeMonth]);

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
      const inputRange = [
        (pageIndex - 1) * pageWidth,
        pageIndex * pageWidth,
        (pageIndex + 1) * pageWidth,
      ];

      const parallaxTranslateX = scrollX.interpolate({
        inputRange,
        outputRange: [
          PARALLAX_FACTOR * pageWidth,
          0,
          -PARALLAX_FACTOR * pageWidth,
        ],
        extrapolate: 'clamp',
      });

      const pageOpacity = scrollX.interpolate({
        inputRange,
        outputRange: [PAGE_OPACITY_MIN, 1, PAGE_OPACITY_MIN],
        extrapolate: 'clamp',
      });

      const pageScale = scrollX.interpolate({
        inputRange,
        outputRange: [PAGE_SCALE_MIN, 1, PAGE_SCALE_MIN],
        extrapolate: 'clamp',
      });

      const isActive = activeMonth === m;

      let resolvedSelectedDay: CalendarDay | null = null;
      if (isActive && selectedDate) {
        resolvedSelectedDay =
          detail.days.find(day => day.date === selectedDate) ?? null;
      }

      return (
        <View style={[styles.page, styles.pageClipped, { width: pageWidth }]}>
          <Animated.View
            style={[
              styles.pageAnimatedContent,
              {
                transform: [
                  { translateX: parallaxTranslateX },
                  { scale: pageScale },
                ],
                opacity: pageOpacity,
              },
            ]}
          >
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
              />
            </ScrollView>
          </Animated.View>
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
    ],
  );

  if (!activeDetail) {
    return null;
  }

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: palette.background,
            paddingTop: safeAreaInsets.top + layout.safeAreaTopExtra,
            transform: [
              { translateX: sheetTranslateX },
              { translateY: sheetTranslateY },
              { scaleX: sheetScaleX },
              { scaleY: sheetScaleY },
            ],
            opacity: sheetOpacity,
          },
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

        <Animated.FlatList
          ref={flatListRef}
          data={MONTHS_DATA}
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
          windowSize={5}
          maxToRenderPerBatch={3}
          removeClippedSubviews={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          style={styles.horizontalScroll}
          onScroll={onScrollEvent}
          scrollEventThrottle={16}
        />
      </Animated.View>
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
}: MonthDetailBodyProps) {
  const selectedHolidayLabel =
    selectedDay !== null
      ? getHolidayDisplayName(selectedDay, language)
      : null;

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

  const holidayImage = useMemo(
    () => {
      if (selectedDay) {
        const dayImg = getDayImage(selectedDay, detail.days);
        if (dayImg) return dayImg;
      }
      return getHolidayImageForMonth(detail.days);
    },
    [selectedDay, detail.days],
  );

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

  if (monthLayoutMetrics.layout === 'split') {
    return (
      <View style={styles.monthSplitRowWrapper}>
        {holidayImage ? <HolidayBanner source={holidayImage} /> : null}
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
      {holidayImage ? <HolidayBanner source={holidayImage} /> : null}
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
  onSelectDay: (date: string) => void;
};

function MonthDetailDayCell({
  day,
  isSelected,
  palette,
  calendarScale,
  onSelectDay,
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

type TotalItemProps = {
  label: string;
  value: string;
  palette: CalendarPalette;
  sideScale: number;
};

function TotalItem({
  label,
  value,
  palette,
  sideScale,
}: TotalItemProps) {
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
const MemoizedMonthDetailDayCell = memo(MonthDetailDayCell);
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
