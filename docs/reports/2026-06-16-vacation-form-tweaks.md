# Vacation screen: заголовок по центру + логика дней

**Date:** 2026-06-16
**Session:** ses_12dcb0a5bffegLqj7XCGlpq0vw

## What was done
- Отцентрован заголовок «Отпуск» на экране VacationScreen (как в SettingsScreen)
- Переименовано поле «+ дней» в «Дней»
- Изменена логика подсчёта дней: первый день включён (старт 1 января, 7 дней → конец 7 января)

## Files changed
- `src/pages/vacation/ui/VacationScreen.tsx` — добавлены `textAlign: 'center'` и `appBarTrailing` для центрирования заголовка
- `src/pages/vacation/ui/VacationForm.tsx` — label «+ дней» → «Дней», `daysBetweenDates` возвращает `diff + 1`, `addDaysToDate` прибавляет `days - 1`

## Tests
- Все 10 тест-сьютов (74 теста) проходят
