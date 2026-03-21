import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
  type DocumentPickerResponse,
} from '@react-native-documents/picker';

import { parseValidateAndNormalizeCalendarImport } from './calendar-import';
import {
  CalendarImportSourceError,
  type CalendarImportSourceFile,
  type PreparedCalendarImport,
} from './types';

const JSON_EXTENSION = '.json';

function getFallbackFileName(uri: string): string {
  const lastSlashIndex = uri.lastIndexOf('/');

  if (lastSlashIndex === -1 || lastSlashIndex === uri.length - 1) {
    return 'calendar-import.json';
  }

  try {
    return decodeURIComponent(uri.slice(lastSlashIndex + 1));
  } catch {
    return uri.slice(lastSlashIndex + 1);
  }
}

function isLikelyJsonFile(file: DocumentPickerResponse): boolean {
  const normalizedName = file.name?.toLowerCase() ?? '';
  const normalizedType = file.type?.toLowerCase() ?? '';
  const normalizedNativeType = file.nativeType?.toLowerCase() ?? '';

  return (
    normalizedName.endsWith(JSON_EXTENSION) ||
    normalizedType.includes('json') ||
    normalizedNativeType.includes('json')
  );
}

function mapPickedFile(file: DocumentPickerResponse): CalendarImportSourceFile {
  return {
    uri: file.uri,
    name: file.name ?? getFallbackFileName(file.uri),
    type: file.type,
    size: file.size,
  };
}

async function readPickedFileText(file: CalendarImportSourceFile): Promise<string> {
  let response: Response;

  try {
    response = await fetch(file.uri);
  } catch {
    throw new CalendarImportSourceError(
      'FILE_READ_FAILED',
      `Could not read the selected file "${file.name}".`,
    );
  }

  if (!response.ok) {
    throw new CalendarImportSourceError(
      'FILE_READ_FAILED',
      `Could not read the selected file "${file.name}".`,
    );
  }

  try {
    return await response.text();
  } catch {
    throw new CalendarImportSourceError(
      'FILE_READ_FAILED',
      `Could not decode the selected file "${file.name}" as text.`,
    );
  }
}

export async function prepareCalendarImportFromFile(
  file: CalendarImportSourceFile,
): Promise<PreparedCalendarImport> {
  const json = await readPickedFileText(file);

  return {
    file,
    calendar: parseValidateAndNormalizeCalendarImport(json),
  };
}

export async function pickAndPrepareCalendarImport(): Promise<PreparedCalendarImport | null> {
  try {
    const [pickedFile] = await pick({
      mode: 'open',
      type: [types.json, types.plainText],
    });

    if (pickedFile.error) {
      throw new CalendarImportSourceError(
        'PICKER_FAILED',
        pickedFile.error,
      );
    }

    if (!pickedFile.hasRequestedType && !isLikelyJsonFile(pickedFile)) {
      throw new CalendarImportSourceError(
        'UNSUPPORTED_FILE',
        'The selected file is not recognized as JSON.',
      );
    }

    if (!isLikelyJsonFile(pickedFile)) {
      throw new CalendarImportSourceError(
        'UNSUPPORTED_FILE',
        'The selected file is not recognized as JSON.',
      );
    }

    const file = mapPickedFile(pickedFile);

    return prepareCalendarImportFromFile(file);
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      error.code === errorCodes.OPERATION_CANCELED
    ) {
      return null;
    }

    if (error instanceof CalendarImportSourceError) {
      throw error;
    }

    throw new CalendarImportSourceError(
      'PICKER_FAILED',
      'Could not open the file picker.',
    );
  }
}
