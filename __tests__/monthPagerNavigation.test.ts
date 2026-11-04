import { createPagerNavigation } from '../src/pages/month/model/monthPagerNavigation';

test('three rapid arrows advance from January to April only after each native selection and idle', () => {
  const pager = createPagerNavigation(1, 12);
  pager.request(1);
  expect(pager.next(true)).toEqual({ month: 2, animated: true });
  pager.scrollState('settling');
  pager.request(1);
  pager.request(1);
  expect(pager.next(true)).toBeNull();
  expect(pager.selected).toBe(1);
  for (const month of [2, 3, 4]) {
    expect(pager.select(month)).toBe(true);
    expect(pager.next(true)).toBeNull();
    pager.scrollState('idle');
    expect(pager.next(true)).toEqual(
      month < 4 ? { month: month + 1, animated: true } : null,
    );
    pager.scrollState('settling');
  }
  expect(pager.selected).toBe(4);
});

test('duplicate selection cannot acknowledge a newer arrow command', () => {
  const pager = createPagerNavigation(1, 12);
  pager.request(1);
  pager.next(true);
  pager.scrollState('settling');
  pager.request(1);
  pager.select(2);
  pager.scrollState('idle');
  expect(pager.next(true)?.month).toBe(3);
  expect(pager.select(2)).toBe(false);
  expect(pager.selected).toBe(2);
  expect(pager.select(3)).toBe(true);
});

test('swipe takes over from queued arrows and can reverse direction', () => {
  const pager = createPagerNavigation(5, 12);
  pager.request(1);
  pager.next(true);
  pager.request(1);
  pager.scrollState('dragging');
  pager.scrollState('settling');
  pager.select(4);
  pager.scrollState('idle');
  expect(pager.next(true)).toBeNull();
  expect(pager.selected).toBe(4);
  pager.request(-1);
  expect(pager.next(true)?.month).toBe(3);
});

test('queued arrows can reverse and cannot go beyond the year', () => {
  const pager = createPagerNavigation(1, 12);
  pager.request(-1);
  expect(pager.next(true)).toBeNull();
  pager.request(1);
  pager.next(true);
  pager.scrollState('settling');
  pager.request(-1);
  pager.select(2);
  pager.scrollState('idle');
  expect(pager.next(true)?.month).toBe(1);
  pager.jump(12);
  pager.select(12);
  pager.request(1);
  expect(pager.next(true)).toBeNull();
});

test('reduced motion completes from selection without a momentum/idle event', () => {
  const pager = createPagerNavigation(1, 12);
  for (const month of [2, 3, 4]) {
    pager.request(1);
    expect(pager.next(false)).toEqual({ month, animated: false });
    expect(pager.select(month)).toBe(true);
  }
  expect(pager.next(false)).toBeNull();
});

test('resume discards interrupted commands and rejects their late selection', () => {
  const pager = createPagerNavigation(7, 12);
  pager.request(1);
  pager.next(true);
  pager.scrollState('settling');
  pager.jump(pager.selected);
  expect(pager.select(8)).toBe(false);
  expect(pager.select(7)).toBe(true);
  expect(pager.next(true)).toBeNull();
  expect(pager.select(0)).toBe(false);
  expect(pager.select(13)).toBe(false);
  expect(pager.select(NaN)).toBe(false);
});

test('resuming on the same page never waits for a native selection that may not fire', () => {
  const pager = createPagerNavigation(1, 12);
  pager.jump(1);
  expect(pager.select(2)).toBe(false); // unsolicited stale event at idle
  pager.request(1);
  expect(pager.next(true)).toEqual({ month: 2, animated: true });
});
