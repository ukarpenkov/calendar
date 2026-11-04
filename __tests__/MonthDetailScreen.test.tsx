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
  return {
    useAppLocalization: () => ({
      language: 'en',
      t: (key: TranslationKey) => getTranslation('en', key),
    }),
  };
});

const calendar = parseValidateAndNormalizeCalendarImport(
  require('../calendar2027.json'),
);
const { monthDetails } = buildCalendarYearViewCache(calendar, 'en');
const portrait = { width: 390, height: 844, scale: 3, fontScale: 1 };
const landscape = { ...portrait, width: 844, height: 390 };
const onMonthChange = jest.fn();
const defaults = {
  monthDetails,
  month: 7,
  visible: true,
  onBack: jest.fn(),
  onOpenSettings: jest.fn(),
  onMonthChange,
  vacationPeriods: [],
};
let props = defaults;
let renderer: ReactTestRenderer;
let listeners: Set<(state: AppStateStatus) => void>;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2027-01-01T12:00:00Z'));
  jest.mocked(useWindowDimensions).mockReturnValue(portrait);
  jest.mocked(useReducedMotion).mockReturnValue(false);
  props = { ...defaults };
  onMonthChange.mockReset().mockImplementation(month => {
    props = { ...props, month };
    renderer.update(<MonthDetailScreen {...props} />);
  });
  listeners = new Set();
  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_type, listener) => {
      const handler = listener as (state: AppStateStatus) => void;
      listeners.add(handler);
      return { remove: () => listeners.delete(handler) };
    });
});
afterEach(() => {
  act(() => renderer?.unmount());
  jest.restoreAllMocks();
  jest.useRealTimers();
});
function render(month = 7, visible = true) {
  props = { ...props, month, visible };
  act(() => {
    renderer = create(<MonthDetailScreen {...props} />);
  });
}
function update(next: Partial<typeof props>) {
  props = { ...props, ...next };
  act(() => renderer.update(<MonthDetailScreen {...props} />));
}
function rotate(dimensions: typeof portrait) {
  jest.mocked(useWindowDimensions).mockReturnValue(dimensions);
  update({});
}
function appState(appStatus: AppStateStatus) {
  act(() => {
    for (const listener of listeners) listener(appStatus);
  });
}
function pager() {
  return renderer.root.findAllByType(View).find(node => node.props.commands)!;
}
function state(pageScrollState: 'idle' | 'dragging' | 'settling') {
  act(() =>
    pager().props.onPageScrollStateChanged({
      nativeEvent: { pageScrollState },
    }),
  );
}
function select(month: number) {
  act(() =>
    pager().props.onPageSelected({ nativeEvent: { position: month - 1 } }),
  );
}
function arrow(direction: 'Next' | 'Previous') {
  act(() =>
    renderer.root
      .findAllByProps({ accessibilityLabel: `${direction} month` })
      .find(node => typeof node.props.disabled === 'boolean')!
      .props.onPress(),
  );
}
function content(month = props.month) {
  return renderer.root.findByProps({ testID: `month-content-${month}` });
}
function verticalScroll() {
  return renderer.root
    .findAllByType(ScrollView)
    .find(node => node.props.testID === `month-scroll-${props.month}`)!;
}
function expectMonth(month: number) {
  expect(props.month).toBe(month);
  const title = renderer.root.findByProps({ testID: 'month-title' });
  expect(title.props.children.join('')).toBe(
    `${monthDetails[month]!.shortLabel} 2027`,
  );
  const iso = `2027-${String(month).padStart(2, '0')}-01`;
  expect(
    content(month).findAllByProps({ testID: `calendar-day-${iso}` }).length,
  ).toBeGreaterThan(0);
}

