import { createPagerNavigation } from '../src/shared/lib/ui/pagerNavigation';

test('queues rapid taps and keeps each animated step adjacent', () => {
  const pager = createPagerNavigation(1, 12);
  expect(pager.move(1, true)).toBe(2);
  expect(pager.move(1, true)).toBeNull();
  expect(pager.move(1, true)).toBeNull();
  expect(pager.settle(2, true)).toBe(3);
  expect(pager.settle(2, true)).toBeNull(); // late native event
  expect(pager.settle(3, true)).toBe(4);
  expect(pager.settle(4, true)).toBe(4);
  expect(pager.move(-1, true)).toBe(3);
});

test('allows reversing a queued movement without losing the tap', () => {
  const pager = createPagerNavigation(5, 12);
  expect(pager.move(1, true)).toBe(6);
  pager.move(1, true);
  pager.move(-1, true);
  pager.move(-1, true);
  expect(pager.settle(6, true)).toBe(5);
  expect(pager.settle(5, true)).toBe(5);
});

test('a swipe can interrupt an arrow animation and establish a new page', () => {
  const pager = createPagerNavigation(5, 12);
  pager.move(1, true);
  pager.move(1, true);
  pager.beginDrag();
  expect(pager.settle(5, true)).toBe(5);
  expect(pager.move(-1, true)).toBe(4);
});

test('reopening or rotation drops queued taps and stale momentum', () => {
  const pager = createPagerNavigation(1, 12);
  pager.move(1, true);
  pager.move(1, true);
  pager.reset(8);
  expect(pager.settle(2, true)).toBeNull();
  expect(pager.move(1, true)).toBe(9);
});

test('reduced motion never waits for a native momentum event', () => {
  const pager = createPagerNavigation(1, 12);
  expect(pager.move(-1, false)).toBeNull();
  expect(pager.move(1, false)).toBe(2);
  expect(pager.move(1, false)).toBe(3);
  expect(pager.move(-1, false)).toBe(2);
  expect(pager.settle(3, false)).toBeNull();
  pager.reset(12);
  expect(pager.move(1, false)).toBeNull();
  expect(pager.move(-1, false)).toBe(11);
});
