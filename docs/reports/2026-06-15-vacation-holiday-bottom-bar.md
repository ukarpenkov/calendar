# Отпуск на праздниках — линия снизу и фон

**Date:** 2026-06-15
**Session:** Vacation UI — holiday color + bottom bar

## What was done
- Праздники, попадающие в период отпуска, теперь окрашиваются фоном отпуска и имеют линию снизу (vacationBar), как и будни в отпуске
- Обновлена логика на обоих экранах: годовой календарь отпусков и детальный вид месяца

## Files changed
- `src/pages/vacation/ui/VacationYearCalendar.tsx` — добавлено `cal?.type === 'holiday'` в условие назначения `vacationColor`
- `src/pages/month/ui/MonthDetailScreen.tsx` — `vacationColorByDate` включает праздники; `showVacation` расширен на `workday || holiday`; фон ячейки окрашивается в `vacationColor + '4D'` для будней и праздников в отпуске

## Tests
- Не запускались (визуальное изменение)

## Notes
- Выходные в отпуске пока не окрашиваются — только будни и праздники
