# Шаг 29 — Запуск тестов и исправление падений

**Дата:** 2026-06-13
**Статус:** ✅ Выполнено

## Результат

```
Test Suites: 30 passed, 30 total
Tests:       177 passed, 177 total
Snapshots:   7 passed, 7 total
```

## Найденные и исправленные проблемы

### 1. `App.test.tsx` — дублирующийся импорт `VacationPeriod`

**Файл:** `src/pages/year/ui/YearHomeScreen.tsx:27-29`

Три одинаковых строки `import type { VacationPeriod } from '../../../features/vacation/model';` вызывали `SyntaxError: Identifier 'VacationPeriod' has already been declared`. Jest не мог распарсить файл.

**Исправление:** Удалены дубли, оставлен один импорт.

### 2. `App.test.tsx` — дублированный JSX-блок в YearHomeScreen

**Файл:** `src/pages/year/ui/YearHomeScreen.tsx:310-326`

В JSX-дереве компонента был дублированный фрагмент: повторный блок с `) : null}`, `<Text>` и `</View>`, который ломал структуру тега `<Pressable>`. Babel выбрасывал `Expected corresponding JSX closing tag for <Pressable>`.

**Исправление:** Удалён дублированный JSX-фрагмент (17 строк).

### 3. `monthDetailLayout.test.ts` — планшет в портрете не кэпился

**Файл:** `src/pages/month/ui/monthDetailLayout.ts`

Два падающих теста:
- `tablet portrait caps month column width` — ожидалось 440, получалось 868
- `portrait month detail is always stack (tablet)` — ожидалось `stack`, получалось `split`

Причина: `getMonthContentMaxWidth` кэпировал ширину на 440 только для `isTablet && isLandscape`, но не для планшета в портрете. А `getMonthDetailLayoutMetrics` возвращал `stack` только для `!isLandscape && !isTablet` (телефон в портрете), планшет в портрете уходил в `split`.

**Исправление:**
- `getMonthContentMaxWidth`: для планшета в портрете — отдельная ветка с кэпом `TABLET_MONTH_MAX_CONTENT_WIDTH_LANDSCAPE` (440).
- `getMonthDetailLayoutMetrics`: изменено условие `!isLandscape && !isTablet` → `!isLandscape` — все портретные orientations возвращают `stack`.

### 4. `MonthDayVacationOverlay.test.tsx` — ReactTestRenderer без `act()`

**Файл:** `__tests__/MonthDayVacationOverlay.test.tsx`

5 тестов падали с ошибкой `Can't access .root on unmounted test renderer`. Компонент `TestDayCell`使用 React Native компоненты (`View`, `Text`) через ленивый `import` из `react-native`. `ReactTestRenderer.create()` без `act()` не успевал завершить рендер до обращения к `.root`.

**Исправление:** Все вызовы `ReactTestRenderer.create()` обёрнуты в `act()`.

## Не затронуто

- `DayType` — не менялся
- Существующая логика календаря — не затронута
- Snapshot-тесты — все 7 прошли без обновления

## Тесты DayType и calendarRepository

- `calendarRepository.test.ts` — все 7 тестов пройдены, миграция v3→v4 работает корректно
- Все тесты, использующие `DayType` (holidayImages, yearSummary, monthDetail, widgetVacationData и др.) — зелёные
