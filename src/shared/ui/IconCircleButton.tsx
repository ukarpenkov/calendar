import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

type IconCircleButtonPalette = {
  border: string;
  icon: string;
  subtitle: string;
  surface: string;
  surfaceMuted: string;
};

type IconCircleButtonProps = {
  onPress?: () => void;
  palette: IconCircleButtonPalette;
  accessibilityLabel: string;
  children: ReactNode;
};

export function IconCircleButton({
  onPress,
  palette,
  accessibilityLabel,
  children,
}: IconCircleButtonProps) {
  const disabled = !onPress;
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      friction: 6,
      tension: 220,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        if (!disabled) {
          animateTo(0.92);
        }
      }}
      onPressOut={() => {
        if (!disabled) {
          animateTo(1);
        }
      }}
      android_ripple={
        disabled
          ? undefined
          : { color: 'rgba(128, 128, 128, 0.22)', foreground: true, borderless: false }
      }
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: palette.border,
          backgroundColor: disabled ? palette.surfaceMuted : palette.surface,
          opacity: disabled ? 0.5 : pressed ? 0.95 : 1,
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
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
    overflow: 'hidden',
  },
});
