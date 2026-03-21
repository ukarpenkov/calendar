type TranslationParams = Record<string, number | string>;

export type AppLanguage = 'en' | 'ru';

const MONTH_LABELS: Record<AppLanguage, readonly string[]> = {
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
};

const MONTH_SHORT_LABELS: Record<AppLanguage, readonly string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
};

const COMPACT_WEEKDAY_LABELS: Record<AppLanguage, readonly string[]> = {
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
};

const SHORT_WEEKDAY_LABELS: Record<AppLanguage, readonly string[]> = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
};

const translations = {
  en: {
    'common.appName': 'Calendar',
    'common.hoursUnit': 'h',
    'common.backToYear': 'Back to year',
    'app.error.bootstrapTitle': 'Failed to initialize local calendar data.',
    'app.error.bootstrapSubtitle': 'Fix the storage error and relaunch the app.',
    'app.error.monthTitle': 'Failed to open the selected month.',
    'app.error.monthSubtitle': 'Return to the year overview and try again.',
    'splash.loadingTitle': 'Loading your offline year view',
    'splash.loadingSubtitle': 'Initializing local calendar data...',
    'year.menu.settings': 'Settings',
    'year.header.eyebrow': 'Production calendar',
    'year.header.subtitle':
      'Active year is loaded from local SQLite storage and rendered as a month-by-month overview.',
    'year.summary.work': 'Work',
    'year.summary.off': 'Off',
    'year.summary.days': 'Days',
    'month.header.eyebrow': 'Month detail',
    'month.header.subtitle':
      'Full month grid with stored day states and monthly totals from SQLite.',
    'month.selectedDay.eyebrow': 'Selected day',
    'month.totals.totalDays': 'Total days',
    'month.totals.workingDays': 'Working days',
    'month.totals.nonWorkingDays': 'Non-working days',
    'month.totals.workHours': 'Work hours',
    'settings.title': 'Settings',
    'settings.sections.calendarData.title': 'Calendar data',
    'settings.sections.calendarData.subtitle':
      'Current active year and upcoming import actions.',
    'settings.rows.activeYear.title': 'Active year',
    'settings.rows.activeYear.subtitle':
      'The SQLite-backed dataset currently loaded in the app is {{year}}.',
    'settings.rows.importYear.title': 'Import year (JSON)',
    'settings.rows.importYear.subtitle':
      'Open a dedicated import entry screen and continue with the JSON replacement flow.',
    'settings.rows.importYear.action': 'Open',
    'settings.sections.appearance.title': 'Appearance',
    'settings.sections.appearance.subtitle':
      'Theme settings are now controlled through the global app context.',
    'settings.rows.darkTheme.title': 'Dark theme',
    'settings.rows.darkTheme.subtitle': 'Current mode: {{mode}}.',
    'settings.sections.localization.title': 'Language',
    'settings.sections.localization.subtitle':
      'Switch the language used across the app interface.',
    'settings.rows.language.title': 'Interface language',
    'settings.rows.language.subtitle': 'Current language: {{language}}.',
    'settings.sections.about.title': 'About',
    'settings.sections.about.subtitle':
      'Service information for the current local-first build.',
    'settings.about.app': 'App',
    'settings.about.storage': 'Storage',
    'settings.about.defaultDataset': 'Default dataset',
    'settings.about.theme': 'Theme',
    'settings.about.language': 'Language',
    'settings.about.appValue': 'Calendar',
    'settings.about.storageValue': 'Offline SQLite',
    'settings.about.defaultDatasetValue': 'Production calendar 2026',
    'importEntry.title': 'JSON import',
    'importEntry.eyebrow': 'Import flow entry',
    'importEntry.heroTitle': 'Prepare a local JSON replacement',
    'importEntry.heroSubtitle':
      'This screen is now the dedicated entry point for replacing the active year with a local JSON file.',
    'importEntry.currentYear.title': 'Current active year',
    'importEntry.currentYear.subtitle':
      'If you continue with import later, the SQLite dataset for {{year}} will be replaced, not merged.',
    'importEntry.flow.title': 'What the flow will do next',
    'importEntry.flow.step1': '1. Choose a local JSON file from the device.',
    'importEntry.flow.step2': '2. Validate and normalize the selected year before any write.',
    'importEntry.flow.step3':
      '3. Ask for confirmation before replacing the active SQLite dataset.',
    'importEntry.nextStep.title': 'Next implementation step',
    'importEntry.nextStep.subtitle':
      'The next task can attach the file picker and hand this entry screen over to the confirm and validating states.',
  },
  ru: {
    'common.appName': 'Календарь',
    'common.hoursUnit': 'ч',
    'common.backToYear': 'Назад к году',
    'app.error.bootstrapTitle': 'Не удалось инициализировать локальные данные календаря.',
    'app.error.bootstrapSubtitle': 'Исправьте ошибку хранилища и перезапустите приложение.',
    'app.error.monthTitle': 'Не удалось открыть выбранный месяц.',
    'app.error.monthSubtitle':
      'Вернитесь к годовому обзору и попробуйте снова.',
    'splash.loadingTitle': 'Загружаем локальный календарь',
    'splash.loadingSubtitle': 'Инициализируем локальные данные календаря...',
    'year.menu.settings': 'Настройки',
    'year.header.eyebrow': 'Производственный календарь',
    'year.header.subtitle':
      'Активный год загружается из локального хранилища SQLite и показывается как обзор по месяцам.',
    'year.summary.work': 'Раб.',
    'year.summary.off': 'Вых.',
    'year.summary.days': 'Дни',
    'month.header.eyebrow': 'Детали месяца',
    'month.header.subtitle':
      'Полная сетка месяца с сохраненными типами дней и месячными итогами из SQLite.',
    'month.selectedDay.eyebrow': 'Выбранный день',
    'month.totals.totalDays': 'Всего дней',
    'month.totals.workingDays': 'Рабочие дни',
    'month.totals.nonWorkingDays': 'Нерабочие дни',
    'month.totals.workHours': 'Часы работы',
    'settings.title': 'Настройки',
    'settings.sections.calendarData.title': 'Данные календаря',
    'settings.sections.calendarData.subtitle':
      'Текущий активный год и будущие действия по импорту.',
    'settings.rows.activeYear.title': 'Активный год',
    'settings.rows.activeYear.subtitle':
      'Сейчас в приложении загружен набор данных {{year}}, сохраненный в SQLite.',
    'settings.rows.importYear.title': 'Импорт года (JSON)',
    'settings.rows.importYear.subtitle':
      'Открывает отдельный экран входа в flow замены года через локальный JSON.',
    'settings.rows.importYear.action': 'Открыть',
    'settings.sections.appearance.title': 'Оформление',
    'settings.sections.appearance.subtitle':
      'Параметры темы управляются через глобальный контекст приложения.',
    'settings.rows.darkTheme.title': 'Темная тема',
    'settings.rows.darkTheme.subtitle': 'Текущий режим: {{mode}}.',
    'settings.sections.localization.title': 'Язык',
    'settings.sections.localization.subtitle':
      'Переключение языка интерфейса приложения.',
    'settings.rows.language.title': 'Язык интерфейса',
    'settings.rows.language.subtitle': 'Текущий язык: {{language}}.',
    'settings.sections.about.title': 'О приложении',
    'settings.sections.about.subtitle':
      'Служебная информация о текущей локальной сборке.',
    'settings.about.app': 'Приложение',
    'settings.about.storage': 'Хранилище',
    'settings.about.defaultDataset': 'Базовый набор',
    'settings.about.theme': 'Тема',
    'settings.about.language': 'Язык',
    'settings.about.appValue': 'Календарь',
    'settings.about.storageValue': 'Локальный SQLite',
    'settings.about.defaultDatasetValue': 'Производственный календарь 2026',
    'importEntry.title': 'Импорт JSON',
    'importEntry.eyebrow': 'Точка входа в импорт',
    'importEntry.heroTitle': 'Подготовка замены года локальным JSON',
    'importEntry.heroSubtitle':
      'Этот экран теперь служит отдельной точкой входа для замены активного года файлом JSON с устройства.',
    'importEntry.currentYear.title': 'Текущий активный год',
    'importEntry.currentYear.subtitle':
      'Когда дальнейший импорт будет подтвержден, набор данных {{year}} в SQLite заменится полностью, без объединения.',
    'importEntry.flow.title': 'Что дальше сделает flow',
    'importEntry.flow.step1': '1. Даст выбрать локальный JSON-файл на устройстве.',
    'importEntry.flow.step2':
      '2. Провалидирует и нормализует выбранный год до любой записи в БД.',
    'importEntry.flow.step3':
      '3. Запросит явное подтверждение перед заменой активного набора в SQLite.',
    'importEntry.nextStep.title': 'Следующий шаг реализации',
    'importEntry.nextStep.subtitle':
      'Следующая задача может подключить file picker и передать этот экран в состояния подтверждения и валидации.',
  },
} as const;

export type TranslationKey = keyof (typeof translations)['en'];

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = params[key];

    return value === undefined ? '' : String(value);
  });
}

export function detectDeviceLanguage(): AppLanguage {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  return locale.startsWith('ru') ? 'ru' : 'en';
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

  return mode === 'dark' ? 'Dark' : 'Light';
}

export function getLanguageLabel(
  language: AppLanguage,
  targetLanguage: AppLanguage,
): string {
  if (language === 'ru') {
    return targetLanguage === 'ru' ? 'Русский' : 'English';
  }

  return targetLanguage === 'ru' ? 'Russian' : 'English';
}
