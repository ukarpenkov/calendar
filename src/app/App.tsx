import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  getYearCalendar,
  seedBundledYearIfNeeded,
  type CalendarYear,
} from '../entities/calendar';
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

function AppContent({ isDarkMode }: AppContentProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const [status, setStatus] = useState<
    | { kind: 'loading' }
    | { kind: 'ready'; calendar: CalendarYear }
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
          setStatus({ kind: 'ready', calendar: storedCalendar });
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

  return (
    <YearHomeScreen calendar={status.calendar} isDarkMode={isDarkMode} />
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
});

export default App;
