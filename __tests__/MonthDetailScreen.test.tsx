import React from 'react';
import {
  AppState,
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type AppStateStatus,
} from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useReducedMotion } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import { buildCalendarYearViewCache } from '../src/entities/calendar';
import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';
import { HolidayBanner } from '../src/pages/month/ui/HolidayBanner';
import { MonthDetailScreen } from '../src/pages/month/ui/MonthDetailScreen';
import type { TranslationKey } from '../src/shared/lib/i18n';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('../src/app/providers/theme', () => {
  const { getCalendarPalette } = jest.requireActual('../src/entities/calendar');
  const palette = getCalendarPalette(false);
  return { useAppTheme: () => ({ palette }) };
});
jest.mock('../src/app/providers/localization', () => {
  const { getTranslation } = jest.requireActual('../src/shared/lib/i18n');
  const localization = {
    language: 'en',
    t: (key: TranslationKey) => getTranslation('en', key),
  };
  return { useAppLocalization: () => localization };
});

const calendar = parseValidateAndNormalizeCalendarImport(
  require('../calendar2027.json'),
);
const { monthDetails } = buildCalendarYearViewCache(calendar, 'en');
const portrait = { width: 390, height: 844, scale: 3, fontScale: 1 };
const landscape = { ...portrait, width: 844, height: 390 };
const onMonthChange = jest.fn();
const props = {
  monthDetails,
  month: 7,
  onBack: jest.fn(),
  onOpenSettings: jest.fn(),
  onMonthChange,
  vacationPeriods: [],
};
let renderer: ReactTestRenderer;
let listeners: Set<(state: AppStateStatus) => void>;
let scrollTo: jest.SpyInstance;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2027-01-01T12:00:00Z'));
  jest.mocked(useWindowDimensions).mockReturnValue(portrait);
  jest.mocked(useReducedMotion).mockReturnValue(false);
  onMonthChange.mockClear();
  listeners = new Set();
  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_type, listener) => {
      const handler = listener as (state: AppStateStatus) => void;
      listeners.add(handler);
      return { remove: () => listeners.delete(handler) };
    });
  scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');
  scrollTo.mockClear();
});

afterEach(() => {
  act(() => renderer?.unmount());
  jest.restoreAllMocks();
  jest.useRealTimers();
});

function render() {
  act(() => {
    renderer = create(<MonthDetailScreen {...props} />);
  });
}

function rotate(dimensions: typeof portrait) {
  jest.mocked(useWindowDimensions).mockReturnValue(dimensions);
  act(() => renderer.update(<MonthDetailScreen {...props} />));
}

function changeAppState(state: AppStateStatus) {
  act(() => {
    for (const listener of listeners) listener(state);
  });
}

function content() {
  return renderer.root.findByProps({ testID: 'month-content-7' });
}

function selectedDayCell() {
  return content()
    .findAllByProps({ testID: 'calendar-day-2027-07-15' })
    .find(node => typeof node.props.onPress === 'function')!;
}

function expectBannerInFlow(split: boolean) {
  const body = content();
  expect(body.findAllByType(HolidayBanner)).toHaveLength(1);
  const banner = body.findByProps({ testID: 'month-holiday-banner' });
  expect(StyleSheet.flatten(banner.props.style).position).not.toBe('absolute');
  expect(banner.props.layout).toBeUndefined();
  expect(banner.props.exiting).toBeUndefined();
  if (split) {
    const side = body.findByProps({ testID: 'month-side-column' });
    expect(side.findAllByType(HolidayBanner)).toHaveLength(1);
    expect(side.findByProps({ testID: 'month-totals' })).toBeTruthy();
    const nodes = side.findAll(node =>
      ['month-holiday-banner', 'month-totals'].includes(node.props.testID),
    );
    expect(nodes[0].props.testID).toBe('month-holiday-banner');
    expect(
      body
        .findByProps({ testID: 'month-calendar-column' })
        .findAllByType(HolidayBanner),
    ).toHaveLength(0);
  } else {
    expect(body.findAllByProps({ testID: 'month-side-column' })).toHaveLength(
      0,
    );
    const nodes = body.findAll(
      node =>
        node.type === HolidayBanner ||
        node.props.testID === 'calendar-day-2027-07-01',
    );
    expect(nodes[0].type).toBe(HolidayBanner);
    expect(nodes[1].props.testID).toBe('calendar-day-2027-07-01');
  }
}

