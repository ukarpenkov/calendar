import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { createPagerNavigation } from '../../../shared/lib/ui/pagerNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  buildMonthDetail,
  type CalendarDay,
  type CalendarMonthDetail,
  type CalendarPalette,
} from '../../../entities/calendar';
import { CalendarMonthGrid } from '../../../entities/calendar/ui/CalendarMonthGrid';
import {
  getShortWeekdayLabels,
  getTranslation,
  type AppLanguage,
} from '../../../shared/lib/i18n';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../shared/ui/icons/NavigationIcons';

type VacationDatePickerProps = {
  year: number;
  calendarDays: CalendarDay[];
  selectedDate: string | null;
  initialDate: string | null;
  minDate?: string;
  maxDate?: string;
  disabledDates?: ReadonlySet<string>;
  startDate?: string | null;
  endDate?: string | null;
  title: string;
  palette: CalendarPalette;
  language: AppLanguage;
  onSelect: (date: string) => void;
  onClose: () => void;
};

export function VacationDatePicker({
  year,
  calendarDays,
  selectedDate,
  initialDate,
  minDate,
  maxDate,
  disabledDates,
  startDate,
  endDate,
  title,
  palette,
  language,
  onSelect,
  onClose,
}: VacationDatePickerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pageWidth = Math.min(420, width - insets.left - insets.right - 32) - 26;
  const calendarScale = Math.min(Math.max(pageWidth / 360, 0.78), 1);
  // Reserve six rows so paging never changes the dialog height.
  const rowHeight = Math.max(36, 42 * calendarScale, (pageWidth - 62) / 7);
  const calendarHeight = Math.ceil(88 + 6 * rowHeight);
  const listRef = useRef<ScrollView>(null);
  const reduceMotion = useReducedMotion();
  const [month, setMonth] = useState(() => {
    const date = selectedDate ?? initialDate;
    if (date && Number(date.slice(0, 4)) === year) {
      return Number(date.slice(5, 7));
    }
    const today = new Date();
    return today.getFullYear() === year ? today.getMonth() + 1 : 1;
  });
  const targetMonth = useRef(month);
  const initialOffset = useRef({ x: (month - 1) * pageWidth, y: 0 }).current;
  const previousWidth = useRef(pageWidth);
  const navigation = useRef(createPagerNavigation(month, 12)).current;
  useLayoutEffect(() => {
    if (previousWidth.current === pageWidth) return;
    previousWidth.current = pageWidth;
    navigation.reset(targetMonth.current);
    listRef.current?.scrollTo({
      x: (targetMonth.current - 1) * pageWidth,
      animated: false,
    });
  }, [navigation, pageWidth]);
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const monthNumber = index + 1;
        const days = calendarDays
          .filter(day => day.year === year && day.month === monthNumber)
          .sort((a, b) => a.day - b.day);
        return buildMonthDetail(year, monthNumber, days, language);
      }),
    [calendarDays, language, year],
  );
  const weekdayLabels = useMemo(
    () => getShortWeekdayLabels(language),
    [language],
  );
  const markedDates = useMemo(() => {
    const dates = new Map<string, string>();
    if (startDate)
      dates.set(startDate, getTranslation(language, 'vacation.startDate'));
    if (endDate) {
      const label = getTranslation(language, 'vacation.endDate');
      dates.set(
        endDate,
        dates.has(endDate) ? `${dates.get(endDate)}, ${label}` : label,
      );
    }
    return dates;
  }, [endDate, language, startDate]);
  const rangeColors = useMemo(() => {
    const colors = new Map<string, string>();
    if (startDate && endDate && startDate <= endDate) {
      for (const day of calendarDays) {
        if (day.date >= startDate && day.date <= endDate) {
          colors.set(day.date, palette.selectedBorder);
        }
      }
    }
    return colors;
  }, [calendarDays, endDate, palette.selectedBorder, startDate]);
  const selectDay = useCallback(
    (date: string) => {
      if (
        Number(date.slice(0, 4)) === year &&
        (!minDate || date >= minDate) &&
        (!maxDate || date <= maxDate) &&
        !disabledDates?.has(date)
      ) {
        onSelect(date);
      }
    },
    [disabledDates, maxDate, minDate, onSelect, year],
  );
  const renderMonth = useCallback(
    ({ item }: { item: CalendarMonthDetail }) => (
      <View style={{ width: pageWidth }}>
        <CalendarMonthGrid
          detail={item}
          palette={palette}
          language={language}
          weekdayLabels={weekdayLabels}
          calendarScale={calendarScale}
          selectedDayDate={selectedDate ?? undefined}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
          markedDates={markedDates}
          vacationColorByDate={rangeColors}
          onSelectDay={selectDay}
          preserveDayTypeOnSelection
        />
      </View>
    ),
    [
      calendarScale,
      language,
      minDate,
      maxDate,
      disabledDates,
      markedDates,
      rangeColors,
      pageWidth,
      palette,
      selectDay,
      selectedDate,
      weekdayLabels,
    ],
  );

  const scrollToMonth = (next: number) => {
    targetMonth.current = next;
    setMonth(next);
    listRef.current?.scrollTo({
      x: (next - 1) * pageWidth,
      animated: !reduceMotion,
    });
  };
  const moveMonth = (direction: number) => {
    const next = navigation.move(direction, !reduceMotion);
    if (next !== null) scrollToMonth(next);
  };
  const finishPaging = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.max(
      1,
      Math.min(
        12,
        Math.round(event.nativeEvent.contentOffset.x / pageWidth) + 1,
      ),
    );
    const target = navigation.settle(next, !reduceMotion);
    if (target === null) return;
    targetMonth.current = target;
    setMonth(target);
    if (target !== next) scrollToMonth(target);
  };

  return (
    <Modal
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      visible
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessible={false}
          testID="date-picker-backdrop"
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.dialog,
            {
              width: pageWidth + 26,
              maxHeight: height - insets.top - insets.bottom - 32,
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: palette.title }]}>{title}</Text>
          {startDate || endDate ? (
            <View style={styles.rangeSummary}>
              {(['start', 'end'] as const).map(field => {
                const date = field === 'start' ? startDate : endDate;
                return (
                  <View key={field} style={styles.rangeEndpoint}>
                    <Text
                      style={[
                        styles.rangeLabel,
                        field === 'end' && styles.rangeEndText,
                        { color: palette.subtitle },
                      ]}
                    >
                      {getTranslation(
                        language,
                        field === 'start'
                          ? 'vacation.startDate'
                          : 'vacation.endDate',
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.rangeDate,
                        field === 'end' && styles.rangeEndText,
                        {
                          color: date
                            ? palette.selectedBorder
                            : palette.subtitle,
                        },
                      ]}
                    >
                      {date ? `${date.slice(8, 10)}.${date.slice(5, 7)}` : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          <View style={styles.navigation}>
            <IconCircleButton
              palette={palette}
              accessibilityLabel={getTranslation(
                language,
                'month.nav.previousMonth',
              )}
              onPress={month > 1 ? () => moveMonth(-1) : undefined}
            >
              <ChevronLeftIcon
                color={month > 1 ? palette.icon : palette.subtitle}
                size={20}
              />
            </IconCircleButton>
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.month, { color: palette.title }]}
            >
              {months[month - 1].label}
            </Text>
            <IconCircleButton
              palette={palette}
              accessibilityLabel={getTranslation(
                language,
                'month.nav.nextMonth',
              )}
              onPress={month < 12 ? () => moveMonth(1) : undefined}
            >
              <ChevronRightIcon
                color={month < 12 ? palette.icon : palette.subtitle}
                size={20}
              />
            </IconCircleButton>
          </View>
          <ScrollView
            style={styles.calendarBody}
            bounces={false}
            nestedScrollEnabled
          >
            <ScrollView
              ref={listRef}
              testID="date-picker-months"
              horizontal
              pagingEnabled
              nestedScrollEnabled
              bounces={false}
              overScrollMode="never"
              showsHorizontalScrollIndicator={false}
              contentOffset={initialOffset}
              removeClippedSubviews={false}
              onMomentumScrollEnd={finishPaging}
              onScrollBeginDrag={() => {
                navigation.beginDrag();
              }}
              onScrollEndDrag={event => {
                const offset = event.nativeEvent.contentOffset.x;
                if (
                  !event.nativeEvent.velocity?.x &&
                  Math.abs(
                    offset / pageWidth - Math.round(offset / pageWidth),
                  ) < 0.001
                ) {
                  finishPaging(event);
                }
              }}
              onLayout={() => {
                navigation.reset(targetMonth.current);
                listRef.current?.scrollTo({
                  x: (targetMonth.current - 1) * pageWidth,
                  animated: false,
                });
              }}
              style={{ width: pageWidth, height: calendarHeight }}
            >
              {months.map(detail => (
                <View
                  key={detail.month}
                  style={{ width: pageWidth }}
                  accessibilityElementsHidden={detail.month !== month}
                  importantForAccessibility={
                    detail.month === month ? 'auto' : 'no-hide-descendants'
                  }
                >
                  {Math.abs(detail.month - month) <= 1
                    ? renderMonth({ item: detail })
                    : null}
                </View>
              ))}
            </ScrollView>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.cancel}
          >
            <Text
              style={[styles.cancelText, { color: palette.selectedBorder }]}
            >
              {getTranslation(language, 'common.cancel')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  dialog: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  rangeSummary: { flexDirection: 'row', gap: 12, paddingHorizontal: 8 },
  rangeEndpoint: { flex: 1, gap: 2 },
  rangeLabel: { fontSize: 12 },
  rangeDate: { fontSize: 18, fontWeight: '700' },
  rangeEndText: { textAlign: 'right' },
  navigation: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  month: { flex: 1, fontSize: 22, fontWeight: '600', textAlign: 'center' },
  calendarBody: { flexShrink: 1 },
  cancel: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '600' },
});
