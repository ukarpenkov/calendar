import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { motion } from '../../../shared/lib/ui/motion';
import { createPagerNavigation } from '../../../shared/lib/ui/pagerNavigation';

const PAGE_COUNT = 12;
const POSITION_TOLERANCE = 1;
const ALIGNMENT_ATTEMPTS = 12;

export type MonthPagerHandle = {
  moveMonth: (direction: number) => void;
};

type MonthPagerViewportProps = {
  month: number;
  pageWidth: number;
  visible: boolean;
  onMonthChange: (month: number) => void;
  isClosingRef: RefObject<boolean>;
  renderPage: (month: number, scrollX: SharedValue<number>) => ReactNode;
};

/**
 * One native viewport lifetime. The parent remounts this component after a
 * viewport change or resume, preserving calendar selection outside the pager.
 * Old native callbacks can therefore never animate a replacement viewport.
 */
export const MonthPagerViewport = forwardRef<
  MonthPagerHandle,
  MonthPagerViewportProps
>(function MonthPagerViewport(
  { month, pageWidth, visible, onMonthChange, isClosingRef, renderPage },
  ref,
) {
  const pagerRef = useRef<ScrollView>(null);
  const activePageRef = useRef<View>(null);
  const mounted = useRef(true);
  const alignmentFrame = useRef<number | undefined>(undefined);
  const alignmentRequest = useRef(0);
  const previousVisible = useRef(false);
  const nativeMonth = useRef(month);
  const current = useRef({ month, visible, onMonthChange });
  current.current = { month, visible, onMonthChange };
  const navigation = useRef(createPagerNavigation(month, PAGE_COUNT)).current;
  const reduceMotion = useReducedMotion();

  // Updating contentOffset on every month change would cancel arrow animations.
  const initialOffset = useRef({ x: (month - 1) * pageWidth, y: 0 }).current;
  const scrollX = useSharedValue(initialOffset.x);
  const targetOffset = useSharedValue(initialOffset.x);
  const ready = useSharedValue(false);
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      alignmentRequest.current += 1;
      if (alignmentFrame.current !== undefined) {
        cancelAnimationFrame(alignmentFrame.current);
      }
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const alignPage = useCallback(() => {
    if (!mounted.current) return;
    const offset = (current.current.month - 1) * pageWidth;
    targetOffset.value = offset;
    scrollX.value = offset;
    pagerRef.current?.scrollTo({ x: offset, animated: false });
  }, [pageWidth, scrollX, targetOffset]);

  const confirmPagePosition = useCallback(() => {
    if (!mounted.current || ready.value) return;
    if (alignmentFrame.current !== undefined) {
      cancelAnimationFrame(alignmentFrame.current);
    }
    const request = ++alignmentRequest.current;
    let attempts = 0;
    const isCurrent = () =>
      mounted.current && alignmentRequest.current === request && !ready.value;

    const schedule = () => {
      if (!isCurrent() || attempts >= ALIGNMENT_ATTEMPTS) return;
      alignmentFrame.current = requestAnimationFrame(() => {
        alignmentFrame.current = undefined;
        if (!isCurrent()) return;
        attempts += 1;
        const pager = pagerRef.current;
        const page = activePageRef.current;
        const nativePager = pager?.getNativeScrollRef();
        if (!pager || !page || !nativePager) {
          schedule();
          return;
        }
        // Both bounds include the sheet's opening scale. Compare them to each
        // other, rather than comparing a scaled width with the window width.
        nativePager.measureInWindow((pagerX, _y, width) => {
          if (!isCurrent()) return;
          if (width <= 0) {
            schedule();
            return;
          }
          page.measureInWindow((pageX, _pageY, measuredWidth) => {
            if (!isCurrent()) return;
            if (pagerRef.current !== pager || activePageRef.current !== page) {
              schedule();
              return;
            }
            if (
              Math.abs(pageX - pagerX) < POSITION_TOLERANCE &&
              Math.abs(measuredWidth - width) < POSITION_TOLERANCE
            ) {
              // Native placement and the parallax model must agree. An earlier
              // initialization event may have reported a clamped scroll offset.
              scrollX.value = targetOffset.value;
              ready.value = true;
              opacity.value = withTiming(1, motion.change);
            } else {
              alignPage();
              schedule();
            }
          });
        });
      });
    };
    schedule();
  }, [alignPage, opacity, ready, scrollX, targetOffset]);

  const onScroll = useAnimatedScrollHandler(
    {
      onScroll: event => {
        if (
          Math.abs(event.layoutMeasurement.width - pageWidth) >
          POSITION_TOLERANCE
        )
          return;
        scrollX.value = event.contentOffset.x;
        if (
          !ready.value &&
          Math.abs(event.contentOffset.x - targetOffset.value) <
            POSITION_TOLERANCE
        ) {
          ready.value = true;
          opacity.value = withTiming(1, motion.change);
        }
      },
    },
    [pageWidth],
  );

  useLayoutEffect(() => {
    const opening = visible && !previousVisible.current;
    previousVisible.current = visible;
    if (!visible || opening || !ready.value) {
      navigation.reset(month);
      nativeMonth.current = month;
      alignPage();
      confirmPagePosition();
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
    confirmPagePosition,
    month,
    navigation,
    pageWidth,
    ready,
    reduceMotion,
    scrollX,
    visible,
  ]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (
        !mounted.current ||
        ready.value ||
        Math.abs(event.nativeEvent.layout.width - pageWidth) >
          POSITION_TOLERANCE
      )
        return;
      alignPage();
      confirmPagePosition();
    },
    [alignPage, confirmPagePosition, pageWidth, ready],
  );

  const onContentSizeChange = useCallback(() => {
    if (!mounted.current || ready.value) return;
    alignPage();
    confirmPagePosition();
  }, [alignPage, confirmPagePosition, ready]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (
        !mounted.current ||
        !current.current.visible ||
        !ready.value ||
        isClosingRef.current
      )
        return;
      if (
        Math.abs(event.nativeEvent.layoutMeasurement.width - pageWidth) >
        POSITION_TOLERANCE
      )
        return;
      const next = Math.min(
        PAGE_COUNT,
        Math.max(
          1,
          Math.round(event.nativeEvent.contentOffset.x / pageWidth) + 1,
        ),
      );
      const target = navigation.settle(next, !reduceMotion);
      if (target === null) return;
      nativeMonth.current = next;
      if (target !== current.current.month)
        current.current.onMonthChange(target);
    },
    [isClosingRef, navigation, pageWidth, ready, reduceMotion],
  );

  const onScrollBeginDrag = useCallback(() => {
    if (
      !mounted.current ||
      !current.current.visible ||
      !ready.value ||
      isClosingRef.current
    )
      return;
    navigation.beginDrag();
  }, [isClosingRef, navigation, ready]);

  useImperativeHandle(
    ref,
    () => ({
      moveMonth(direction: number) {
        if (
          !mounted.current ||
          !current.current.visible ||
          isClosingRef.current
        )
          return;
        const target = navigation.move(direction, !reduceMotion && ready.value);
        if (target !== null) current.current.onMonthChange(target);
      },
    }),
    [isClosingRef, navigation, ready, reduceMotion],
  );

  return (
    <Animated.ScrollView
      ref={pagerRef}
      testID="month-pager"
      horizontal
      pagingEnabled
      contentOffset={initialOffset}
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
      decelerationRate="fast"
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false}
      style={[styles.pager, animatedStyle]}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollEndDrag={event => {
        const offset = event.nativeEvent.contentOffset.x;
        if (
          !event.nativeEvent.velocity?.x &&
          Math.abs(offset / pageWidth - Math.round(offset / pageWidth)) < 0.001
        ) {
          onMomentumScrollEnd(event);
        }
      }}
      scrollEventThrottle={16}
      onLayout={onLayout}
      onContentSizeChange={onContentSizeChange}
    >
      {Array.from({ length: PAGE_COUNT }, (_, index) => {
        const page = index + 1;
        return (
          <View
            key={page}
            ref={page === month ? activePageRef : undefined}
            collapsable={false}
            style={[styles.page, { width: pageWidth }]}
          >
            {renderPage(page, scrollX)}
          </View>
        );
      })}
    </Animated.ScrollView>
  );
});

const styles = StyleSheet.create({
  pager: { flex: 1 },
  page: { flexGrow: 1 },
});
