import React from 'react';
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import * as Reanimated from 'react-native-reanimated';
import { SettingsLayer } from '../src/shared/ui/SettingsLayer';

let renderer: ReactTestRenderer;
let timing: jest.SpyInstance;
const onClosed = jest.fn();
beforeEach(() => {
  onClosed.mockReset();
  // Native completion is separate from receiving an animation request.
  timing = jest
    .spyOn(Reanimated, 'withTiming')
    .mockImplementation(value => value);
});
afterEach(() => {
  act(() => renderer?.unmount());
  jest.restoreAllMocks();
});
function view(closing: boolean) {
  return (
    <SettingsLayer closing={closing} backgroundColor="#fff" onClosed={onClosed}>
      <Text>Settings content</Text>
    </SettingsLayer>
  );
}
function completion() {
  return timing.mock.calls[timing.mock.calls.length - 1][2] as (
    finished: boolean,
  ) => void;
}

test('retains settings and blocks input until the closing animation completes', () => {
  act(() => {
    renderer = create(view(false));
  });
  act(() => renderer.update(view(true)));
  expect(renderer.root.findByType(Text).props.children).toBe(
    'Settings content',
  );
  expect(
    renderer.root.findByProps({ testID: 'settings-layer' }).props.pointerEvents,
  ).toBe('none');
  expect(onClosed).not.toHaveBeenCalled();
  act(() => completion()(true));
  expect(onClosed).toHaveBeenCalledTimes(1);
});

test('reopening during close ignores the superseded native completion', () => {
  act(() => {
    renderer = create(view(false));
  });
  act(() => renderer.update(view(true)));
  const oldCompletion = completion();
  act(() => renderer.update(view(false)));
  act(() => oldCompletion(true));
  expect(onClosed).not.toHaveBeenCalled();
  expect(
    renderer.root.findByProps({ testID: 'settings-layer' }).props.pointerEvents,
  ).toBe('auto');
});

test('an interrupted or disposed animation cannot navigate back', () => {
  act(() => {
    renderer = create(view(true));
  });
  const finish = completion();
  act(() => finish(false));
  expect(onClosed).not.toHaveBeenCalled();
  act(() => renderer.unmount());
  act(() => finish(true));
  expect(onClosed).not.toHaveBeenCalled();
});

test('a stale close completion cannot finish a later closing transition', () => {
  act(() => {
    renderer = create(view(false));
  });
  act(() => renderer.update(view(true)));
  const oldCompletion = completion();
  act(() => renderer.update(view(false)));
  act(() => renderer.update(view(true)));
  const currentCompletion = completion();
  act(() => oldCompletion(true));
  expect(onClosed).not.toHaveBeenCalled();
  act(() => currentCompletion(true));
  expect(onClosed).toHaveBeenCalledTimes(1);
});
