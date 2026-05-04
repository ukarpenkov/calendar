import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

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
  const scale = useRef(new Animated.Value(1)).current;
  const backProgress = useRef(new Animated.Value(0)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      friction: 6,
      tension: 220,
      useNativeDriver: true,
    }).start();
  };

  const animateBackTo = (toValue: number) => {
    Animated.timing(backProgress, {
      toValue,
      duration: toValue === 1 ? 420 : 360,
      easing:
        toValue === 1
          ? Easing.bezier(0.25, 0.46, 0.45, 0.94)
          : Easing.bezier(0.455, 0.03, 0.515, 0.955),
      useNativeDriver: true,
    }).start();
  };

  const isBack = variant === 'back';
  const backBaseOpacity = backProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const backBaseScale = backProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });
  const backAccentOpacity = backProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const backAccentScale = backProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1.3, 1],
  });
  const backIconTranslate = backProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -56],
  });

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
          : { color: 'rgba(128, 128, 128, 0.22)', foreground: true, borderless: false }
      }
      style={({ pressed }) => [
        isBack ? styles.backButton : styles.button,
        isBack
          ? {
              opacity: disabled ? 0.5 : 1,
            }
          : {
              borderColor: palette.border,
              backgroundColor: disabled ? palette.surfaceMuted : palette.surface,
              opacity: disabled ? 0.5 : pressed ? 0.95 : 1,
            },
      ]}
    >
      {isBack ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.backRing,
              {
                borderColor: palette.border,
                opacity: backBaseOpacity,
                transform: [{ scale: backBaseScale }],
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.backRing,
              {
                borderColor: '#96DAF0',
                opacity: backAccentOpacity,
                transform: [{ scale: backAccentScale }],
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.backIconTrack,
              { transform: [{ translateX: backIconTranslate }] },
            ]}
          >
            <View style={styles.backIconSlot}>{children}</View>
            <View style={styles.backIconSlot}>{children}</View>
          </Animated.View>
        </>
      ) : (
        <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
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
