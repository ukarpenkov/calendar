import { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import Reanimated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

import {
  getDayImage,
  getDayTypeLabel,
  getHolidayDisplayName,
  getHolidayImageForMonth,
  isDateOnVacation,
  type CalendarDay,
  type CalendarPalette,
  type CalendarYearMonthDetails,
} from '../../../entities/calendar';
import { CalendarMonthGrid } from '../../../entities/calendar/ui/CalendarMonthGrid';
import type { VacationPeriod } from '../../../features/vacation/model';
import { getVacationColorForDate } from '../../../shared/lib/date/vacationRange';
import type { AppLanguage, TranslationKey } from '../../../shared/lib/i18n';
import { motion } from '../../../shared/lib/ui/motion';
import { HolidayBanner } from './HolidayBanner';
import { MonthResponsiveLayout } from './MonthResponsiveLayout';
import {
  getMonthCalendarScale,
  getMonthSideScale,
  type MonthDetailLayoutMetrics,
} from './monthDetailLayout';
import { styles } from './monthDetailStyles';

type LocalizationParams = Record<string, number | string>;

const selectedDayEnter = FadeInDown.duration(motion.change.duration)
  .withInitialValues({ transform: [{ translateY: 8 }] })
  .reduceMotion(ReduceMotion.System);

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
    for (const day of detail.days) {
      const color = getVacationColorForDate(day.date, vacationPeriods);
      if (color) {
        map.set(day.date, color);
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

  const banner = holidayImage ? (
    <View
      testID="month-holiday-banner"
      pointerEvents="none"
      style={styles.holidayBanner}
    >
      <HolidayBanner source={holidayImage} />
    </View>
  ) : null;

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
      testID="month-totals"
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
    <MonthResponsiveLayout
      month={detail.month}
      metrics={monthLayoutMetrics}
      banner={banner}
      calendar={calendarCard}
      summary={
        <>
          {totalsCard}
          {selectedDayCard}
        </>
      }
    />
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
const MemoizedTotalItem = memo(TotalItem);


export { MemoizedMonthDetailBody };
