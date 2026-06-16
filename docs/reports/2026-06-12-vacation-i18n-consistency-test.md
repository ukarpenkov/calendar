# Vacation i18n consistency test — шаг 6

**Дата:** 2026-06-12
**Ветка:** feat/vacation
**Статус:** выполнено

---

## Что сделано

Создан тест `vacationLocalization.test.ts`, проверяющий что все vacation-ключи из `en.ts` присутствуют в 4 других файлах локализации и не содержат пустых значений.

### Созданный файл

| Файл | Описание |
|---|---|
| `__tests__/vacationLocalization.test.ts` | Тест консистентности vacation i18n-ключей |

### Что проверяет тест

1. **`en.ts` содержит vacation-ключи** — проверка что список ключей не пуст
2. **Все ключи есть в `ru.ts`, `tr.ts`, `id.ts`, `ja.ts`** — 4 теста на наличие
3. **Нет пустых значений** — 4 теста что ни один перевод не пустой

Итого: 9 тестов.

## Результат

```
PASS __tests__/vacationLocalization.test.ts
  vacation i18n key consistency
    √ en.ts contains vacation keys
    √ all vacation keys present in ru.ts
    √ no empty values in ru.ts vacation keys
    √ all vacation keys present in tr.ts
    √ no empty values in tr.ts vacation keys
    √ all vacation keys present in id.ts
    √ no empty values in id.ts vacation keys
    √ all vacation keys present in ja.ts
    √ no empty values in ja.ts vacation keys

Tests: 9 passed, 9 total
```

## Коммит

```
test(vacation): add i18n key consistency check across 5 languages

Verify all vacation.* keys from en.ts exist in ru, tr, id, ja
with no empty values.
```
