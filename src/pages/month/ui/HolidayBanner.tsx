import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../../../shared/lib/ui/motion';

type HolidayBannerProps = {
  source: ImageSourcePropType;
};

export const HOLIDAY_BANNER_ASPECT_RATIO = 21 / 9;

export function HolidayBanner({ source }: HolidayBannerProps) {
  const [displayed, setDisplayed] = useState(source);
  const sourceKey = JSON.stringify(source);
  const displayedKey = JSON.stringify(displayed);
  const latestSource = useRef(sourceKey);
  const mounted = useRef(true);
  latestSource.current = sourceKey;
  const opacity = useSharedValue(0);
  const changing = displayedKey !== sourceKey;
  const imageStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const displayedStyle = useAnimatedStyle(() => ({ opacity: 1 }));

  useLayoutEffect(() => {
    cancelAnimation(opacity);
    opacity.value = 0;
  }, [sourceKey, opacity]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => () => cancelAnimation(opacity), [opacity]);

  const commitImage = useCallback((loaded: ImageSourcePropType) => {
    if (mounted.current && latestSource.current === JSON.stringify(loaded))
      setDisplayed(loaded);
  }, []);

  const reveal = () => {
    if (latestSource.current !== sourceKey) return;
    opacity.value = withTiming(1, motion.change, finished => {
      if (finished) runOnJS(commitImage)(source);
    });
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        key={displayedKey}
        source={displayed}
        style={[styles.image, displayedStyle]}
        resizeMode="cover"
        resizeMethod="resize"
        fadeDuration={0}
        accessibilityIgnoresInvertColors
        accessibilityRole="image"
      />
      {changing ? (
        <Animated.Image
          key={sourceKey}
          source={source}
          style={[styles.image, StyleSheet.absoluteFill, imageStyle]}
          resizeMode="cover"
          resizeMethod="resize"
          fadeDuration={0}
          onLoad={reveal}
          accessibilityIgnoresInvertColors
          accessible={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: HOLIDAY_BANNER_ASPECT_RATIO,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
