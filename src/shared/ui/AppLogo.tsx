import { Image, StyleSheet, View } from 'react-native';

type AppLogoProps = {
  isDarkMode: boolean;
  size?: 'large' | 'small' | 'toolbar';
  /**
   * Extra padding around the raster (splash); the artwork already includes the mint plate.
   */
  withPlate?: boolean;
  accessibilityLabel?: string;
};

/** Same art as `icons/play_store_512.png` (synced to assets by `scripts/generate-launcher-pngs.ps1`). */
const LOGO_SOURCE = require('../../../assets/launcher-icon-source.png');

const SIZE_PRESETS = {
  large: { width: 124 },
  small: { width: 92 },
  /** Compact mark for app bar (aligned with ~36px touch targets). */
  toolbar: { width: 32 },
} as const;

export function AppLogo({
  isDarkMode: _isDarkMode,
  size = 'large',
  withPlate = size === 'large',
  accessibilityLabel,
}: AppLogoProps) {
  const { width } = SIZE_PRESETS[size];
  const platePad = withPlate ? Math.round(10 * (width / 124)) : 0;

  const image = (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      importantForAccessibility="yes"
      source={LOGO_SOURCE}
      style={{ width, height: width }}
      resizeMode="contain"
    />
  );

  if (!withPlate) {
    return <View style={styles.wrap}>{image}</View>;
  }

  return (
    <View style={[styles.plate, { padding: platePad }]}>{image}</View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
  plate: {
    alignSelf: 'center',
  },
});
