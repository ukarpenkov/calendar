import { ScrollView, Text, View } from 'react-native';

import type { CalendarPalette } from '../../../entities/calendar';
import type { PreparedCalendarImport } from '../../../features/calendar-import';
import type { TranslationKey } from '../../../shared/lib/i18n';
import { ActionButton, InfoRow } from './ImportEntryChrome';
import { formatFileSize, type ImportEntryErrorState } from './importEntryModel';
import { styles } from './importEntryStyles';

type Translate = (key: TranslationKey, params?: Record<string, number | string>) => string;

type ImportReviewPanelProps = {
  palette: CalendarPalette;
  t: Translate;
  bottomInset: number;
  preparedImport: PreparedCalendarImport;
  previewStats: { totalDays: number; workingDays: number; nonWorkingDays: number; workHours: number };
  reviewError: ImportEntryErrorState | null;
  retryReplaceFromReview: () => void;
  openConfirm: () => void;
  handlePickAnotherFromReview: () => void;
};

export function ImportReviewPanel({
    palette,
    t,
    bottomInset,
    preparedImport,
    previewStats,
    reviewError,
    retryReplaceFromReview,
    openConfirm,
    handlePickAnotherFromReview,
}: ImportReviewPanelProps) {
  return (
          <ScrollView
            contentContainerStyle={[
              styles.scrollBody,
              { paddingBottom: bottomInset },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.panelHeadline, { color: palette.title }]}>
              {t('importEntry.review.headline')}
            </Text>
            <Text style={[styles.panelSupporting, { color: palette.subtitle }]}>
              {t('importEntry.review.supporting')}
            </Text>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: palette.title }]}>
                {t('importEntry.fileCard.title')}
              </Text>
              <Text style={[styles.cardBody, { color: palette.subtitle }]}>
                {t('importEntry.fileCard.readySubtitle')}
              </Text>
              <View style={styles.detailList}>
                <InfoRow
                  label={t('importEntry.fileCard.fileName')}
                  value={preparedImport.file.name}
                  palette={palette}
                />
                <InfoRow
                  label={t('importEntry.fileCard.detectedYear')}
                  value={String(preparedImport.calendar.year)}
                  palette={palette}
                />
                {formatFileSize(preparedImport.file.size) ? (
                  <InfoRow
                    label={t('importEntry.fileCard.fileSize')}
                    value={formatFileSize(preparedImport.file.size)!}
                    palette={palette}
                  />
                ) : null}
              </View>
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
              <Text style={[styles.cardTitle, { color: palette.title }]}>
                {t('importEntry.preview.title')}
              </Text>
              <Text style={[styles.cardBody, { color: palette.subtitle }]}>
                {t('importEntry.preview.subtitle', {
                  year: preparedImport.calendar.year,
                })}
              </Text>
              <View style={styles.detailList}>
                <InfoRow
                  label={t('importEntry.preview.totalDays')}
                  value={String(previewStats.totalDays)}
                  palette={palette}
                />
                <InfoRow
                  label={t('importEntry.preview.workingDays')}
                  value={String(previewStats.workingDays)}
                  palette={palette}
                />
                <InfoRow
                  label={t('importEntry.preview.nonWorkingDays')}
                  value={String(previewStats.nonWorkingDays)}
                  palette={palette}
                />
                <InfoRow
                  label={t('importEntry.preview.workHours')}
                  value={String(previewStats.workHours)}
                  palette={palette}
                />
              </View>
            </View>

            {reviewError ? (
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
                  {reviewError.title}
                </Text>
                <Text style={[styles.cardBody, { color: palette.subtitle }]}>
                  {reviewError.body}
                </Text>
                <View style={styles.errorList}>
                  {reviewError.details.map(detail => (
                    <Text
                      key={detail}
                      style={[styles.errorText, { color: palette.subtitle }]}
                    >
                      {`\u2022 ${detail}`}
                    </Text>
                  ))}
                </View>
                <ActionButton
                  label={t('importEntry.error.tryAgain')}
                  onPress={retryReplaceFromReview}
                  disabled={false}
                  palette={palette}
                />
              </View>
            ) : null}

            <ActionButton
              label={t('importEntry.actions.replaceYear')}
              onPress={openConfirm}
              disabled={false}
              palette={palette}
              variant="danger"
            />
            <ActionButton
              label={t('importEntry.actions.chooseAnotherFile')}
              onPress={handlePickAnotherFromReview}
              disabled={false}
              palette={palette}
            />
          </ScrollView>
  );
}
