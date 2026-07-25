import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Reanimated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

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
  variant?: 'default' | 'back';
};

export function IconCircleButton({
  onPress,
  palette,
  accessibilityLabel,
  children,
  variant = 'default',
}: IconCircleButtonProps) {
  const disabled = !onPress;
  const scale = useSharedValue(1);
  const backProgress = useSharedValue(0);

  const animateTo = (toValue: number) => {
    scale.value = withSpring(toValue, {
      damping: 18,
      stiffness: 420,
    });
  };

  const animateBackTo = (toValue: number) => {
    backProgress.value = withTiming(toValue, {
      duration: toValue === 1 ? 140 : 120,
      easing:
        toValue === 1
          ? Easing.bezier(0.25, 0.46, 0.45, 0.94)
          : Easing.bezier(0.455, 0.03, 0.515, 0.955),
    });
  };

  const isBack = variant === 'back';
  const defaultAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const backBaseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - backProgress.value,
    transform: [{ scale: interpolate(backProgress.value, [0, 1], [1, 0.7]) }],
  }));
  const backAccentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backProgress.value,
    transform: [{ scale: interpolate(backProgress.value, [0, 1], [1.3, 1]) }],
  }));
  const backIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(backProgress.value, [0, 1], [0, -56]) },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        if (!disabled) {
          if (isBack) {
            animateBackTo(1);
          } else {
            animateTo(0.92);
          }
        }
      }}
      onPressOut={() => {
        if (!disabled) {
          if (isBack) {
            animateBackTo(0);
          } else {
            animateTo(1);
          }
        }
      }}
      android_ripple={
        disabled || isBack
          ? undefined
          : {
              color: 'rgba(128, 128, 128, 0.22)',
              foreground: true,
              borderless: false,
            }
      }
      style={({ pressed }) => [
        isBack ? styles.backButton : styles.button,
        isBack
          ? {
              opacity: disabled ? 0.5 : 1,
            }
          : {
              borderColor: palette.border,
              backgroundColor: disabled
                ? palette.surfaceMuted
                : palette.surface,
              opacity: disabled ? 0.5 : pressed ? 0.95 : 1,
            },
      ]}
    >
      {isBack ? (
        <>
          <Reanimated.View
            pointerEvents="none"
            style={[
              styles.backRing,
              {
                borderColor: palette.border,
              },
              backBaseAnimatedStyle,
            ]}
          />
          <Reanimated.View
            pointerEvents="none"
            style={[
              styles.backRing,
              styles.backRingAccent,
              backAccentAnimatedStyle,
            ]}
          />
          <Reanimated.View
            pointerEvents="none"
            style={[styles.backIconTrack, backIconAnimatedStyle]}
          >
            <View style={styles.backIconSlot}>{children}</View>
            <View style={styles.backIconSlot}>{children}</View>
          </Reanimated.View>
        </>
      ) : (
        <Reanimated.View style={defaultAnimatedStyle}>
          {children}
        </Reanimated.View>
      )}
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
  backButton: {
    width: 56,
    height: 56,
    margin: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  backRing: {
    position: 'absolute',
    top: 7,
    right: 7,
    bottom: 7,
    left: 7,
    borderWidth: 4,
    borderRadius: 21,
  },
  backRingAccent: {
    borderColor: '#96DAF0',
  },
  backIconTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 112,
    height: 56,
    flexDirection: 'row',
  },
  backIconSlot: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
