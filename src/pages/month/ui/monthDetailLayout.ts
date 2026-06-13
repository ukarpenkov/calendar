import { layout } from '../../../shared/lib/ui/layout';

const TABLET_MONTH_MAX_CONTENT_WIDTH_LANDSCAPE = 440;
const MONTH_CONTENT_MIN_WIDTH = 280;

/** Space between calendar column and side column in split layout. */
export const MONTH_SPLIT_COLUMNS_GAP = 16;

const SIDE_COLUMN_MIN_WIDTH = 160;
/** Below this width the calendar column is too tight for split; fall back to stack. */
const MIN_CALENDAR_FOR_SPLIT = 150;

export type MonthDetailLayoutMetrics =
  | {
      layout: 'stack';
      calendarColumnWidth: number;
    }
  | {
      layout: 'split';
      calendarColumnWidth: number;
      sideColumnWidth: number;
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

  if (!isLandscape) {
    if (isTablet) {
      return Math.max(Math.min(fullContentWidth, TABLET_MONTH_MAX_CONTENT_WIDTH_LANDSCAPE), MONTH_CONTENT_MIN_WIDTH);
    }
    return fullContentWidth;
  }

  let w = Math.min(fullContentWidth, minDimension - horizontalPadding);
  return Math.max(w, MONTH_CONTENT_MIN_WIDTH);
}

/**
 * Stack: портрет-телефон — одна колонка.
 * Split: альбом (телефон/планшет) и портрет-планшет — календарь слева, детали и итоги справа.
 */
export function getMonthDetailLayoutMetrics(
  windowWidth: number,
  windowHeight: number,
): MonthDetailLayoutMetrics {
  const horizontalPadding = layout.screenPaddingH * 2;
  const fullContentWidth = windowWidth - horizontalPadding;
  const isLandscape = windowWidth > windowHeight;
  const minDimension = Math.min(windowWidth, windowHeight);
  const isTablet = minDimension >= 600;

  const idealCalendarWidth = getMonthContentMaxWidth(windowWidth, windowHeight);

  if (!isLandscape) {
    return {
      layout: 'stack',
      calendarColumnWidth: idealCalendarWidth,
    };
  }

  // В сплите календарь занимает ~440px, остальное — side column.
  const calendarColumnWidth = Math.min(
    idealCalendarWidth,
    TABLET_MONTH_MAX_CONTENT_WIDTH_LANDSCAPE,
    fullContentWidth - MONTH_SPLIT_COLUMNS_GAP - SIDE_COLUMN_MIN_WIDTH,
  );
  const sideIfSplit =
    fullContentWidth - MONTH_SPLIT_COLUMNS_GAP - calendarColumnWidth;

  const useSplit =
    sideIfSplit >= SIDE_COLUMN_MIN_WIDTH &&
    calendarColumnWidth >= MIN_CALENDAR_FOR_SPLIT;

  if (!useSplit) {
    return {
      layout: 'stack',
      calendarColumnWidth: idealCalendarWidth,
    };
  }

  return {
    layout: 'split',
    calendarColumnWidth,
    sideColumnWidth: sideIfSplit,
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
