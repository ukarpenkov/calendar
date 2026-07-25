# Bug: Year view stretched on OnePlus / OxygenOS / ColorOS

**Status:** fixed  
**ID:** YEAR-OEM-FONT-STRETCH  
**Severity:** high (layout unusable / looks broken on affected devices)  
**Affects:** Android OEM skins with custom system fonts (OnePlus Slate, OPPO Sans, etc.)  
**OK on:** Pixel (Roboto), many Xiaomi devices  
**Date:** 2026-07-23  

## Summary

On OnePlus and similar phones the year screen month cards look vertically stretched: day chips become elongated ovals, week rows gain extra vertical space, and typography feels taller than on Pixel/Xiaomi. Reference: compact proportions (photo 1) vs user-reported stretched layout (photo 2).

## Root cause

1. **OEM system fonts ≠ Roboto metrics.** React Native’s Android text measurement assumes Roboto-like metrics. OnePlus Slate / OPPO Sans have larger ascent/descent, so dense `Text` (month titles, week numbers, day digits, summary) measures taller and pushes each month card down.
2. **Default `includeFontPadding: true`** adds extra Android font padding on top of those metrics, amplifying vertical growth in the year grid.
3. **Day cells used fixed `height: 18` + `alignSelf: 'stretch'`.** When the computed day slot width ≠ 18dp, chips become ovals (taller than wide on narrower slots), which reads as “stretched” even when width is correct.
4. **System `fontScale` still allowed up to `maxFontSizeMultiplier ≈ 1.1`**, which further inflates the dense year grid on devices with enlarged display/font settings (common on OEM skins).

## Expected

Year month cards match Pixel/Xiaomi: compact row spacing, roughly square/round day chips, balanced fonts (photo 1).

## Actual

Month cards elongate vertically; day highlights look oblong; overall year grid looks “pulled down” (photo 2).

## Fix

- Force compact Android text metrics on the year grid via `getYearGridTextStyle`: `includeFontPadding: false`, `textAlignVertical: 'center'`, explicit `lineHeight`, and `fontFamily: 'sans-serif'` (Roboto) so layout matches measurement.
- Size day chips with `aspectRatio: 1` from slot width (`dayCellSize` in metrics) so chips stay square.
- Lock year-grid `maxFontSizeMultiplier` to `1` so OEM font/display scale cannot inflate the dense calendar.

## Files

- `src/pages/year/ui/yearGridMetrics.ts`
- `src/pages/year/ui/YearHomeScreen.tsx`
- `__tests__/yearGridMetrics.test.ts`

## Verification

- `npm test -- --runInBand yearGridMetrics` — pass
- Manual: compare year screen on OnePlus (or emulator with non-Roboto system font / large display size) vs Pixel — month cards should match photo 1 proportions
