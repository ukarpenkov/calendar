/**
 * @format
 */

import React from 'react';
import { create } from 'react-test-renderer';

import { getCalendarPalette } from '../src/entities/calendar/lib/presentation';
import { VacationLegend } from '../src/pages/vacation/ui/VacationLegend';

describe('VacationLegend', () => {
  const palette = getCalendarPalette(false);

  it('renders with English language', () => {
    const tree = create(
      <VacationLegend palette={palette} language="en" />,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders with Russian language', () => {
    const tree = create(
      <VacationLegend palette={palette} language="ru" />,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders with dark palette', () => {
    const darkPalette = getCalendarPalette(true);
    const tree = create(
      <VacationLegend palette={darkPalette} language="en" />,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
