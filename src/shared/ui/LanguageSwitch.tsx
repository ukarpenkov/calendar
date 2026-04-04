import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppLanguage } from '../lib/i18n';

type LanguageSwitchPalette = {
  border: string;
  selectedBorder: string;
  selectedFill: string;
  subtitle: string;
  surfaceMuted: string;
  title: string;
};

const LANGUAGE_OPTIONS = ['ru', 'en'] as const satisfies readonly AppLanguage[];

type LanguageSwitchOption = (typeof LANGUAGE_OPTIONS)[number];

type LanguageSwitchProps = {
  selectedLanguage: AppLanguage;
  onSelectLanguage: (language: AppLanguage) => void;
  palette: LanguageSwitchPalette;
  labels: Record<LanguageSwitchOption, string>;
};

export function LanguageSwitch({
  selectedLanguage,
  onSelectLanguage,
  palette,
  labels,
}: LanguageSwitchProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.surfaceMuted,
          borderColor: palette.border,
        },
      ]}
    >
      {LANGUAGE_OPTIONS.map(language => {
        const isSelected = language === selectedLanguage;
        const optionPaletteStyle = {
          backgroundColor: isSelected ? palette.selectedFill : 'transparent',
          borderColor: isSelected ? palette.selectedBorder : 'transparent',
        };
        const optionTextStyle = {
          color: isSelected ? palette.title : palette.subtitle,
        };

        return (
          <Pressable
            key={language}
            accessibilityRole="button"
            onPress={() => onSelectLanguage(language)}
            style={({ pressed }) => [
              styles.option,
              optionPaletteStyle,
              { opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <Text style={[styles.optionText, optionTextStyle]}>
              {labels[language]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  option: {
    minWidth: 52,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
