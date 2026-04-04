import * as fs from 'fs';
import * as path from 'path';

import {
  AGREED_APP_LANGUAGE_CODES,
  BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE,
  BUNDLED_CALENDAR_YEAR,
} from '../src/shared/config/agreedLanguagesAndBundledCalendars';

const repoRoot = path.join(__dirname, '..');

test('agreed language list matches bundled filename map 1:1', () => {
  const mapKeys = Object.keys(BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE).sort();
  const codes = [...AGREED_APP_LANGUAGE_CODES].sort();
  expect(mapKeys).toEqual(codes);
});

test('each bundled JSON file exists at repository root', () => {
  const uniqueFiles = new Set(
    Object.values(BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE),
  );
  for (const file of uniqueFiles) {
    expect(fs.existsSync(path.join(repoRoot, file))).toBe(true);
  }
});

test('bundled calendar year constant matches plan year 2026', () => {
  expect(BUNDLED_CALENDAR_YEAR).toBe(2026);
});
