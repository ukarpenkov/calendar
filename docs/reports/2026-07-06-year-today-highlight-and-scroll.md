# Today Highlight & Auto-Scroll — Year Screen

**Date:** 2026-07-06
**Scope:** `src/pages/year/ui/YearHomeScreen.tsx`

## What changed

### 1. Current day highlight

`MonthDayCell` now accepts an `isToday` boolean prop. When true, the cell renders with a 2px border using `palette.selectedBorder` (#2563EB light / #60A5FA dark) instead of the default 1px day-type border. The parent component computes `todayDate` via a local `getLocalIsoDate()` helper and passes `isToday={day?.date === todayDate}`.

### 2. Auto-scroll to current month

On mount, the screen scrolls to center the current month's row in the viewport:

- `scrollViewRef` attached to `ScrollView`
- `containerHeight` measured via `onLayout`
- `cardHeight` measured from the first month card's `onLayout`
- `useEffect` calculates `targetY = rowIndex * (cardHeight + gapHeight) - containerHeight/2 + cardHeight/2`, clamped to 0
- Scroll executes via `requestAnimationFrame` with `animated: false`

### 3. Version bump

App version incremented from 11.0 to 12.0 across `package.json`, `appDisplayVersion.ts`, and `android/app/build.gradle`.

## Files touched

| File | Change |
|------|--------|
| `src/pages/year/ui/YearHomeScreen.tsx` | Today highlight + auto-scroll |
| `docs/feat/today-highlight-and-scroll.md` | Feature spec (new) |
| `package.json` | 11.0 → 12.0 |
| `src/shared/config/appDisplayVersion.ts` | 11.0 → 12.0 |
| `android/app/build.gradle` | versionCode 11→12, versionName 11.0→12.0 |

## Verification

- TypeScript: `tsc --noEmit` passes clean
- Tests: 175/177 pass (2 pre-existing failures in `VacationForm.test.tsx` unrelated to this change)
