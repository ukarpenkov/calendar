import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  activateUserJsonImport,
  buildCalendarYearViewCache,
  type CalendarYear,
} from '../../entities/calendar';
import {
  registerCalendarSyncOnAppLanguageChange,
  registerCalendarSyncOnBundledRegionChange,
  syncActiveYearWithBundledRegion,
} from '../../features/calendar-language-sync';
import type { VacationPeriod } from '../../features/vacation/model';
import { getBundledRegionToApplyOnManualAppLanguageChange } from '../../shared/lib/bundledCalendarRegion';
import type { AppLanguage } from '../../shared/lib/i18n';
import { scheduleIdleTask } from '../../shared/lib/ui/scheduleIdleTask';
import { updateCalendarWidget } from '../../widgets/registerWidget';
import { useBundledCalendarRegion } from '../providers/bundled-calendar-region';
import { useAppLocalization } from '../providers/localization';
import { useAppTheme } from '../providers/theme';
import { useAppBootstrap } from './useAppBootstrap';
import { useHardwareBack } from './useHardwareBack';
import type { ReadyScreen } from './user-flow';

/**
 * Screen state for the running app: which layer is open, and the actions that
 * move between year, month, settings, import, and vacation.
 *
 * Language → calendar link: `AppLocalizationProvider` calls
 * `notifyCalendarSyncOnAppLanguageChange`. The handler registered below is the
 * only place that turns that signal into a bundled-region change. The region
 * provider then notifies `registerCalendarSyncOnBundledRegionChange`, which
 * reloads SQLite. Neither provider imports this screen.
 */
