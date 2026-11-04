import { StyleSheet } from 'react-native';
import { MotionPressable } from './MotionPressable';

import { VacationIcon } from './icons/VacationIcon';

type VacationButtonPalette = {
  border: string;
  icon: string;
  surface: string;
};

type VacationButtonProps = {
  onPress: () => void;
  palette: VacationButtonPalette;
  accessibilityLabel: string;
};

export function VacationButton({
  onPress,
  palette,
  accessibilityLabel,
}: VacationButtonProps) {
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
      <VacationIcon color={palette.icon} size={20} />
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
