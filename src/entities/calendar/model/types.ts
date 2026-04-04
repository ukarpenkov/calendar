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
  /** Локализованное название для UI `tr`; опционально в JSON (`name_tr`). */
  holidayNameTr: string | null;
  /** Локализованное название для UI `id`; опционально в JSON (`name_id`). */
  holidayNameId: string | null;
  /** Локализованное название для UI `ja`; опционально в JSON (`name_ja`). */
  holidayNameJa: string | null;
  isShortened: boolean;
  workHours: number;
}

export interface CalendarYear {
  year: number;
  days: CalendarDay[];
}
