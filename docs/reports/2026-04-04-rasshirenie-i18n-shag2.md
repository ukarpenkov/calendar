# Расширение модели локализации (шаг 2 плана языков и bundled-календарей)

## Что изменено

- Тип `AppLanguage` приведён к согласованному списку из `AGREED_APP_LANGUAGE_CODES` (`ru`, `en`, `tr`, `id`, `ja`) в `src/shared/config/agreedLanguagesAndBundledCalendars.ts`.
- Строки интерфейса вынесены в модуль `src/shared/lib/i18n/messages/` (`en`, `ru`, `tr`, `id`, `ja` + `catalog.ts`); для `tr` / `id` / `ja` добавлены полные наборы ключей наравне с `en` / `ru`.
- В `src/shared/lib/i18n/index.ts` расширены календарные подписи (месяцы, дни недели), матрица `getLanguageLabel`, режимы темы для всех языков, добавлены `mapLocaleStringToAppLanguage` (маппинг локали → язык) и обновлён `detectDeviceLanguage` с безопасным `try/catch` и fallback на `en`.
- `getDayTypeLabel` в `src/entities/calendar/lib/presentation.ts` локализован для `tr`, `id`, `ja` (для `en` поведение как раньше).
- В `src/shared/lib/settings/repository.ts` проверка сохранённого языка опирается на `AGREED_APP_LANGUAGE_CODES`.
- В `LanguageSwitch` тип подписей ограничен только отображаемыми опциями (`ru`, `en`), чтобы не требовать лишних ключей до шага с полным UI выбора языка.

## Что проверено

- `npm test` — все 11 сьюитов, 45 тестов проходят.
- Дополнительно в `__tests__/localization.test.ts` добавлены проверки `mapLocaleStringToAppLanguage` и выборочных строк для `tr` / `ja`.

## Дальнейшие шаги

- Шаг 3 плана: UI выбора языка на все согласованные коды (`LanguageSwitch` или замена).
- Фаза 2 плана: при сидировании БД вызывать ту же логику, что и `mapLocaleStringToAppLanguage`, для выбора bundled JSON (см. `BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE`).
- При необходимости: локализованные названия праздников в данных (сейчас для не-`ru` по-прежнему в основном fallback на EN в `MonthDetailScreen`).
