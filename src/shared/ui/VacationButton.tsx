import { Pressable, StyleSheet } from 'react-native';

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
    <Pressable
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
    </Pressable>
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
