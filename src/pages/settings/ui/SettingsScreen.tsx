import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import { getLanguageLabel, getThemeModeLabel } from '../../../shared/lib/i18n';
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

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + 12,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: safeAreaInsets.bottom + 32,
        },
      ]}
    >
      <View style={styles.appBar}>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={[styles.iconButton, { borderColor: palette.border }]}
        >
          <Text style={[styles.iconButtonText, { color: palette.icon }]}>{'<'}</Text>
        </Pressable>
        <Text style={[styles.appBarTitle, { color: palette.title }]}>
          {t('settings.title')}
        </Text>
        <View style={styles.appBarSpacer} />
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
        <SettingRow
          title={t('settings.rows.language.title')}
          subtitle={t('settings.rows.language.subtitle', {
            language: getLanguageLabel(language, language),
          })}
          trailing={
            <LanguageSwitch
              selectedLanguage={language}
              onSelectLanguage={setLanguage}
              palette={palette}
              labels={{
                ru: getLanguageLabel(language, 'ru'),
                en: getLanguageLabel(language, 'en'),
              }}
            />
          }
          palette={palette}
        />
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
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.rowPressable}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
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
});
