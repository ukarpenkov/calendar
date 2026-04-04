import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBundledCalendarRegion } from '../../../app/providers/bundled-calendar-region';
import { getActiveCalendarIsUserJsonImport } from '../../../entities/calendar';
import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import {
  openWorkingCalendarTelegram,
  WORKING_CALENDAR_TELEGRAM_PATH,
} from '../../../features/year-end-reminder';
import {
  AGREED_APP_LANGUAGE_CODES,
  // BUNDLED_CALENDAR_REGION_CODES,
  // type BundledCalendarRegionCode,
} from '../../../shared/config/agreedLanguagesAndBundledCalendars';
import {
  // getBundledRegionLabel,
  getLanguageLabel,
  getLanguageNativeLabel,
  getThemeModeLabel,
  type AppLanguage,
} from '../../../shared/lib/i18n';
import { layout } from '../../../shared/lib/ui/layout';
import {
  ArrowBackIcon,
  TelegramIcon,
} from '../../../shared/ui/icons/NavigationIcons';
import { IconCircleButton } from '../../../shared/ui/IconCircleButton';
// import { BundledCalendarSwitch } from '../../../shared/ui/BundledCalendarSwitch';
import { LanguageSwitch } from '../../../shared/ui/LanguageSwitch';
import { ThemeSwitch } from '../../../shared/ui/ThemeSwitch';

type SettingsScreenProps = {
  activeYear: number;
  onBack: () => void;
  onOpenImportEntry: () => void;
};

export function SettingsScreen({
  activeYear,
  onBack,
  onOpenImportEntry,
}: SettingsScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { isDarkMode, palette, themeMode, toggleTheme } = useAppTheme();
  const { language, setLanguage, t } = useAppLocalization();
  const { bundledCalendarRegion } = useBundledCalendarRegion();
  const [userJsonImportActive, setUserJsonImportActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getActiveCalendarIsUserJsonImport()
      .then(flag => {
        if (!cancelled) {
          setUserJsonImportActive(flag);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUserJsonImportActive(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeYear, bundledCalendarRegion]);

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
        <IconCircleButton
          onPress={onBack}
          palette={palette}
          accessibilityLabel={t('common.navigateBack')}
        >
          <ArrowBackIcon color={palette.icon} size={20} />
        </IconCircleButton>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {t('settings.title')}
        </Text>
        <View style={styles.appBarTrailing} />
      </View>

      <SectionCard
        title={t('settings.sections.calendarData.title')}
        subtitle={t('settings.sections.calendarData.subtitle')}
        palette={palette}
      >
        <SettingRow
          title={t('settings.rows.activeYear.title')}
          subtitle={t('settings.rows.activeYear.subtitle', { year: activeYear })}
          trailing={
            <Text style={[styles.badgeText, { color: palette.title }]}>
              {activeYear}
            </Text>
          }
          palette={palette}
        />
        <Divider palette={palette} />
        {/*
        <View style={styles.languageSettingBlock}>
          <View style={styles.rowCopy}>
            <Text style={[styles.rowTitle, { color: palette.title }]}>
              {t('settings.rows.bundledCalendar.title')}
            </Text>
            <Text style={[styles.rowSubtitle, { color: palette.subtitle }]}>
              {t('settings.rows.bundledCalendar.subtitle', {
                region: getBundledRegionLabel(language, bundledCalendarRegion),
              })}
            </Text>
          </View>
          <BundledCalendarSwitch
            selectedRegion={bundledCalendarRegion}
            onSelectRegion={setBundledCalendarRegion}
            palette={palette}
            labels={BUNDLED_CALENDAR_SWITCH_LABELS[language]}
          />
        </View>
        <Divider palette={palette} />
        */}
        <SettingRow
          title={t('settings.rows.importYear.title')}
          subtitle={t('settings.rows.importYear.subtitle')}
          trailing={
            <Text style={[styles.actionText, { color: palette.title }]}>
              {t('settings.rows.importYear.action')}
            </Text>
          }
          palette={palette}
          onPress={onOpenImportEntry}
        />
      </SectionCard>

      <SectionCard
        title={t('settings.sections.appearance.title')}
        subtitle={t('settings.sections.appearance.subtitle')}
        palette={palette}
      >
        <SettingRow
          title={t('settings.rows.darkTheme.title')}
          subtitle={t('settings.rows.darkTheme.subtitle', {
            mode: getThemeModeLabel(language, themeMode),
          })}
          trailing={
            <ThemeSwitch checked={isDarkMode} onPress={toggleTheme} />
          }
          palette={palette}
        />
      </SectionCard>

      <SectionCard
        title={t('settings.sections.localization.title')}
        subtitle={t('settings.sections.localization.subtitle')}
        palette={palette}
      >
        <View style={styles.languageSettingBlock}>
          <View style={styles.rowCopy}>
            <Text style={[styles.rowTitle, { color: palette.title }]}>
              {t('settings.rows.language.title')}
            </Text>
            <Text style={[styles.rowSubtitle, { color: palette.subtitle }]}>
              {t('settings.rows.language.subtitle', {
                language: getLanguageLabel(language, language),
              })}
            </Text>
          </View>
          <LanguageSwitch
            selectedLanguage={language}
            onSelectLanguage={setLanguage}
            palette={palette}
            labels={LANGUAGE_SWITCH_NATIVE_LABELS}
          />
          {userJsonImportActive ? (
            <Text
              style={[styles.languageImportHint, { color: palette.subtitle }]}
            >
              {t('settings.rows.language.userImportHint')}
            </Text>
          ) : null}
        </View>
      </SectionCard>

      <SectionCard
        title={t('settings.sections.about.title')}
        subtitle={t('settings.sections.about.subtitle')}
        palette={palette}
      >
        <View style={styles.aboutList}>
          <AboutLine
            label={t('settings.about.app')}
            value={t('settings.about.appValue')}
            palette={palette}
          />
          <AboutLine
            label={t('settings.about.storage')}
            value={t('settings.about.storageValue')}
            palette={palette}
          />
          <AboutLine
            label={t('settings.about.defaultDataset')}
            value={t('settings.about.defaultDatasetValue')}
            palette={palette}
          />
          <AboutLine
            label={t('settings.about.theme')}
            value={getThemeModeLabel(language, themeMode)}
            palette={palette}
          />
          <AboutLine
            label={t('settings.about.language')}
            value={getLanguageLabel(language, language)}
            palette={palette}
          />
          <AboutLinkLine
            label={t('settings.about.telegram')}
            value={WORKING_CALENDAR_TELEGRAM_PATH}
            palette={palette}
            onPress={() => {
              void openWorkingCalendarTelegram();
            }}
          />
        </View>
      </SectionCard>
    </ScrollView>
  );
}

type SectionCardProps = {
  title: string;
  subtitle: string;
  palette: ReturnType<typeof useAppTheme>['palette'];
  children: ReactNode;
};

function SectionCard({ title, subtitle, palette, children }: SectionCardProps) {
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: palette.title }]}>{title}</Text>
      <Text style={[styles.sectionSubtitle, { color: palette.subtitle }]}>
        {subtitle}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

