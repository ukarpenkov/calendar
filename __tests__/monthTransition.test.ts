import { getMonthTransitionOrigin } from '../src/pages/month/ui/monthTransition';

test('the collapsed screen matches the tapped card for opening and reverse closing', () => {
  const origin = { x: 204, y: 500, width: 180, height: 240 };
  const result = getMonthTransitionOrigin(origin, 400, 800);
  expect(200 + result.translateX - (400 * result.scaleX) / 2).toBe(origin.x);
  expect(400 + result.translateY - (800 * result.scaleY) / 2).toBe(origin.y);
  expect(400 * result.scaleX).toBe(origin.width);
  expect(800 * result.scaleY).toBe(origin.height);
});

test.each([
  null,
  { x: 0, y: -400, width: 180, height: 240 },
  { x: 0, y: 900, width: 180, height: 240 },
  { x: NaN, y: 50, width: 180, height: 240 },
  { x: 0, y: 50, width: 0, height: 0 },
])(
  'uses a gentle fallback for unavailable or offscreen card geometry: %p',
  origin => {
    expect(getMonthTransitionOrigin(origin, 400, 800)).toEqual({
      translateX: 0,
      translateY: 16,
      scaleX: 0.96,
      scaleY: 0.96,
    });
  },
);
