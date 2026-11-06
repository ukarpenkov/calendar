export type VacationDateRange = {
  startDate: string;
  endDate: string;
};

export function findVacationPeriod<T extends VacationDateRange>(
  date: string,
  periods: readonly T[],
): T | undefined {
  for (const period of periods) {
    if (date >= period.startDate && date <= period.endDate) {
      return period;
    }
  }

  return undefined;
}

export function isDateOnVacation(
  date: string,
  periods: readonly VacationDateRange[],
): boolean {
  return findVacationPeriod(date, periods) !== undefined;
}

export function getVacationColorForDate(
  date: string,
  periods: readonly (VacationDateRange & { color: string })[],
): string | undefined {
  return findVacationPeriod(date, periods)?.color;
}
