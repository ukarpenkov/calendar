# Year view: month mini-grid overflow on device

## What changed

- In `src/pages/year/ui/YearHomeScreen.tsx`, the month card calendar used fixed pixel widths for the week-number column and seven day cells (~170px total plus gaps), while each card is only `width: '47%'` of the scroll content with horizontal padding—so the usable inner width on real phones was often **smaller** than the fixed grid.
- Replaced that layout with a **flex row**: fixed `weekNumberColumn` (22px) plus a `flex: 1` strip of seven equal `dayColumn` / `dayColumnHeader` slots (`minWidth: 0` so flex children can shrink on Android).
- Day cells and empty placeholders use `alignSelf: 'stretch'` and no fixed width so they always match their column; weekday headers stay centered in the same column widths.

## What was verified

- `npx tsc --noEmit` passes.

## Follow-up

- Re-check on the same physical device after a release/debug build; if any locale uses wider weekday glyphs, typography can be tuned without changing the flex model.
