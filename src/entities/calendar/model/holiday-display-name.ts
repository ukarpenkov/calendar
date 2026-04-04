import type { AppLanguage } from '../../../shared/lib/i18n';

import type { CalendarDay } from './types';

function firstNonEmpty(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    if (value !== null && value !== undefined && value.length > 0) {
      return value;
    }
  }

  return null;
}

/**
 * Подпись праздника для текущего языка UI с предсказуемым fallback (EN/RU),
 * если отдельное поле для языка в данных отсутствует.
 */
export function getHolidayDisplayName(
  day: CalendarDay,
  language: AppLanguage,
): string | null {
  const {
    holidayNameRu,
    holidayNameEn,
    holidayNameTr,
    holidayNameId,
    holidayNameJa,
  } = day;

  switch (language) {
    case 'ru':
      return firstNonEmpty(
        holidayNameRu,
        holidayNameEn,
        holidayNameTr,
        holidayNameId,
        holidayNameJa,
      );
    case 'en':
      return firstNonEmpty(
        holidayNameEn,
        holidayNameRu,
        holidayNameTr,
        holidayNameId,
        holidayNameJa,
      );
    case 'tr':
      return firstNonEmpty(holidayNameTr, holidayNameEn, holidayNameRu);
    case 'id':
      return firstNonEmpty(holidayNameId, holidayNameEn, holidayNameRu);
    case 'ja':
      return firstNonEmpty(holidayNameJa, holidayNameEn, holidayNameRu);
    default: {
      const _exhaustive: never = language;
      return _exhaustive;
    }
  }
}
