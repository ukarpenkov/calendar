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
  notifyCalendarSyncOnBundledRegionChange,
  type BundledRegionChangeCause,
} from '../../../features/calendar-language-sync';
import type { BundledCalendarRegionCode } from '../../../shared/config/agreedLanguagesAndBundledCalendars';
import { appLanguageToDefaultBundledRegion } from '../../../shared/lib/bundledCalendarRegion';
import { detectDeviceLanguage } from '../../../shared/lib/i18n';
import {
  getStoredBundledCalendarRegion,
  setStoredBundledCalendarRegion,
} from '../../../shared/lib/settings';

export type SetBundledCalendarRegionOptions = {
  changeCause?: BundledRegionChangeCause;
  /**
   * Вызывает синхронизацию SQLite с bundled даже если регион в состоянии уже такой же
   * (нужно при смене языка с активного JSON на встроенный календарь того же региона).
   */
  force?: boolean;
};

type BundledCalendarRegionContextValue = {
  bundledCalendarRegion: BundledCalendarRegionCode;
  setBundledCalendarRegion: (
    region: BundledCalendarRegionCode,
    options?: SetBundledCalendarRegionOptions,
  ) => void;
};

const BundledCalendarRegionContext =
  createContext<BundledCalendarRegionContextValue | null>(null);

export function BundledCalendarRegionProvider({
  children,
}: PropsWithChildren) {
  const [bundledCalendarRegion, setBundledCalendarRegionState] =
    useState<BundledCalendarRegionCode>(() =>
      appLanguageToDefaultBundledRegion(detectDeviceLanguage()),
    );
  const hasManualSelectionRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateStoredRegion = async () => {
      try {
        const storedRegion = await getStoredBundledCalendarRegion();

        if (
          isMounted &&
          storedRegion &&
          !hasManualSelectionRef.current
        ) {
          setBundledCalendarRegionState(storedRegion);
        }
      } catch {
        // Ignore preference hydration failures and keep the device default.
      }
    };

    hydrateStoredRegion().catch(() => {
      // Ignore preference hydration failures and keep the device default.
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetBundledCalendarRegion = useCallback(
    (
      nextRegion: BundledCalendarRegionCode,
      options?: SetBundledCalendarRegionOptions,
    ) => {
      const cause = options?.changeCause ?? 'settings';
      const force = options?.force ?? false;
      const previousRegion = bundledCalendarRegion;

      if (!force && nextRegion === bundledCalendarRegion) {
        return;
      }

      hasManualSelectionRef.current = true;

      if (nextRegion !== bundledCalendarRegion) {
        setBundledCalendarRegionState(nextRegion);

        setStoredBundledCalendarRegion(nextRegion).catch(() => {
          // Ignore persistence failures to keep switching responsive.
        });
      }

      notifyCalendarSyncOnBundledRegionChange(previousRegion, nextRegion, cause);
    },
    [bundledCalendarRegion],
  );

  const value = useMemo<BundledCalendarRegionContextValue>(
    () => ({
      bundledCalendarRegion,
      setBundledCalendarRegion: handleSetBundledCalendarRegion,
    }),
    [bundledCalendarRegion, handleSetBundledCalendarRegion],
  );

  return (
    <BundledCalendarRegionContext.Provider value={value}>
      {children}
    </BundledCalendarRegionContext.Provider>
  );
}

export function useBundledCalendarRegion() {
  const context = useContext(BundledCalendarRegionContext);

  if (!context) {
    throw new Error(
      'useBundledCalendarRegion must be used inside BundledCalendarRegionProvider.',
    );
  }

  return context;
}
