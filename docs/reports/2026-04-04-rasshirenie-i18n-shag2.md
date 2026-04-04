# Расширение модели локализации (шаг 2 плана языков и bundled-календарей)

## Что изменено

- Тип `AppLanguage` приведён к согласованному списку из `AGREED_APP_LANGUAGE_CODES` (`ru`, `en`, `tr`, `id`, `ja`) в `src/shared/config/agreedLanguagesAndBundledCalendars.ts`.
- Строки интерфейса вынесены в модуль `src/shared/lib/i18n/messages/` (`en`, `ru`, `tr`, `id`, `ja` + `catalog.ts`); для `tr` / `id` / `ja` добавлены полные наборы ключей наравне с `en` / `ru`.
- В `src/shared/lib/i18n/index.ts` расширены календарные подписи (месяцы, дни недели), матрица `getLanguageLabel`, режимы темы для всех языков, добавлены `mapLocaleStringToAppLanguage` (маппинг локали → язык) и обновлён `detectDeviceLanguage` с безопасным `try/catch` и fallback на `en`.
- `getDayTypeLabel` в `src/entities/calendar/lib/presentation.ts` локализован для `tr`, `id`, `ja` (для `en` поведение как раньше).
- В `src/shared/lib/settings/repository.ts` проверка сохранённого языка опирается на `AGREED_APP_LANGUAGE_CODES`.
- В `LanguageSwitch` тип подписей ограничен только отображаемыми опциями (`ru`, `en`), чтобы не требовать лишних ключей до шага с полным UI выбора языка.
- **Стартовый bundled по языку (завершение п.2 плана и фазы 2 по сидированию):** добавлен `src/entities/calendar/model/bundledCalendarJsonByLanguage.ts` (статические `require` для всех региональных JSON). В `seedBundledYearIfNeeded` при пустой или неполной БД выбирается язык `getStoredLanguage() ?? detectDeviceLanguage()`, затем соответствующий bundled; для юнит-тестов репозитория доступна инъекция `resolveLanguageForBundledSeed` в `createCalendarRepository`.
- В `__tests__/agreedLanguagesAndBundledCalendars.test.ts` — проверка, что каждый bundled для согласованного языка проходит `parseValidateAndNormalizeCalendarImport` (год 2026, 365 дней).
- В `docs/2026-04-04-languages-and-bundled-calendars-plan.md` п.2 чеклиста и шаги 2.1–2.4 помечены выполненными; обновлён блок «Текущее состояние».

## Что проверено

- `npm test` — все 11 сьюитов, 47 тестов проходят.
- В `__tests__/localization.test.ts` — `mapLocaleStringToAppLanguage` и выборочные строки для `tr` / `ja`.
- В `__tests__/calendarRepository.test.ts` — сид с резолвером `ja` даёт праздник 2026-01-12 «成人の日» (японский bundled).

## Дальнейшие шаги

- Шаг 3 плана: UI выбора языка на все согласованные коды (`LanguageSwitch` или замена).
- Фаза 3 плана: автозамена календаря в SQLite при ручной смене языка (вариант A) и учёт пользовательского импорта.
- При необходимости: локализованные названия праздников в данных (сейчас для не-`ru` по-прежнему в основном fallback на EN в `MonthDetailScreen`).
