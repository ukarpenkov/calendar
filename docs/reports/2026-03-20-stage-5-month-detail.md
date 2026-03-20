# Отчет: Этап 5. Month detail

Дата: `2026-03-20`

Источник задачи: `docs/GLOBAL-DEVELOPMENT-PLAN.md`

## Что было сделано

Реализован следующий шаг после годового overview: пользователь теперь может открыть любой месяц с `Year`-экрана и увидеть детальную сетку дней, состояние выбранной даты и monthly totals.

## Изменения

- `src/app/App.tsx`
  - добавлено простое экранное состояние между `Year` и `Month detail`
  - при открытии месяца данные читаются отдельно через `getMonthCalendar`
- `src/pages/year/ui/YearHomeScreen.tsx`
  - карточки месяцев стали интерактивными и открывают выбранный месяц
  - исправлены ключи у заголовков дней недели
- `src/pages/month/ui/MonthDetailScreen.tsx`
  - добавлен экран месяца с полной сеткой, выбранным днем и блоком totals
- `src/entities/calendar/model/month-helpers.ts`
  - вынесена общая логика labels и построения недель месяца
- `src/entities/calendar/model/month-detail.ts`
  - добавлен селектор month detail с totals вне UI-слоя
- `src/entities/calendar/lib/presentation.ts`
  - вынесены palette и цветовые маппинги day type для `Year` и `Month detail`
- `src/entities/calendar/index.ts`
  - экспортированы новые helpers и селектор
- `__tests__/App.test.tsx`
  - добавлен сценарий открытия месяца из year flow
- `__tests__/monthDetail.test.ts`
  - добавлен unit test для month totals и month grid

## Что проверено

- `npm test -- --runInBand __tests__/App.test.tsx __tests__/yearSummary.test.ts __tests__/monthDetail.test.ts`
- `npx tsc --noEmit`
- IDE-диагностики по измененным файлам

## Результат

Сейчас приложение:

- показывает `Month detail` после выбора месяца на годовом экране
- читает данные месяца отдельно из repository
- отображает полную сетку дней с selectable state
- считает `Total days`, `Working days`, `Non-working days`, `Work hours` вне UI

## Что осталось дальше

Следующий шаг по плану: перейти к `Settings`, связать экран года с меню в правом верхнем углу и начать flow импорта года из локального `JSON`.
