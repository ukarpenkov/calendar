import { StyleSheet, Text } from 'react-native';

import type { CalendarPalette } from '../../../entities/calendar';
import { MotionPressable } from '../../../shared/ui/MotionPressable';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  palette: CalendarPalette;
  variant?: 'default' | 'danger';
};

export function ActionButton({
  label,
  onPress,
  disabled,
  palette,
  variant = 'default',
}: ActionButtonProps) {
  const backgroundColor =
    variant === 'danger' ? palette.holidayBorder : palette.selectedBorder;

  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
      ]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </MotionPressable>
  );
}

type GhostButtonProps = {
  label: string;
  onPress: () => void;
  palette: CalendarPalette;
};

export function GhostButton({ label, onPress, palette }: GhostButtonProps) {
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghostButton,
        {
          borderColor: palette.border,
          backgroundColor: palette.surface,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.ghostButtonText, { color: palette.title }]}>{label}</Text>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  ghostButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
