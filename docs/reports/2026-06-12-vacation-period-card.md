# VacationPeriodCard — шаги 11–12

**Дата:** 2026-06-12
**Ветка:** feat/vacation
**Статус:** выполнено

---

## Шаг 11. Компонент `VacationPeriodCard`

### Созданный файл

| Файл | Описание |
|---|---|
| `src/pages/vacation/ui/VacationPeriodCard.tsx` | Карточка периода отпуска |

### Пропсы

```typescript
type VacationPeriodCardProps = {
  period: VacationPeriod;
  workDays: number;
  totalDays: number;
  onPress: (period: VacationPeriod) => void;
  language: AppLanguage;
};
```

### Визуал

- `borderLeftWidth: 4`, `borderLeftColor: period.color`
- Сверху: даты `DD.MM.YYYY — DD.MM.YYYY` (для `ja` — `YYYY年MM月DD日`)
- Снизу: `workDays / totalDays`
- `Pressable` с `onPress`

---

## Шаг 12. Тест для `VacationPeriodCard`

### Созданный файл

| Файл | Описание |
|---|---|
| `__tests__/VacationPeriodCard.test.tsx` | 5 тестов + snapshot |

### Тесты

| Тест | Что проверяет |
|---|---|
| renders with default props | snapshot |
| renders dates for Russian locale | `01.07.2026` / `14.07.2026` |
| renders dates for Japanese locale | `2026年07月01日` / `2026年07月14日` |
| renders workDays and totalDays summary | `10` / `14` |
| calls onPress when pressed | вызов с правильным period |

## Результат

```
PASS __tests__/VacationPeriodCard.test.tsx
  VacationPeriodCard
    √ renders with default props
    √ renders dates for Russian locale
    √ renders dates for Japanese locale
    √ renders workDays and totalDays summary
    √ calls onPress when pressed

Tests: 5 passed, 5 total
Snapshots: 1 written
```

## Коммит

```
feat(vacation): add VacationPeriodCard component and tests

Card component for vacation list with colored left border,
formatted dates (DD.MM.YYYY / YYYY年MM月DD日), and work/total
day summary. Includes 5 tests and snapshot.
```
