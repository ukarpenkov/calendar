/**
 * @format
 */

import { getCalendarPalette } from '../src/entities/calendar/lib/presentation';

describe('vacation palette', () => {
  it('dark theme has vacationFill and vacationBorder', () => {
    const palette = getCalendarPalette(true);

    expect(palette.vacationFill).toBeTruthy();
    expect(palette.vacationBorder).toBeTruthy();
    expect(typeof palette.vacationFill).toBe('string');
    expect(typeof palette.vacationBorder).toBe('string');
  });

  it('light theme has vacationFill and vacationBorder', () => {
    const palette = getCalendarPalette(false);

    expect(palette.vacationFill).toBeTruthy();
    expect(palette.vacationBorder).toBeTruthy();
    expect(typeof palette.vacationFill).toBe('string');
    expect(typeof palette.vacationBorder).toBe('string');
  });

  it('dark vacation colors match expected values', () => {
    const palette = getCalendarPalette(true);

    expect(palette.vacationFill).toBe('#134E4A');
    expect(palette.vacationBorder).toBe('#2DD4BF');
  });

  it('light vacation colors match expected values', () => {
    const palette = getCalendarPalette(false);

    expect(palette.vacationFill).toBe('#CCFBF1');
    expect(palette.vacationBorder).toBe('#14B8A6');
  });
});
