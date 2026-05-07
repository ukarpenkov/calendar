import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AGREED_APP_LANGUAGE_CODES,
  type BundledCalendarRegionCode,
} from '../config/agreedLanguagesAndBundledCalendars';
import type { AppLanguage } from '../lib/i18n';
import { CalendarIcon, GlobeIcon } from './icons/NavigationIcons';

const ACTIVE_CALENDAR_FILL = 'rgba(148, 163, 184, 0.18)';

type LanguageSwitchPalette = {
  border: string;
  selectedBorder: string;
  selectedFill: string;
  subtitle: string;
  surfaceMuted: string;
  title: string;
};

type LanguageSwitchProps = {
  selectedLanguage: AppLanguage;
  activeCalendarRegion?: BundledCalendarRegionCode | null;
  onSelectLanguage: (language: AppLanguage) => void;
  onSelectUserJsonImport?: () => void;
  palette: LanguageSwitchPalette;
  /** Подписи опций (обычно нативные автонимы: `getLanguageNativeLabel`). */
  labels: Record<AppLanguage, string>;
  userJsonImportAvailable?: boolean;
  userJsonImportActive?: boolean;
  userJsonImportLabel?: string;
};

export function LanguageSwitch({
  selectedLanguage,
  activeCalendarRegion,
  onSelectLanguage,
  onSelectUserJsonImport,
  palette,
  labels,
  userJsonImportAvailable = false,
  userJsonImportActive = false,
  userJsonImportLabel = 'JSON calendar',
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
      {AGREED_APP_LANGUAGE_CODES.map(code => {
        const isSelected = code === selectedLanguage;
        const isActiveCalendar =
          !isSelected && code !== 'en' && code === activeCalendarRegion;
        const iconColor =
          isSelected || isActiveCalendar ? palette.title : palette.subtitle;
        const optionPaletteStyle = {
          backgroundColor: isSelected
            ? palette.selectedFill
            : isActiveCalendar
              ? ACTIVE_CALENDAR_FILL
              : 'transparent',
          borderColor: isSelected ? palette.selectedBorder : palette.border,
        };
        const optionTextStyle = {
          color: isSelected || isActiveCalendar ? palette.title : palette.subtitle,
        };

        return (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectLanguage(code)}
            style={({ pressed }) => [
              styles.option,
              optionPaletteStyle,
              { opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionText, optionTextStyle]}>{labels[code]}</Text>
              <View style={styles.optionIcons}>
                <GlobeIcon color={iconColor} size={16} />
                {code === 'en' ? null : <CalendarIcon color={iconColor} size={16} />}
              </View>
            </View>
          </Pressable>
        );
      })}
      {userJsonImportAvailable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: false }}
          onPress={onSelectUserJsonImport}
          style={({ pressed }) => [
            styles.option,
            {
              backgroundColor: userJsonImportActive
                ? ACTIVE_CALENDAR_FILL
                : 'transparent',
              borderColor: palette.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionText,
                {
                  color: userJsonImportActive ? palette.title : palette.subtitle,
                },
              ]}
            >
              {userJsonImportLabel}
            </Text>
            <View style={styles.optionIcons}>
              <CalendarIcon
                color={userJsonImportActive ? palette.title : palette.subtitle}
                size={16}
              />
            </View>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  option: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
