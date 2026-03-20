import { StyleSheet, Text, View } from 'react-native';

type AppLogoProps = {
  isDarkMode: boolean;
  size?: 'large' | 'small';
};

const SIZE_PRESETS = {
  large: {
    box: 96,
    year: 22,
    caption: 13,
  },
  small: {
    box: 72,
    year: 18,
    caption: 11,
  },
} as const;

export function AppLogo({ isDarkMode, size = 'large' }: AppLogoProps) {
  const preset = SIZE_PRESETS[size];
  const palette = isDarkMode
    ? {
        badgeBackground: '#2563eb',
        badgeAccent: '#60a5fa',
        year: '#f8fafc',
        caption: '#dbeafe',
      }
    : {
        badgeBackground: '#1d4ed8',
        badgeAccent: '#93c5fd',
        year: '#f8fafc',
        caption: '#dbeafe',
      };

  return (
    <View
      style={[
        styles.badge,
        {
          width: preset.box,
          height: preset.box,
          borderRadius: preset.box / 3,
          backgroundColor: palette.badgeBackground,
        },
      ]}
    >
      <View
        style={[
          styles.badgeStripe,
          {
            backgroundColor: palette.badgeAccent,
          },
        ]}
      />
      <Text style={[styles.year, { fontSize: preset.year, color: palette.year }]}>
        2026
      </Text>
      <Text
        style={[
          styles.caption,
          { fontSize: preset.caption, color: palette.caption },
        ]}
      >
        Calendar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 6,
  },
  badgeStripe: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    height: 10,
    borderRadius: 999,
  },
  year: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  caption: {
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
