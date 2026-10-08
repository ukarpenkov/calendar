import type { VacationPeriod } from '../model/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function overlapsVacation(
  startDate: string,
  endDate: string,
  periods: readonly VacationPeriod[],
): boolean {
  return periods.some(
    period => startDate <= period.endDate && endDate >= period.startDate,
  );
}

/** Inclusive days available before the next vacation or the end of the year. */
export function getMaxVacationDays(
  startDate: string,
  year: number,
  periods: readonly VacationPeriod[],
): number {
  if (
    !startDate.startsWith(`${year}-`) ||
    overlapsVacation(startDate, startDate, periods)
  ) {
    return 0;
  }
  let endExclusive = `${year + 1}-01-01`;
  for (const period of periods) {
    if (period.startDate > startDate && period.startDate < endExclusive) {
      endExclusive = period.startDate;
    }
  }
  return Math.round(
    (Date.parse(endExclusive) - Date.parse(startDate)) / DAY_MS,
  );
}