test('swipes through the whole year and back always show the selected month and its dates', () => {
  render(1);
  for (const month of [
    ...Array.from({ length: 11 }, (_, i) => i + 2),
    ...Array.from({ length: 11 }, (_, i) => 11 - i),
  ]) {
    state('dragging');
    state('settling');
    select(month);
    state('idle');
    expectMonth(month);
  }
  expect(pager().props.commands.setPage).not.toHaveBeenCalled();
  expect(pager().props.commands.setPageWithoutAnimation).not.toHaveBeenCalled();
});

test('all twelve pages contain real month content even before any selection event arrives', () => {
  render(1);
  for (let month = 1; month <= 12; month++) {
    expect(content(month).findAllByType(HolidayBanner)).toHaveLength(1);
    expect(content(month).findByProps({ testID: 'month-totals' })).toBeTruthy();
  }
  expect(StyleSheet.flatten(pager().props.style).opacity).toBeUndefined();
});

test('rapid arrows keep title and content on native selection and reject duplicate February', () => {
  render(1);
  const commands = pager().props.commands;
  arrow('Next');
  state('settling');
  arrow('Next');
  arrow('Next');
  expectMonth(1);
  expect(commands.setPage.mock.calls).toEqual([[1]]);
  select(2);
  expectMonth(2);
  state('idle');
  state('settling');
  select(2);
  expectMonth(2); // late duplicate cannot finish March's command
  select(3);
  expectMonth(3);
  state('idle');
  state('settling');
  select(4);
  state('idle');
  expectMonth(4);
  expect(commands.setPage.mock.calls).toEqual([[1], [2], [3]]);
});

test.each([false, true])(
  'rotation preserves native pager, image and selected date (reduced motion %s)',
  reduced => {
    jest.mocked(useReducedMotion).mockReturnValue(reduced);
    render();
    const day = () =>
      content()
        .findAllByProps({ testID: 'calendar-day-2027-07-15' })
        .find(node => typeof node.props.onPress === 'function')!;
    act(() => day().props.onPress());
    const originalPager = pager();
    const banner = content().findByType(HolidayBanner);
    const pending = banner.findAllByType(Image).find(node => node.props.onLoad);
    if (pending) act(() => pending.props.onLoad());
    const image = banner.findByType(Image);
    for (let i = 0; i < 8; i++) {
      rotate(i % 2 ? portrait : landscape);
      expect(pager()).toBe(originalPager);
      const transition = content().findByProps({
        testID: 'month-banner-position',
      }).props.layout;
      if (reduced) expect(transition).toBeUndefined();
      else expect(transition).toBeDefined();
      expect(content().findByType(HolidayBanner)).toBe(banner);
      expect(banner.findByType(Image)).toBe(image);
      expect(day().props.accessibilityState.selected).toBe(true);
      expect(content().findAllByType(Image)).toHaveLength(1);
    }
    expect(onMonthChange).not.toHaveBeenCalled();
  },
);

test('a rotation during paging does not discard the pending native selection', () => {
  render(1);
  arrow('Next');
  state('settling');
  rotate(landscape);
  select(2);
  state('idle');
  expectMonth(2);
  rotate(portrait);
  state('dragging');
  select(3);
  state('idle');
  expectMonth(3);
});

test('resume cancels an interrupted arrow queue without rebuilding the image or pager', () => {
  render();
  const native = pager();
  const banner = content().findByType(HolidayBanner);
  arrow('Next');
  state('settling');
  arrow('Next');
  appState('background');
  appState('active');
  expect(pager()).toBe(native);
  expect(content().findByType(HolidayBanner)).toBe(banner);
  expect(
    native.props.commands.setPageWithoutAnimation,
  ).toHaveBeenLastCalledWith(6);
  select(8);
  expectMonth(7);
  // Same-page native commands need not emit selection or idle.
  arrow('Previous');
  state('settling');
  select(6);
  state('idle');
  expectMonth(6);
});

