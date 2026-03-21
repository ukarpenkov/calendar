import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  getMonthCalendar,
  getYearCalendar,
  seedBundledYearIfNeeded,
  type CalendarDay,
  type CalendarYear,
} from '../entities/calendar';
import {
  AppLocalizationProvider,
  useAppLocalization,
} from './providers/localization';
import { AppThemeProvider, useAppTheme } from './providers/theme';
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

type ReadyScreen =
  | { name: 'year' }
  | { name: 'settings' }
  | { name: 'import-entry' }
  | { name: 'month-loading'; month: number }
  | { name: 'month-error'; month: number }
  | { name: 'month'; month: number; days: CalendarDay[] };

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
  const [status, setStatus] = useState<
    | { kind: 'loading' }
    | { kind: 'ready'; calendar: CalendarYear; screen: ReadyScreen }
    | { kind: 'error' }
  >({ kind: 'loading' });

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
            paddingBottom: safeAreaInsets.bottom + 24,
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

  const openMonth = async (month: number) => {
    if (month < 1 || month > 12) {
      return;
    }

    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        screen: { name: 'month-loading', month },
      };
    });

    try {
      const monthDays = await getMonthCalendar(status.calendar.year, month);

      if (monthDays.length === 0) {
        throw new Error('Month data was not found.');
      }

      setStatus(currentStatus => {
        if (currentStatus.kind !== 'ready') {
          return currentStatus;
        }

        return {
          ...currentStatus,
          screen: {
            name: 'month',
            month,
            days: monthDays,
          },
        };
      });
    } catch {
      setStatus(currentStatus => {
        if (currentStatus.kind !== 'ready') {
          return currentStatus;
        }

        return {
          ...currentStatus,
          screen: { name: 'month-error', month },
        };
      });
    }
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

  if (status.screen.name === 'month-loading') {
    return <SplashScreen />;
  }

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
            paddingBottom: safeAreaInsets.bottom + 24,
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

  if (status.screen.name === 'month') {
    const currentMonth = status.screen.month;

    return (
      <MonthDetailScreen
        year={status.calendar.year}
        month={currentMonth}
        days={status.screen.days}
        onBack={closeMonth}
        onOpenPreviousMonth={
          currentMonth > 1
            ? () => {
                openMonth(currentMonth - 1);
              }
            : undefined
        }
        onOpenNextMonth={
          currentMonth < 12
            ? () => {
                openMonth(currentMonth + 1);
              }
            : undefined
        }
      />
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
      />
    );
  }

  return (
    <YearHomeScreen
      calendar={status.calendar}
      onOpenMonth={openMonth}
      onOpenSettings={openSettings}
    />
  );
}

const styles = StyleSheet.create({
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
