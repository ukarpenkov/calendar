export type MonthOrigin = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getMonthTransitionOrigin(
  origin: MonthOrigin | null | undefined,
  width: number,
  height: number,
) {
  if (
    origin &&
    width > 0 &&
    height > 0 &&
    [origin.x, origin.y, origin.width, origin.height].every(Number.isFinite) &&
    origin.width > 0 &&
    origin.height > 0 &&
    origin.y < height &&
    origin.y + origin.height > 0
  ) {
    return {
      translateX: origin.x + origin.width / 2 - width / 2,
      translateY: origin.y + origin.height / 2 - height / 2,
      scaleX: Math.max(0.05, Math.min(1, origin.width / width)),
      scaleY: Math.max(0.05, Math.min(1, origin.height / height)),
    };
  }

  return { translateX: 0, translateY: 16, scaleX: 0.96, scaleY: 0.96 };
}
