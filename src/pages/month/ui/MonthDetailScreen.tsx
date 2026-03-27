import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  buildMonthDetail,
  getDayTypeColors,
  getDayTypeLabel,
  type CalendarPalette,
  type CalendarDay,
} from '../../../entities/calendar';
import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import { getShortWeekdayLabels } from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
import {
  ArrowBackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../shared/ui/icons/NavigationIcons';
import { SettingsGearButton } from '../../../shared/ui/SettingsGearButton';

type MonthDetailScreenProps = {
  year: number;
  month: number;
  days: CalendarDay[];
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenPreviousMonth?: () => void;
  onOpenNextMonth?: () => void;
};

export function MonthDetailScreen({
  year,
  month,
  days,
  onBack,
  onOpenSettings,
  onOpenPreviousMonth,
  onOpenNextMonth,
}: MonthDetailScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { language, t } = useAppLocalization();
  const detail = useMemo(
    () => buildMonthDetail(year, month, days, language),
    [days, language, month, year],
  );
  const weekdayLabels = getShortWeekdayLabels(language);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(detail.days[0]?.date ?? null);
  }, [detail.days]);

  const selectedDay =
    detail.days.find(day => day.date === selectedDate) ?? detail.days[0] ?? null;

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + layout.safeAreaTopExtra,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: safeAreaInsets.bottom + layout.yearMonthScrollBottom,
        },
      ]}
    >
      <View style={styles.appBar}>
        <View style={[styles.appBarSide, styles.appBarSideStart]}>
          <IconCircleButton
            onPress={onBack}
            palette={palette}
            accessibilityLabel={t('common.backToYear')}
          >
            <ArrowBackIcon color={palette.icon} size={20} />
          </IconCircleButton>
        </View>
        <View style={styles.appBarTitleWrap}>
          <Text style={[styles.appBarTitle, { color: palette.title }]}>
            {detail.shortLabel} {detail.year}
          </Text>
        </View>
        <View style={[styles.appBarSide, styles.appBarActions]}>
          <IconCircleButton
            onPress={onOpenPreviousMonth}
            palette={palette}
            accessibilityLabel={t('month.nav.previousMonth')}
          >
            <ChevronLeftIcon
              color={onOpenPreviousMonth ? palette.icon : palette.subtitle}
              size={20}
            />
          </IconCircleButton>
          <IconCircleButton
            onPress={onOpenNextMonth}
            palette={palette}
            accessibilityLabel={t('month.nav.nextMonth')}
          >
            <ChevronRightIcon
              color={onOpenNextMonth ? palette.icon : palette.subtitle}
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

      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.headerEyebrow, { color: palette.subtitle }]}>
          {t('month.header.eyebrow')}
        </Text>
        <Text style={[styles.headerTitle, { color: palette.title }]}>
          {detail.label} {detail.year}
        </Text>
        <Text style={[styles.headerSubtitle, { color: palette.subtitle }]}>
          {t('month.header.subtitle')}
        </Text>
      </View>

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
              style={[styles.weekdayLabel, { color: palette.subtitle }]}
            >
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.weeksList}>
          {detail.weeks.map(week => (
            <View key={`${detail.month}-${week.isoWeek}`} style={styles.weekRow}>
              {week.days.map((day, dayIndex) => (
                <MonthDetailDayCell
                  key={`${detail.month}-${week.isoWeek}-${dayIndex}`}
                  day={day}
                  isSelected={day?.date === selectedDay?.date}
                  palette={palette}
                  onPress={() => {
                    if (day) {
                      setSelectedDate(day.date);
                    }
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

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
          <Text style={[styles.selectedDayEyebrow, { color: palette.subtitle }]}>
            {t('month.selectedDay.eyebrow')}
          </Text>
          <Text style={[styles.selectedDayTitle, { color: palette.title }]}>
            {detail.label} {selectedDay.day}
          </Text>
          <Text style={[styles.selectedDayMeta, { color: palette.subtitle }]}>
            {getDayTypeLabel(selectedDay.type, language)} - {selectedDay.workHours}{' '}
            {t('common.hoursUnit')}
          </Text>
          {selectedDay.holidayNameRu || selectedDay.holidayNameEn ? (
            <Text style={[styles.selectedDayHoliday, { color: palette.title }]}>
              {language === 'ru'
                ? selectedDay.holidayNameRu ?? selectedDay.holidayNameEn
                : selectedDay.holidayNameEn ?? selectedDay.holidayNameRu}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.totalsGrid}>
        <TotalCard
          label={t('month.totals.totalDays')}
          value={String(detail.totalDays)}
          palette={palette}
        />
        <TotalCard
          label={t('month.totals.workingDays')}
          value={String(detail.workingDays)}
          palette={palette}
        />
        <TotalCard
          label={t('month.totals.nonWorkingDays')}
          value={String(detail.nonWorkingDays)}
          palette={palette}
        />
        <TotalCard
          label={t('month.totals.workHours')}
          value={`${detail.workHours} ${t('common.hoursUnit')}`}
          palette={palette}
        />
      </View>
    </ScrollView>
  );
}

type MonthDetailDayCellProps = {
  day: CalendarDay | null;
  isSelected: boolean;
  palette: CalendarPalette;
  onPress: () => void;
};

function MonthDetailDayCell({
  day,
  isSelected,
  palette,
  onPress,
}: MonthDetailDayCellProps) {
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
          backgroundColor: isSelected
            ? palette.selectedFill
            : colors.backgroundColor,
          borderColor: isSelected ? palette.selectedBorder : colors.borderColor,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.dayCellText,
          {
            color: isSelected ? palette.title : colors.color,
          },
        ]}
      >
        {day.day}
      </Text>
    </Pressable>
  );
}

type TotalCardProps = {
  label: string;
  value: string;
  palette: CalendarPalette;
};

function TotalCard({ label, value, palette }: TotalCardProps) {
  return (
    <View
      style={[
        styles.totalCard,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <Text style={[styles.totalLabel, { color: palette.subtitle }]}>{label}</Text>
      <Text style={[styles.totalValue, { color: palette.title }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    gap: layout.contentStackGap,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    gap: 12,
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
  },
  appBarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
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
    padding: 16,
    gap: 6,
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
  totalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  totalCard: {
    width: '47%',
    minWidth: 160,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },
});
