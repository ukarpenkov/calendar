# Скрытие выбора встроенного календаря в настройках

## Что изменено

- В `src/pages/settings/ui/SettingsScreen.tsx` блок с переключателем региона встроенного календария (`BundledCalendarSwitch` и подписи) обёрнут в JSX-комментарий `{/* ... */}`, а не удалён.
- Закомментированы связанные импорты (`getBundledRegionLabel`, типы и константы регионов, `BundledCalendarSwitch`) и константа `BUNDLED_CALENDAR_SWITCH_LABELS`.
- Из деструктуризации `useBundledCalendarRegion()` убран неиспользуемый `setBundledCalendarRegion`; `bundledCalendarRegion` оставлен для существующего `useEffect` (обновление флага пользовательского импорта).

Выбор языка в секции локализации не трогался.

## Что проверено

- Линтер для изменённого файла — без замечаний.
- Полный `tsc --noEmit` в репозитории падает на существующих ошибках в `__tests__/agreedLanguagesAndBundledCalendars.test.ts` (модули `fs`/`path`), не связанных с этим изменением.

## Дальнейшие шаги

- При необходимости снова показать выбор календаря — раскомментировать блок, импорты и `BUNDLED_CALENDAR_SWITCH_LABELS`, вернуть `setBundledCalendarRegion` в деструктуризацию.
