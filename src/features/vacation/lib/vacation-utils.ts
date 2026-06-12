import type { CalendarDay } from '../../../entities/calendar/model/types';

export function getVacationDaysInRange(
  startDate: string,
  endDate: string,
  calendarDays: CalendarDay[],
): { totalDays: number; workDays: number; preHolidayDates: string[] } {
  if (endDate < startDate) {
    return { totalDays: 0, workDays: 0, preHolidayDates: [] };
  }

  const daysInRange = calendarDays.filter(
    d => d.date >= startDate && d.date <= endDate,
  );

  const totalDays = daysInRange.length;
  const workDays = daysInRange.filter(d => d.type === 'workday').length;

  const holidayDatesInRange = new Set(
    daysInRange.filter(d => d.type === 'holiday').map(d => d.date),
  );

  const preHolidayDates = daysInRange
    .filter(d => {
      const nextDate = getNextDate(d.date);
      return holidayDatesInRange.has(nextDate);
    })
    .map(d => d.date);

  return { totalDays, workDays, preHolidayDates };
}

function getNextDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d + 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
