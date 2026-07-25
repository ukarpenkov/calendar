import {
  getYearGridMetrics,
  getYearGridTextStyle,
} from '../src/pages/year/ui/yearGridMetrics';

test('keeps default sizes on regular screens', () => {
  const metrics = getYearGridMetrics(430, 1);

  expect(metrics.dayFontSize).toBe(9);
  expect(metrics.weekdayFontSize).toBe(9);
  expect(metrics.monthTitleFontSize).toBe(16);
  expect(metrics.minimumTextScale).toBe(0.78);
  expect(metrics.maxFontSizeMultiplier).toBe(1);
  expect(metrics.dayCellSize).toBeGreaterThanOrEqual(14);
  expect(metrics.dayCellSize).toBeLessThanOrEqual(22);
});

test('reduces fonts when width is tight or system font is enlarged', () => {
  const narrowMetrics = getYearGridMetrics(360, 1);
  const largeFontMetrics = getYearGridMetrics(430, 1.35);

  expect(narrowMetrics.dayFontSize).toBeLessThan(9);
  expect(narrowMetrics.weekdayFontSize).toBeLessThan(9);
  expect(largeFontMetrics.dayFontSize).toBeLessThan(9);
  expect(largeFontMetrics.monthMetaFontSize).toBeLessThan(12);
  expect(largeFontMetrics.minimumTextScale).toBeLessThan(0.78);
  // Dense year grid never follows system font scale.
  expect(largeFontMetrics.maxFontSizeMultiplier).toBe(1);
});

test('uses narrower cards in four-column layout so fonts scale down vs two columns', () => {
  const twoCol = getYearGridMetrics(800, 1, 2);
  const fourCol = getYearGridMetrics(800, 1, 4);

  expect(fourCol.dayFontSize).toBeLessThanOrEqual(twoCol.dayFontSize);
  expect(fourCol.monthTitleFontSize).toBeLessThanOrEqual(twoCol.monthTitleFontSize);
  expect(fourCol.dayCellSize).toBeLessThan(twoCol.dayCellSize);
});

test('year grid text style pins line height for compact rows', () => {
  const style = getYearGridTextStyle(9, { fontWeight: '600' });

  expect(style.fontSize).toBe(9);
  expect(style.lineHeight).toBe(Math.ceil(9 * 1.15));
  expect(style.fontWeight).toBe('600');
});

test('year grid text style applies Android compact font metrics', () => {
  const { Platform } = require('react-native');
  const originalOS = Platform.OS;
  Platform.OS = 'android';

  try {
    const style = getYearGridTextStyle(12);
    expect(style.includeFontPadding).toBe(false);
    expect(style.textAlignVertical).toBe('center');
    expect(style.fontFamily).toBe('sans-serif');
  } finally {
    Platform.OS = originalOS;
  }
});
