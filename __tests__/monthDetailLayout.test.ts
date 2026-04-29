import {
  getMonthContentMaxWidth,
  getMonthDetailLayoutMetrics,
} from '../src/pages/month/ui/monthDetailLayout';

test('phone portrait uses full content width', () => {
  const w = getMonthContentMaxWidth(390, 844);
  expect(w).toBe(390 - 32);
});

test('landscape keeps same month column width as portrait for the same device', () => {
  const portrait = getMonthContentMaxWidth(390, 844);
  const landscape = getMonthContentMaxWidth(844, 390);
  expect(landscape).toBe(portrait);
  expect(landscape).toBe(390 - 32);
});

test('tablet portrait caps month column width', () => {
  const w = getMonthContentMaxWidth(900, 1200);
  expect(w).toBe(440);
});

test('portrait month detail is always stack (phone)', () => {
  const m = getMonthDetailLayoutMetrics(390, 844);
  expect(m.layout).toBe('stack');
  if (m.layout === 'stack') {
    expect(m.calendarColumnWidth).toBe(390 - 32);
  }
});

test('portrait month detail is always stack (tablet)', () => {
  const m = getMonthDetailLayoutMetrics(900, 1200);
  expect(m.layout).toBe('stack');
});

test('landscape month detail splits calendar and side column', () => {
  const m = getMonthDetailLayoutMetrics(844, 390);
  expect(m.layout).toBe('split');
  if (m.layout === 'split') {
    expect(m.calendarColumnWidth).toBe(390 - 32);
    expect(m.sideColumnWidth).toBeGreaterThan(160);
  }
});
