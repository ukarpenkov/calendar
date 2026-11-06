import { ScrollView, Text, TextInput, View } from 'react-native';

import type { CalendarPalette } from '../../../entities/calendar';
import type { TranslationKey } from '../../../shared/lib/i18n';
import { ActionButton, GhostButton } from './ImportEntryChrome';
import type { ImportEntryErrorState } from './importEntryModel';
import { styles } from './importEntryStyles';

type Translate = (key: TranslationKey, params?: Record<string, number | string>) => string;

type ImportChoosePanelProps = {
  activeYear: number;
  palette: CalendarPalette;
  t: Translate;
  bottomInset: number;
  promptCopied: boolean;
  handleCopyPrompt: () => void;
  pastedJsonText: string;
  tryPrepareImportFromText: (value: string) => void;
  pastedJsonError: ImportEntryErrorState | null;
  pasteJsonFromClipboard: () => void;
  handlePickFile: () => void;
};

export function ImportChoosePanel({
    activeYear,
    palette,
    t,
    bottomInset,
    promptCopied,
    handleCopyPrompt,
    pastedJsonText,
    tryPrepareImportFromText,
    pastedJsonError,
    pasteJsonFromClipboard,
    handlePickFile,
}: ImportChoosePanelProps) {
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
  );
}
