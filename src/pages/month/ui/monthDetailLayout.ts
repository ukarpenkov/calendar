import { layout } from '../../../shared/lib/ui/layout';

const TABLET_MONTH_MAX_CONTENT_WIDTH = 440;
const MONTH_CONTENT_MIN_WIDTH = 280;

/** Gap between the two total cards in one row of the 2×2 grid. */
export const MONTH_TOTALS_GAP = 12;

/** Space between calendar column and side column in split layout. */
export const MONTH_SPLIT_COLUMNS_GAP = 16;

const SIDE_COLUMN_MIN_WIDTH = 160;
/** Below this width the calendar column is too tight for split; fall back to stack. */
const MIN_CALENDAR_FOR_SPLIT = 150;

export type MonthDetailLayoutMetrics =
  | {
      layout: 'stack';
      calendarColumnWidth: number;
      totalCardWidth: number;
    }
  | {
      layout: 'split';
      calendarColumnWidth: number;
      sideColumnWidth: number;
      totalCardWidth: number;
      columnGap: number;
    };

/**
 * Max width for the calendar column (same rules as before: portrait phone = full inset;
 * landscape/tablet = portrait-like width cap).
 */
export function getMonthContentMaxWidth(
  windowWidth: number,
  windowHeight: number,
): number {
  const horizontalPadding = layout.screenPaddingH * 2;
  const fullContentWidth = windowWidth - horizontalPadding;
  const minDimension = Math.min(windowWidth, windowHeight);
  const isLandscape = windowWidth > windowHeight;
  const isTablet = minDimension >= 600;

  if (!isLandscape && !isTablet) {
    return fullContentWidth;
  }

  let w = Math.min(fullContentWidth, minDimension - horizontalPadding);
  if (isTablet) {
    w = Math.min(w, TABLET_MONTH_MAX_CONTENT_WIDTH);
  }
  return Math.max(w, MONTH_CONTENT_MIN_WIDTH);
}

/**
 * Stack: портрет (телефон и планшет) — одна колонка, как раньше.
 * Split: только альбом — календарь слева, детали и итоги справа, если хватает ширины.
 */
export function getMonthDetailLayoutMetrics(
  windowWidth: number,
  windowHeight: number,
): MonthDetailLayoutMetrics {
  const horizontalPadding = layout.screenPaddingH * 2;
  const fullContentWidth = windowWidth - horizontalPadding;
  const isLandscape = windowWidth > windowHeight;

  const idealCalendarWidth = getMonthContentMaxWidth(windowWidth, windowHeight);

  if (!isLandscape) {
    return {
      layout: 'stack',
      calendarColumnWidth: idealCalendarWidth,
      totalCardWidth: Math.max((idealCalendarWidth - MONTH_TOTALS_GAP) / 2, 0),
    };
  }

  const maxCalendarForSplit =
    fullContentWidth - MONTH_SPLIT_COLUMNS_GAP - SIDE_COLUMN_MIN_WIDTH;

  const calendarColumnWidth = Math.min(idealCalendarWidth, maxCalendarForSplit);
  const sideIfSplit =
    fullContentWidth - MONTH_SPLIT_COLUMNS_GAP - calendarColumnWidth;

  const useSplit =
    sideIfSplit >= SIDE_COLUMN_MIN_WIDTH &&
    calendarColumnWidth >= MIN_CALENDAR_FOR_SPLIT;

  if (!useSplit) {
    return {
      layout: 'stack',
      calendarColumnWidth: idealCalendarWidth,
      totalCardWidth: Math.max((idealCalendarWidth - MONTH_TOTALS_GAP) / 2, 0),
    };
  }

  return {
    layout: 'split',
    calendarColumnWidth,
    sideColumnWidth: sideIfSplit,
    totalCardWidth: Math.max((sideIfSplit - MONTH_TOTALS_GAP) / 2, 0),
    columnGap: MONTH_SPLIT_COLUMNS_GAP,
  };
}

/** Scales calendar typography/cells when the calendar column is narrow. */
export function getMonthCalendarScale(calendarColumnWidth: number): number {
  const ref = 360;
  return Math.min(Math.max(calendarColumnWidth / ref, 0.78), 1);
}

/** Scales the right column when it is narrow in split layout. */
export function getMonthSideScale(sideColumnWidth: number): number {
  const ref = 300;
  return Math.min(Math.max(sideColumnWidth / ref, 0.72), 1);
}
