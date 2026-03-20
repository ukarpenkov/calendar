export type DayType = 'workday' | 'weekend' | 'holiday' | 'shortened';

export interface CalendarDay {
  date: string;
  year: number;
  month: number;
  day: number;
  weekday: number;
  type: DayType;
  holidayNameRu: string | null;
  holidayNameEn: string | null;
  isShortened: boolean;
  workHours: number;
}

export interface CalendarYear {
  year: number;
  days: CalendarDay[];
}
