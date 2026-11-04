import { useCallback, useLayoutEffect, useRef } from 'react';
import {
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from 'react-native';

type MonthPageScrollViewProps = Omit<
  ScrollViewProps,
  'contentOffset' | 'onScroll'
> & {
  offsetKey: string;
  savedOffsets: Map<string, number>;
};

/** Restores scrolling once per native page, without controlling its live offset. */
export function MonthPageScrollView({
  offsetKey,
  savedOffsets,
  ...props
}: MonthPageScrollViewProps) {
  const initialOffset = useRef({
    x: 0,
    y: savedOffsets.get(offsetKey) ?? 0,
  }).current;
  const mounted = useRef(true);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // A disposed native view can still deliver an event after rotation/resume.
      // It must not overwrite the replacement page's saved position.
      if (mounted.current) {
        savedOffsets.set(offsetKey, event.nativeEvent.contentOffset.y);
      }
    },
    [offsetKey, savedOffsets],
  );

  return (
    <ScrollView
      {...props}
      contentOffset={initialOffset}
      onScroll={onScroll}
    />
  );
}
