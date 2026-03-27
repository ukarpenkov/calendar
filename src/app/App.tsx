import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  getCalendarDaysForMonth,
  getYearCalendar,
  seedBundledYearIfNeeded,
  type CalendarYear,
} from '../entities/calendar';
import {
  AppLocalizationProvider,
  useAppLocalization,
} from './providers/localization';
import { AppThemeProvider, useAppTheme } from './providers/theme';
import type { AppContentStatus } from './model/user-flow';
import { ImportEntryScreen } from '../pages/import-entry/ui/ImportEntryScreen';
import { MonthDetailScreen } from '../pages/month/ui/MonthDetailScreen';
import { SettingsScreen } from '../pages/settings/ui/SettingsScreen';
import { SplashScreen } from '../pages/splash/ui/SplashScreen';
import { YearHomeScreen } from '../pages/year/ui/YearHomeScreen';

function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AppLocalizationProvider>
          <AppRoot />
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
  const safeAreaInsets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { t } = useAppLocalization();
  const [status, setStatus] = useState<AppContentStatus>({ kind: 'loading' });
  const yearUnderlayProgress = useRef(new Animated.Value(0)).current;

  const isMonthOverlayOpen =
    status.kind === 'ready' && status.screen.name === 'month';

  useEffect(() => {
    Animated.timing(yearUnderlayProgress, {
      toValue: isMonthOverlayOpen ? 1 : 0,
      duration: 340,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isMonthOverlayOpen, yearUnderlayProgress]);

  const yearUnderlayStyle = {
    opacity: yearUnderlayProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.48],
    }),
    transform: [
      {
        scale: yearUnderlayProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.94],
        }),
      },
    ],
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapDatabase = async () => {
      try {
        const bootstrappedCalendar = await seedBundledYearIfNeeded();
        const storedCalendar = await getYearCalendar(bootstrappedCalendar.year);

        if (!storedCalendar) {
          throw new Error('Active calendar was not found after bootstrap.');
        }

        if (isMounted) {
          setStatus({
            kind: 'ready',
            calendar: storedCalendar,
            screen: { name: 'year' },
          });
        }
      } catch {
        if (isMounted) {
          setStatus({ kind: 'error' });
        }
      }
    };

    bootstrapDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status.kind === 'loading') {
    return <SplashScreen />;
  }

  if (status.kind === 'error') {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          styles.screenPadding,
          {
            backgroundColor: palette.background,
            paddingTop: safeAreaInsets.top + 24,
            paddingBottom: safeAreaInsets.bottom + 56,
          },
        ]}
      >
        <View style={[styles.errorCard, { borderColor: palette.border }]}>
          <Text style={[styles.title, { color: palette.title }]}>
            {t('app.error.bootstrapTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: palette.subtitle }]}>
            {t('app.error.bootstrapSubtitle')}
          </Text>
        </View>
      </View>
    );
  }

  const goToMonth = (month: number) => {
    if (month < 1 || month > 12) {
      return;
    }

    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      const monthDays = getCalendarDaysForMonth(currentStatus.calendar, month);

      if (monthDays.length === 0) {
        return {
          ...currentStatus,
          screen: { name: 'month-error', month },
        };
      }

      return {
        ...currentStatus,
        screen: { name: 'month', month },
      };
    });
  };

  const closeMonth = () => {
    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        screen: { name: 'year' },
      };
    });
  };

  const openSettings = () => {
    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        screen: { name: 'settings' },
      };
    });
  };

  const closeSettings = () => {
    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        screen: { name: 'year' },
      };
    });
  };

  const openImportEntry = () => {
    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        screen: { name: 'import-entry' },
      };
    });
  };

  const closeImportEntry = () => {
    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        screen: { name: 'settings' },
      };
    });
  };

  const completeImportEntry = (calendar: CalendarYear) => {
    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        calendar,
        screen: { name: 'year' },
      };
    });
  };

  if (status.screen.name === 'month-error') {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          styles.screenPadding,
          {
            backgroundColor: palette.background,
            paddingTop: safeAreaInsets.top + 24,
            paddingBottom: safeAreaInsets.bottom + 56,
          },
        ]}
      >
        <View style={[styles.errorCard, { borderColor: palette.border }]}>
          <Text style={[styles.title, { color: palette.title }]}>
            {t('app.error.monthTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: palette.subtitle }]}>
            {t('app.error.monthSubtitle')}
          </Text>
          <Text
            onPress={closeMonth}
            style={[styles.errorAction, { color: palette.title }]}
          >
            {t('common.backToYear')}
          </Text>
        </View>
      </View>
    );
  }

  if (status.screen.name === 'settings') {
    return (
      <SettingsScreen
        activeYear={status.calendar.year}
        onBack={closeSettings}
        onOpenImportEntry={openImportEntry}
      />
    );
  }

  if (status.screen.name === 'import-entry') {
    return (
      <ImportEntryScreen
        activeYear={status.calendar.year}
        onBack={closeImportEntry}
        onImportCompleted={completeImportEntry}
      />
    );
  }

  return (
    <View style={styles.layerStack}>
      <Animated.View style={[{ flex: 1 }, yearUnderlayStyle]}>
        <YearHomeScreen
          calendar={status.calendar}
          onOpenMonth={goToMonth}
          onOpenSettings={openSettings}
        />
      </Animated.View>
      {status.screen.name === 'month' ? (
        <MonthDetailScreen
          calendar={status.calendar}
          month={status.screen.month}
          onBack={closeMonth}
          onOpenSettings={openSettings}
          onMonthChange={goToMonth}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  layerStack: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenPadding: {
    paddingHorizontal: 24,
  },
  errorCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorAction: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default App;
