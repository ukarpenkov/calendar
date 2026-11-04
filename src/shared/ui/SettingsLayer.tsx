import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../lib/ui/motion';

type Props = {
  children: ReactNode;
  backgroundColor: string;
  closing: boolean;
  covered?: boolean;
  onClosed: () => void;
};

/** One UI-thread progress value; navigation commits only after the closing slide. */
export function SettingsLayer({
  children,
  backgroundColor,
  closing,
  covered = false,
  onClosed,
}: Props) {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);
  const mounted = useRef(false);
  const generation = useRef(0);
  const current = useRef({ closing, onClosed });
  current.current = { closing, onClosed };
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const finishClose = useCallback((request: number) => {
    if (
      mounted.current &&
      current.current.closing &&
      request === generation.current
    ) {
      current.current.onClosed();
    }
  }, []);
  useEffect(() => {
    const request = ++generation.current;
    progress.value = withTiming(
      closing ? 0 : 1,
      closing ? motion.settingsClose : motion.settingsOpen,
      finished => {
        if (finished && closing) runOnJS(finishClose)(request);
      },
    );
    return () => {
      generation.current += 1;
      cancelAnimation(progress);
    };
  }, [closing, finishClose, progress]);
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: width * (1 - progress.value) }],
    }),
    [width],
  );

  return (
    <Animated.View
      testID="settings-layer"
      collapsable={false}
      pointerEvents={covered || closing ? 'none' : 'auto'}
      accessibilityElementsHidden={covered || closing}
      importantForAccessibility={
        covered || closing ? 'no-hide-descendants' : 'auto'
      }
      style={[StyleSheet.absoluteFill, { backgroundColor }, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}
