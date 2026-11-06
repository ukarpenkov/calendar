import type { CalendarYear } from '../../../entities/calendar';

export type ImportEntryErrorState = {
  title: string;
  body: string;
  details: string[];
};

export type ImportPanel =
  | 'choose'
  | 'validating'
  | 'review'
  | 'confirm'
  | 'importing'
  | 'success'
  | 'error';

export function formatFileSize(size: number | null): string | null {
  if (size === null || Number.isNaN(size)) {
    return null;
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function getImportPreviewStats(calendar: CalendarYear) {
  return calendar.days.reduce(
    (summary, day) => {
      const isWorkingDay = day.type === 'workday' || day.type === 'shortened';

      return {
        totalDays: summary.totalDays + 1,
        workingDays: summary.workingDays + (isWorkingDay ? 1 : 0),
        nonWorkingDays: summary.nonWorkingDays + (isWorkingDay ? 0 : 1),
        workHours: summary.workHours + day.workHours,
      };
    },
    {
      totalDays: 0,
      workingDays: 0,
      nonWorkingDays: 0,
      workHours: 0,
    },
  );
}

export function getStepperIndex(panel: ImportPanel): number {
  if (panel === 'success') {
    return 3;
  }

  if (panel === 'choose' || panel === 'validating' || panel === 'error') {
    return 0;
  }

  if (panel === 'review') {
    return 1;
  }

  return 2;
}

