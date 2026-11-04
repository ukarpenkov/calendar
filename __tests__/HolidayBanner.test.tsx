import React from 'react';
import { Image } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { HolidayBanner } from '../src/pages/month/ui/HolidayBanner';

let renderer: ReactTestRenderer;
afterEach(() => act(() => renderer.unmount()));

test('keeps the loaded image visible until the replacement is decoded', () => {
  act(() => {
    renderer = create(<HolidayBanner source={1} />);
  });
  act(() => renderer.update(<HolidayBanner source={2} />));
  expect(
    renderer.root.findAllByType(Image).some(node => node.props.source === 1),
  ).toBe(true);
  const pending = renderer.root.find(
    node => node.props.source === 2 && typeof node.props.onLoad === 'function',
  );
  const decodedImage = renderer.root
    .findAllByType(Image)
    .find(node => node.props.source === 2);
  act(() => pending.props.onLoad());
  expect(renderer.root.findByType(Image)).toBe(decodedImage);
  expect(
    renderer.root.findAllByType(Image).some(node => node.props.source === 2),
  ).toBe(true);
  expect(
    renderer.root.findAllByType(Image).some(node => node.props.source === 1),
  ).toBe(false);
});

test('a late load from an earlier selection cannot replace the latest image', () => {
  act(() => {
    renderer = create(<HolidayBanner source={1} />);
  });
  act(() => renderer.update(<HolidayBanner source={2} />));
  const staleLoad = renderer.root.find(
    node => node.props.source === 2 && typeof node.props.onLoad === 'function',
  ).props.onLoad;
  act(() => renderer.update(<HolidayBanner source={3} />));
  act(() => staleLoad());
  expect(
    renderer.root.findAllByType(Image).some(node => node.props.source === 1),
  ).toBe(true);
  const latest = renderer.root.find(
    node => node.props.source === 3 && typeof node.props.onLoad === 'function',
  );
  act(() => latest.props.onLoad());
  expect(
    renderer.root.findAllByType(Image).some(node => node.props.source === 3),
  ).toBe(true);
});

test('equivalent URI sources retain the existing native image', () => {
  act(() => {
    renderer = create(<HolidayBanner source={{ uri: 'file:///month.webp' }} />);
  });
  const original = renderer.root.findByType(Image);
  act(() =>
    renderer.update(<HolidayBanner source={{ uri: 'file:///month.webp' }} />),
  );
  expect(renderer.root.findAllByType(Image)).toEqual([original]);
});

test('returning to the displayed image cancels an obsolete pending load', () => {
  act(() => {
    renderer = create(<HolidayBanner source={1} />);
  });
  act(() => renderer.update(<HolidayBanner source={2} />));
  const staleLoad = renderer.root.find(
    node => node.props.source === 2 && typeof node.props.onLoad === 'function',
  ).props.onLoad;
  act(() => renderer.update(<HolidayBanner source={1} />));
  act(() => staleLoad());
  expect(renderer.root.findByType(Image).props.source).toBe(1);
});
