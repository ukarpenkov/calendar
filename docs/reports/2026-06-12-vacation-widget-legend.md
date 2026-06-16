# Vacation Steps 26–28: Widget Status, Test, Legend

**Date:** 2026-06-12
**Status:** Completed

---

## Summary

Implemented three vacation feature steps: widget vacation status display, widget data test, and vacation legend.

---

## Step 26 — Widget Vacation Status

### Files modified:
- `src/widgets/widgetData.ts`
  - Added `isOnVacation: boolean` and `vacationColor: string | null` to `WidgetDayData` interface
  - Added SQL query to `vacation_periods` table checking if today's date falls within any period
  - Returns vacation color from the matched period

- `src/widgets/CalendarWidgetLayout.tsx`
  - Added `VACATION_LABELS` map (en/ru/tr/id/ja)
  - Renders `🏖 <label>` text line below the date when `isOnVacation === true`
  - Text color uses `vacationColor` from data

### Implementation details:
- Vacation query: `SELECT color FROM vacation_periods WHERE start_date <= ? AND end_date >= ? LIMIT 1`
- Gracefully handles missing table (try/catch around query)
- Date boundaries are inclusive (start_date and end_date match)

---

## Step 27 — Widget Vacation Data Test

### Files created:
- `__tests__/widgetVacationData.test.ts`

### Test cases:
1. Today within vacation period → `isOnVacation: true`, correct color
2. Today not in any period → `isOnVacation: false`, `vacationColor: null`
3. Today is `start_date` of a period → `isOnVacation: true` (boundary)
4. Today is `end_date` of a period → `isOnVacation: true` (boundary)

### Testing approach:
- Mocked `@op-engineering/op-sqlite` `open` function to redirect `fetchTodayWidgetData()`'s internal DB to a test in-memory DB
- Used `jest.requireActual` inside mock factory (jest hoisting constraint)
- Used `mock`-prefixed variable (`mockTestDb`) for jest.mock factory reference

---

## Step 28 — Vacation Legend

### Files created:
- `src/pages/vacation/ui/VacationLegend.tsx`

### Files modified:
- `src/pages/vacation/ui/VacationScreen.tsx` — renders `VacationLegend` below calendar (ScrollView) and as list footer (FlatList)
- `src/pages/vacation/ui/index.ts` — added barrel export

### Files created:
- `__tests__/VacationLegend.test.tsx` — 3 snapshot tests (en, ru, dark mode)

### Legend items:
| Color | i18n key |
|-------|----------|
| `#9CA3AF` (gray) | `vacation.legend.workday` |
| `#3B82F6` (blue) | `vacation.legend.weekend` |
| `#EF4444` (red) | `vacation.legend.holiday` |
| `#F59E0B` (yellow) | `vacation.legend.shortened` |
| `#2DD4BF` (teal) | `vacation.legend.vacation` |

Swatches: 16×16 px, 4px border-radius, horizontal flex-wrap layout.

---

## Test Results

- **New tests:** 7/7 passing (4 widget vacation data + 3 legend snapshots)
- **Pre-existing failures:** 2 in `monthDetailLayout.test.ts` (tablet layout — unrelated to this change)
- **Full suite:** 164/166 passing

---

## Files touched

| File | Action |
|------|--------|
| `src/widgets/widgetData.ts` | Modified |
| `src/widgets/CalendarWidgetLayout.tsx` | Modified |
| `src/pages/vacation/ui/VacationLegend.tsx` | Created |
| `src/pages/vacation/ui/VacationScreen.tsx` | Modified |
| `src/pages/vacation/ui/index.ts` | Modified |
| `__tests__/widgetVacationData.test.ts` | Created |
| `__tests__/VacationLegend.test.tsx` | Created |
