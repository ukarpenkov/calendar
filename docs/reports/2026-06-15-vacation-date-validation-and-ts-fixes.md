# 2026-06-15 — Vacation date validation + pre-existing TS error fixes

## Vacation date input validation (VacationForm.tsx)

Added real-time validation to `formatDayMonthInput()` so users cannot type invalid dates:

- **Day range**: 01–31 enforced during typing
- **Month range**: 01–12 enforced during typing
- **Calendar validity**: blocked dates like 31.04, 30.02, 29.02 in non-leap years — if an invalid day/month combo is entered, the input truncates to the last valid digit

The validation runs on every keystroke before the formatted string is returned, so invalid combinations never appear in the field.

## Pre-existing TypeScript error fixes (14 errors across 6 files)

| File | Error | Fix |
|------|-------|-----|
| `tsconfig.json` | `@types/node` missing — `fs`, `path`, `__dirname` unresolved | Added `"node"` to `types` array |
| `MonthDayVacationOverlay.test.tsx` (×3) | `toJSON()` returns `JSON \| JSON[] \| null` but typed as `JSON \| null` | Widened `tree` variable type to include `JSON[]` |
| `MonthDetailScreen.tsx` | Duplicate `vacationBar` property in stylesheet | Removed the duplicate entry |
| `VacationYearCalendar.tsx` (×2) | `Map<string>` keyed by `number` (`d.day`) | Wrapped keys with `String()` |
| `YearHomeScreen.tsx` (×4) | Duplicate `vacationBadge` / `vacationBadgeText` in stylesheet | Removed duplicate entries |
| `CalendarWidgetLayout.tsx` | `string` not assignable to `ColorProp` (`#${string}`) | Cast with `as \`#${string}\`` |

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx jest --no-coverage` — 30 suites, 177 tests, all PASS
