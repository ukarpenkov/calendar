/* eslint-env jest */

jest.mock('@react-native-documents/picker', () => ({
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