test('reopening a prepared month starts at its own page and ignores callbacks from the disposed pager', () => {
  render(11, false);
  const stale = pager().props.onPageSelected;
  update({ month: 1, visible: true });
  expect(pager().props.initialPage).toBe(0);
  act(() => stale({ nativeEvent: { position: 10 } }));
  expectMonth(1);
  state('dragging');
  select(2);
  state('idle');
  expectMonth(2);
  expect(pager().props.initialPage).toBe(0);
});

test('vertical offsets are restored per orientation without remounting or repositioning on selection', () => {
  render();
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');
  const initialOffset = verticalScroll().props.contentOffset;
  const stale = verticalScroll().props.onScroll;
  act(() => stale({ nativeEvent: { contentOffset: { y: 210 } } }));
  rotate(landscape);
  expect(scrollTo).toHaveBeenLastCalledWith({ y: 0, animated: false });
  act(() => stale({ nativeEvent: { contentOffset: { y: 0 } } }));
  rotate(portrait);
  expect(scrollTo).toHaveBeenCalledWith({ y: 210, animated: false });
  expect(verticalScroll().props.contentOffset).toBe(initialOffset);
  scrollTo.mockClear();
  act(() =>
    content()
      .findAllByProps({ testID: 'calendar-day-2027-07-15' })
      .find(node => typeof node.props.onPress === 'function')!
      .props.onPress(),
  );
  expect(scrollTo).not.toHaveBeenCalled();
});

test('reduced motion uses immediate native commands and still waits for actual selection', () => {
  jest.mocked(useReducedMotion).mockReturnValue(true);
  render(1);
  for (const month of [2, 3, 4]) {
    arrow('Next');
    expectMonth(month - 1);
    expect(
      pager().props.commands.setPageWithoutAnimation,
    ).toHaveBeenLastCalledWith(month - 1);
    select(month);
    expectMonth(month);
  }
  expect(pager().props.commands.setPage).not.toHaveBeenCalled();
});

test('hidden screens ignore gestures and arrows', () => {
  render(7, false);
  arrow('Next');
  state('dragging');
  select(8);
  state('idle');
  expect(onMonthChange).not.toHaveBeenCalled();
  expect(pager().props.commands.setPage).not.toHaveBeenCalled();
});

test('reopening the same month restores an interrupted native animation without requiring a new pager', () => {
  render(1);
  const native = pager();
  arrow('Next');
  state('settling');
  update({ visible: false });
  select(2); // native finished after the sheet closed
  update({ visible: true });
  expect(pager()).toBe(native);
  expect(
    native.props.commands.setPageWithoutAnimation,
  ).toHaveBeenLastCalledWith(0);
  expectMonth(1);
  arrow('Next');
  state('settling');
  select(2);
  state('idle');
  expectMonth(2);
});

test.each(['onScrollEndDrag', 'onMomentumScrollEnd'] as const)(
  '%s preserves the final position missed by throttled scroll events',
  eventName => {
    render();
    const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');
    act(() => {
      verticalScroll().props.onScroll({
        nativeEvent: { contentOffset: { y: 210 } },
      });
      verticalScroll().props[eventName]({
        nativeEvent: { contentOffset: { y: 212.5 } },
      });
    });
    rotate(landscape);
    rotate(portrait);
    expect(scrollTo).toHaveBeenCalledWith({ y: 212.5, animated: false });
  },
);

test('callbacks from an earlier visit to the same orientation cannot replace its final saved offset', () => {
  render();
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');
  const stale = verticalScroll().props.onMomentumScrollEnd;
  act(() =>
    verticalScroll().props.onMomentumScrollEnd({
      nativeEvent: { contentOffset: { y: 212.5 } },
    }),
  );
  rotate(landscape);
  rotate(portrait);
  act(() => stale({ nativeEvent: { contentOffset: { y: 0 } } }));
  rotate(landscape);
  scrollTo.mockClear();
  rotate(portrait);
  expect(scrollTo).toHaveBeenCalledWith({ y: 212.5, animated: false });
});
