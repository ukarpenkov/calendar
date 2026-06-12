/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { VacationPeriodCard } from '../src/pages/vacation/ui/VacationPeriodCard';
import type { VacationPeriod } from '../src/features/vacation/model';

const defaultPeriod: VacationPeriod = {
  id: 1,
  startDate: '2026-07-01',
  endDate: '2026-07-14',
  color: '#2DD4BF',
};

const defaultOnPress = jest.fn();

describe('VacationPeriodCard', () => {
  beforeEach(() => {
    defaultOnPress.mockClear();
  });

  it('renders with default props', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="en"
        />,
      );
    });

    expect(renderer!.toJSON()).toMatchSnapshot();
  });

  it('renders dates for Russian locale', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="ru"
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('01.07.2026');
    expect(json).toContain('14.07.2026');
  });

  it('renders dates for Japanese locale', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="ja"
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('2026年07月01日');
    expect(json).toContain('2026年07月14日');
  });

  it('renders workDays and totalDays summary', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="en"
        />,
      );
    });

    const json = JSON.stringify(renderer!.toJSON());
    expect(json).toContain('"10"');
    expect(json).toContain('" / "');
    expect(json).toContain('"14"');
  });

  it('calls onPress when pressed', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <VacationPeriodCard
          period={defaultPeriod}
          workDays={10}
          totalDays={14}
          onPress={defaultOnPress}
          language="en"
        />,
      );
    });

    const root = renderer!.root;
    const card = root.children[0] as ReactTestRenderer.ReactTestInstance;
    await ReactTestRenderer.act(async () => {
      card.props.onPress();
    });

    expect(defaultOnPress).toHaveBeenCalledWith(defaultPeriod);
  });
});
