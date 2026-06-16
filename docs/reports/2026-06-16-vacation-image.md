# Vacation image on vacation days

**Date:** 2026-06-16
**Branch:** feat/vacation

## What was done

- Added `default_vacancy_chill.webp` (beach vacation image) as background for all vacation days
- Month view: "Выбранный день" card now shows "Отпуск - 0 ч" instead of day type for vacation days
- Month view: holiday banner uses vacation image for non-holiday vacation days (workdays, weekends, shortened)
- Widget: background image switches to vacation image when user is on vacation (except holidays)
- Widget: caption shows "Отпуск - 0ч" instead of regular day type
- Added `isDateOnVacation()` helper to check if a date falls within any vacation period
- Added `getVacationImage()` helper for React Native image source
- Added `getVacationDrawableResourceName()` for Android widget drawable lookup

## Files changed

| File | Change |
|------|--------|
| `src/entities/calendar/model/holidayImages.ts` | Added vacation image import, `isDateOnVacation()`, `getVacationImage()`, updated `getDayImage()` to accept vacation periods |
| `src/entities/calendar/index.ts` | Exported new `isDateOnVacation` and `getVacationImage` |
| `src/pages/month/ui/MonthDetailScreen.tsx` | Selected day shows "Отпуск - 0 ч", holiday banner uses vacation image |
| `src/widgets/imageMapping.ts` | Added `getVacationDrawableResourceName()` |
| `src/widgets/widgetData.ts` | Widget uses vacation image when `isOnVacation && type !== 'holiday'` |
| `src/widgets/CalendarWidgetLayout.tsx` | Caption shows "Отпуск - 0ч", removed separate vacation text |
| `android/.../drawable/day_default_vacancy_chill.webp` | Copied vacation image for Android widget |
| `__tests__/widgetVacationData.test.ts` | Updated mock to include `getVacationDrawableResourceName` |

## Tests

- All 177 tests pass (30 suites)
- Updated widget vacation test mock for new export
- Existing `holidayImages.test.ts` unchanged (vacation periods param is optional)

---

## Remove pre-holiday warning

- Removed "Предпраздничный: сокращён до 7ч" warning block from `VacationForm.tsx`
- The warning was unnecessary noise in the vacation creation flow

| File | Change |
|------|--------|
| `src/pages/vacation/ui/VacationForm.tsx` | Removed pre-holiday warning UI block |
