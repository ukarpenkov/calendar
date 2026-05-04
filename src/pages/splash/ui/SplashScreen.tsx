import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppLocalization } from '../../../app/providers/localization';
import { useAppTheme } from '../../../app/providers/theme';
import { YearScreenCalendarMark } from '../../../shared/ui/icons/YearScreenCalendarMark';

/** Larger than app bar (~32); slightly below legacy raster splash (~124). */
const SPLASH_MARK_SIZE = 112;

export function SplashScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { isDarkMode, palette } = useAppTheme();
  const { t } = useAppLocalization();
  const splashBackground = isDarkMode ? palette.background : '#FFFFFF';
  const spinnerColor = isDarkMode ? '#FFFFFF' : palette.subtitle;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: splashBackground,
          paddingTop: safeAreaInsets.top + 32,
          paddingBottom: safeAreaInsets.bottom + 32,
        },
      ]}
    >
      <View style={styles.content}>
        <YearScreenCalendarMark
          accessibilityLabel={t('common.appName')}
          size={SPLASH_MARK_SIZE}
          backgroundColor={isDarkMode ? splashBackground : undefined}
        />
        <Text style={[styles.title, { color: palette.title }]}>
          {t('common.appName')}
        </Text>
        <Text style={[styles.subtitle, { color: palette.subtitle }]}>
          {t('splash.loadingTitle')}
        </Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={spinnerColor} />
        <Text style={[styles.footerText, { color: palette.subtitle }]}>
          {t('splash.loadingSubtitle')}
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
