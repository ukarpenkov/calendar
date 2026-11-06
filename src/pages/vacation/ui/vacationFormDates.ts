export function daysBetweenDates(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export function addDaysToDate(startIso: string, days: number): string {
  const date = new Date(startIso);
  date.setUTCDate(date.getUTCDate() + days - 1);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isoToDisplayDate(iso: string): string {
  if (!iso) {
    return '';
  }
  const [_y, m, d] = iso.split('-');
  return `${d}.${m}`;
}
