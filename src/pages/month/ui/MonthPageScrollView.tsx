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
  onScrollEndDrag,
  onMomentumScrollEnd,
  ...props
}: MonthPageScrollViewProps) {
  const initialOffset = useRef({
    x: 0,
    y: savedOffsets.get(offsetKey) ?? 0,
  }).current;
  const mounted = useRef(true);
  const scroll = useRef<ScrollView>(null);
  const viewport = useRef({ key: offsetKey, generation: 0 });
  if (viewport.current.key !== offsetKey) {
    viewport.current = {
      key: offsetKey,
      generation: viewport.current.generation + 1,
    };
  }
  const generation = viewport.current.generation;
  const restoredKey = useRef(offsetKey);

  useLayoutEffect(() => {
    if (restoredKey.current === offsetKey) return;
    restoredKey.current = offsetKey;
    scroll.current?.scrollTo({
      y: savedOffsets.get(offsetKey) ?? 0,
      animated: false,
    });
  }, [offsetKey, savedOffsets]);

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
      if (mounted.current && viewport.current.generation === generation) {
        savedOffsets.set(offsetKey, event.nativeEvent.contentOffset.y);
      }
    },
    [generation, offsetKey, savedOffsets],
  );

  return (
    <ScrollView
      {...props}
      ref={scroll}
      contentOffset={initialOffset}
      onScroll={onScroll}
      onScrollEndDrag={event => {
        onScroll(event);
        onScrollEndDrag?.(event);
      }}
      onMomentumScrollEnd={event => {
        onScroll(event);
        onMomentumScrollEnd?.(event);
      }}
    />
  );
}
