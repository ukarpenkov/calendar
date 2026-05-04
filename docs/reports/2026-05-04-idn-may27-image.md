# Отчёт: картинка IDN 27 мая (Idul Adha)

## Что изменено

- В `holidayImages.ts` подключён `assets/days_img/id_27may.webp` для `calendar2026IDN.json` на `2026-05-27`: `Eid al-Adha 1447 H` и `Hari Raya Idul Adha 1447 H`.
- В тестах добавлена проверка, что при том же ISO-дате индонезийские названия дают другой ассет, чем турецкая строка `Eid al-Adha (1st day)`.

## Что проверено

- `npx jest __tests__/holidayImages.test.ts` — успешно.

## Дальнейшие шаги

- При изменении подписей в `calendar2026IDN.json` для 27.05 — обновить ключи.
