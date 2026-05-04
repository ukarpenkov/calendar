# Изображение для 1 января (bundled календари)

## Что изменено

- В `countrySpecificHolidayImageByKey` добавлены явные ключи под bundled JSON:
  - `2025-01-01` / `2026-01-01` + `New Year's Day` (общее английское имя для RU/JP/TR/ID);
  - `2026-01-01|元日` (JP из `calendar2026JP.json`);
  - `2026-01-01|Yılbaşı Tatili` (TR из `calendar2026TR.json`);
  - `2026-01-01|Tahun Baru Masehi` (ID из `calendar2026IDN.json`).
- Универсальный fallback по дате 1.01 без ключа в таблице **убран** — для новых годов импорта строки нужно добавлять в таблицу либо совпадать с уже заведёнными именами.

## Что проверено

- `npx jest __tests__/holidayImages.test.ts`.

## Дальнейшие шаги

- При добавлении нового bundled года — дописать ключи для `YYYY-01-01` под поля `name_*` из JSON импорта.
