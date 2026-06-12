# Vacation utils & tests — шаги 9–10

**Дата:** 2026-06-12
**Ветка:** feat/vacation
**Статус:** выполнено

---

## Шаг 9. Утилита `getVacationDaysInRange`

### Созданные файлы

| Файл | Описание |
|---|---|
| `src/features/vacation/lib/vacation-utils.ts` | Чистая функция подсчёта дней отпуска |
| `src/features/vacation/lib/index.ts` | Barrel export |

### Сигнатура

```typescript
getVacationDaysInRange(
  startDate: string,   // YYYY-MM-DD
  endDate: string,     // YYYY-MM-DD
  calendarDays: CalendarDay[],
): { totalDays: number; workDays: number; preHolidayDates: string[] }
```

### Логика

- `totalDays` — дни в диапазоне (включительно)
- `workDays` — только `type === 'workday'`
- `preHolidayDates` — даты, у которых следующий день — праздник (`type === 'holiday'`)
- `endDate < startDate` → `{ totalDays: 0, workDays: 0, preHolidayDates: [] }`

---

## Шаг 10. Тесты для `getVacationDaysInRange`

### Созданный файл

| Файл | Описание |
|---|---|
| `__tests__/vacationUtils.test.ts` | 8 unit-тестов |

### Тестовые данные

Мок `CalendarDay[]` для января 2026:
- 1 января (чт) — holiday
- 2 января (пт) — workday
- 3–4 января (сб–вс) — weekend
- 5–6 января (пн–вт) — workday
- 7 января (ср) — holiday
- 8 января (чт) — shortened
- 9 января (пт) — workday
- 10 января (сб) — weekend

### Покрытие тестов

| Тест | Что проверяет |
|---|---|
| counts 5 workday-only range | 4 workday в Jan 2–9 |
| does not count weekends | weekend → workDays = 0 |
| does not count holidays | holiday → workDays = 0 |
| does not count shortened days | shortened → workDays = 0 |
| returns zeros when endDate < startDate | невалидный диапазон |
| includes day before holiday in preHolidayDates | Jan 6 перед Jan 7 |
| does not include day before weekend in preHolidayDates | Jan 2 (пт) перед сб — не попадает |
| returns correct totalDays count | 10 дней в полном диапазоне |

## Результат

```
PASS __tests__/vacationUtils.test.ts
  getVacationDaysInRange
    √ counts 5 workday-only range
    √ does not count weekends
    √ does not count holidays
    √ does not count shortened days
    √ returns zeros when endDate < startDate
    √ includes day before holiday in preHolidayDates
    √ does not include day before weekend in preHolidayDates
    √ returns correct totalDays count

Tests: 8 passed, 8 total
```

## Коммит

```
feat(vacation): add getVacationDaysInRange utility and tests

Pure function that counts total days, work days, and pre-holiday
dates within a date range against a CalendarDay array.
Includes 8 unit tests with mock January 2026 data.
```
