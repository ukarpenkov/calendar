import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Reanimated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ThemeSwitchProps = {
  checked: boolean;
  onPress: () => void;
};

const TRACK_WIDTH = 68;
const TRACK_HEIGHT = 38;
const THUMB_SIZE = 20;
const THUMB_OFFSET = 8;
const THUMB_TRAVEL = 30;

export function ThemeSwitch({ checked, onPress }: ThemeSwitchProps) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, {
      duration: 180,
      easing: Easing.bezier(0.81, -0.04, 0.38, 1.5),
    });
  }, [checked, progress]);

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
  }));
  const starsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));
  const cloudAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [8, 0]) }],
  }));
  const moonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [1, 0.25, 0]),
  }));
  const sunAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0.35, 1]),
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.switch,
        checked ? styles.switchChecked : styles.switchUnchecked,
        { opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <Reanimated.View
        style={[styles.star, styles.starOne, starsAnimatedStyle]}
      />
      <Reanimated.View
        style={[styles.star, styles.starTwo, starsAnimatedStyle]}
      />
      <Reanimated.View
        style={[styles.star, styles.starThree, starsAnimatedStyle]}
      />

      <Reanimated.View style={[styles.cloudWrap, cloudAnimatedStyle]}>
        <View style={styles.cloudBase} />
        <View style={[styles.cloudCircle, styles.cloudCircleLeft]} />
        <View style={[styles.cloudCircle, styles.cloudCircleMiddle]} />
        <View style={[styles.cloudCircle, styles.cloudCircleRight]} />
      </Reanimated.View>

      <Reanimated.View style={[styles.thumb, thumbAnimatedStyle]}>
        <Reanimated.View style={[styles.moon, moonAnimatedStyle]}>
          <View style={styles.moonCutout} />
        </Reanimated.View>
        <Reanimated.View style={[styles.sun, sunAnimatedStyle]} />
      </Reanimated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  switch: {
    position: 'relative',
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  switchUnchecked: {
    backgroundColor: '#2A2A2A',
  },
  switchChecked: {
    backgroundColor: '#00A6FF',
  },
  thumb: {
    position: 'absolute',
    left: THUMB_OFFSET,
    bottom: 9,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moon: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  moonCutout: {
    position: 'absolute',
    width: 16,
    height: 16,
    top: -1,
    left: 6,
    borderRadius: 999,
    backgroundColor: '#2A2A2A',
  },
  sun: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 999,
    backgroundColor: '#FFCF48',
    shadowColor: '#FFCF48',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
  },
  star: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  starOne: {
    left: 42,
    top: 8,
  },
  starTwo: {
    left: 37,
    top: 19,
  },
  starThree: {
    left: 50,
    top: 14,
  },
  cloudWrap: {
    position: 'absolute',
    left: -6,
    bottom: -2,
    width: 58,
    height: 26,
  },
  cloudBase: {
    position: 'absolute',
    left: 12,
    bottom: 0,
    width: 34,
    height: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cloudCircle: {
    position: 'absolute',
    bottom: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  cloudCircleLeft: {
    left: 10,
    width: 14,
    height: 14,
  },
  cloudCircleMiddle: {
    left: 21,
    width: 18,
    height: 18,
  },
  cloudCircleRight: {
    left: 34,
    width: 14,
    height: 14,
  },
});
