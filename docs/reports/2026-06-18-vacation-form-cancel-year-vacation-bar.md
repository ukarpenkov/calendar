# Vacation form cancel button & year calendar vacation bars

**Date:** 2026-06-18
**Session:** UI fixes

## What was done
- Removed the "Cancel" ghost button from the vacation edit/add form (back arrow in app bar already serves this purpose)
- Fixed year calendar not showing vacation bars on holidays — now matches month calendar behavior

## Files changed
- `src/pages/vacation/ui/VacationForm.tsx` — removed `GhostButton` with `t('common.cancel')` label
- `src/pages/year/ui/YearHomeScreen.tsx` — changed `showVacation` condition from `vacationColor && day.type !== 'holiday'` to `!!vacationColor`

## Notes
- The back arrow button (`IconCircleButton` with `onCancel`) was already present in the app bar, making the separate cancel button redundant
- Month screen (`MonthDetailScreen.tsx:926`) already used `!!vacationColor` without holiday exclusion — year screen now matches
