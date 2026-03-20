import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import {
  getCalendarPalette,
  type CalendarPalette,
} from '../../../entities/calendar';

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
  const isDarkMode = themeMode === 'dark';

  const value = useMemo<AppThemeContextValue>(
    () => ({
      themeMode,
      isDarkMode,
      palette: getCalendarPalette(isDarkMode),
      setThemeMode,
      toggleTheme: () => {
        setThemeMode(currentMode => (currentMode === 'dark' ? 'light' : 'dark'));
      },
    }),
    [isDarkMode, themeMode],
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
