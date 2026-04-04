import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  detectDeviceLanguage,
  getTranslation,
  type AppLanguage,
  type TranslationKey,
} from '../../../shared/lib/i18n';
import { getStoredLanguage, setStoredLanguage } from '../../../shared/lib/settings';

type LocalizationParams = Record<string, number | string>;

type AppLocalizationContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey, params?: LocalizationParams) => string;
};

const AppLocalizationContext =
  createContext<AppLocalizationContextValue | null>(null);

export function AppLocalizationProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<AppLanguage>(detectDeviceLanguage);
  const hasManualLanguageSelectionRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateStoredLanguage = async () => {
      try {
        const storedLanguage = await getStoredLanguage();

        if (
          isMounted &&
          storedLanguage &&
          !hasManualLanguageSelectionRef.current
        ) {
          setLanguage(storedLanguage);
        }
      } catch {
        // Ignore preference hydration failures and keep the device default.
      }
    };

    hydrateStoredLanguage().catch(() => {
      // Ignore preference hydration failures and keep the device default.
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetLanguage = useCallback(
    (nextLanguage: AppLanguage) => {
      if (nextLanguage === language) {
        return;
      }

      hasManualLanguageSelectionRef.current = true;
      setLanguage(nextLanguage);

      setStoredLanguage(nextLanguage).catch(() => {
        // Ignore persistence failures to keep language switching responsive.
      });
    },
    [language],
  );

  const value = useMemo<AppLocalizationContextValue>(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t: (key, params) => getTranslation(language, key, params),
    }),
    [handleSetLanguage, language],
  );

  return (
    <AppLocalizationContext.Provider value={value}>
      {children}
    </AppLocalizationContext.Provider>
  );
}

export function useAppLocalization() {
  const context = useContext(AppLocalizationContext);

  if (!context) {
    throw new Error(
      'useAppLocalization must be used inside AppLocalizationProvider.',
    );
  }

  return context;
}
