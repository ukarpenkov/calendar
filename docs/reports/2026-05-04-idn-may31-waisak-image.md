# Отчёт: картинка IDN 31 мая (Весак)

## Что изменено

- В `src/entities/calendar/model/holidayImages.ts` подключён `assets/days_img/id_31may.webp` и сопоставление с праздником из `calendar2026IDN.json`: `Vesak Day 2570 BE` и `Hari Raya Waisak 2570 BE` (ключи `2026-05-31|…`).
- В `__tests__/holidayImages.test.ts` добавлена проверка, что этот день не совпадает по картинке с соседним Pancasila Day.

## Что проверено

- `npx jest __tests__/holidayImages.test.ts` — успешно.

## Дальнейшие шаги

- При смене формулировок названий в JSON для 31.05 импорта — обновить ключи в `countrySpecificHolidayImageByKey`.
