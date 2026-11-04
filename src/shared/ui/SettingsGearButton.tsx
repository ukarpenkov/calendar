import { StyleSheet } from 'react-native';
import { MotionPressable } from './MotionPressable';

import { SettingsGearIcon } from './icons/SettingsGearIcon';

type SettingsGearButtonPalette = {
  border: string;
  icon: string;
  surface: string;
};

type SettingsGearButtonProps = {
  onPress: () => void;
  palette: SettingsGearButtonPalette;
  accessibilityLabel: string;
};

export function SettingsGearButton({
  onPress,
  palette,
  accessibilityLabel,
}: SettingsGearButtonProps) {
  return (
    <MotionPressable
      pressedScale={0.9}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: palette.border,
          backgroundColor: palette.surface,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <SettingsGearIcon color={palette.icon} size={20} />
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
