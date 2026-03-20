import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../../app/providers/theme';
import { ThemeSwitch } from '../../../shared/ui/ThemeSwitch';

type SettingsScreenProps = {
  activeYear: number;
  onBack: () => void;
};

export function SettingsScreen({
  activeYear,
  onBack,
}: SettingsScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const { isDarkMode, palette, themeMode, toggleTheme } = useAppTheme();

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
        <Text style={[styles.appBarTitle, { color: palette.title }]}>Settings</Text>
        <View style={styles.appBarSpacer} />
      </View>

      <SectionCard
        title="Calendar data"
        subtitle="Current active year and upcoming import actions."
        palette={palette}
      >
        <SettingRow
          title="Active year"
          subtitle={`The SQLite-backed dataset currently loaded in the app is ${activeYear}.`}
          trailing={
            <Text style={[styles.badgeText, { color: palette.title }]}>
              {activeYear}
            </Text>
          }
          palette={palette}
        />
        <Divider palette={palette} />
        <SettingRow
          title="Import year (JSON)"
          subtitle="The entry point will be connected in the next implementation step."
          trailing={
            <Text style={[styles.placeholderText, { color: palette.subtitle }]}>
              Soon
            </Text>
          }
          palette={palette}
        />
      </SectionCard>

      <SectionCard
        title="Appearance"
        subtitle="Theme settings are now controlled through the global app context."
        palette={palette}
      >
        <SettingRow
          title="Dark theme"
          subtitle={`Current mode: ${themeMode === 'dark' ? 'Dark' : 'Light'}.`}
          trailing={
            <ThemeSwitch checked={isDarkMode} onPress={toggleTheme} />
          }
          palette={palette}
        />
      </SectionCard>

      <SectionCard
        title="About"
        subtitle="Service information for the current local-first build."
        palette={palette}
      >
        <View style={styles.aboutList}>
          <AboutLine label="App" value="Calendar" palette={palette} />
          <AboutLine label="Storage" value="Offline SQLite" palette={palette} />
          <AboutLine label="Default dataset" value="Production calendar 2026" palette={palette} />
          <AboutLine label="Theme" value={themeMode === 'dark' ? 'Dark' : 'Light'} palette={palette} />
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
};

function SettingRow({ title, subtitle, trailing, palette }: SettingRowProps) {
  return (
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
    minWidth: 72,
    alignItems: 'flex-end',
  },
  badgeText: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholderText: {
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
