# Settings: кнопка-шестерёнка вместо overflow

## Изменения

- Удалён `SettingsOverflowMenu` (меню `⋯`); добавлен `src/shared/ui/SettingsGearButton.tsx` — один тап по иконке `⚙` открывает настройки.
- Подключено на `YearHomeScreen` и `MonthDetailScreen`; `accessibilityLabel` по-прежнему из `year.menu.settings`.
- Правило `.cursor/rules/navigation-and-settings.mdc` обновлено под иконку в app bar.

## Проверка

- `npx tsc --noEmit`, `npm test`, `npm run lint`

## Примечание

Иконка — символ Unicode `⚙` (GEAR); при необходимости позже можно заменить на вектор из общего набора иконок без смены контракта кнопки.
