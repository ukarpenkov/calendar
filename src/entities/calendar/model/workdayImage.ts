import type { CalendarDay } from './types';

const weekdayNames = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
type WorkdayImageKey = `default_work_${(typeof weekdayNames)[number]}${
  | ''
  | '_2'}`;

/** Monday-based calendar rows; the partial first week counts as week one. */
export function getWorkdayImageKey(day: CalendarDay): WorkdayImageKey | null {
  const weekday = weekdayNames[day.weekday - 1];
  if (!weekday) return null;

  const weekIndex = Math.floor((day.day - day.weekday + 6) / 7);
  return `default_work_${weekday}${weekIndex % 2 === 1 ? '_2' : ''}`;
}

export type { WorkdayImageKey };
