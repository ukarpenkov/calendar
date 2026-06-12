# Vacation palette test — шаг 8

**Дата:** 2026-06-12
**Ветка:** feat/vacation
**Статус:** выполнено

---

## Что сделано

Создан тест `vacationPalette.test.ts`, проверяющий наличие и корректность цветов отпуска в обеих темах.

### Созданный файл

| Файл | Описание |
|---|---|
| `__tests__/vacationPalette.test.ts` | Тест палитры отпуска |

### Что проверяет тест

1. **Dark theme** — `vacationFill` и `vacationBorder` присутствуют и являются непустыми строками
2. **Light theme** — аналогично
3. **Dark значения** — `#134E4A` и `#2DD4BF`
4. **Light значения** — `#CCFBF1` и `#14B8A6`

Итого: 4 теста.

## Результат

```
PASS __tests__/vacationPalette.test.ts
  vacation palette
    √ dark theme has vacationFill and vacationBorder
    √ light theme has vacationFill and vacationBorder
    √ dark vacation colors match expected values
    √ light vacation colors match expected values

Tests: 4 passed, 4 total
```

## Коммит

```
test(vacation): add palette color assertions for dark and light themes
```
