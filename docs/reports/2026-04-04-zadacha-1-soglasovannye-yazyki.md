# Задача 1: согласованный список языков и bundled-календарей

## Что изменено

- Добавлен единый контракт в `src/shared/config/agreedLanguagesAndBundledCalendars.ts`: коды языков `ru`, `en`, `tr`, `id`, `ja` и соответствие каждому коду имени bundled JSON в корне репозитория на год **2026** (`calendar2026.json` для `ru` и `en`, `calendar2026TR.json`, `calendar2026IDN.json`, `calendar2026JP.json`).
- Добавлены юнит-тесты `__tests__/agreedLanguagesAndBundledCalendars.test.ts`: полнота маппинга и наличие файлов на диске.
- В плане `docs/2026-04-04-languages-and-bundled-calendars-plan.md` пункт чеклиста 1 отмечен как выполненный со ссылкой на модуль.

## Что проверено

- `npm test` — тесты проекта, включая новые.

## Дальнейшие шаги

- Задача 2 плана: расширить `AppLanguage` и i18n, подключив те же коды из контракта.
- Задачи 4–5: `require`/Metro и выбор bundled по языку должны опираться на `BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE` (или его обёртку с учётом года).
