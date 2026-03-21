import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import {
  getCalendarPalette,
  type CalendarPalette,
} from '../../../entities/calendar';
import { getStoredTheme, setStoredTheme } from '../../../shared/lib/settings';

export type ThemeMode = 'light' | 'dark';

type AppThemeContextValue = {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  palette: CalendarPalette;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    systemColorScheme === 'dark' ? 'dark' : 'light',
  );
  const hasManualThemeSelectionRef = useRef(false);
  const isDarkMode = themeMode === 'dark';

  useEffect(() => {
    let isMounted = true;

    const hydrateStoredTheme = async () => {
      try {
        const storedTheme = await getStoredTheme();

        if (isMounted && storedTheme && !hasManualThemeSelectionRef.current) {
          setThemeMode(storedTheme);
        }
      } catch {
        // Ignore preference hydration failures and keep the system default.
      }
    };

    hydrateStoredTheme().catch(() => {
      // Ignore preference hydration failures and keep the system default.
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetThemeMode = useCallback((nextThemeMode: ThemeMode) => {
    hasManualThemeSelectionRef.current = true;
    setThemeMode(nextThemeMode);

    setStoredTheme(nextThemeMode).catch(() => {
      // Ignore persistence failures to keep theme switching responsive.
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    handleSetThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [handleSetThemeMode, themeMode]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      themeMode,
      isDarkMode,
      palette: getCalendarPalette(isDarkMode),
      setThemeMode: handleSetThemeMode,
      toggleTheme: handleToggleTheme,
    }),
    [handleSetThemeMode, handleToggleTheme, isDarkMode, themeMode],
  );

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider.');
  }

  return context;
}
