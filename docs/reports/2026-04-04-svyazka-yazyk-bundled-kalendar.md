# Связка языка UI и bundled-календаря (шаг 5 плана)

## Что изменено

- Добавлен слайс `src/features/calendar-language-sync/`:
  - `syncActiveYearWithUiLanguage` — по политике варианта A: при `nextLanguage === 'en'` или при активном годе ≠ `BUNDLED_CALENDAR_YEAR` (2026) замена не выполняется; иначе берётся JSON из `getBundledCalendarJsonObject` (как при сидировании), валидация тем же `parseValidateAndNormalizeCalendarImport`, затем `replaceActiveYear` и чтение `getYearCalendar`.
  - `shouldApplyBundledCalendarOnUserLanguageChange` — явное условие для юнит-тестов.
  - Реестр `registerCalendarSyncOnUserLanguageChange` / `notifyCalendarSyncOnUserLanguageChange` — связь между провайдером локализации и корнем приложения без циклических импортов.
- `LocalizationProvider`: при **ручном** выборе языка (`handleSetLanguage`) после сохранения настроек вызывается уведомление реестра; повторный выбор того же кода игнорируется. Гидратация из хранилища по-прежнему вызывает только `setLanguage` из `useState`, без замены календаря.
- `AppContent` в `App.tsx`: регистрирует обработчик, при успешной синхронизации обновляет `status.calendar` (как после импорта).

Таблица язык → JSON по-прежнему задаётся в `bundledCalendarJsonByLanguage.ts` и `BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE`; для `en` автосмена календаря отключена на уровне `shouldApply…`.

## Что проверено

- `npm test` — все 12 suites, 54 теста.
- Новые тесты: `__tests__/syncActiveYearWithUiLanguage.test.ts` (правила `en`, год ≠ 2026, успешный путь с `replaceActiveYear`).

## Дальнейшие шаги

- Пункт 6 плана: политика при пользовательском импорте (всегда перезапись при смене языка или флаг «не трогать»).
- Пункт 3.4 плана: при необходимости расширить интеграционный сценарий в `App.test.tsx` (смена языка в настройках → вызов `replaceActiveYear`).
