import { ScrollView, Text, View } from 'react-native';

import type { CalendarPalette } from '../../../entities/calendar';
import type { PreparedCalendarImport } from '../../../features/calendar-import';
import type { TranslationKey } from '../../../shared/lib/i18n';
import { ActionButton, GhostButton } from './ImportEntryChrome';
import { styles } from './importEntryStyles';

type Translate = (key: TranslationKey, params?: Record<string, number | string>) => string;

type ImportConfirmPanelProps = {
  palette: CalendarPalette;
  t: Translate;
  bottomInset: number;
  activeYear: number;
  preparedImport: PreparedCalendarImport;
  applyPreparedImport: () => void;
  onBackToReview: () => void;
};

export function ImportConfirmPanel({
    palette,
    t,
    bottomInset,
    activeYear,
    preparedImport,
    applyPreparedImport,
    onBackToReview,
}: ImportConfirmPanelProps) {
  return (
          <ScrollView
            contentContainerStyle={[
              styles.scrollBody,
              { paddingBottom: bottomInset },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.holidayBorder,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: palette.title }]}>
                {t('importEntry.confirm.screenTitle')}
              </Text>
              <Text style={[styles.confirmCompare, { color: palette.title }]}>
                {t('importEntry.confirm.compare', {
                  currentYear: activeYear,
                  importedYear: preparedImport.calendar.year,
                })}
              </Text>
              <Text style={[styles.cardBody, { color: palette.subtitle }]}>
                {t('importEntry.confirm.title')}
              </Text>
            </View>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.stepText, { color: palette.subtitle }]}>
                {`\u2022 ${t('importEntry.confirm.bullet1')}`}
              </Text>
              <Text style={[styles.stepText, { color: palette.subtitle }]}>
                {`\u2022 ${t('importEntry.confirm.bullet2')}`}
              </Text>
              <Text style={[styles.stepText, { color: palette.subtitle }]}>
                {`\u2022 ${t('importEntry.confirm.bullet3')}`}
              </Text>
            </View>

            <ActionButton
              label={t('importEntry.confirm.action')}
              onPress={applyPreparedImport}
              disabled={false}
              palette={palette}
              variant="danger"
            />
            <GhostButton
              label={t('importEntry.confirm.backToReview')}
              onPress={onBackToReview}
              palette={palette}
            />
          </ScrollView>
  );
}
