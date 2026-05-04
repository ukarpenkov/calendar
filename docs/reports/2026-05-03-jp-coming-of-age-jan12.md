# JP: изображение для 12 января (Coming of Age Day)

## Что изменено

- В `holidayImages.ts` добавлен ассет `assets/days_img/jp_12jan.webp` и ключи по bundled `calendar2026JP.json`: `2026-01-12|Coming of Age Day`, `2026-01-12|成人の日` (поля `name_en` / `name_ru` / `name_ja` совпадают для японского названия).

## Что проверено

- `npx jest __tests__/holidayImages.test.ts`.

## Дальнейшие шаги

- Для других лет японский «成人の日» может быть не 12 января — при добавлении bundled года завести ключи `YYYY-MM-DD|…` по фактической дате в JSON.
