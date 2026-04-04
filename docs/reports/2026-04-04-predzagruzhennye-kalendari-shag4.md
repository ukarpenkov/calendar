# Шаг 4 плана: предзагруженные календари

## Что изменено

- Дополнительных правок в коде не потребовалось: шаг **уже выполнен** в текущем `main`.
- В `docs/2026-04-04-languages-and-bundled-calendars-plan.md` уточнена цель (раздел «Цель»): убрана устаревшая ссылка на «только `calendar2026.json` в `repository.ts`», добавлена отсылка к фактической реализации (`bundledCalendarJsonByLanguage.ts` + логика сида).

## Что проверено

- `src/entities/calendar/model/bundledCalendarJsonByLanguage.ts`: для `ru`/`en` — `calendar2026.json`, для `tr` / `id` / `ja` — соответствующие региональные файлы; объект удовлетворяет `Record<AgreedAppLanguageCode, unknown>`.
- `src/shared/config/agreedLanguagesAndBundledCalendars.ts`: `BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE` согласован с именами файлов.
- `__tests__/agreedLanguagesAndBundledCalendars.test.ts`: каждый bundled для согласованного языка проходит `parseValidateAndNormalizeCalendarImport` (год 2026, 365 дней).
- Полный прогон `npm test`: 11 suites / 48 тестов — успешно.

## Дальнейшие шаги

- По плану документа — пункт **5** (связка смены языка в UI с `replaceActiveYear` для языков ≠ `en`), если ещё не закрыт в коде.
