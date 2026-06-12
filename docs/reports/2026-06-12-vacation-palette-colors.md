# Vacation palette colors — шаг 7

**Дата:** 2026-06-12
**Ветка:** feat/vacation
**Статус:** выполнено

---

## Что сделано

Добавлены цвета отпуска (бирюзовый) в `CalendarPalette` для светлой и тёмной темы.

### Изменённый файл

| Файл | Изменение |
|---|---|
| `src/entities/calendar/lib/presentation.ts` | Добавлены `vacationFill` и `vacationBorder` в тип и обе темы |

### Цвета

| Поле | Dark | Light |
|---|---|---|
| `vacationFill` | `#134E4A` | `#CCFBF1` |
| `vacationBorder` | `#2DD4BF` | `#14B8A6` |

### Что НЕ тронуто

- `DayType` — отпуск не является типом дня, это оверлей
- `getDayTypeColors` — не изменена

## Проверки

- **TypeScript:** компилируется без ошибок
- **Jest:** 125/127 тестов зелёные (2 предсуществующих падения в `monthDetailLayout`)

## Коммит

```
feat(vacation): add vacation colors to CalendarPalette

Add vacationFill and vacationBorder for dark (#134E4A/#2DD4BF)
and light (#CCFBF1/#14B8A6) themes.
```
