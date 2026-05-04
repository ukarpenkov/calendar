# Отчёт: картинка IDN 28 мая (cuti Idul Adha)

## Что изменено

- В `holidayImages.ts` добавлен ассет `assets/days_img/id_28may.webp` для строк из `calendar2026IDN.json` на `2026-05-28`: `Collective Leave for Eid al-Adha` и `Cuti Bersama Hari Raya Idul Adha`.
- В `__tests__/holidayImages.test.ts` — проверка отличия от картинки для `2026-05-27` (сам праздник Idul Adha в IDN).

## Что проверено

- `npx jest __tests__/holidayImages.test.ts` — успешно.

## Дальнейшие шаги

- При смене названий в JSON — синхронизировать ключи в `countrySpecificHolidayImageByKey`.
