import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CalendarDay, CalendarPalette } from '../../../entities/calendar';
import type { VacationPeriod } from '../../../features/vacation/model';
import { getVacationDaysInRange } from '../../../features/vacation/lib';
import type { AppLanguage } from '../../../shared/lib/i18n';
import { getTranslation } from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
import { ArrowBackIcon } from '../../../shared/ui/icons/NavigationIcons';
import { VacationPeriodCard } from './VacationPeriodCard';

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

export function VacationScreen({
  calendarDays,
  vacationPeriods,
  palette,
  language,
  onBack,
  onAdd,
  onEdit,
}: VacationScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();

  const t = (key: Parameters<typeof getTranslation>[1]) =>
    getTranslation(language, key);

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
        <View style={styles.appBarTrailing} />
      </View>

      <View style={styles.content}>
        {vacationPeriods.length === 0 ? (
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
                  palette={palette}
                />
              );
            }}
          />
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('vacation.addTitle')}
        testID="vacation-add"
        onPress={onAdd}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: palette.vacationFill,
            borderColor: palette.vacationBorder,
            bottom: safeAreaInsets.bottom + 24,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          },
        ]}
      >
        <Text style={[styles.fabText, { color: palette.vacationBorder }]}>+</Text>
      </Pressable>
    </View>
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
  appBarTrailing: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
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
    paddingTop: 16,
    gap: 0,
  },
  separator: {
    height: 10,
  },
});
