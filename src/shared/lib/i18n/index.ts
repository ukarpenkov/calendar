import type {
  AgreedAppLanguageCode,
  BundledCalendarRegionCode,
} from '../../config/agreedLanguagesAndBundledCalendars';

import { translations, type TranslationKey } from './messages/catalog';

export type AppLanguage = AgreedAppLanguageCode;

export type { TranslationKey };

type TranslationParams = Record<string, number | string>;

const MONTH_LABELS: Record<AppLanguage, readonly string[]> = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  ru: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  tr: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  id: [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ],
  ja: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
};

const MONTH_SHORT_LABELS: Record<AppLanguage, readonly string[]> = {
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

const COMPACT_WEEKDAY_LABELS: Record<AppLanguage, readonly string[]> = {
  es: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  tr: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'],
  id: ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'],
  ja: ['月', '火', '水', '木', '金', '土', '日'],
};

const SHORT_WEEKDAY_LABELS: Record<AppLanguage, readonly string[]> = {
  es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz'],
  id: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
  ja: ['月', '火', '水', '木', '金', '土', '日'],
};

const LANGUAGE_LABELS_BY_UI: Record<AppLanguage, Record<AppLanguage, string>> = {
  es: { en: 'Inglés', ru: 'Ruso', tr: 'Turco', id: 'Indonesio', ja: 'Japonés', es: 'Español' },
  en: {
    en: 'English',
    ru: 'Russian',
    tr: 'Turkish',
    id: 'Indonesian',
    ja: 'Japanese',
    es: 'Spanish',
  },
  ru: {
    en: 'Английский',
    ru: 'Русский',
    tr: 'Турецкий',
    id: 'Индонезийский',
    ja: 'Японский',
    es: 'Испанский',
  },
  tr: {
    en: 'İngilizce',
    ru: 'Rusça',
    tr: 'Türkçe',
    id: 'Endonezce',
    ja: 'Japonca',
    es: 'İspanyolca',
  },
  id: {
    en: 'Inggris',
    ru: 'Rusia',
    tr: 'Turki',
    id: 'Indonesia',
    ja: 'Jepang',
    es: 'Spanyol',
  },
  ja: {
    en: '英語',
    ru: 'ロシア語',
    tr: 'トルコ語',
    id: 'インドネシア語',
    ja: '日本語',
    es: 'スペイン語',
  },
};

/** Название языка на нём самом (для списка выбора языка в настройках). */
const LANGUAGE_NATIVE_AUTONYMS: Record<AppLanguage, string> = {
  ru: 'Русский',
  en: 'English',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  ja: '日本語',
  es: 'Español',
};

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = params[key];

    return value === undefined ? '' : String(value);
  });
}

const BUNDLED_REGION_LABEL_KEYS: Record<
  BundledCalendarRegionCode,
  TranslationKey
> = {
  ru: 'settings.bundledCalendar.chip.ru',
  tr: 'settings.bundledCalendar.chip.tr',
  id: 'settings.bundledCalendar.chip.id',
  ja: 'settings.bundledCalendar.chip.ja',
  es: 'settings.bundledCalendar.chip.es',
};

/**
 * Maps a BCP 47 / ICU-style locale string (e.g. from `Intl`) to an app UI language.
 * Used for first-launch UI language when nothing is stored in SQLite. Предзагруженный
 * календарь при пустой БД выбирается через `resolveBundledCalendarRegionForSeed`
 * (явный регион в настройках или тот же вывод из языка, `en` → набор `ru`).
 */
export function mapLocaleStringToAppLanguage(locale: string): AppLanguage {
  const normalized = locale.trim().toLowerCase();

  if (normalized.startsWith('ru')) {
    return 'ru';
  }

  if (normalized.startsWith('tr')) {
    return 'tr';
  }

  if (normalized.startsWith('id')) {
    return 'id';
  }

  if (normalized.startsWith('ja')) {
    return 'ja';
  }

  if (normalized.startsWith('es')) {
    return 'es';
  }

  return 'en';
}

export function detectDeviceLanguage(): AppLanguage {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return mapLocaleStringToAppLanguage(locale);
  } catch {
    return 'en';
  }
}

export function getTranslation(
  language: AppLanguage,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  return interpolate(translations[language][key], params);
}

export function getMonthLabel(language: AppLanguage, month: number): string {
  return MONTH_LABELS[language][month - 1] ?? String(month);
}

export function getMonthShortLabel(language: AppLanguage, month: number): string {
  return MONTH_SHORT_LABELS[language][month - 1] ?? String(month);
}

export function getCompactWeekdayLabels(language: AppLanguage): readonly string[] {
  return COMPACT_WEEKDAY_LABELS[language];
}

export function getShortWeekdayLabels(language: AppLanguage): readonly string[] {
  return SHORT_WEEKDAY_LABELS[language];
}

export function getThemeModeLabel(
  language: AppLanguage,
  mode: 'dark' | 'light',
): string {
  if (language === 'ru') {
    return mode === 'dark' ? 'Темная' : 'Светлая';
  }

  if (language === 'tr') {
    return mode === 'dark' ? 'Koyu' : 'Açık';
  }

  if (language === 'id') {
    return mode === 'dark' ? 'Gelap' : 'Terang';
  }

  if (language === 'ja') {
    return mode === 'dark' ? 'ダーク' : 'ライト';
  }

  if (language === 'es') {
    return mode === 'dark' ? 'Oscuro' : 'Claro';
  }

  return mode === 'dark' ? 'Dark' : 'Light';
}

export function getLanguageLabel(
  language: AppLanguage,
  targetLanguage: AppLanguage,
): string {
  return LANGUAGE_LABELS_BY_UI[language][targetLanguage];
}

export function getLanguageNativeLabel(targetLanguage: AppLanguage): string {
  return LANGUAGE_NATIVE_AUTONYMS[targetLanguage];
}

export function getBundledRegionLabel(
  language: AppLanguage,
  region: BundledCalendarRegionCode,
): string {
  return getTranslation(language, BUNDLED_REGION_LABEL_KEYS[region]);
}