test.each([false, true])(
  'repeated rapid rotations retain one banner and the selected day (reduced motion: %s)',
  reduced => {
    jest.mocked(useReducedMotion).mockReturnValue(reduced);
    render();
    act(() => selectedDayCell().props.onPress());
    const source = content().findByType(HolidayBanner).props.source;
    // Do not advance animation timers between rotations: every transition is interrupted.
    for (let i = 0; i < 8; i++) {
      rotate(i % 2 === 0 ? landscape : portrait);
      expectBannerInFlow(i % 2 === 0);
      expect(selectedDayCell().props.accessibilityState.selected).toBe(true);
      expect(content().findByType(HolidayBanner).props.source).toEqual(source);
      expect(content().findAllByType(Image)).toHaveLength(1);
      expect(scrollTo).toHaveBeenLastCalledWith({
        x: 6 * (i % 2 === 0 ? 844 : 390),
        animated: false,
      });
    }
    expect(onMonthChange).not.toHaveBeenCalled();
  },
);

test.each([portrait, landscape])(
  'lock/unlock rebuilds the native pager at $width × $height with the current month',
  dimensions => {
    jest.mocked(useWindowDimensions).mockReturnValue(dimensions);
    render();
    const source = content().findByType(HolidayBanner).props.source;
    const pager = renderer.root.findByProps({ testID: 'month-pager' });
    // Lock while a horizontal swipe/opening animation is still in progress.
    act(() => pager.props.onScrollBeginDrag());
    for (let i = 0; i < 3; i++) {
      changeAppState('background');
      changeAppState('active');
      act(() => jest.advanceTimersByTime(20));
      expect(scrollTo).toHaveBeenLastCalledWith({
        x: 6 * dimensions.width,
        animated: false,
      });
      const restoredPager = renderer.root.findByProps({
        testID: 'month-pager',
      });
      expect(restoredPager).not.toBe(pager);
      expect(restoredPager.props.contentOffset.x).toBe(6 * dimensions.width);
      expect(content().findByType(HolidayBanner).props.source).toEqual(source);
      act(() =>
        restoredPager.props.onLayout({
          nativeEvent: { layout: { width: dimensions.width } },
        }),
      );
      expectBannerInFlow(dimensions.width > dimensions.height);
    }
    act(() =>
      renderer.root
        .findByProps({ testID: 'month-pager' })
        .props.onMomentumScrollEnd({
          nativeEvent: {
            contentOffset: { x: 7 * dimensions.width },
            layoutMeasurement: { width: dimensions.width },
          },
        }),
    );
    expect(onMonthChange).not.toHaveBeenCalled();
  },
);

test('rotation while locked and another rotation during resume use the latest viewport', () => {
  render();
  changeAppState('inactive');
  changeAppState('background');
  rotate(landscape);
  changeAppState('active');
  rotate(portrait);
  act(() => jest.advanceTimersByTime(20));
  expectBannerInFlow(false);
  expect(scrollTo).toHaveBeenLastCalledWith({
    x: 6 * portrait.width,
    animated: false,
  });
  expect(onMonthChange).not.toHaveBeenCalled();
});

test('late native layout and momentum events from the old orientation cannot move the month', () => {
  render();
  rotate(landscape);
  mockNativeBounds(0, 0, landscape.width);
  const pager = renderer.root.findByProps({ testID: 'month-pager' });
  scrollTo.mockClear();
  act(() =>
    pager.props.onLayout({
      nativeEvent: { layout: { width: portrait.width } },
    }),
  );
  expect(scrollTo).not.toHaveBeenCalled();
  act(() =>
    pager.props.onLayout({
      nativeEvent: { layout: { width: landscape.width } },
    }),
  );
  expect(scrollTo).toHaveBeenLastCalledWith({
    x: 6 * landscape.width,
    animated: false,
  });
  act(() => jest.advanceTimersByTime(20));
  act(() => pager.props.onScrollBeginDrag());
  act(() =>
    pager.props.onMomentumScrollEnd({
      nativeEvent: {
        contentOffset: { x: 7 * portrait.width },
        layoutMeasurement: { width: portrait.width },
      },
    }),
  );
  expect(onMonthChange).not.toHaveBeenCalled();
  act(() =>
    pager.props.onMomentumScrollEnd({
      nativeEvent: {
        contentOffset: { x: 7 * landscape.width },
        layoutMeasurement: { width: landscape.width },
      },
    }),
  );
  expect(onMonthChange).toHaveBeenCalledWith(8);
});

