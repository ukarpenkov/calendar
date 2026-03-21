import { Pressable, StyleSheet, Text } from 'react-native';

type SettingsGearButtonPalette = {
  border: string;
  icon: string;
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.button, { borderColor: palette.border }]}
    >
      <Text style={[styles.icon, { color: palette.icon }]}>⚙</Text>
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
  icon: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
