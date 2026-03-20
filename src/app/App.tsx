import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
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
import { MonthDetailScreen } from '../pages/month/ui/MonthDetailScreen';
import { SplashScreen } from '../pages/splash/ui/SplashScreen';
import { YearHomeScreen } from '../pages/year/ui/YearHomeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent isDarkMode={isDarkMode} />
    </SafeAreaProvider>
  );
}

type AppContentProps = {
  isDarkMode: boolean;
};

type ReadyScreen =
  | { name: 'year' }
  | { name: 'month-loading'; month: number }
  | { name: 'month-error'; month: number }
  | { name: 'month'; month: number; days: CalendarDay[] };

function AppContent({ isDarkMode }: AppContentProps) {
  const safeAreaInsets = useSafeAreaInsets();
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
      } catch (error) {
        if (isMounted) {
          setStatus({ kind: 'error' });
        }
      }
    };

    void bootstrapDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status.kind === 'loading') {
    return <SplashScreen isDarkMode={isDarkMode} />;
  }

  if (status.kind === 'error') {
    const palette = isDarkMode
      ? {
          background: '#020617',
          title: '#f8fafc',
          subtitle: '#94a3b8',
          border: '#1e293b',
        }
      : {
          background: '#f8fafc',
          title: '#0f172a',
          subtitle: '#475569',
          border: '#cbd5e1',
        };

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
            Failed to initialize local calendar data.
          </Text>
          <Text style={[styles.subtitle, { color: palette.subtitle }]}>
          Fix the storage error and relaunch the app.
          </Text>
        </View>
      </View>
    );
  }

  const openMonth = async (month: number) => {
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
    } catch (error) {
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

  if (status.screen.name === 'month-loading') {
    return <SplashScreen isDarkMode={isDarkMode} />;
  }

  if (status.screen.name === 'month-error') {
    const palette = isDarkMode
      ? {
          background: '#020617',
          title: '#f8fafc',
          subtitle: '#94a3b8',
          border: '#1e293b',
        }
      : {
          background: '#f8fafc',
          title: '#0f172a',
          subtitle: '#475569',
          border: '#cbd5e1',
        };

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
            Failed to open the selected month.
          </Text>
          <Text style={[styles.subtitle, { color: palette.subtitle }]}>
            Return to the year overview and try again.
          </Text>
          <Text
            onPress={closeMonth}
            style={[styles.errorAction, { color: palette.title }]}
          >
            Back to year
          </Text>
        </View>
      </View>
    );
  }

  if (status.screen.name === 'month') {
    return (
      <MonthDetailScreen
        year={status.calendar.year}
        month={status.screen.month}
        days={status.screen.days}
        isDarkMode={isDarkMode}
        onBack={closeMonth}
      />
    );
  }

  return (
    <YearHomeScreen
      calendar={status.calendar}
      isDarkMode={isDarkMode}
      onOpenMonth={openMonth}
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
