import type { AppLanguage } from '../../../shared/lib/i18n';
import type { DayType } from '../model/types';

export type CalendarPalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  title: string;
  subtitle: string;
  icon: string;
  selectedFill: string;
  selectedBorder: string;
  workdayFill: string;
  workdayBorder: string;
  weekendFill: string;
  weekendBorder: string;
  holidayFill: string;
  holidayBorder: string;
  shortenedFill: string;
  shortenedBorder: string;
  workdayText: string;
  accentText: string;
};

export type DayTypeColors = {
  backgroundColor: string;
  borderColor: string;
  color: string;
};

export function getCalendarPalette(isDarkMode: boolean): CalendarPalette {
  if (isDarkMode) {
    return {
      background: '#12141A',
      surface: '#1B1F27',
      surfaceMuted: '#232834',
      border: '#2C3442',
      title: '#E8EAEF',
      subtitle: '#9AA3B2',
      icon: '#D6DAE3',
      selectedFill: '#0F172A',
      selectedBorder: '#60A5FA',
      workdayFill: '#1B1F27',
      workdayBorder: '#3A4252',
      weekendFill: '#1E3A5F',
      weekendBorder: '#3B82F6',
      holidayFill: '#472326',
      holidayBorder: '#F87171',
      shortenedFill: '#4A371A',
      shortenedBorder: '#F59E0B',
      workdayText: '#E8EAEF',
      accentText: '#F8FAFC',
    };
  }

  return {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    border: '#E2E6ED',
    title: '#1A1D26',
    subtitle: '#5C667A',
    icon: '#374151',
    selectedFill: '#EFF6FF',
    selectedBorder: '#2563EB',
    workdayFill: '#FFFFFF',
    workdayBorder: '#E5E7EB',
    weekendFill: '#DBEAFE',
    weekendBorder: '#3B82F6',
    holidayFill: '#FEE2E2',
    holidayBorder: '#EF4444',
    shortenedFill: '#FEF3C7',
    shortenedBorder: '#F59E0B',
    workdayText: '#1A1D26',
    accentText: '#0F172A',
  };
}

export function getDayTypeColors(
  type: DayType,
  palette: CalendarPalette,
): DayTypeColors {
  if (type === 'weekend') {
    return {
      backgroundColor: palette.weekendFill,
      borderColor: palette.weekendBorder,
      color: palette.accentText,
    };
  }

  if (type === 'holiday') {
    return {
      backgroundColor: palette.holidayFill,
      borderColor: palette.holidayBorder,
      color: palette.accentText,
    };
  }

  if (type === 'shortened') {
    return {
      backgroundColor: palette.shortenedFill,
      borderColor: palette.shortenedBorder,
      color: palette.accentText,
    };
  }

  return {
    backgroundColor: palette.workdayFill,
    borderColor: palette.workdayBorder,
    color: palette.workdayText,
  };
}

export function getDayTypeLabel(type: DayType, language: AppLanguage): string {
  if (language === 'ru') {
    if (type === 'weekend') {
      return 'Выходной';
    }

    if (type === 'holiday') {
      return 'Праздник';
    }

    if (type === 'shortened') {
      return 'Сокращенный';
    }

    return 'Рабочий день';
  }

  if (language === 'tr') {
    if (type === 'weekend') {
      return 'Hafta sonu';
    }

    if (type === 'holiday') {
      return 'Resmi tatil';
    }

    if (type === 'shortened') {
      return 'Kısa gün';
    }

    return 'İş günü';
  }

  if (language === 'id') {
    if (type === 'weekend') {
      return 'Akhir pekan';
    }

    if (type === 'holiday') {
      return 'Hari libur';
    }

    if (type === 'shortened') {
      return 'Hari pendek';
    }

    return 'Hari kerja';
  }

  if (language === 'ja') {
    if (type === 'weekend') {
      return '週末';
    }

    if (type === 'holiday') {
      return '祝日';
    }

    if (type === 'shortened') {
      return '短縮勤務日';
    }

    return '平日';
  }

  if (type === 'weekend') {
    return 'Weekend';
  }

  if (type === 'holiday') {
    return 'Holiday';
  }

  if (type === 'shortened') {
    return 'Shortened';
  }

  return 'Workday';
}
