/** Keeps rapid arrow taps in order while only animating to an adjacent page.
 * Native momentum events from an interrupted scroll must not undo a newer tap.
 */
export function createPagerNavigation(initialPage: number, pageCount: number) {
  let page = initialPage;
  let requested = initialPage;
  let moving = false;
  let dragging = false;
  const clamp = (value: number) => Math.max(1, Math.min(pageCount, value));

  const advance = (animated: boolean) => {
    if (moving || page === requested) return null;
    page = animated ? page + Math.sign(requested - page) : requested;
    moving = animated;
    return page;
  };

  return {
    reset(next: number) {
      page = requested = clamp(next);
      moving = dragging = false;
    },
    expect(next: number, animated: boolean) {
      if (next !== page) {
        page = requested = clamp(next);
        moving = animated;
        dragging = false;
      }
    },
    move(direction: number, animated: boolean) {
      requested = clamp(requested + direction);
      return advance(animated);
    },
    beginDrag() {
      requested = page;
      moving = dragging = true;
    },
    settle(next: number, animated: boolean) {
      next = clamp(next);
      if (!dragging && next !== page) return null;
      if (dragging) requested = next;
      page = next;
      moving = dragging = false;
      return advance(animated) ?? page;
    },
  };
}
