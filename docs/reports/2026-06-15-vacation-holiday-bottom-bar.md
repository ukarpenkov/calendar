# Отпуск на праздниках — линия снизу и фон

**Date:** 2026-06-15
**Session:** Vacation UI — holiday color + bottom bar

## What was done
- Праздники и выходные, попадающие в период отпуска, теперь окрашиваются фоном отпуска и имеют линию снизу (vacationBar), как и будни в отпуске
- Обновлена логика на обоих экранах: годовой календарь отпусков и детальный вид месяца

## Files changed
- `src/pages/vacation/ui/VacationYearCalendar.tsx` — `vacationColor` назначается для всех типов дней (workday, weekend, holiday) в периоде отпуска
- `src/pages/month/ui/MonthDetailScreen.tsx` — `vacationColorByDate` включает все типы дней; `showVacation = !!vacationColor`; фон и линия снизу отображаются для будней, выходных и праздников в отпуске

## Tests
- Не запускались (визуальное изменение)

## Notes
- Все типы дней в отпуске теперь имеют единообразное отображение: полупрозрачный фон отпуска + линия снизу
