# Year screen falls back to one column on some Android devices

## Status

Open

## Severity

Critical

## Summary

On some Android devices, the year screen renders month cards in a single column instead of the required two-column layout.

## Affected devices

- Honor 200 (6.7", 2664x1200)
- Realme GT7T (6.8", 2800x1280)

## Devices where the layout is correct

- Xiaomi 15T Pro (6.83", 2772x1280)
- Xiaomi 14 (6.36", 2670x1200)
- Pixel 8 Pro

## Actual result

The year overview shows month cards in one column. The screen becomes noticeably longer and does not match the expected design.

## Expected result

The year overview must always render month cards in exactly two columns on any supported device.

## Reproduction

1. Open the app on an affected Android device.
2. Wait until the year screen is shown.
3. Scroll the yearly calendar list.
4. Observe that month cards are displayed in one column.

## Notes

- The current implementation previously relied on a wrapped flex layout with percentage card width.
- The attached screenshot from closed testing shows the broken one-column rendering.
