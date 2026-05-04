# Отчёт: изображение для коротких рабочих дней (7 ч)

## Что изменено

- В `src/entities/calendar/model/holidayImages.ts` добавлен ассет `assets/days_img/default_short_day.webp` и использование его для дней типа `shortened` в `getDayImage`.
- Обычные рабочие дни (`workday`) по-прежнему используют `work_default.webp`.
- В `getCalendarImagesForDays` предзагрузка разделена: `work_default` только при наличии `workday`, `default_short_day` — при наличии `shortened`.
- В `__tests__/holidayImages.test.ts` обновлено ожидание: короткий день даёт иной источник картинки, чем полный рабочий.

## Что проверено

- `npx jest __tests__/holidayImages.test.ts` — все тесты проходят.

## Дальнейшие шаги

- При необходимости визуально проверить на устройстве экран месяца с предпраздничными днями.
