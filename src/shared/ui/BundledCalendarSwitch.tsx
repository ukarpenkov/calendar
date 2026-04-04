import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BUNDLED_CALENDAR_REGION_CODES,
  type BundledCalendarRegionCode,
} from '../config/agreedLanguagesAndBundledCalendars';

type BundledCalendarSwitchPalette = {
  border: string;
  selectedBorder: string;
  selectedFill: string;
  subtitle: string;
  surfaceMuted: string;
  title: string;
};

type BundledCalendarSwitchProps = {
  selectedRegion: BundledCalendarRegionCode;
  onSelectRegion: (region: BundledCalendarRegionCode) => void;
  palette: BundledCalendarSwitchPalette;
  labels: Record<BundledCalendarRegionCode, string>;
};

export function BundledCalendarSwitch({
  selectedRegion,
  onSelectRegion,
  palette,
  labels,
}: BundledCalendarSwitchProps) {
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
      {BUNDLED_CALENDAR_REGION_CODES.map(code => {
        const isSelected = code === selectedRegion;
        const optionPaletteStyle = {
          backgroundColor: isSelected ? palette.selectedFill : 'transparent',
          borderColor: isSelected ? palette.selectedBorder : 'transparent',
        };
        const optionTextStyle = {
          color: isSelected ? palette.title : palette.subtitle,
        };

        return (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectRegion(code)}
            style={({ pressed }) => [
              styles.option,
              optionPaletteStyle,
              { opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <Text style={[styles.optionText, optionTextStyle]}>{labels[code]}</Text>
          </Pressable>
        );
      })}
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
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
