import { scheduleIdleTask } from '../../../shared/lib/ui/scheduleIdleTask';
import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';

type Props = { sources: ImageSourcePropType[]; paused: boolean; width: number };

/** Image.prefetch only fills the disk cache on Android. An attached Image also
 * decodes into Fresco's bounded bitmap cache. Prepare one image per idle turn,
 * at display size, so startup never launches a year of full-resolution decodes.
 */
export function CalendarImageWarmup({ sources, paused, width }: Props) {
  return (
    <ImageWarmupQueue
      key={`${width}:${JSON.stringify(sources)}`}
      sources={sources}
      paused={paused}
      width={width}
    />
  );
}

function ImageWarmupQueue({ sources, paused, width }: Props) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded || paused || index >= sources.length) return;
    const cancel = scheduleIdleTask(() => {
      setLoaded(false);
      setIndex(value => value + 1);
    });
    return cancel;
  }, [index, loaded, paused, sources.length]);

  if (paused || index >= sources.length) return null;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.hidden}
    >
      <Image
        key={`${index}-${width}`}
        source={sources[index]}
        resizeMode="cover"
        resizeMethod="resize"
        fadeDuration={0}
        onLoadEnd={() => setLoaded(true)}
        style={{ width, height: (width * 9) / 21 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
});
