import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppLocalization } from '../../../shared/lib/localization';
import { useAppTheme } from '../../../shared/lib/theme';
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
import {
  getImportPreviewStats,
  getStepperIndex,
  type ImportEntryErrorState,
  type ImportPanel,
} from './importEntryModel';
import {
  ActionButton,
  CenteredState,
  GhostButton,
  ImportStepper,
} from './ImportEntryChrome';
import { styles } from './importEntryStyles';
import { ImportChoosePanel } from './ImportChoosePanel';
import { ImportConfirmPanel } from './ImportConfirmPanel';
import { ImportReviewPanel } from './ImportReviewPanel';
import { ArrowBackIcon } from '../../../shared/ui/icons/NavigationIcons';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';

type ImportEntryScreenProps = {
  activeYear: number;
  onBack: () => void;
  onImportCompleted: (calendar: CalendarYear) => void;
};

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
          <ImportChoosePanel
            activeYear={activeYear}
            palette={palette}
            t={t}
            bottomInset={safeAreaInsets.bottom + layout.settingsScrollBottom}
            promptCopied={promptCopied}
            handleCopyPrompt={handleCopyPrompt}
            pastedJsonText={pastedJsonText}
            tryPrepareImportFromText={tryPrepareImportFromText}
            pastedJsonError={pastedJsonError}
            pasteJsonFromClipboard={pasteJsonFromClipboard}
            handlePickFile={handlePickFile}
          />
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
          <ImportReviewPanel
            palette={palette}
            t={t}
            bottomInset={safeAreaInsets.bottom + layout.settingsScrollBottom}
            preparedImport={preparedImport}
            previewStats={previewStats}
            reviewError={reviewError}
            retryReplaceFromReview={retryReplaceFromReview}
            openConfirm={openConfirm}
            handlePickAnotherFromReview={handlePickAnotherFromReview}
          />
        ) : null}

        {panel === 'confirm' && preparedImport ? (
          <ImportConfirmPanel
            palette={palette}
            t={t}
            bottomInset={safeAreaInsets.bottom + layout.settingsScrollBottom}
            activeYear={activeYear}
            preparedImport={preparedImport}
            applyPreparedImport={applyPreparedImport}
            onBackToReview={() => setPanel('review')}
          />
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

