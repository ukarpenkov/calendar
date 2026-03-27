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
    'common.navigateBack': 'Go back',
    'common.cancel': 'Cancel',
    'app.error.bootstrapTitle': 'Failed to initialize local calendar data.',
    'app.error.bootstrapSubtitle': 'Fix the storage error and relaunch the app.',
    'app.error.monthTitle': 'Failed to open the selected month.',
    'app.error.monthSubtitle': 'Return to the year overview and try again.',
    'splash.loadingTitle': 'Loading your offline year view',
    'splash.loadingSubtitle': 'Initializing local calendar data...',
    'year.menu.settings': 'Settings',
    'year.home.title': 'Year {{year}}',
    'year.summary.work': 'Work',
    'year.summary.off': 'Off',
    'year.summary.days': 'Days',
    'month.selectedDay.eyebrow': 'Selected day',
    'month.totals.totalDays': 'Total days',
    'month.totals.workingDays': 'Working days',
    'month.totals.nonWorkingDays': 'Non-working days',
    'month.totals.workHours': 'Work hours',
    'month.nav.previousMonth': 'Previous month',
    'month.nav.nextMonth': 'Next month',
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
    'settings.about.telegram': 'Telegram',
    'settings.about.appValue': 'Calendar',
    'settings.about.storageValue': 'Offline SQLite',
    'settings.about.defaultDatasetValue': 'Production calendar 2026',
    'year.reminder.title': 'Next year JSON template',
    'year.reminder.body':
      'The {{year}} template will be published in Telegram. Open the channel to download the next JSON when it is ready.',
    'year.reminder.action': 'Open Telegram',
    'importEntry.title': 'JSON import',
    'importEntry.eyebrow': 'Import flow entry',
    'importEntry.heroTitle': 'Prepare a local JSON replacement',
    'importEntry.heroSubtitle':
      'This screen is now the dedicated entry point for replacing the active year with a local JSON file.',
    'importEntry.currentYear.title': 'Current active year',
    'importEntry.currentYear.subtitle':
      'If you confirm the next step, the SQLite dataset for {{year}} will be replaced, not merged.',
    'importEntry.fileCard.title': 'Selected JSON file',
    'importEntry.fileCard.idleSubtitle':
      'Choose a local JSON file to start validation. The active year stays unchanged until the replacement is confirmed.',
    'importEntry.fileCard.readySubtitle':
      'The selected file was validated successfully and is ready to replace the active SQLite dataset.',
    'importEntry.fileCard.fileName': 'File',
    'importEntry.fileCard.detectedYear': 'Detected year',
    'importEntry.fileCard.fileSize': 'Size',
    'importEntry.preview.title': 'Validated import preview',
    'importEntry.preview.subtitle':
      'Year {{year}} passed validation and can now replace the current local dataset.',
    'importEntry.preview.totalDays': 'Total days',
    'importEntry.preview.workingDays': 'Working days',
    'importEntry.preview.nonWorkingDays': 'Non-working days',
    'importEntry.preview.workHours': 'Work hours',
    'importEntry.actions.chooseFile': 'Choose JSON file',
    'importEntry.actions.chooseAnotherFile': 'Choose another file',
    'importEntry.actions.validating': 'Validating file...',
    'importEntry.actions.replaceYear': 'Replace active year',
    'importEntry.actions.importing': 'Replacing local dataset...',
    'importEntry.confirm.title': 'Replace active calendar year?',
    'importEntry.confirm.body':
      'The current year {{currentYear}} will be fully replaced by year {{importedYear}} in local SQLite storage. This action does not merge data.',
    'importEntry.confirm.action': 'Replace year',
    'importEntry.error.validationTitle': 'Validation failed',
    'importEntry.error.validationBody':
      'The selected JSON file did not pass validation. The active calendar year was not changed.',
    'importEntry.error.unsupportedTitle': 'Unsupported file',
    'importEntry.error.unsupportedBody':
      'Choose a `.json` file with the calendar import structure.',
    'importEntry.error.readTitle': 'Failed to read the file',
    'importEntry.error.readBody':
      'The selected file could not be read from device storage. The active calendar year was not changed.',
    'importEntry.error.pickerTitle': 'Failed to open file picker',
    'importEntry.error.pickerBody':
      'The system file picker did not return a readable JSON file.',
    'importEntry.error.replaceTitle': 'Failed to replace active year',
    'importEntry.error.replaceBody':
      'Validation succeeded, but the new year could not be written to SQLite. The current calendar remains active.',
    'importEntry.error.replaceDetail':
      'Check local storage availability and try the import again.',
    'importEntry.error.genericTitle': 'Import failed',
    'importEntry.error.genericBody':
      'The import flow stopped before replacing the active calendar year.',
    'importEntry.error.genericDetail':
      'Review the selected file and try again.',
    'importEntry.flow.title': 'How this import works',
    'importEntry.flow.step1': '1. Choose a local JSON file from the device.',
    'importEntry.flow.step2':
      '2. Validate and normalize the selected year before any write.',
    'importEntry.flow.step3':
      '3. Ask for confirmation before replacing the active SQLite dataset.',
    'importEntry.step.file': 'File',
    'importEntry.step.preview': 'Check',
    'importEntry.step.confirm': 'Confirm',
    'importEntry.choose.headline': 'Load a calendar year from a JSON file',
    'importEntry.choose.supporting':
      'The app only reads a file you pick on this device. Nothing changes until you confirm replacement.',
    'importEntry.validating.headline': 'Checking your file',
    'importEntry.validating.supporting':
      'Parsing JSON, validating structure, and building the day list. This usually takes a moment.',
    'importEntry.review.headline': 'File looks good',
    'importEntry.review.supporting':
      'Review the summary below. When you continue, you will confirm replacing the active year.',
    'importEntry.confirm.screenTitle': 'Confirm replacement',
    'importEntry.confirm.compare': '{{currentYear}} → {{importedYear}}',
    'importEntry.confirm.bullet1':
      'The SQLite calendar for the active year is fully replaced; there is no merge.',
    'importEntry.confirm.bullet2': 'Only this device is affected; there is no cloud upload.',
    'importEntry.confirm.bullet3':
      'You can import another file later from settings if you need to correct a mistake.',
    'importEntry.confirm.backToReview': 'Back to summary',
    'importEntry.importing.headline': 'Saving to local storage',
    'importEntry.importing.supporting':
      'Writing the validated year into SQLite. Please keep the app open.',
    'importEntry.success.headline': 'Import complete',
    'importEntry.success.supporting':
      'Year {{year}} is now the active calendar on this device.',
    'importEntry.success.toCalendar': 'Open year view',
    'importEntry.error.tryAgain': 'Try again',
    'importEntry.error.pickAnotherFile': 'Pick another file',
    'importEntry.error.startOver': 'Start over',
  },
  ru: {
    'common.appName': 'Календарь',
    'common.hoursUnit': 'ч',
    'common.backToYear': 'Назад к году',
    'common.navigateBack': 'Назад',
    'common.cancel': 'Отмена',
    'app.error.bootstrapTitle': 'Не удалось инициализировать локальные данные календаря.',
    'app.error.bootstrapSubtitle': 'Исправьте ошибку хранилища и перезапустите приложение.',
    'app.error.monthTitle': 'Не удалось открыть выбранный месяц.',
    'app.error.monthSubtitle':
      'Вернитесь к годовому обзору и попробуйте снова.',
    'splash.loadingTitle': 'Загружаем локальный календарь',
    'splash.loadingSubtitle': 'Инициализируем локальные данные календаря...',
    'year.menu.settings': 'Настройки',
    'year.home.title': 'Год {{year}}',
    'year.summary.work': 'Раб.',
    'year.summary.off': 'Вых.',
    'year.summary.days': 'Дни',
    'month.selectedDay.eyebrow': 'Выбранный день',
    'month.totals.totalDays': 'Всего дней',
    'month.totals.workingDays': 'Рабочие дни',
    'month.totals.nonWorkingDays': 'Нерабочие дни',
    'month.totals.workHours': 'Часы работы',
    'month.nav.previousMonth': 'Предыдущий месяц',
    'month.nav.nextMonth': 'Следующий месяц',
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
    'settings.about.telegram': 'Telegram',
    'settings.about.appValue': 'Календарь',
    'settings.about.storageValue': 'Локальный SQLite',
    'settings.about.defaultDatasetValue': 'Производственный календарь 2026',
    'year.reminder.title': 'JSON-шаблон на следующий год',
    'year.reminder.body':
      'Шаблон на {{year}} год будет опубликован в Telegram. Откройте канал, чтобы скачать новый JSON, когда он будет готов.',
    'year.reminder.action': 'Открыть Telegram',
    'importEntry.title': 'Импорт JSON',
    'importEntry.eyebrow': 'Точка входа в импорт',
    'importEntry.heroTitle': 'Подготовка замены года локальным JSON',
    'importEntry.heroSubtitle':
      'Этот экран теперь служит отдельной точкой входа для замены активного года файлом JSON с устройства.',
    'importEntry.currentYear.title': 'Текущий активный год',
    'importEntry.currentYear.subtitle':
      'После подтверждения следующий шаг полностью заменит набор данных {{year}} в SQLite, без объединения.',
    'importEntry.fileCard.title': 'Выбранный JSON-файл',
    'importEntry.fileCard.idleSubtitle':
      'Выберите локальный JSON-файл, чтобы запустить валидацию. Активный год не изменится, пока замена не будет подтверждена.',
    'importEntry.fileCard.readySubtitle':
      'Выбранный файл успешно прошел валидацию и готов заменить активный набор данных в SQLite.',
    'importEntry.fileCard.fileName': 'Файл',
    'importEntry.fileCard.detectedYear': 'Определенный год',
    'importEntry.fileCard.fileSize': 'Размер',
    'importEntry.preview.title': 'Предпросмотр валидированного импорта',
    'importEntry.preview.subtitle':
      'Год {{year}} прошел валидацию и теперь может заменить текущий локальный набор данных.',
    'importEntry.preview.totalDays': 'Всего дней',
    'importEntry.preview.workingDays': 'Рабочих дней',
    'importEntry.preview.nonWorkingDays': 'Нерабочих дней',
    'importEntry.preview.workHours': 'Рабочих часов',
    'importEntry.actions.chooseFile': 'Выбрать JSON-файл',
    'importEntry.actions.chooseAnotherFile': 'Выбрать другой файл',
    'importEntry.actions.validating': 'Проверяем файл...',
    'importEntry.actions.replaceYear': 'Заменить активный год',
    'importEntry.actions.importing': 'Обновляем локальный набор...',
    'importEntry.confirm.title': 'Заменить активный календарный год?',
    'importEntry.confirm.body':
      'Текущий год {{currentYear}} будет полностью заменен годом {{importedYear}} в локальном SQLite-хранилище. Объединения данных не будет.',
    'importEntry.confirm.action': 'Заменить год',
    'importEntry.error.validationTitle': 'Валидация не пройдена',
    'importEntry.error.validationBody':
      'Выбранный JSON-файл не прошел проверку. Активный календарный год не изменился.',
    'importEntry.error.unsupportedTitle': 'Неподдерживаемый файл',
    'importEntry.error.unsupportedBody':
      'Выберите файл `.json` со структурой импорта календаря.',
    'importEntry.error.readTitle': 'Не удалось прочитать файл',
    'importEntry.error.readBody':
      'Выбранный файл не удалось прочитать из памяти устройства. Активный календарный год не изменился.',
    'importEntry.error.pickerTitle': 'Не удалось открыть выбор файла',
    'importEntry.error.pickerBody':
      'Системный file picker не вернул читаемый JSON-файл.',
    'importEntry.error.replaceTitle': 'Не удалось заменить активный год',
    'importEntry.error.replaceBody':
      'Валидация прошла успешно, но новый год не удалось записать в SQLite. Текущий календарь остался активным.',
    'importEntry.error.replaceDetail':
      'Проверьте доступность локального хранилища и попробуйте импорт еще раз.',
    'importEntry.error.genericTitle': 'Импорт не завершен',
    'importEntry.error.genericBody':
      'Flow импорта остановился до замены активного календарного года.',
    'importEntry.error.genericDetail':
      'Проверьте выбранный файл и повторите попытку.',
    'importEntry.flow.title': 'Как работает этот импорт',
    'importEntry.flow.step1': '1. Дает выбрать локальный JSON-файл на устройстве.',
    'importEntry.flow.step2':
      '2. Провалидирует и нормализует выбранный год до любой записи в БД.',
    'importEntry.flow.step3':
      '3. Запросит явное подтверждение перед заменой активного набора в SQLite.',
    'importEntry.step.file': 'Файл',
    'importEntry.step.preview': 'Проверка',
    'importEntry.step.confirm': 'Подтверждение',
    'importEntry.choose.headline': 'Загрузить год календаря из JSON-файла',
    'importEntry.choose.supporting':
      'Приложение читает только файл, который вы выберете на устройстве. Данные не меняются, пока вы не подтвердите замену.',
    'importEntry.validating.headline': 'Проверяем файл',
    'importEntry.validating.supporting':
      'Разбор JSON, проверка структуры и сбор списка дней. Обычно это занимает несколько секунд.',
    'importEntry.review.headline': 'Файл прошел проверку',
    'importEntry.review.supporting':
      'Ниже сводка по году. Далее откроется шаг подтверждения замены активного года.',
    'importEntry.confirm.screenTitle': 'Подтвердите замену',
    'importEntry.confirm.compare': '{{currentYear}} → {{importedYear}}',
    'importEntry.confirm.bullet1':
      'Календарь активного года в SQLite полностью заменяется; объединения данных нет.',
    'importEntry.confirm.bullet2':
      'Изменения только на этом устройстве; облачной синхронизации нет.',
    'importEntry.confirm.bullet3':
      'При ошибке вы сможете импортировать другой файл снова из настроек.',
    'importEntry.confirm.backToReview': 'К сводке',
    'importEntry.importing.headline': 'Сохраняем в локальное хранилище',
    'importEntry.importing.supporting':
      'Записываем проверенный год в SQLite. Не закрывайте приложение.',
    'importEntry.success.headline': 'Импорт выполнен',
    'importEntry.success.supporting': 'Год {{year}} теперь активный календарь на устройстве.',
    'importEntry.success.toCalendar': 'Открыть обзор года',
    'importEntry.error.tryAgain': 'Повторить',
    'importEntry.error.pickAnotherFile': 'Выбрать другой файл',
    'importEntry.error.startOver': 'С начала',
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
