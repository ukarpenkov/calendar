/**
 * @format
 */

declare function require(moduleName: string): unknown;

import { errorCodes, keepLocalCopy, pick } from '@react-native-documents/picker';

import {
  pickAndPrepareCalendarImport,
  type CalendarImportSourceError,
} from '../src/features/calendar-import';

const bundledCalendar = require('../calendar2026.json');

jest.mock('@react-native-documents/picker', () => ({
  keepLocalCopy: jest.fn(),
  pick: jest.fn(),
  types: {
    json: 'application/json',
    plainText: 'text/plain',
  },
  errorCodes: {
    OPERATION_CANCELED: 'OPERATION_CANCELED',
  },
  isErrorWithCode: (error: unknown) =>
    Boolean(
      error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof (error as { code?: unknown }).code === 'string',
    ),
}));

const mockedKeepLocalCopy = jest.mocked(keepLocalCopy);
const mockedPick = jest.mocked(pick);

describe('calendar device import', () => {
  beforeEach(() => {
    mockedKeepLocalCopy.mockReset();
    mockedPick.mockReset();
    global.fetch = jest.fn();
  });

  it('returns null when the user cancels picking a file', async () => {
    const canceledError = Object.assign(new Error('canceled'), {
      code: errorCodes.OPERATION_CANCELED,
    });

    mockedPick.mockRejectedValue(canceledError);

    await expect(pickAndPrepareCalendarImport()).resolves.toBeNull();
  });

  it('reads and validates the selected json file', async () => {
    mockedPick.mockResolvedValue([
      {
        uri: 'content://calendar2026.json',
        name: 'calendar2026.json',
        error: null,
        type: 'application/json',
        nativeType: 'application/json',
        size: 4567,
        isVirtual: false,
        convertibleToMimeTypes: null,
        hasRequestedType: true,
      },
    ]);
    mockedKeepLocalCopy.mockResolvedValue([
      {
        status: 'success',
        sourceUri: 'content://calendar2026.json',
        localUri: 'file:///cache/calendar2026.json',
      },
    ]);
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(bundledCalendar)),
    } as unknown as Response);

    const result = await pickAndPrepareCalendarImport();

    expect(mockedKeepLocalCopy).toHaveBeenCalledWith({
      files: [
        {
          uri: 'content://calendar2026.json',
          fileName: 'calendar2026.json',
        },
      ],
      destination: 'cachesDirectory',
    });
    expect(global.fetch).toHaveBeenCalledWith('file:///cache/calendar2026.json');
    expect(result?.file.name).toBe('calendar2026.json');
    expect(result?.calendar.year).toBe(2026);
  });

  it('rejects non-json files before reading them', async () => {
    mockedPick.mockResolvedValue([
      {
        uri: 'content://notes.txt',
        name: 'notes.txt',
        error: null,
        type: 'text/plain',
        nativeType: 'text/plain',
        size: 128,
        isVirtual: false,
        convertibleToMimeTypes: null,
        hasRequestedType: true,
      },
    ]);

    await expect(pickAndPrepareCalendarImport()).rejects.toMatchObject<
      Partial<CalendarImportSourceError>
    >({
      code: 'UNSUPPORTED_FILE',
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
