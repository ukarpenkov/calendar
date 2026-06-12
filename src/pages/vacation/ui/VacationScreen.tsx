import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CalendarDay, CalendarPalette } from '../../../entities/calendar';
import type { VacationPeriod } from '../../../features/vacation/model';
import { getVacationDaysInRange } from '../../../features/vacation/lib';
import type { AppLanguage } from '../../../shared/lib/i18n';
import { getTranslation } from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
import { ArrowBackIcon } from '../../../shared/ui/icons/NavigationIcons';
import { VacationBalance } from './VacationBalance';
import { VacationLegend } from './VacationLegend';
import { VacationPeriodCard } from './VacationPeriodCard';
import { VacationYearCalendar } from './VacationYearCalendar';

type VacationScreenProps = {
  year: number;
  calendarDays: CalendarDay[];
  vacationPeriods: VacationPeriod[];
  palette: CalendarPalette;
  language: AppLanguage;
  onBack: () => void;
  onAdd: () => void;
  onEdit: (period: VacationPeriod) => void;
};

type Tab = 'calendar' | 'list';

export function VacationScreen({
  year,
  calendarDays,
  vacationPeriods,
  palette,
  language,
  onBack,
  onAdd,
  onEdit,
}: VacationScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('calendar');

  const t = (key: Parameters<typeof getTranslation>[1]) =>
    getTranslation(language, key);

  const usedWorkDays = vacationPeriods.reduce((sum, p) => {
    const { workDays } = getVacationDaysInRange(p.startDate, p.endDate, calendarDays);
    return sum + workDays;
  }, 0);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + layout.safeAreaTopExtra,
        },
      ]}
    >
      <View style={[styles.appBar, { paddingHorizontal: layout.screenPaddingH }]}>
        <IconCircleButton
          onPress={onBack}
          palette={palette}
          accessibilityLabel={t('common.navigateBack')}
          variant="back"
        >
          <ArrowBackIcon color={palette.icon} size={20} />
        </IconCircleButton>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {t('vacation.title')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('vacation.addTitle')}
          testID="vacation-add"
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addButton,
            { borderColor: palette.border, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.addButtonText, { color: palette.title }]}>+</Text>
        </Pressable>
      </View>

      <View style={[styles.tabs, { paddingHorizontal: layout.screenPaddingH }]}>
        <TabButton
          label={t('vacation.calendar')}
          isActive={activeTab === 'calendar'}
          palette={palette}
          onPress={() => setActiveTab('calendar')}
        />
        <TabButton
          label={t('vacation.list')}
          isActive={activeTab === 'list'}
          palette={palette}
          onPress={() => setActiveTab('list')}
        />
      </View>

      <View style={styles.balanceWrapper}>
        <VacationBalance
          usedWorkDays={usedWorkDays}
          totalAllowed={28}
          palette={palette}
          language={language}
        />
      </View>

      <View style={styles.content}>
        {activeTab === 'calendar' ? (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: safeAreaInsets.bottom + 20,
            }}
          >
            <VacationYearCalendar
              year={year}
              calendarDays={calendarDays}
              vacationPeriods={vacationPeriods}
              palette={palette}
              language={language}
            />
            <VacationLegend palette={palette} language={language} />
          </ScrollView>
        ) : vacationPeriods.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={{ color: palette.subtitle }}>{t('vacation.empty')}</Text>
          </View>
        ) : (
          <FlatList
            data={vacationPeriods}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingHorizontal: layout.screenPaddingH,
                paddingBottom: safeAreaInsets.bottom + 20,
              },
            ]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={
              <VacationLegend palette={palette} language={language} />
            }
            renderItem={({ item }) => {
              const { totalDays, workDays } = getVacationDaysInRange(
                item.startDate,
                item.endDate,
                calendarDays,
              );
              return (
                <VacationPeriodCard
                  period={item}
                  workDays={workDays}
                  totalDays={totalDays}
                  onPress={onEdit}
                  language={language}
                />
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

function TabButton({
  label,
  isActive,
  palette,
  onPress,
}: {
  label: string;
  isActive: boolean;
  palette: CalendarPalette;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        {
          backgroundColor: isActive ? palette.surface : 'transparent',
          borderColor: isActive ? palette.border : 'transparent',
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.tabLabel,
          { color: isActive ? palette.title : palette.subtitle },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  balanceWrapper: {
    paddingHorizontal: 0,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    gap: 0,
  },
  separator: {
    height: 10,
  },
});
