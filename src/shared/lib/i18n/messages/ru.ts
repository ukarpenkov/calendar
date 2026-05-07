import type { TranslationKey } from './en';

export const ruTranslations: Record<TranslationKey, string> = {
    'common.appName': 'Календарь',
    'common.hoursUnit': 'ч',
    'common.backToYear': 'Назад к году',
    'common.navigateBack': 'Назад',
    'common.cancel': 'Отмена',
    'app.error.bootstrapTitle': 'Не удалось инициализировать локальные данные календаря.',
    'app.error.bootstrapSubtitle':
      'Проверьте память устройства и нажмите «Повторить». При необходимости перезапустите приложение.',
    'app.error.bootstrapRetry': 'Повторить',
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
    'settings.rows.bundledCalendar.title': 'Производственный календарь (2026)',
    'settings.rows.bundledCalendar.subtitle': 'Встроенный набор: {{region}}.',
    'settings.bundledCalendar.chip.ru': 'Россия',
    'settings.bundledCalendar.chip.tr': 'Турция',
    'settings.bundledCalendar.chip.id': 'Индонезия',
    'settings.bundledCalendar.chip.ja': 'Япония',
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
    'settings.rows.language.userImportHint':
      'Активен сохраненный JSON-календарь. Языком интерфейса выбран английский.',
    'settings.languageSwitch.userJsonCalendar': 'JSON календарь',
    'settings.sections.about.title': 'О приложении',
    'settings.sections.about.subtitle':
      'Служебная информация о текущей локальной сборке.',
    'settings.about.app': 'Приложение',
    'settings.about.version': 'Версия',
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
      'Этот экран служит точкой входа для сохранения и автоматического выбора локального JSON-календаря.',
    'importEntry.currentYear.title': 'Текущий активный год',
    'importEntry.currentYear.subtitle':
      'После сохранения JSON-календарь станет активным автоматически, а язык приложения переключится на English.',
    'importEntry.fileCard.title': 'Выбранный JSON-файл',
    'importEntry.fileCard.idleSubtitle':
      'Выберите локальный JSON-файл, чтобы запустить валидацию. Активный год не изменится, пока замена не будет подтверждена.',
    'importEntry.fileCard.readySubtitle':
      'Выбранный файл успешно прошел валидацию и готов сохраниться как JSON-календарь.',
    'importEntry.fileCard.fileName': 'Файл',
    'importEntry.fileCard.detectedYear': 'Определенный год',
    'importEntry.fileCard.fileSize': 'Размер',
    'importEntry.preview.title': 'Предпросмотр валидированного импорта',
    'importEntry.preview.subtitle':
      'Год {{year}} прошел валидацию и теперь может быть сохранен как JSON-календарь.',
    'importEntry.preview.totalDays': 'Всего дней',
    'importEntry.preview.workingDays': 'Рабочих дней',
    'importEntry.preview.nonWorkingDays': 'Нерабочих дней',
    'importEntry.preview.workHours': 'Рабочих часов',
    'importEntry.actions.chooseFile': 'Выбрать JSON-файл',
    'importEntry.actions.chooseAnotherFile': 'Выбрать другой файл',
    'importEntry.actions.validating': 'Проверяем файл...',
    'importEntry.actions.replaceYear': 'Сохранить JSON-календарь',
    'importEntry.actions.importing': 'Сохраняем JSON-календарь...',
    'importEntry.confirm.title': 'Сохранить JSON-календарь?',
    'importEntry.confirm.body':
      'Год {{importedYear}} будет сохранен как JSON-календарь и выбран автоматически вместо текущего загруженного года {{currentYear}}.',
    'importEntry.confirm.action': 'Сохранить календарь',
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
    'importEntry.error.replaceTitle': 'Не удалось сохранить JSON-календарь',
    'importEntry.error.replaceBody':
      'Валидация прошла успешно, но JSON-календарь не удалось записать в SQLite. Текущий календарь остался активным.',
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
      '3. Запросит явное подтверждение перед сохранением JSON-календаря.',
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
      'Ниже сводка по году. Далее откроется шаг подтверждения сохранения JSON-календаря.',
    'importEntry.confirm.screenTitle': 'Подтвердите замену',
    'importEntry.confirm.compare': '{{currentYear}} → {{importedYear}}',
    'importEntry.confirm.bullet1':
      'Сохраненный слот JSON-календаря заменяется и становится активным календарем.',
    'importEntry.confirm.bullet2':
      'Изменения только на этом устройстве; облачной синхронизации нет.',
    'importEntry.confirm.bullet3':
      'После сохранения язык приложения переключится на English.',
    'importEntry.confirm.backToReview': 'К сводке',
    'importEntry.importing.headline': 'Сохраняем в локальное хранилище',
    'importEntry.importing.supporting':
      'Записываем проверенный JSON-календарь в SQLite. Не закрывайте приложение.',
    'importEntry.success.headline': 'Импорт выполнен',
    'importEntry.success.supporting':
      'Год {{year}} сохранен и выбран как JSON-календарь.',
    'importEntry.success.toCalendar': 'Открыть настройки',
    'importEntry.error.tryAgain': 'Повторить',
    'importEntry.error.pickAnotherFile': 'Выбрать другой файл',
    'importEntry.error.startOver': 'С начала',
    'importEntry.aiPrompt.title': 'Сгенерировать через ИИ',
    'importEntry.aiPrompt.description':
      'Нужен календарь другой страны или года? Нажмите кнопку ниже, чтобы скопировать готовый промт. Затем откройте любой ИИ-чат (Gemini, ChatGPT, DeepSeek), вставьте промт и отдельным сообщением добавьте задание, например:\n\n«Сгенерируй календарь Армении 2026, верни файл JSON».\n\nСохраните ответ как файл .json (или воспользуйтесь экраном вставки JSON) и импортируйте его здесь.',
    'importEntry.aiPrompt.copyButton': 'Скопировать промт в буфер обмена',
    'importEntry.aiPrompt.copied': 'Промт скопирован!',
    'importEntry.textJson.title': 'Вставьте готовый JSON',
    'importEntry.textJson.description':
      'Вставьте сюда полный текст JSON. Если структура валидна, приложение автоматически распарсит его и откроет шаг проверки.',
    'importEntry.textJson.placeholder': 'Вставьте JSON календаря сюда...',
    'importEntry.textJson.pasteButton': 'Вставить текст',
    'importEntry.textJson.sourceName': 'Вставленный JSON-текст',
  };
