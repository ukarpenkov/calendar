# Связка языка UI и bundled-календаря (п.5 плана)

## Что изменено

- Реестр `registerCalendarSyncOnAppLanguageChange` / `notifyCalendarSyncOnAppLanguageChange` в `src/features/calendar-language-sync/appLanguageChangeCalendarSyncRegistry.ts`.
- `LocalizationProvider`: при ручном `handleSetLanguage` после смены состояния вызывается уведомление реестра (гидратация языка из SQLite по-прежнему через `setLanguage` из `useState`, без уведомления).
- `AppContent` в `App.tsx`: обработчик для нового языка `en` ничего не делает (вариант A); для `ru` / `tr` / `id` / `ja` вызывает `setBundledCalendarRegion(appLanguageToDefaultBundledRegion(next))`, что согласует настройки региона с языком и переиспользует уже существующую цепочку `notifyCalendarSyncOnBundledRegionChange` → `syncActiveYearWithBundledRegion` → `replaceActiveYear` и обновление `status.calendar` при активном годе 2026.
- Таблица язык → JSON: `BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE`, `getBundledCalendarJsonObject` / региональные `require` в `bundledCalendarJsonByLanguage.ts`; `appLanguageToDefaultBundledRegion` (`en` → регион `ru`).
- Тесты реестра: `__tests__/appLanguageChangeCalendarSyncRegistry.test.ts`.

## Что проверено

- `npm test` — все suites проходят.

## Дальнейшие шаги

- П.6 плана: при пользовательском импорте 2026 смена языка на не-`en` по-прежнему может перезаписать данные (как смена региона); при необходимости флаг «не трогать импорт».
