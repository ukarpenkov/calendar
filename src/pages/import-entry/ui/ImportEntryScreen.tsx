import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import { replaceActiveYear, type CalendarYear } from '../../../entities/calendar';
import {
  CalendarImportSourceError,
  CalendarImportValidationError,
  pickAndPrepareCalendarImport,
  type PreparedCalendarImport,
} from '../../../features/calendar-import';
import { layout } from '../../../shared/lib/ui/layout';

type ImportEntryScreenProps = {
  activeYear: number;
  onBack: () => void;
  onImportCompleted: (calendar: CalendarYear) => void;
};

type ImportEntryErrorState = {
  title: string;
  body: string;
  details: string[];
};

function formatFileSize(size: number | null): string | null {
  if (size === null || Number.isNaN(size)) {
    return null;
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getImportPreviewStats(calendar: CalendarYear) {
  return calendar.days.reduce(
    (summary, day) => {
      const isWorkingDay = day.type === 'workday' || day.type === 'shortened';

      return {
        totalDays: summary.totalDays + 1,
        workingDays: summary.workingDays + (isWorkingDay ? 1 : 0),
        nonWorkingDays: summary.nonWorkingDays + (isWorkingDay ? 0 : 1),
        workHours: summary.workHours + day.workHours,
      };
    },
    {
      totalDays: 0,
      workingDays: 0,
      nonWorkingDays: 0,
      workHours: 0,
    },
  );
}

export function ImportEntryScreen({
  activeYear,
  onBack,
  onImportCompleted,
}: ImportEntryScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { t } = useAppLocalization();
  const [phase, setPhase] = useState<'idle' | 'validating' | 'ready' | 'importing'>(
    'idle',
  );
  const [preparedImport, setPreparedImport] = useState<PreparedCalendarImport | null>(
    null,
  );
  const [errorState, setErrorState] = useState<ImportEntryErrorState | null>(null);
  const isBusy = phase === 'validating' || phase === 'importing';
  const previewStats = useMemo(
    () =>
      preparedImport ? getImportPreviewStats(preparedImport.calendar) : null,
    [preparedImport],
  );

  const describeImportError = (error: unknown): ImportEntryErrorState => {
    if (error instanceof CalendarImportValidationError) {
      return {
        title: t('importEntry.error.validationTitle'),
        body: t('importEntry.error.validationBody'),
        details:
          error.issues.length > 0
            ? error.issues.slice(0, 6).map(issue => issue.message)
            : [t('importEntry.error.genericDetail')],
      };
    }

    if (error instanceof CalendarImportSourceError) {
      if (error.code === 'UNSUPPORTED_FILE') {
        return {
          title: t('importEntry.error.unsupportedTitle'),
          body: t('importEntry.error.unsupportedBody'),
          details: [error.message],
        };
      }

      if (error.code === 'FILE_READ_FAILED') {
        return {
          title: t('importEntry.error.readTitle'),
          body: t('importEntry.error.readBody'),
          details: [error.message],
        };
      }

      return {
        title: t('importEntry.error.pickerTitle'),
        body: t('importEntry.error.pickerBody'),
        details: [error.message],
      };
    }

    return {
      title: t('importEntry.error.genericTitle'),
      body: t('importEntry.error.genericBody'),
      details: [t('importEntry.error.genericDetail')],
    };
  };

  const handlePickFile = () => {
    if (isBusy) {
      return;
    }

    setErrorState(null);
    setPreparedImport(null);
    setPhase('validating');

    pickAndPrepareCalendarImport()
      .then(nextImport => {
        if (!nextImport) {
          setPhase('idle');
          return;
        }

        setPreparedImport(nextImport);
        setPhase('ready');
      })
      .catch(error => {
        setPhase('idle');
        setErrorState(describeImportError(error));
      });
  };

  const applyPreparedImport = () => {
    if (!preparedImport) {
      return;
    }

    setErrorState(null);
    setPhase('importing');

    replaceActiveYear(preparedImport.calendar)
      .then(() => {
        onImportCompleted(preparedImport.calendar);
      })
      .catch(() => {
        setPhase('ready');
        setErrorState({
          title: t('importEntry.error.replaceTitle'),
          body: t('importEntry.error.replaceBody'),
          details: [t('importEntry.error.replaceDetail')],
        });
      });
  };

  const handleConfirmImport = () => {
    if (!preparedImport || isBusy) {
      return;
    }

    Alert.alert(
      t('importEntry.confirm.title'),
      t('importEntry.confirm.body', {
        currentYear: activeYear,
        importedYear: preparedImport.calendar.year,
      }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('importEntry.confirm.action'),
          style: 'destructive',
          onPress: applyPreparedImport,
        },
      ],
    );
  };

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
          paddingBottom: safeAreaInsets.bottom + layout.settingsScrollBottom,
        },
      ]}
    >
      <View style={styles.appBar}>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            {
              borderColor: palette.border,
              backgroundColor: palette.surface,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <Text style={[styles.backButtonText, { color: palette.icon }]}>{'<'}</Text>
        </Pressable>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {t('importEntry.title')}
        </Text>
        <View style={styles.appBarSpacer} />
      </View>

      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.eyebrow, { color: palette.subtitle }]}>
          {t('importEntry.eyebrow')}
        </Text>
        <Text style={[styles.heroTitle, { color: palette.title }]}>
          {t('importEntry.heroTitle')}
        </Text>
        <Text style={[styles.heroSubtitle, { color: palette.subtitle }]}>
          {t('importEntry.heroSubtitle')}
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
        <Text style={[styles.cardTitle, { color: palette.title }]}>
          {t('importEntry.currentYear.title')}
        </Text>
        <Text style={[styles.cardBody, { color: palette.subtitle }]}>
          {t('importEntry.currentYear.subtitle', { year: activeYear })}
        </Text>
        <Text style={[styles.yearBadge, { color: palette.title }]}>{activeYear}</Text>
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
          {t('importEntry.fileCard.title')}
        </Text>
        <Text style={[styles.cardBody, { color: palette.subtitle }]}>
          {preparedImport
            ? t('importEntry.fileCard.readySubtitle')
            : t('importEntry.fileCard.idleSubtitle')}
        </Text>
        {preparedImport ? (
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
        ) : null}
        <ActionButton
          label={
            phase === 'validating'
              ? t('importEntry.actions.validating')
              : preparedImport
                ? t('importEntry.actions.chooseAnotherFile')
                : t('importEntry.actions.chooseFile')
          }
          onPress={handlePickFile}
          disabled={isBusy}
          palette={palette}
          isBusy={phase === 'validating'}
        />
      </View>

      {preparedImport && previewStats ? (
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
          <ActionButton
            label={
              phase === 'importing'
                ? t('importEntry.actions.importing')
                : t('importEntry.actions.replaceYear')
            }
            onPress={handleConfirmImport}
            disabled={isBusy}
            palette={palette}
            isBusy={phase === 'importing'}
            variant="danger"
          />
        </View>
      ) : null}

      {errorState ? (
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
            {errorState.title}
          </Text>
          <Text style={[styles.cardBody, { color: palette.subtitle }]}>
            {errorState.body}
          </Text>
          <View style={styles.errorList}>
            {errorState.details.map(detail => (
              <Text
                key={detail}
                style={[styles.errorText, { color: palette.subtitle }]}
              >
                {`\u2022 ${detail}`}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

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
          {t('importEntry.flow.title')}
        </Text>
        <Text style={[styles.stepText, { color: palette.subtitle }]}>
          {t('importEntry.flow.step1')}
        </Text>
        <Text style={[styles.stepText, { color: palette.subtitle }]}>
          {t('importEntry.flow.step2')}
        </Text>
        <Text style={[styles.stepText, { color: palette.subtitle }]}>
          {t('importEntry.flow.step3')}
        </Text>
      </View>
    </ScrollView>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  isBusy?: boolean;
  palette: ReturnType<typeof useAppTheme>['palette'];
  variant?: 'default' | 'danger';
};

function ActionButton({
  label,
  onPress,
  disabled,
  isBusy = false,
  palette,
  variant = 'default',
}: ActionButtonProps) {
  const backgroundColor =
    variant === 'danger' ? palette.holidayBorder : palette.selectedBorder;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          opacity: disabled ? 0.7 : pressed ? 0.9 : 1,
        },
      ]}
    >
      {isBusy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.actionButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

function InfoRow({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: ReturnType<typeof useAppTheme>['palette'];
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: palette.subtitle }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: palette.title }]}>{value}</Text>
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
  },
  backButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  appBarSpacer: {
    width: 36,
    height: 36,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  yearBadge: {
    fontSize: 28,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailList: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  actionButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorList: {
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