test('rotation discards an unfinished image replacement and ignores its late load', () => {
  render();
  act(() => selectedDayCell().props.onPress());
  const pending = content()
    .findAllByType(Image)
    .find(node => node.props.onLoad);
  expect(pending).toBeDefined();
  const staleLoad = pending!.props.onLoad;
  const selectedSource = content().findByType(HolidayBanner).props.source;
  changeAppState('background');
  rotate(landscape);
  changeAppState('active');
  act(() => staleLoad());
  expectBannerInFlow(true);
  expect(content().findAllByType(Image)).toHaveLength(1);
  expect(content().findByType(Image).props.source).toEqual(selectedSource);
});

test('unmount removes the resume listener', () => {
  render();
  changeAppState('background');
  changeAppState('active');
  act(() => renderer.unmount());
  scrollTo.mockClear();
  act(() => jest.advanceTimersByTime(20));
  expect(scrollTo).not.toHaveBeenCalled();
  expect(listeners.size).toBe(0);
});

test('a new native viewport starts at the current month; paging keeps its existing initial offset', () => {
  render();
  const originalPager = renderer.root.findByProps({ testID: 'month-pager' });
  // Updating the contentOffset on every month change would cancel arrow animations.
  act(() => renderer.update(<MonthDetailScreen {...props} month={8} />));
  expect(renderer.root.findByProps({ testID: 'month-pager' })).toBe(
    originalPager,
  );
  expect(originalPager.props.contentOffset.x).toBe(6 * portrait.width);
  jest.mocked(useWindowDimensions).mockReturnValue(landscape);
  act(() => renderer.update(<MonthDetailScreen {...props} month={8} />));
  const rotatedPager = renderer.root.findByProps({ testID: 'month-pager' });
  expect(rotatedPager).not.toBe(originalPager);
  expect(rotatedPager.props.contentOffset.x).toBe(7 * landscape.width);
  changeAppState('background');
  changeAppState('active');
  const resumedPager = renderer.root.findByProps({ testID: 'month-pager' });
  expect(resumedPager).not.toBe(rotatedPager);
  expect(resumedPager.props.contentOffset.x).toBe(7 * landscape.width);
});

test('unlock preserves vertical scrolling and keeps offsets separate for each orientation', () => {
  render();
  const verticalScroll = () =>
    renderer.root.findByProps({ testID: 'month-scroll-7' });
  act(() =>
    verticalScroll().props.onScroll({
      nativeEvent: { contentOffset: { y: 210 } },
    }),
  );
  changeAppState('background');
  changeAppState('active');
  expect(verticalScroll().props.contentOffset.y).toBe(210);
  rotate(landscape);
  expect(verticalScroll().props.contentOffset.y).toBe(0);
  rotate(portrait);
  expect(verticalScroll().props.contentOffset.y).toBe(210);
});

test('content stays hidden until a scroll event confirms the current viewport and target page', () => {
  jest
    .spyOn(Reanimated, 'useAnimatedScrollHandler')
    .mockImplementation(
      handlers =>
        (typeof handlers === 'function'
          ? handlers
          : handlers.onScroll) as unknown as ReturnType<
          typeof Reanimated.useAnimatedScrollHandler
        >,
    );
  const timing = jest.spyOn(Reanimated, 'withTiming');
  render();
  rotate(landscape);
  const pager = renderer.root.findByProps({ testID: 'month-pager' });
  expect(StyleSheet.flatten(pager.props.style).opacity).toBe(0);
  timing.mockClear();
  const scroll = (width: number, x: number) =>
    act(() =>
      pager.props.onScroll({
        layoutMeasurement: { width },
        contentOffset: { x },
      }),
    );
  scroll(portrait.width, 6 * portrait.width);
  scroll(landscape.width, 0);
  scroll(landscape.width, 5 * landscape.width);
  expect(timing).not.toHaveBeenCalled();
  act(() => pager.props.onContentSizeChange());
  expect(scrollTo).toHaveBeenLastCalledWith({
    x: 6 * landscape.width,
    animated: false,
  });
  scroll(landscape.width, 6 * landscape.width);
  expect(timing).toHaveBeenCalledTimes(1);
  expect(timing).toHaveBeenLastCalledWith(
    1,
    expect.objectContaining({ duration: 160 }),
  );
  scroll(landscape.width, 6 * landscape.width);
  expect(timing).toHaveBeenCalledTimes(1);
});

