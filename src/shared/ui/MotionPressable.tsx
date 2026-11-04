import { useEffect, useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../lib/ui/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Animate the surface without adding another layout wrapper. */
export function MotionPressable({
  style,
  onPressIn,
  onPressOut,
  disabled,
  pressedScale = 0.97,
  ...props
}: PressableProps & { pressedScale?: number }) {
  const reduceMotion = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (disabled || reduceMotion) scale.value = 1;
    if (disabled) setPressed(false);
  }, [disabled, reduceMotion, scale]);

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={event => {
        if (!disabled) {
          setPressed(true);
          scale.value = reduceMotion
            ? 1
            : withTiming(pressedScale, motion.press);
          onPressIn?.(event);
        }
      }}
      onPressOut={event => {
        setPressed(false);
        scale.value = reduceMotion ? 1 : withTiming(1, motion.release);
        onPressOut?.(event);
      }}
      style={[
        typeof style === 'function' ? style({ pressed }) : style,
        animatedStyle,
      ]}
    />
  );
}
