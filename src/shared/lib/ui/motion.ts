import { Easing, ReduceMotion } from 'react-native-reanimated';

// One rhythm for navigation; transforms keep layout out of the animation loop.
export const motion = {
  press: {
    duration: 90,
    easing: Easing.out(Easing.cubic),
    reduceMotion: ReduceMotion.System,
  },
  release: {
    duration: 180,
    easing: Easing.out(Easing.cubic),
    reduceMotion: ReduceMotion.System,
  },
  open: {
    duration: 320,
    easing: Easing.bezier(0.2, 0.85, 0.2, 1),
    reduceMotion: ReduceMotion.System,
  },
  close: {
    duration: 240,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    reduceMotion: ReduceMotion.System,
  },
  change: {
    duration: 160,
    easing: Easing.out(Easing.cubic),
    reduceMotion: ReduceMotion.System,
  },
};
