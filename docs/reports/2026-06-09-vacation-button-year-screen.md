# Vacation: кнопка на экране года

## Изменения

- Добавлена `src/shared/ui/icons/VacationIcon.tsx` — SVG-иконка (пальма, солнце, пляж, вода), масштабированная из `icons/vacation/vacation.svg` (512×512 → viewBox 24×24). Оригинальные цвета заливок сохранены (`#F2FF00`, `#FFE500`, `#18B8D0`, `#5AAA0A`, `#FF9D00`); обводки используют `palette.icon` для адаптации к светлой/тёмной теме.
- Добавлена `src/shared/ui/VacationButton.tsx` — круглая кнопка 36×36, по форме и размерам идентична `SettingsGearButton`.
- `YearHomeScreen`: кнопка vacation размещена в app bar слева от кнопки настроек; trailing-зона переделана с фиксированного `width: 36` на `flexDirection: 'row'` с `gap: 8`.
- `App.tsx`: добавлен `openVacation`, обработка кнопки «Назад» (возврат на годовой экран), заглушка рендера экрана vacation.
- `user-flow.ts`: в `ReadyScreen` добавлен вариант `{ name: 'vacation' }`.
- Локализация: ключ `year.menu.vacation` добавлен во все 5 файлов (en, ru, id, tr, ja).

## Проверка

- TypeScript компилируется без ошибок.
- Кнопка отображается в app bar рядом с настройками, нажатие навигирует на экран-заглушку vacation.
