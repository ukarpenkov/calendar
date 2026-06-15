# Отпуск — визуальные улучшения UI

**Date:** 2026-06-15
**Session:** Vacation UI — holiday color, bottom bar, FAB, delete confirm

## What was done
- Праздники и выходные, попадающие в период отпуска, теперь окрашиваются фоном отпуска и имеют линию снизу (vacationBar), как и будни в отпуске
- Обновлена логика на обоих экранах: годовой календарь отпусков и детальный вид месяца
- Кнопка "+" добавления отпуска перенесена из app bar в Material FAB (Floating Action Button) — круг 56×56, позиция absolute bottom-right, с тенью и анимацией нажатия
- Подтверждение удаления отпуска: кнопки "Удалить" / "Отмена" заменены на "Да" / "Нет"
- Добавлены ключи `common.yes` / `common.no` на все 5 языков (ru, en, tr, ja, id)

## Files changed
- `src/pages/vacation/ui/VacationYearCalendar.tsx` — `vacationColor` назначается для всех типов дней в периоде отпуска
- `src/pages/month/ui/MonthDetailScreen.tsx` — `vacationColorByDate` включает все типы дней; `showVacation = !!vacationColor`; фон и линия снизу для будней, выходных и праздников в отпуске
- `src/pages/vacation/ui/VacationScreen.tsx` — кнопка "+" перенесена в FAB (absolute, bottom-right, 56×56, с тенью)
- `src/pages/vacation/ui/VacationForm.tsx` — подтверждение удаления: "Да" / "Нет"
- `src/shared/lib/i18n/messages/ru.ts` — `common.yes`, `common.no`
- `src/shared/lib/i18n/messages/en.ts` — `common.yes`, `common.no`
- `src/shared/lib/i18n/messages/tr.ts` — `common.yes`, `common.no`
- `src/shared/lib/i18n/messages/ja.ts` — `common.yes`, `common.no`
- `src/shared/lib/i18n/messages/id.ts` — `common.yes`, `common.no`

## Tests
- `npx tsc --noEmit` — pass

## Notes
- FAB использует цвета `vacationFill` / `vacationBorder` из палитры
