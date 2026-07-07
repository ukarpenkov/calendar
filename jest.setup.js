/* eslint-env jest */

const { setUpTests } = require('react-native-reanimated/src/jestUtils');

setUpTests();

// Reanimated 4 split its JS runtime into `react-native-worklets`. Both packages
// reach for native TurboModules on import, which don't exist under jest, so we
// swap them for the shipped mocks. `SharedTransition` isn't exported by the
// stock Reanimated mock, so alias it to the base builder mock to keep the
// `.duration(...)` chain used by MonthDetailScreen working in tests.
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock'),
);
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  const Builder = Reanimated.BaseAnimationBuilder;
  if (Builder) {
    if (!Reanimated.SharedTransition) {
      Reanimated.SharedTransition = Builder;
    }
    if (Reanimated.default && !Reanimated.default.SharedTransition) {
      Reanimated.default.SharedTransition = Builder;
    }
  }
  return Reanimated;
});

jest.mock('@react-native-documents/picker', () => ({
  keepLocalCopy: jest.fn(),
  pick: jest.fn(),
  types: {
    json: 'application/json',
    plainText: 'text/plain',
  },
  errorCodes: {
    OPERATION_CANCELED: 'OPERATION_CANCELED',
    IN_PROGRESS: 'ASYNC_OP_IN_PROGRESS',
    UNABLE_TO_OPEN_FILE_TYPE: 'UNABLE_TO_OPEN_FILE_TYPE',
    NULL_PRESENTER: 'NULL_PRESENTER',
  },
  isErrorWithCode: error =>
    Boolean(
      error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof error.code === 'string',
    ),
}));

jest.mock('@dr.pogodin/react-native-fs', () => ({
  readFile: jest.fn(),
}));
