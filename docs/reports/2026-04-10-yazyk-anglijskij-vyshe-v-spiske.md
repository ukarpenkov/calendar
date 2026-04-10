# Порядок языков: English выше в списке

## Что изменено

- В `src/shared/config/agreedLanguagesAndBundledCalendars.ts` массив `AGREED_APP_LANGUAGE_CODES` переупорядочен: `en` идёт первым (`en`, `ru`, `tr`, `id`, `ja`). Переключатель языка в настройках (`LanguageSwitch`) строится по этому порядку.

## Что проверено

- Запуск `npx jest __tests__/agreedLanguagesAndBundledCalendars.test.ts` (после успешного выполнения в среде разработки).

## Дальнейшие шаги

- При необходимости обновить упоминание порядка `ru`, `en`, … в документации плана/отчётов — сейчас в коде актуален порядок с `en` первым.
