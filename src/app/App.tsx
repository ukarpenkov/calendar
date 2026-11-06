import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BundledCalendarRegionProvider } from '@/features/calendar-language-sync';
import { SplashScreen } from '@/pages/splash/ui/SplashScreen';
import { AppLocalizationProvider } from '@/shared/lib/localization';
import { AppThemeProvider, useAppTheme } from '@/shared/lib/theme';
import { useCalendarSession } from './model/useCalendarSession';
import { AppMessageScreen } from './ui/AppMessageScreen';
import { AppReadyLayers } from './ui/AppReadyLayers';

function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AppLocalizationProvider>
          <BundledCalendarRegionProvider>
            <AppRoot />
          </BundledCalendarRegionProvider>
        </AppLocalizationProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

function AppRoot() {
  const { isDarkMode } = useAppTheme();

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </>
  );
}

function AppContent() {
  const session = useCalendarSession();
  const { status, t, retryBootstrap, closeMonth } = session;

  if (status.kind === 'loading') {
    return <SplashScreen />;
  }

  if (status.kind === 'error') {
    return (
      <AppMessageScreen
        title={t('app.error.bootstrapTitle')}
        subtitle={t('app.error.bootstrapSubtitle')}
        actionLabel={t('app.error.bootstrapRetry')}
        onPress={retryBootstrap}
        testID="app-bootstrap-retry"
        variant="primary"
      />
    );
  }

  if (status.screen.name === 'month-error') {
    return (
      <AppMessageScreen
        title={t('app.error.monthTitle')}
        subtitle={t('app.error.monthSubtitle')}
        actionLabel={t('common.backToYear')}
        onPress={closeMonth}
        testID="app-month-error-back"
        variant="secondary"
      />
    );
  }

  return <AppReadyLayers session={{ ...session, status }} />;
}

export default App;
