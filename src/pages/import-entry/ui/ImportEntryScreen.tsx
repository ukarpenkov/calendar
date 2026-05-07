import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import { saveUserJsonImport, type CalendarYear } from '../../../entities/calendar';
import {
  CalendarImportSourceError,
  CalendarImportValidationError,
  pickAndPrepareCalendarImport,
  parseValidateAndNormalizeCalendarImport,
  type PreparedCalendarImport,
} from '../../../features/calendar-import';
import { LLM_CALENDAR_PROMPT } from '../../../features/calendar-import/model/llm-prompt';
import { layout } from '../../../shared/lib/ui/layout';
import { ArrowBackIcon } from '../../../shared/ui/icons/NavigationIcons';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';

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

type ImportPanel =
  | 'choose'
  | 'validating'
  | 'review'
  | 'confirm'
  | 'importing'
  | 'success'
  | 'error';

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

function getStepperIndex(panel: ImportPanel): number {
  if (panel === 'success') {
    return 3;
  }

  if (panel === 'choose' || panel === 'validating' || panel === 'error') {
    return 0;
  }

  if (panel === 'review') {
    return 1;
  }

  return 2;
}

export function ImportEntryScreen({
  activeYear,
  onBack,
  onImportCompleted,
}: ImportEntryScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { t } = useAppLocalization();
  const [panel, setPanel] = useState<ImportPanel>('choose');
  const [preparedImport, setPreparedImport] = useState<PreparedCalendarImport | null>(
    null,
  );
  const [successCalendar, setSuccessCalendar] = useState<CalendarYear | null>(null);
  const [blockingError, setBlockingError] = useState<ImportEntryErrorState | null>(
    null,
  );
  const [reviewError, setReviewError] = useState<ImportEntryErrorState | null>(null);
  const [pastedJsonText, setPastedJsonText] = useState('');
  const [pastedJsonError, setPastedJsonError] = useState<ImportEntryErrorState | null>(
    null,
  );
  const [promptCopied, setPromptCopied] = useState(false);

  const isBlockingAsync = panel === 'validating' || panel === 'importing';

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

  const goToChoose = () => {
    setPreparedImport(null);
    setBlockingError(null);
    setReviewError(null);
    setPastedJsonText('');
    setPastedJsonError(null);
    setSuccessCalendar(null);
    setPanel('choose');
  };

  const handleHeaderBack = () => {
    if (isBlockingAsync) {
      return;
    }

    if (panel === 'confirm') {
      setPanel('review');
      return;
    }

    if (panel === 'success' && successCalendar) {
      onImportCompleted(successCalendar);
      return;
    }

    if (panel === 'error') {
      goToChoose();
      return;
    }

    onBack();
  };

  const handlePickFile = () => {
    if (isBlockingAsync) {
      return;
    }

    setBlockingError(null);
    setReviewError(null);
    setPastedJsonError(null);
    setPreparedImport(null);
    setPanel('validating');

    pickAndPrepareCalendarImport()
      .then(nextImport => {
        if (!nextImport) {
          setPanel('choose');
          return;
        }

        setPreparedImport(nextImport);
        setPanel('review');
      })
      .catch(error => {
        setBlockingError(describeImportError(error));
        setPanel('error');
      });
  };

  const handlePickAnotherFromReview = () => {
    if (isBlockingAsync) {
      return;
    }

    setReviewError(null);
    setPanel('validating');

    pickAndPrepareCalendarImport()
      .then(nextImport => {
        if (!nextImport) {
          setPanel('review');
          return;
        }

        setPreparedImport(nextImport);
        setPanel('review');
      })
      .catch(error => {
        setBlockingError(describeImportError(error));
        setPanel('error');
      });
  };

  const applyPreparedImport = () => {
    if (!preparedImport || isBlockingAsync) {
      return;
    }

    setReviewError(null);
    setPanel('importing');

    saveUserJsonImport(preparedImport.calendar)
      .then(() => {
        setSuccessCalendar(preparedImport.calendar);
        setPanel('success');
        onImportCompleted(preparedImport.calendar);
      })
      .catch(() => {
        setReviewError({
          title: t('importEntry.error.replaceTitle'),
          body: t('importEntry.error.replaceBody'),
          details: [t('importEntry.error.replaceDetail')],
        });
        setPanel('review');
      });
  };

  const openConfirm = () => {
    if (!preparedImport || isBlockingAsync) {
      return;
    }

    setReviewError(null);
    setPanel('confirm');
  };

  const retryReplaceFromReview = () => {
    if (!preparedImport || isBlockingAsync) {
      return;
    }

    setReviewError(null);
    applyPreparedImport();
  };

  const prepareImportFromText = (jsonText: string): PreparedCalendarImport => {
    const trimmedJson = jsonText.trim();
    const calendar = parseValidateAndNormalizeCalendarImport(trimmedJson);

    return {
      file: {
        uri: 'clipboard://calendar-import.json',
        name: t('importEntry.textJson.sourceName'),
        type: 'application/json',
        size: trimmedJson.length,
      },
      calendar,
    };
  };

  const tryPrepareImportFromText = (jsonText: string) => {
    const trimmedJson = jsonText.trim();

    setPastedJsonText(jsonText);
    setPastedJsonError(null);

    if (!trimmedJson) {
      return;
    }

    if (!trimmedJson.startsWith('{') || !trimmedJson.endsWith('}')) {
      return;
    }

    try {
      const nextImport = prepareImportFromText(trimmedJson);
      setBlockingError(null);
      setReviewError(null);
      setPreparedImport(nextImport);
      setPanel('review');
    } catch (error) {
      setPastedJsonError(describeImportError(error));
    }
  };

  const pasteJsonFromClipboard = () => {
    Clipboard.getString().then(clipboardText => {
      tryPrepareImportFromText(clipboardText);
    });
  };

  const headerBackDisabled = isBlockingAsync;
  const stepperIndex = getStepperIndex(panel);

  const handleCopyPrompt = () => {
    Clipboard.setString(LLM_CALENDAR_PROMPT);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 3000);
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + layout.safeAreaTopExtra,
        },
      ]}
    >
      <View style={styles.appBar}>
        <IconCircleButton
          onPress={headerBackDisabled ? undefined : handleHeaderBack}
          palette={palette}
          accessibilityLabel={t('common.navigateBack')}
          variant="back"
        >
          <ArrowBackIcon color={palette.icon} size={20} />
        </IconCircleButton>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {t('importEntry.title')}
        </Text>
        <View style={styles.appBarTrailing} />
      </View>

      <ImportStepper
        currentIndex={stepperIndex}
        palette={palette}
        labels={[
          t('importEntry.step.file'),
          t('importEntry.step.preview'),
          t('importEntry.step.confirm'),
        ]}
      />

      <View style={styles.body}>
        {panel === 'choose' ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollBody,
              { paddingBottom: safeAreaInsets.bottom + layout.settingsScrollBottom },
            ]}
            keyboardShouldPersistTaps="handled"
          >
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
                {t('importEntry.choose.headline')}
              </Text>
              <Text style={[styles.heroSubtitle, { color: palette.subtitle }]}>
                {t('importEntry.choose.supporting')}
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
              <Text style={[styles.yearBadge, { color: palette.title }]}>
                {activeYear}
              </Text>
            </View>

            <View
              style={[
                styles.aiPromptCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: palette.title }]}>
                {t('importEntry.aiPrompt.title')}
              </Text>
              <Text style={[styles.cardBody, { color: palette.subtitle }]}>
                {t('importEntry.aiPrompt.description')}
              </Text>
              <ActionButton
                label={
                  promptCopied
                    ? t('importEntry.aiPrompt.copied')
                    : t('importEntry.aiPrompt.copyButton')
                }
                onPress={handleCopyPrompt}
                disabled={false}
                palette={palette}
                variant="default"
              />
            </View>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: pastedJsonError ? palette.holidayBorder : palette.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: palette.title }]}>
                {t('importEntry.textJson.title')}
              </Text>
              <Text style={[styles.cardBody, { color: palette.subtitle }]}>
                {t('importEntry.textJson.description')}
              </Text>
              <TextInput
                value={pastedJsonText}
                onChangeText={tryPrepareImportFromText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={t('importEntry.textJson.placeholder')}
                placeholderTextColor={palette.subtitle}
                style={[
                  styles.jsonTextArea,
                  {
                    backgroundColor: palette.surfaceMuted,
                    borderColor: palette.border,
                    color: palette.title,
                  },
                ]}
              />
              {pastedJsonError ? (
                <View style={styles.errorList}>
                  <Text style={[styles.errorText, { color: palette.subtitle }]}>
                    {pastedJsonError.body}
                  </Text>
                  {pastedJsonError.details.map(detail => (
                    <Text
                      key={detail}
                      style={[styles.errorText, { color: palette.subtitle }]}
                    >
                      {`\u2022 ${detail}`}
                    </Text>
                  ))}
                </View>
              ) : null}
              <GhostButton
                label={t('importEntry.textJson.pasteButton')}
                onPress={pasteJsonFromClipboard}
                palette={palette}
              />
            </View>

            <ActionButton
              label={t('importEntry.actions.chooseFile')}
              onPress={handlePickFile}
              disabled={false}
              palette={palette}
            />

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
        ) : null}

        {panel === 'validating' ? (
          <CenteredState
            palette={palette}
            bottomInset={safeAreaInsets.bottom + layout.settingsScrollBottom}
            headline={t('importEntry.validating.headline')}
            supporting={t('importEntry.validating.supporting')}
            showSpinner
          />
        ) : null}

        {panel === 'review' && preparedImport && previewStats ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollBody,
              { paddingBottom: safeAreaInsets.bottom + layout.settingsScrollBottom },
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
        ) : null}

        {panel === 'confirm' && preparedImport ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollBody,
              { paddingBottom: safeAreaInsets.bottom + layout.settingsScrollBottom },
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
              onPress={() => setPanel('review')}
              palette={palette}
            />
          </ScrollView>
        ) : null}

        {panel === 'importing' ? (
          <CenteredState
            palette={palette}
            bottomInset={safeAreaInsets.bottom + layout.settingsScrollBottom}
            headline={t('importEntry.importing.headline')}
            supporting={t('importEntry.importing.supporting')}
            showSpinner
          />
        ) : null}

        {panel === 'success' && successCalendar ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollBody,
              styles.successScroll,
              { paddingBottom: safeAreaInsets.bottom + layout.settingsScrollBottom },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.successMark, { color: palette.selectedBorder }]}>✓</Text>
            <Text style={[styles.panelHeadline, { color: palette.title }]}>
              {t('importEntry.success.headline')}
            </Text>
            <Text style={[styles.panelSupporting, { color: palette.subtitle }]}>
              {t('importEntry.success.supporting', { year: successCalendar.year })}
            </Text>
            <ActionButton
              label={t('importEntry.success.toCalendar')}
              onPress={() => onImportCompleted(successCalendar)}
              disabled={false}
              palette={palette}
            />
          </ScrollView>
        ) : null}

        {panel === 'error' && blockingError ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollBody,
              styles.successScroll,
              { paddingBottom: safeAreaInsets.bottom + layout.settingsScrollBottom },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.errorMark, { color: palette.holidayBorder }]}>!</Text>
            <Text style={[styles.panelHeadline, { color: palette.title }]}>
              {blockingError.title}
            </Text>
            <Text style={[styles.panelSupporting, { color: palette.subtitle }]}>
              {blockingError.body}
            </Text>
            <View style={styles.errorList}>
              {blockingError.details.map(detail => (
                <Text
                  key={detail}
                  style={[styles.errorText, { color: palette.subtitle }]}
                >
                  {`\u2022 ${detail}`}
                </Text>
              ))}
            </View>
            <ActionButton
              label={t('importEntry.error.pickAnotherFile')}
              onPress={handlePickFile}
              disabled={false}
              palette={palette}
            />
            <GhostButton
              label={t('importEntry.error.startOver')}
              onPress={goToChoose}
              palette={palette}
            />
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

