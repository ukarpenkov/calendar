import { Image, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

type HolidayBannerProps = {
  source: ImageSourcePropType;
};

const HOLIDAY_BANNER_ASPECT_RATIO = 21 / 9;

export function HolidayBanner({ source }: HolidayBannerProps) {
  return (
    <View style={styles.container}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        accessibilityRole="image"
      />
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