type SettingRowProps = {
  title: string;
  subtitle: string;
  trailing: ReactNode;
  palette: ReturnType<typeof useAppTheme>['palette'];
  onPress?: () => void;
};

function SettingRow({
  title,
  subtitle,
  trailing,
  palette,
  onPress,
}: SettingRowProps) {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: palette.title }]}>{title}</Text>
        <Text style={[styles.rowSubtitle, { color: palette.subtitle }]}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.rowTrailing}>{trailing}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.rowPressable,
          { opacity: pressed ? 0.88 : 1 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

function Divider({
  palette,
}: {
  palette: ReturnType<typeof useAppTheme>['palette'];
}) {
  return <View style={[styles.divider, { backgroundColor: palette.border }]} />;
}

type AboutLineProps = {
  label: string;
  value: string;
  palette: ReturnType<typeof useAppTheme>['palette'];
};

function AboutLine({ label, value, palette }: AboutLineProps) {
  return (
    <View style={styles.aboutLine}>
      <Text style={[styles.aboutLabel, { color: palette.subtitle }]}>{label}</Text>
      <Text style={[styles.aboutValue, { color: palette.title }]}>{value}</Text>
    </View>
  );
}

type AboutLinkLineProps = AboutLineProps & {
  onPress: () => void;
};

function AboutLinkLine({ label, value, palette, onPress }: AboutLinkLineProps) {
  return (
    <View style={styles.aboutLine}>
      <Text style={[styles.aboutLabel, { color: palette.subtitle }]}>{label}</Text>
      <Pressable
        accessibilityRole="link"
        onPress={onPress}
        style={({ pressed }) => [
          styles.aboutLinkPressable,
          { opacity: pressed ? 0.88 : 1 },
        ]}
      >
        <TelegramIcon color={palette.selectedBorder} size={16} />
        <Text style={[styles.aboutLinkValue, { color: palette.selectedBorder }]}>
          {value}
        </Text>
      </Pressable>
    </View>
  );
}

const LANGUAGE_SWITCH_NATIVE_LABELS = AGREED_APP_LANGUAGE_CODES.reduce<
  Record<AppLanguage, string>
>((acc, code) => {
  acc[code] = getLanguageNativeLabel(code);
  return acc;
}, {} as Record<AppLanguage, string>);

// const BUNDLED_CALENDAR_SWITCH_LABELS = AGREED_APP_LANGUAGE_CODES.reduce(
//   (acc, uiLang) => {
//     const labels = {} as Record<BundledCalendarRegionCode, string>;
//     for (const region of BUNDLED_CALENDAR_REGION_CODES) {
//       labels[region] = getBundledRegionLabel(uiLang, region);
//     }
//     acc[uiLang] = labels;
//     return acc;
//   },
//   {} as Record<AppLanguage, Record<BundledCalendarRegionCode, string>>,
// );

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
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  appBarTrailing: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionBody: {
    gap: 12,
  },
  languageSettingBlock: {
    gap: 12,
  },
  languageImportHint: {
    fontSize: 12,
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowTrailing: {
    minWidth: 110,
    alignItems: 'flex-end',
  },
  badgeText: {
    fontSize: 20,
    fontWeight: '700',
  },
  rowPressable: {
    borderRadius: 16,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  aboutList: {
    gap: 10,
  },
  aboutLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  aboutLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  aboutLinkPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aboutLinkValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
