import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import PagerView, {
  type PagerViewOnPageSelectedEvent,
  type PageScrollStateChangedNativeEvent,
} from 'react-native-pager-view';
import { useReducedMotion } from 'react-native-reanimated';
import {
  createPagerNavigation,
  type PageCommand,
} from '../model/monthPagerNavigation';

const MONTH_COUNT = 12;
export type MonthPagerHandle = { moveMonth: (direction: number) => void };

type MonthPagerViewportProps = {
  month: number;
  visible: boolean;
  onMonthChange: (month: number) => void;
  isClosingRef: RefObject<boolean>;
  renderPage: (month: number) => ReactNode;
};

/** ViewPager2 owns gestures, page placement and animation on the Android UI thread. */
export const MonthPagerViewport = forwardRef<
  MonthPagerHandle,
  MonthPagerViewportProps
>(function MonthPagerViewport(
  { month, visible, onMonthChange, isClosingRef, renderPage },
  ref,
) {
  const pager = useRef<PagerView>(null);
  const initialPage = useRef(month - 1).current;
  const navigation = useRef(createPagerNavigation(month, MONTH_COUNT)).current;
  const mounted = useRef(false);
  const wasVisible = useRef(visible);
  const current = useRef({ visible, onMonthChange });
  current.current = { visible, onMonthChange };
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback((command: PageCommand | null) => {
    if (!command || !pager.current) return;
    if (command.animated) pager.current.setPage(command.month - 1);
    else pager.current.setPageWithoutAnimation(command.month - 1);
  }, []);
  const canNavigate = useCallback(
    () => mounted.current && current.current.visible && !isClosingRef.current,
    [isClosingRef],
  );

  useLayoutEffect(() => {
    // The normal path is native selection -> parent month, with no scroll back.
    // This branch only handles an external change (for example a new calendar).
    const reopening = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (reopening || month !== navigation.selected) run(navigation.jump(month));
  }, [month, navigation, run, visible]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && canNavigate()) {
        // Drop an interrupted gesture/arrow queue without rebuilding any pages.
        run(navigation.jump(navigation.selected));
      }
    });
    return () => subscription.remove();
  }, [canNavigate, navigation, run]);

  const onPageSelected = useCallback(
    (event: PagerViewOnPageSelectedEvent) => {
      if (!canNavigate()) return;
      const next = event.nativeEvent.position + 1;
      const previous = navigation.selected;
      if (!navigation.select(next)) return;
      if (next !== previous) current.current.onMonthChange(next);
      run(navigation.next(!reducedMotion));
    },
    [canNavigate, navigation, reducedMotion, run],
  );

  const onPageScrollStateChanged = useCallback(
    (event: PageScrollStateChangedNativeEvent) => {
      if (!canNavigate()) return;
      navigation.scrollState(event.nativeEvent.pageScrollState);
      run(navigation.next(!reducedMotion));
    },
    [canNavigate, navigation, reducedMotion, run],
  );

  useImperativeHandle(
    ref,
    () => ({
      moveMonth(direction) {
        if (!canNavigate()) return;
        navigation.request(direction);
        run(navigation.next(!reducedMotion));
      },
    }),
    [canNavigate, navigation, reducedMotion, run],
  );

  return (
    <PagerView
      ref={pager}
      testID="month-pager"
      style={styles.pager}
      initialPage={initialPage}
      orientation="horizontal"
      layoutDirection="ltr"
      scrollEnabled={visible}
      offscreenPageLimit={1}
      overScrollMode="never"
      onPageSelected={onPageSelected}
      onPageScrollStateChanged={onPageScrollStateChanged}
    >
      {Array.from({ length: MONTH_COUNT }, (_, index) => (
        <View key={index + 1} collapsable={false} style={styles.page}>
          {renderPage(index + 1)}
        </View>
      ))}
    </PagerView>
  );
});

const styles = StyleSheet.create({
  pager: { flex: 1 },
  page: { width: '100%', height: '100%' },
});
