import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { getCalendarPalette } from '../src/entities/calendar/lib/presentation';
import { VacationLegend } from '../src/pages/vacation/ui/VacationLegend';

let renderer: ReactTestRenderer;
afterEach(() => act(() => renderer.unmount()));

it.each(['en', 'ru'] as const)(
  'renders translated legend labels in %s',
  language => {
    act(() => {
      renderer = create(
        <VacationLegend
          palette={getCalendarPalette(false)}
          language={language}
        />,
      );
    });
    const labels = renderer.root
      .findAllByType(Text)
      .map(node => node.props.children);
    expect(labels).toHaveLength(6);
    expect(labels).toContain(language === 'ru' ? 'Отпуск' : 'Vacation');
    expect(
      labels.every(label => typeof label === 'string' && label.length > 0),
    ).toBe(true);
  },
);

it('uses the dark palette for the legend text', () => {
  const palette = getCalendarPalette(true);
  act(() => {
    renderer = create(<VacationLegend palette={palette} language="en" />);
  });
  const texts = renderer.root.findAllByType(Text);
  expect(StyleSheet.flatten(texts[0].props.style).color).toBe(palette.title);
  expect(StyleSheet.flatten(texts[1].props.style).color).toBe(palette.subtitle);
});
