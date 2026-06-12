import { StyleSheet, Text, View } from 'react-native';

import type { CalendarPalette } from '../../../entities/calendar';
import type { AppLanguage } from '../../../shared/lib/i18n';
import { getTranslation } from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';

type VacationBalanceProps = {
  usedWorkDays: number;
  totalAllowed: number;
  palette: CalendarPalette;
  language: AppLanguage;
};

export function VacationBalance({
  usedWorkDays,
  totalAllowed,
  palette,
  language,
}: VacationBalanceProps) {
  const t = (key: Parameters<typeof getTranslation>[1]) =>
    getTranslation(language, key);

  const remaining = Math.max(0, totalAllowed - usedWorkDays);
  const ratio = totalAllowed > 0 ? Math.min(usedWorkDays / totalAllowed, 1) : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          marginHorizontal: layout.screenPaddingH,
        },
      ]}
    >
      <Text style={[styles.title, { color: palette.title }]}>
        {t('vacation.balance.title')}
      </Text>
      <View style={[styles.barTrack, { backgroundColor: palette.border }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: palette.vacationBorder,
            },
          ]}
        />
      </View>
      <Text style={[styles.remaining, { color: palette.subtitle }]}>
        {remaining} {t('vacation.balance.remaining')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  remaining: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'right',
  },
});
