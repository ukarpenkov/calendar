import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
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
  registerCalendarSyncOnAppLanguageChange,
  registerCalendarSyncOnBundledRegionChange,
  syncActiveYearWithBundledRegion,
} from '../features/calendar-language-sync';
import { appLanguageToDefaultBundledRegion } from '../shared/lib/bundledCalendarRegion';
import {
  BundledCalendarRegionProvider,
  useBundledCalendarRegion,
} from './providers/bundled-calendar-region';
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
  const safeAreaInsets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { t } = useAppLocalization();
  const { setBundledCalendarRegion } = useBundledCalendarRegion();
  const setBundledCalendarRegionRef = useRef(setBundledCalendarRegion);
  setBundledCalendarRegionRef.current = setBundledCalendarRegion;
  const [status, setStatus] = useState<AppContentStatus>({ kind: 'loading' });
  const [bootstrapGeneration, setBootstrapGeneration] = useState(0);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    registerCalendarSyncOnAppLanguageChange((_previous, nextLanguage) => {
      if (nextLanguage === 'en') {
        return;
      }
      const targetRegion = appLanguageToDefaultBundledRegion(nextLanguage);
      setBundledCalendarRegionRef.current(targetRegion);
    });

    return () => {
      registerCalendarSyncOnAppLanguageChange(null);
    };
  }, []);

  useEffect(() => {
    registerCalendarSyncOnBundledRegionChange(
      async (_previousRegion, nextRegion) => {
        const current = statusRef.current;
        if (current.kind !== 'ready') {
          return;
        }

        try {
          const updated = await syncActiveYearWithBundledRegion({
            region: nextRegion,
            activeCalendarYear: current.calendar.year,
          });
          if (!updated) {
            return;
          }

          setStatus(latest => {
            if (latest.kind !== 'ready') {
              return latest;
            }
            return { ...latest, calendar: updated };
          });
        } catch {
          // Оставляем текущий календарь в UI; SQLite не меняется при ошибке до завершения replace.
        }
      },
    );

    return () => {
      registerCalendarSyncOnBundledRegionChange(null);
    };
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (status.kind !== 'ready') {
        return false;
      }

      switch (status.screen.name) {
        case 'month':
        case 'month-error':
        case 'settings':
        case 'import-entry':
          setStatus(current => {
            if (current.kind !== 'ready') {
              return current;
            }
            const screenName = current.screen.name;
            if (screenName === 'month' || screenName === 'month-error') {
              return { ...current, screen: { name: 'year' } };
            }
            if (screenName === 'settings') {
              return { ...current, screen: { name: 'year' } };
            }
            if (screenName === 'import-entry') {
              return { ...current, screen: { name: 'settings' } };
            }
            return current;
          });
          return true;
        default:
          return false;
      }
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [status]);

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
  }, [bootstrapGeneration]);

  const retryBootstrap = () => {
    setStatus({ kind: 'loading' });
    setBootstrapGeneration(generation => generation + 1);
  };

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('app.error.bootstrapRetry')}
            testID="app-bootstrap-retry"
            onPress={retryBootstrap}
            style={({ pressed }) => [
              styles.errorPrimaryAction,
              {
                backgroundColor: palette.selectedBorder,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={styles.errorPrimaryActionText}>
              {t('app.error.bootstrapRetry')}
            </Text>
          </Pressable>
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.backToYear')}
            testID="app-month-error-back"
            onPress={closeMonth}
            style={({ pressed }) => [
              styles.errorSecondaryAction,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={[styles.errorAction, { color: palette.title }]}>
              {t('common.backToYear')}
            </Text>
          </Pressable>
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
      <View style={styles.yearLayer}>
        <YearHomeScreen
          calendar={status.calendar}
          onOpenMonth={goToMonth}
          onOpenSettings={openSettings}
        />
      </View>
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
  yearLayer: {
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
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorPrimaryAction: {
    marginTop: 20,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  errorPrimaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorSecondaryAction: {
    marginTop: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
});

export default App;
