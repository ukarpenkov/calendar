const CONTENT_STACK_GAP = 20;

export const layout = {
  screenPaddingH: 16,
  contentStackGap: CONTENT_STACK_GAP,
  holidayBannerGap: 12,
  /** Вертикальный зазор под app bar на экране месяца: удвоенный `contentStackGap` для большего «воздуха». */
  monthScrollPaddingTop: CONTENT_STACK_GAP * 2,
  safeAreaTopExtra: 12,
  yearMonthScrollBottom: 72,
  settingsScrollBottom: 80,
} as const;
