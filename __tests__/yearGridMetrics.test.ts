import { getYearGridMetrics } from '../src/pages/year/ui/yearGridMetrics';

test('keeps default sizes on regular screens', () => {
  const metrics = getYearGridMetrics(430, 1);

  expect(metrics.dayFontSize).toBe(9);
  expect(metrics.weekdayFontSize).toBe(9);
  expect(metrics.monthTitleFontSize).toBe(16);
  expect(metrics.minimumTextScale).toBe(0.78);
  expect(metrics.maxFontSizeMultiplier).toBe(1.1);
});

test('reduces fonts when width is tight or system font is enlarged', () => {
  const narrowMetrics = getYearGridMetrics(360, 1);
  const largeFontMetrics = getYearGridMetrics(430, 1.35);

  expect(narrowMetrics.dayFontSize).toBeLessThan(9);
  expect(narrowMetrics.weekdayFontSize).toBeLessThan(9);
  expect(largeFontMetrics.dayFontSize).toBeLessThan(9);
  expect(largeFontMetrics.monthMetaFontSize).toBeLessThan(12);
  expect(largeFontMetrics.minimumTextScale).toBeLessThan(0.78);
  expect(largeFontMetrics.maxFontSizeMultiplier).toBeLessThan(1.1);
});
