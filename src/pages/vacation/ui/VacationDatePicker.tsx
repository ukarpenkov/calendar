import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
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
  title: string;
  palette: CalendarPalette;
  language: AppLanguage;
  onSelect: (date: string) => void;
  onClose: () => void;
};

const monthKey = (detail: CalendarMonthDetail) => String(detail.month);

export function VacationDatePicker({
  year,
  calendarDays,
  selectedDate,
  initialDate,
  minDate,
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
  const listRef = useRef<FlatList<CalendarMonthDetail>>(null);
  const [month, setMonth] = useState(() => {
    const date = selectedDate ?? initialDate;
    if (date && Number(date.slice(0, 4)) === year) {
      return Number(date.slice(5, 7));
    }
    const today = new Date();
    return today.getFullYear() === year ? today.getMonth() + 1 : 1;
  });
  const targetMonth = useRef(month);
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
  const selectDay = useCallback(
    (date: string) => {
      if (Number(date.slice(0, 4)) === year && (!minDate || date >= minDate)) {
        onSelect(date);
      }
    },
    [minDate, onSelect, year],
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
          onSelectDay={selectDay}
          preserveDayTypeOnSelection
        />
      </View>
    ),
    [
      calendarScale,
      language,
      minDate,
      pageWidth,
      palette,
      selectDay,
      selectedDate,
      weekdayLabels,
    ],
  );

  const moveMonth = (direction: number) => {
    const next = Math.max(1, Math.min(12, targetMonth.current + direction));
    targetMonth.current = next;
    setMonth(next);
    listRef.current?.scrollToOffset({
      offset: (next - 1) * pageWidth,
      animated: true,
    });
  };
  const finishPaging = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.max(
      1,
      Math.min(
        12,
        Math.round(event.nativeEvent.contentOffset.x / pageWidth) + 1,
      ),
    );
    targetMonth.current = next;
    setMonth(next);
  };

  return (
    <Modal
      transparent
      animationType="fade"
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
            <FlatList
              key={pageWidth}
              ref={listRef}
              testID="date-picker-months"
              data={months}
              renderItem={renderMonth}
              keyExtractor={monthKey}
              horizontal
              pagingEnabled
              nestedScrollEnabled
              bounces={false}
              overScrollMode="never"
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={month - 1}
              getItemLayout={(_, index) => ({
                length: pageWidth,
                offset: pageWidth * index,
                index,
              })}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              windowSize={3}
              removeClippedSubviews={false}
              onMomentumScrollEnd={finishPaging}
              style={{ width: pageWidth, height: calendarHeight }}
            />
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
