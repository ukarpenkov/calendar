## Фича: Выделение текущего дня и автоскролл к текущему месяцу на экране года

### 1. Обвести текущий день в квадрат на экране года (YearHomeScreen)

**Где:** `src/pages/year/ui/YearHomeScreen.tsx`, компонент `MonthDayCell` (строка 522)

**Текущее состояние:**
`MonthDayCell` получает `day: CalendarDay | null` и раскрашивает ячейку только по `day.type` (workday/weekend/holiday/shortened). Проверки на «сегодня» нет.

**Что нужно сделать:**
- Добавить проп `isToday?: boolean` в `MonthDayCell`.
- В `YearHomeScreen` перед рендером определить todayDate (через `getLocalIsoDate()` или аналог) и передать `isToday={day.date === todayDate}`.
- Внутри `MonthDayCell` при `isToday === true` применить другой стиль — квадратную рамку (без скругления `borderRadius: 0` или с контрастным `borderWidth: 2` / цветом `selectedBorder` как в `MonthDetailScreen`), чтобы визуально обвести день в квадрат.

**Референс:** В `MonthDetailScreen.tsx` для выделенного дня используется `selectedBorder` (#2563EB light / #60A5FA dark) и `selectedFill` (#EFF6FF / #0F172A). Для года можно взять те же цвета или их вариацию.

### 2. Автоскролл при открытии — текущий месяц по центру экрана

**Где:** `src/pages/year/ui/YearHomeScreen.tsx`, ScrollView (строка 145)

**Текущее состояние:**
ScrollView без `ref`, без вызова `scrollTo`. Открывается с января.

**Что нужно сделать:**
- Добавить `scrollViewRef = useRef<ScrollView>(null)`.
- Определить индекс текущего месяца (month - 1) или номер карточки.
- После монтирования и получения layout-размеров карточек (через `onLayout` или `useEffect` с `setTimeout(0)`) вычислить `scrollY` для позиции, где карточка текущего месяца будет в центре экрана.
- Вызвать `scrollViewRef.current?.scrollTo({ y: targetY, animated: false })`.
- Учесть columnsPerRow: если карточек 2 в ряд — targetY для rows[floor(month-1 / 2)]; если 4 — rows[floor(month-1 / 4)].
- Учесть `safeAreaInsets.top` и высоту `appBar` + `YearEndReminderCard` (если виден) + `legendCard` при вычислении центра.

**Расчёт targetY:**
```
rowIndex = Math.floor((currentMonth - 1) / columnsPerRow)
cardHeight = высота одной карточки месяца (измерять через onLayout)
gapHeight = 12 (gap между строками)
targetY = rowIndex * (cardHeight + gapHeight) - (containerHeight / 2) + (cardHeight / 2)
clamp(targetY, 0, maxScrollY)
```

Либо использовать `scrollTo({ y: ..., animated: false })` после того, как все карточки отрендерены и измерены.

### Связанные файлы

| Файл | Назначение |
|------|-----------|
| `src/pages/year/ui/YearHomeScreen.tsx` | Основной экран года — здесь вносить изменения |
| `src/pages/year/ui/yearGridMetrics.ts` | Метрики сетки (возможно, понадобится fontSize для today-баджа) |
| `src/pages/month/ui/MonthDetailScreen.tsx` | Референс: как сделано выделение сегодняшнего дня (строка 928–941) |
| `src/entities/calendar/lib/presentation.ts` | Цветовая палитра: `selectedBorder`, `selectedFill` (строки 44–45, 69–70) |
