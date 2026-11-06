import {
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
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Reanimated, {
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type CalendarDay,
  type CalendarYearMonthDetails,
} from '../../../entities/calendar';
import type { VacationPeriod } from '../../../features/vacation/model';
import { getLocalIsoDate } from '../../../shared/lib/date/localIsoDate';
import { useAppLocalization } from '../../../shared/lib/localization';
import { useAppTheme } from '../../../shared/lib/theme';
import { getShortWeekdayLabels } from '../../../shared/lib/i18n';
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

import { MemoizedMonthDetailBody } from './MonthDetailBody';
import { styles } from './monthDetailStyles';
import { MonthPageScrollView } from './MonthPageScrollView';
import {
  MonthPagerViewport,
  type MonthPagerHandle,
} from './MonthPagerViewport';
import { getMonthDetailLayoutMetrics } from './monthDetailLayout';

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

export { MemoizedCalendarDayCell as MemoizedMonthDetailDayCell } from '../../../entities/calendar/ui/CalendarMonthGrid';

