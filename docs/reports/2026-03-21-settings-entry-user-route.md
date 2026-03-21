# Settings entry — пользовательский маршрут

## Что сделано

- Вынесен тип состояния навигации после bootstrap в `src/app/model/user-flow.ts` (`ReadyScreen`, `AppContentStatus`), `App.tsx` использует его как единый контракт экранов.
- Вход в настройки через overflow-меню (⋮) вынесен в `src/shared/ui/SettingsOverflowMenu.tsx` и подключён на экране года и на экране месяца; `App.tsx` передаёт в `MonthDetailScreen` тот же `openSettings`, что и для года.
- Для кнопки меню добавлен `accessibilityLabel` по строке настроек.

## Проверка

- `npx tsc --noEmit`
- `npm test`

## Дальше

- Подпункты 7-й задачи по плану: theme context, localization, JSON import entry (часть уже есть в UI — уточнить по backlog).
