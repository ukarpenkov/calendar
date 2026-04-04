export const enTranslations = {
    'common.appName': 'Calendar',
    'common.hoursUnit': 'h',
    'common.backToYear': 'Back to year',
    'common.navigateBack': 'Go back',
    'common.cancel': 'Cancel',
    'app.error.bootstrapTitle': 'Failed to initialize local calendar data.',
    'app.error.bootstrapSubtitle':
      'Check device storage, then try again. You can also relaunch the app.',
    'app.error.bootstrapRetry': 'Try again',
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
    'settings.rows.bundledCalendar.title': 'Production calendar (2026)',
    'settings.rows.bundledCalendar.subtitle': 'Bundled dataset: {{region}}.',
    'settings.bundledCalendar.chip.ru': 'Russia',
    'settings.bundledCalendar.chip.tr': 'Türkiye',
    'settings.bundledCalendar.chip.id': 'Indonesia',
    'settings.bundledCalendar.chip.ja': 'Japan',
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
    'settings.rows.language.userImportHint':
      'Your calendar came from a JSON import: changing the interface language will not replace it. Use Production calendar (2026) below to load a bundled dataset.',
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
} as const;

export type TranslationKey = keyof typeof enTranslations;
