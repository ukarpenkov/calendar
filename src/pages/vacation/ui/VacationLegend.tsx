import { StyleSheet, Text, View } from 'react-native';

import type { CalendarPalette } from '../../../entities/calendar/lib/presentation';
import type { AppLanguage } from '../../../shared/lib/i18n';
import { getTranslation } from '../../../shared/lib/i18n';

type LegendItem = {
  color: string;
  labelKey: Parameters<typeof getTranslation>[1];
};

const LEGEND_ITEMS: LegendItem[] = [
  { color: '#9CA3AF', labelKey: 'vacation.legend.workday' },
  { color: '#3B82F6', labelKey: 'vacation.legend.weekend' },
  { color: '#EF4444', labelKey: 'vacation.legend.holiday' },
  { color: '#F59E0B', labelKey: 'vacation.legend.shortened' },
  { color: '#2DD4BF', labelKey: 'vacation.legend.vacation' },
];

type VacationLegendProps = {
  palette: CalendarPalette;
  language: AppLanguage;
};

export function VacationLegend({ palette, language }: VacationLegendProps) {
  const t = (key: Parameters<typeof getTranslation>[1]) =>
    getTranslation(language, key);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: palette.title }]}>
        {t('vacation.legend.title')}
      </Text>
      <View style={styles.items}>
        {LEGEND_ITEMS.map(item => (
          <View key={item.labelKey} style={styles.item}>
            <View style={[styles.swatch, { backgroundColor: item.color }]} />
            <Text style={[styles.label, { color: palette.subtitle }]}>
              {t(item.labelKey)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
  },
});