export function useCalendarSession() {
  const { palette } = useAppTheme();
  const { language, setLanguage, t } = useAppLocalization();
  const { setBundledCalendarRegion } = useBundledCalendarRegion();
  const setBundledCalendarRegionRef = useRef(setBundledCalendarRegion);
  setBundledCalendarRegionRef.current = setBundledCalendarRegion;

  const {
    status,
    setStatus,
    retryBootstrap,
    vacationPeriods,
    setVacationPeriods,
    vacationRepositoryRef,
  } = useAppBootstrap();

  const [jsonImportSavedRevision, setJsonImportSavedRevision] = useState(0);
  const [editingPeriod, setEditingPeriod] = useState<VacationPeriod | null>(null);
  const [closingSettings, setClosingSettings] = useState(false);
  const [showVacationForm, setShowVacationForm] = useState(false);
  const [preparedMonth, setPreparedMonth] = useState<number | null>(null);
  const [monthOrigin, setMonthOrigin] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const settingsReturnScreen = useRef<
    Extract<ReadyScreen, { name: 'year' | 'month' }>
  >({ name: 'year' });
  const statusRef = useRef(status);
  statusRef.current = status;

  const finishClosingSettings = useCallback(() => {
    setStatus(currentStatus => {
      if (
        currentStatus.kind !== 'ready' ||
        currentStatus.screen.name !== 'settings'
      ) {
        return currentStatus;
      }
      return { ...currentStatus, screen: settingsReturnScreen.current };
    });
    setClosingSettings(false);
  }, [setStatus]);

  const activeCalendar = status.kind === 'ready' ? status.calendar : null;
  const calendarYearView = useMemo(
    () =>
      activeCalendar
        ? buildCalendarYearViewCache(activeCalendar, language)
        : null,
    [activeCalendar, language],
  );

  useEffect(() => {
    registerCalendarSyncOnAppLanguageChange((_previous, nextLanguage) => {
      const targetRegion =
        getBundledRegionToApplyOnManualAppLanguageChange(nextLanguage);
      if (targetRegion === null) {
        return;
      }
      setBundledCalendarRegionRef.current(targetRegion, {
        changeCause: 'app_language',
        force: true,
      });
    });

    return () => {
      registerCalendarSyncOnAppLanguageChange(null);
    };
  }, []);

  useEffect(() => {
    registerCalendarSyncOnBundledRegionChange(
      async (_previousRegion, nextRegion, cause) => {
        const current = statusRef.current;
        if (current.kind !== 'ready') {
          return;
        }

        try {
          const updated = await syncActiveYearWithBundledRegion({
            region: nextRegion,
            activeCalendarYear: current.calendar.year,
            changeCause: cause,
          });
          if (!updated) {
            return;
          }

          setStatus(latest => {
            if (latest.kind !== 'ready') {
              return latest;
            }
            return {
              ...latest,
              calendar: updated,
              activeCalendarSource: 'bundled',
            };
          });
        } catch {
          // Keep the calendar on screen; SQLite is unchanged if replace fails.
        }
      },
    );

    return () => {
      registerCalendarSyncOnBundledRegionChange(null);
    };
  }, [setStatus]);

  useHardwareBack({
    status,
    showVacationForm,
    setClosingSettings,
    setShowVacationForm,
    setEditingPeriod,
    setStatus,
  });

  useEffect(() => {
    if (status.kind !== 'ready') {
      return;
    }

    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        updateCalendarWidget();
      }
    });

    return () => sub.remove();
  }, [status.kind]);

  useEffect(() => {
    if (!calendarYearView || preparedMonth !== null) {
      return;
    }
    const cancel = scheduleIdleTask(() => {
      const current = new Date().getMonth() + 1;
      setPreparedMonth(calendarYearView.monthDetails[current] ? current : 1);
    });
    return cancel;
  }, [calendarYearView, preparedMonth]);

  const goToMonth = useCallback(
    (
      month: number,
      origin?: { x: number; y: number; width: number; height: number },
    ) => {
      if (month < 1 || month > 12) {
        return;
      }

      setPreparedMonth(month);
      if (origin) {
        setMonthOrigin(origin);
      } else if (
        statusRef.current.kind !== 'ready' ||
        statusRef.current.screen.name !== 'month'
      ) {
        setMonthOrigin(null);
      }

      setStatus(currentStatus => {
        if (currentStatus.kind !== 'ready') {
          return currentStatus;
        }

        const monthDetail = calendarYearView?.monthDetails[month];

        if (!monthDetail) {
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
    },
    [calendarYearView, setStatus],
  );

  const closeMonth = useCallback(() => {
    setMonthOrigin(null);

    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        screen: { name: 'year' },
      };
    });
  }, [setStatus]);

  const openSettings = useCallback(() => {
    setClosingSettings(false);
    const current = statusRef.current;
    if (
      current.kind === 'ready' &&
      (current.screen.name === 'year' || current.screen.name === 'month')
    ) {
      settingsReturnScreen.current = current.screen;
    }
    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        screen: { name: 'settings' },
      };
    });
  }, [setStatus]);

  const openVacation = useCallback(() => {
    setStatus(currentStatus => {
      if (currentStatus.kind !== 'ready') {
        return currentStatus;
      }

      return {
        ...currentStatus,
        screen: { name: 'vacation' },
      };
    });
  }, [setStatus]);

  const prepareMonth = useCallback((month: number) => {
    if (month >= 1 && month <= 12) {
      setPreparedMonth(month);
    }
  }, []);

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

  const refreshVacationPeriods = async () => {
    try {
      const periods = await vacationRepositoryRef.current.getAll();
      setVacationPeriods(periods);
    } catch {
      // Vacation periods are optional; keep the current array.
    }
  };

  const onVacationAdd = () => {
    setEditingPeriod(null);
    setShowVacationForm(true);
  };

  const onVacationEdit = (period: VacationPeriod) => {
    setEditingPeriod(period);
    setShowVacationForm(true);
  };

  const onVacationSave = async (
    startDate: string,
    endDate: string,
    color: string,
  ) => {
    try {
      if (editingPeriod === null) {
        await vacationRepositoryRef.current.create(startDate, endDate, color);
      } else {
        await vacationRepositoryRef.current.update(
          editingPeriod.id,
          startDate,
          endDate,
          color,
        );
      }
      await refreshVacationPeriods();
      setShowVacationForm(false);
      setEditingPeriod(null);
    } catch {
      // Keep the current state on error.
    }
  };

  const onVacationDelete = async () => {
    if (editingPeriod === null) {
      return;
    }
    try {
      await vacationRepositoryRef.current.remove(editingPeriod.id);
      await refreshVacationPeriods();
      setShowVacationForm(false);
      setEditingPeriod(null);
    } catch {
      // Keep the current state on error.
    }
  };

  const onVacationFormCancel = () => {
    setShowVacationForm(false);
    setEditingPeriod(null);
  };

  const completeImportEntry = (calendar: CalendarYear) => {
    setJsonImportSavedRevision(revision => revision + 1);
    setLanguage('en');

    activateUserJsonImport()
      .then(activatedCalendar => {
        setStatus(currentStatus => {
          if (currentStatus.kind !== 'ready') {
            return currentStatus;
          }

          return {
            ...currentStatus,
            calendar: activatedCalendar ?? calendar,
            activeCalendarSource: 'user_json_import',
            screen: { name: 'settings' },
          };
        });
      })
      .catch(() => {
        setStatus(currentStatus => {
          if (currentStatus.kind !== 'ready') {
            return currentStatus;
          }

          return {
            ...currentStatus,
            screen: { name: 'settings' },
          };
        });
      });
  };

  const selectUserJsonImportCalendar = () => {
    activateUserJsonImport()
      .then(calendar => {
        if (!calendar) {
          return;
        }

        setStatus(currentStatus => {
          if (currentStatus.kind !== 'ready') {
            return currentStatus;
          }

          return {
            ...currentStatus,
            calendar,
            activeCalendarSource: 'user_json_import',
          };
        });
      })
      .catch(() => {
        // Keep the current calendar visible if the saved JSON slot cannot be activated.
      });
  };

  return {
    palette,
    language: language as AppLanguage,
    setLanguage,
    t,
    status,
    retryBootstrap,
    calendarYearView,
    vacationPeriods,
    preparedMonth,
    monthOrigin,
    closingSettings,
    showVacationForm,
    editingPeriod,
    jsonImportSavedRevision,
    settingsReturnScreen,
    finishClosingSettings,
    goToMonth,
    closeMonth,
    openSettings,
    openVacation,
    prepareMonth,
    closeSettings: () => setClosingSettings(true),
    openImportEntry,
    closeImportEntry,
    selectUserJsonImportCalendar,
    completeImportEntry,
    onVacationAdd,
    onVacationEdit,
    onVacationSave,
    onVacationDelete,
    onVacationFormCancel,
  };
}

export type CalendarSession = ReturnType<typeof useCalendarSession>;
