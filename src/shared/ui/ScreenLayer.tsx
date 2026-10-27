import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  FadeInRight,
  FadeInDown,
  FadeOutRight,
  FadeOutDown,
  ReduceMotion,
} from 'react-native-reanimated';
import { motion } from '../lib/ui/motion';

const enter = FadeInRight.duration(240)
  .easing(motion.open.easing)
  .reduceMotion(ReduceMotion.System);
const exit = FadeOutRight.duration(180)
  .easing(motion.close.easing)
  .reduceMotion(ReduceMotion.System);
const formEnter = FadeInDown.duration(240)
  .easing(motion.open.easing)
  .reduceMotion(ReduceMotion.System);
const formExit = FadeOutDown.duration(180)
  .easing(motion.close.easing)
  .reduceMotion(ReduceMotion.System);

/** Retains the native surface through its exit, over the already-mounted page. */
export function ScreenLayer({
  children,
  backgroundColor,
  covered = false,
  variant = 'page',
}: {
  children: ReactNode;
  backgroundColor: string;
  covered?: boolean;
  variant?: 'page' | 'form';
}) {
  return (
    <Animated.View
      entering={variant === 'form' ? formEnter : enter}
      exiting={variant === 'form' ? formExit : exit}
      pointerEvents={covered ? 'none' : 'auto'}
      accessibilityElementsHidden={covered}
      importantForAccessibility={covered ? 'no-hide-descendants' : 'auto'}
      style={[StyleSheet.absoluteFill, { backgroundColor }]}
    >
      {children}
    </Animated.View>
  );
}
