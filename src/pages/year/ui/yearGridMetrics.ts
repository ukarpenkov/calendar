import { Platform, type TextStyle } from 'react-native';

import { layout } from '../../../shared/lib/ui/layout';

const MONTH_ROW_GAP = 12;
const MONTH_CARD_HORIZONTAL_PADDING = 24;
const WEEK_NUMBER_COLUMN_WIDTH = 22;
const STRIP_GAP = 2;
const DAYS_IN_WEEK = 7;
const STRIP_GAP_COUNT = DAYS_IN_WEEK - 1;

export type YearGridMetrics = {
  dayFontSize: number;
  dayCellSize: number;
  weekdayFontSize: number;
  weekNumberFontSize: number;
  monthTitleFontSize: number;
  monthMetaFontSize: number;
  summaryLabelFontSize: number;
  summaryValueFontSize: number;
  minimumTextScale: number;
  maxFontSizeMultiplier: number;
};

/**
 * Compact year-grid text style for Android OEM fonts (OnePlus Slate, OPPO Sans, …).
 * RN measures with Roboto-like metrics; OEM fonts + includeFontPadding stretch rows vertically.
 */
export function getYearGridTextStyle(
  fontSize: number,
  extras: TextStyle = {},
): TextStyle {
  const { lineHeight: extraLineHeight, ...restExtras } = extras;
  const lineHeight =
    typeof extraLineHeight === 'number'
      ? extraLineHeight
      : Math.ceil(fontSize * 1.15);

  return {
    ...(Platform.OS === 'android'
      ? {
          includeFontPadding: false,
          textAlignVertical: 'center' as const,
          // Force Roboto metrics so layout matches measurement on OEM skins.
          fontFamily: 'sans-serif',
        }
      : null),
    ...restExtras,
    fontSize,
    lineHeight,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getYearGridMetrics(
  windowWidth: number,
  fontScale: number,
  columnsPerRow: number = 2,
): YearGridMetrics {
  const safeWindowWidth = Math.max(windowWidth, 320);
  const safeFontScale = Math.max(fontScale, 1);
  const columns = Math.min(Math.max(Math.round(columnsPerRow), 1), 6);

  const contentWidth = safeWindowWidth - layout.screenPaddingH * 2;
  const monthCardWidth =
    (contentWidth - MONTH_ROW_GAP * Math.max(columns - 1, 0)) / columns;
  const daysStripWidth =
    monthCardWidth -
    MONTH_CARD_HORIZONTAL_PADDING -
    WEEK_NUMBER_COLUMN_WIDTH -
    STRIP_GAP;
  const daySlotWidth =
    (daysStripWidth - STRIP_GAP * STRIP_GAP_COUNT) / DAYS_IN_WEEK;

  const widthPressure = clamp((18 - daySlotWidth) / 5, 0, 1);
  const fontScalePressure = clamp((safeFontScale - 1) / 0.45, 0, 1);
  const pressure = Math.max(widthPressure, fontScalePressure);

  // Keep chips square: size follows slot width, not a fixed height that becomes an oval.
  const dayCellSize = clamp(Math.round(daySlotWidth), 14, 22);

  return {
    dayFontSize: clamp(9 - pressure * 1.6, 7, 9),
    dayCellSize,
    weekdayFontSize: clamp(9 - pressure * 2, 6.4, 9),
    weekNumberFontSize: clamp(9 - pressure * 1.4, 7, 9),
    monthTitleFontSize: clamp(16 - pressure * 1.4, 14, 16),
    monthMetaFontSize: clamp(12 - pressure, 10.5, 12),
    summaryLabelFontSize: clamp(10 - pressure, 8.5, 10),
    summaryValueFontSize: clamp(13 - pressure, 11.5, 13),
    minimumTextScale: clamp(0.78 - pressure * 0.1, 0.68, 0.78),
    // Dense year grid must not grow with system font scale (OnePlus display size, etc.).
    maxFontSizeMultiplier: 1,
  };
}
