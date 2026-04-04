# Тесты и документация: языки UI и bundled-календари

Дата: 2026-04-04. Закрытие пунктов 8–9 плана [2026-04-04-languages-and-bundled-calendars-plan.md](../2026-04-04-languages-and-bundled-calendars-plan.md).

## Что изменено

- Вынесено в `getBundledRegionToApplyOnManualAppLanguageChange` (`src/shared/lib/bundledCalendarRegion.ts`) правило варианта A: при ручной смене языка на **`en`** не подставляется другой bundled-календарь (`null`); для остальных кодов возвращается тот же регион, что и для стартового сида (`appLanguageToDefaultBundledRegion`). `App.tsx` вызывает эту функцию вместо встроенной проверки `nextLanguage === 'en'`.
- Добавлены юнит-тесты `__tests__/bundledCalendarRegion.test.ts` и `__tests__/localeToBundledSeedConsistency.test.ts` (согласованность «локаль → `AppLanguage` → регион → валидированный JSON» и маркеры по полям праздников).
- В плане языков и bundled отмечено выполнение п. 8–9 со ссылками на файлы тестов; в `docs/development-plan.md` обновлено актуальное состояние продукта, строка эпика D4 и ссылка на план.

## Что проверено

- `npm test` — все 16 suites, 73 теста, успешно.
- Покрытие по плану: маппинг локалей (включая `tr-TR`, `id-ID`, `ja-JP`) — `localization.test.ts`; валидация bundled как импорт — `agreedLanguagesAndBundledCalendars.test.ts`; сид по региону — `calendarRepository.test.ts`; правило `en` при смене языка — `bundledCalendarRegion.test.ts` + рефакторинг под одну функцию.

## Дальнейшие шаги

- При добавлении нового языка/региона: расширить `AGREED_APP_LANGUAGE_CODES`, реестр JSON, тесты в `localeToBundledSeedConsistency` и `agreedLanguagesAndBundledCalendars`.
- Опционально: e2e-сценарий смены языка в UI (сейчас достаточно юнит-слоя и существующих тестов `LocalizationProvider` / репозитория).
