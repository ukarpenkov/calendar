import { useEffect, useRef, useState } from 'react';

import {
  getActiveCalendarSource,
  getYearCalendar,
  seedBundledYearIfNeeded,
} from '../../entities/calendar';
import { createVacationRepository, type VacationPeriod } from '../../features/vacation/model';
import { getDatabase } from '../../shared/lib/db';
import { updateCalendarWidget } from '../../widgets/registerWidget';
import type { AppContentStatus } from './user-flow';

/**
 * Loads the active year from SQLite and the saved vacation periods.
 * `retryBootstrap` restarts the same load after a failed start.
 */
export function useAppBootstrap() {
  const [status, setStatus] = useState<AppContentStatus>({ kind: 'loading' });
  const [bootstrapGeneration, setBootstrapGeneration] = useState(0);
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const vacationRepositoryRef = useRef(createVacationRepository(getDatabase()));

  useEffect(() => {
    let isMounted = true;

    const bootstrapDatabase = async () => {
      try {
        const bootstrappedCalendar = await seedBundledYearIfNeeded();
        const storedCalendar = await getYearCalendar(bootstrappedCalendar.year);

        if (!storedCalendar) {
          throw new Error('Active calendar was not found after bootstrap.');
        }

        const activeCalendarSource = await getActiveCalendarSource();

        if (isMounted) {
          setStatus({
            kind: 'ready',
            calendar: storedCalendar,
            activeCalendarSource,
            screen: { name: 'year' },
          });
          updateCalendarWidget();

          try {
            const periods = await vacationRepositoryRef.current.getAll();
            if (isMounted) {
              setVacationPeriods(periods);
            }
          } catch {
            // Vacation periods are optional; keep the empty array.
          }
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

  return {
    status,
    setStatus,
    retryBootstrap,
    vacationPeriods,
    setVacationPeriods,
    vacationRepositoryRef,
  };
}
