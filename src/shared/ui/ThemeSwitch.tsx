import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

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
  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: checked ? 1 : 0,
      duration: 320,
      easing: Easing.bezier(0.81, -0.04, 0.38, 1.5),
      useNativeDriver: true,
    }).start();
  }, [checked, progress]);

  const thumbTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, THUMB_TRAVEL],
  });

  const starsOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const cloudOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cloudTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  const moonOpacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.25, 0],
  });

  const sunOpacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.35, 1],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[
        styles.switch,
        checked ? styles.switchChecked : styles.switchUnchecked,
      ]}
    >
      <Animated.View style={[styles.star, styles.starOne, { opacity: starsOpacity }]} />
      <Animated.View style={[styles.star, styles.starTwo, { opacity: starsOpacity }]} />
      <Animated.View
        style={[styles.star, styles.starThree, { opacity: starsOpacity }]}
      />

      <Animated.View
        style={[
          styles.cloudWrap,
          {
            opacity: cloudOpacity,
            transform: [{ translateY: cloudTranslateY }],
          },
        ]}
      >
        <View style={styles.cloudBase} />
        <View style={[styles.cloudCircle, styles.cloudCircleLeft]} />
        <View style={[styles.cloudCircle, styles.cloudCircleMiddle]} />
        <View style={[styles.cloudCircle, styles.cloudCircleRight]} />
      </Animated.View>

      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: thumbTranslateX }],
          },
        ]}
      >
        <Animated.View style={[styles.moon, { opacity: moonOpacity }]}>
          <View style={styles.moonCutout} />
        </Animated.View>
        <Animated.View style={[styles.sun, { opacity: sunOpacity }]} />
      </Animated.View>
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