test('the first month becomes visible on layout even if zero scrolling emits no event', () => {
  const timing = jest.spyOn(Reanimated, 'withTiming');
  act(() => {
    renderer = create(<MonthDetailScreen {...props} month={1} />);
  });
  mockNativeBounds(0, 0, portrait.width, 1);
  timing.mockClear();
  act(() =>
    renderer.root.findByProps({ testID: 'month-pager' }).props.onLayout({
      nativeEvent: { layout: { width: portrait.width } },
    }),
  );
  act(() => jest.advanceTimersByTime(20));
  expect(timing).toHaveBeenCalledWith(
    1,
    expect.objectContaining({ duration: 160 }),
  );
});

function mockNativeBounds(
  pagerX: number,
  pageX: number,
  width: number,
  month = 7,
) {
  const pager = renderer.root
    .findAllByType(ScrollView)
    .find(node => node.props.testID === 'month-pager')!;
  const page = renderer.root
    .findAllByType(View)
    .find(
      node =>
        node.props.collapsable === false &&
        node.findAllByProps({ testID: `month-content-${month}` }).length > 0,
    )!;
  // RN's mock shares the prototype method; provide independent native responses.
  const measurePager = (
    callback: (x: number, y: number, w: number, h: number) => void,
  ) => callback(pagerX, 50, width, 400);
  pager.instance.getNativeScrollRef = () => ({ measureInWindow: measurePager });
  page.instance.measureInWindow = (
    callback: (x: number, y: number, w: number, h: number) => void,
  ) => callback(pageX, 50, width, 400);
}

test('native measurements reveal an aligned page without an initial scroll event', () => {
  const timing = jest.spyOn(Reanimated, 'withTiming');
  render();
  // Both measurements include the sheet's opening scale.
  mockNativeBounds(20, 20, 200);
  timing.mockClear();
  act(() => jest.advanceTimersByTime(20));
  expect(timing).toHaveBeenCalledWith(
    1,
    expect.objectContaining({ duration: 160 }),
  );
});

test('a page measured outside its viewport stays hidden', () => {
  const timing = jest.spyOn(Reanimated, 'withTiming');
  render();
  mockNativeBounds(0, 80, 390);
  timing.mockClear();
  act(() => jest.advanceTimersByTime(20));
  expect(timing).not.toHaveBeenCalledWith(
    1,
    expect.objectContaining({ duration: 160 }),
  );
});

test('events from the disposed native pager cannot change a resumed page at the same size', () => {
  jest
    .spyOn(Reanimated, 'useAnimatedScrollHandler')
    .mockImplementation(
      handlers =>
        (typeof handlers === 'function'
          ? handlers
          : handlers.onScroll) as unknown as ReturnType<
          typeof Reanimated.useAnimatedScrollHandler
        >,
    );
  render();
  const oldEvents = renderer.root.findByProps({ testID: 'month-pager' }).props;
  changeAppState('background');
  changeAppState('active');
  const currentPage = renderer.root.find(
    node => node.props.pageIndex === 6 && node.props.scrollX,
  );
  const currentScrollX = currentPage.props.scrollX;
  scrollTo.mockClear();
  act(() => {
    oldEvents.onScrollBeginDrag();
    oldEvents.onMomentumScrollEnd({
      nativeEvent: {
        contentOffset: { x: 7 * portrait.width },
        layoutMeasurement: { width: portrait.width },
      },
    });
    oldEvents.onLayout({ nativeEvent: { layout: { width: portrait.width } } });
    oldEvents.onContentSizeChange();
    oldEvents.onScroll({
      contentOffset: { x: 7 * portrait.width },
      layoutMeasurement: { width: portrait.width },
    });
  });
  expect(onMonthChange).not.toHaveBeenCalled();
  expect(scrollTo).not.toHaveBeenCalled();
  expect(currentScrollX.value).toBe(6 * portrait.width);
});
