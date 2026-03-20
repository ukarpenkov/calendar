import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogo } from '../../../shared/ui/AppLogo';

type SplashScreenProps = {
  isDarkMode: boolean;
};

export function SplashScreen({ isDarkMode }: SplashScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const palette = isDarkMode
    ? {
        background: '#020617',
        title: '#f8fafc',
        subtitle: '#94a3b8',
        accent: '#60a5fa',
      }
    : {
        background: '#f8fafc',
        title: '#0f172a',
        subtitle: '#475569',
        accent: '#2563eb',
      };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: safeAreaInsets.top + 32,
          paddingBottom: safeAreaInsets.bottom + 32,
        },
      ]}
    >
      <View style={styles.content}>
        <AppLogo isDarkMode={isDarkMode} size="large" />
        <Text style={[styles.title, { color: palette.title }]}>Calendar</Text>
        <Text style={[styles.subtitle, { color: palette.subtitle }]}>
          Loading your offline year view
        </Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={palette.accent} />
        <Text style={[styles.footerText, { color: palette.subtitle }]}>
          Initializing local calendar data...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 28,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
