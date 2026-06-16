# Disable "+ дней" field when start date is empty

**Date:** 2026-06-16
**Session:** Vacation form UX improvement

## What was done
- "+ дней" input field and "+" button are now disabled when "Дата начала" is not filled
- Disabled state: grey background, reduced opacity (0.5), non-editable
- Active state: restored when start date is fully entered

## Files changed
- `src/pages/vacation/ui/VacationForm.tsx` — added `daysEnabled` flag, applied to TextInput (editable) and Pressable (disabled), conditional styling for background color and opacity

## Tests
- Existing tests in `__tests__/VacationForm.test.tsx` unchanged
