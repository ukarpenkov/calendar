export type PageCommand = { month: number; animated: boolean };
export type PageScrollState = 'idle' | 'dragging' | 'settling';

/** Native selection is authoritative. Arrow requests wait for native idle. */
export function createPagerNavigation(initialMonth: number, pageCount: number) {
  const clamp = (month: number) => Math.max(1, Math.min(pageCount, month));
  let selected = clamp(initialMonth);
  let requested = selected;
  let command: PageCommand | null = null;
  let state: PageScrollState = 'idle';

  return {
    get selected() {
      return selected;
    },
    request(direction: number) {
      requested = clamp(requested + Math.sign(direction));
    },
    next(animated: boolean): PageCommand | null {
      if (state !== 'idle' || command || requested === selected) return null;
      command = {
        month: animated
          ? selected + Math.sign(requested - selected)
          : requested,
        animated,
      };
      return command;
    },
    select(month: number): boolean {
      if (!Number.isInteger(month) || month < 1 || month > pageCount)
        return false;
      // A delayed initial/previous selection cannot acknowledge a newer command.
      if (command && command.month !== month) return false;
      if (!command && state === 'idle' && month !== selected) return false;
      selected = month;
      if (!command) requested = month;
      if (command && (!command.animated || state === 'idle')) command = null;
      return true;
    },
    scrollState(next: PageScrollState) {
      state = next;
      if (next === 'dragging') {
        // A direct gesture takes over from queued arrows.
        command = null;
        requested = selected;
      } else if (next === 'idle' && command?.month === selected) {
        command = null;
      }
    },
    jump(month: number): PageCommand {
      requested = clamp(month);
      state = 'idle';
      const jump = { month: requested, animated: false };
      // ViewPager2 emits no selection event when it is already on this page.
      command = requested === selected ? null : jump;
      return jump;
    },
  };
}