type ImportStepperProps = {
  currentIndex: number;
  labels: [string, string, string];
  palette: ReturnType<typeof useAppTheme>['palette'];
};

function ImportStepper({ currentIndex, labels, palette }: ImportStepperProps) {
  return (
    <View style={styles.stepperRow}>
      {labels.map((label, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        const circleStyle = isComplete
          ? { backgroundColor: palette.selectedBorder, borderColor: palette.selectedBorder }
          : isCurrent
            ? { backgroundColor: palette.surface, borderColor: palette.selectedBorder }
            : { backgroundColor: palette.surfaceMuted, borderColor: palette.border };

        const textColor = isComplete || isCurrent ? palette.title : palette.subtitle;

        return (
          <View key={label} style={styles.stepperSegment}>
            <View style={styles.stepperNode}>
              <View style={[styles.stepperCircle, circleStyle]}>
                <Text
                  style={[
                    styles.stepperCircleText,
                    { color: isComplete ? '#FFFFFF' : textColor },
                  ]}
                >
                  {isComplete ? '✓' : index + 1}
                </Text>
              </View>
              <Text style={[styles.stepperLabel, { color: textColor }]} numberOfLines={2}>
                {label}
              </Text>
            </View>
            {index < labels.length - 1 ? (
              <View
                style={[
                  styles.stepperConnector,
                  {
                    backgroundColor:
                      index < currentIndex ? palette.selectedBorder : palette.border,
                  },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

type CenteredStateProps = {
  palette: ReturnType<typeof useAppTheme>['palette'];
  bottomInset: number;
  headline: string;
  supporting: string;
  showSpinner: boolean;
};

function CenteredState({
  palette,
  bottomInset,
  headline,
  supporting,
  showSpinner,
}: CenteredStateProps) {
  return (
    <View style={[styles.centeredWrap, { paddingBottom: bottomInset }]}>
      {showSpinner ? (
        <ActivityIndicator size="large" color={palette.selectedBorder} />
      ) : null}
      <Text style={[styles.centeredHeadline, { color: palette.title }]}>{headline}</Text>
      <Text style={[styles.centeredSupporting, { color: palette.subtitle }]}>
        {supporting}
      </Text>
    </View>
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
      disabled={disabled || isBusy}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          opacity: disabled || isBusy ? 0.7 : pressed ? 0.9 : 1,
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

type GhostButtonProps = {
  label: string;
  onPress: () => void;
  palette: ReturnType<typeof useAppTheme>['palette'];
};

function GhostButton({ label, onPress, palette }: GhostButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghostButton,
        {
          borderColor: palette.border,
          backgroundColor: palette.surface,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.ghostButtonText, { color: palette.title }]}>{label}</Text>
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
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: layout.screenPaddingH,
    gap: layout.contentStackGap,
  },
  successScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: layout.screenPaddingH,
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: 12,
  },
  stepperSegment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepperNode: {
    alignItems: 'center',
    minWidth: 68,
    maxWidth: 92,
  },
  stepperCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepperLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepperConnector: {
    width: 72,
    height: 2,
    marginTop: 15,
    marginHorizontal: 8,
    borderRadius: 1,
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
    fontSize: 22,
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
  aiPromptCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  jsonTextArea: {
    height: 92,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    lineHeight: 18,
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
  panelHeadline: {
    fontSize: 22,
    fontWeight: '700',
  },
  panelSupporting: {
    fontSize: 15,
    lineHeight: 22,
  },
  confirmCompare: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  ghostButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorList: {
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  centeredWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
    gap: 16,
  },
  centeredHeadline: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  centeredSupporting: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  successMark: {
    fontSize: 56,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMark: {
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
  },
});
