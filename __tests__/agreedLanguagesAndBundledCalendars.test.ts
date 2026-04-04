import * as fs from 'fs';
import * as path from 'path';

import { parseValidateAndNormalizeCalendarImport } from '../src/features/calendar-import';
import {
  AGREED_APP_LANGUAGE_CODES,
  BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE,
  BUNDLED_CALENDAR_JSON_FILENAME_BY_REGION,
  BUNDLED_CALENDAR_REGION_CODES,
  BUNDLED_CALENDAR_YEAR,
} from '../src/shared/config/agreedLanguagesAndBundledCalendars';
import {
  getBundledCalendarJsonForRegion,
  getBundledCalendarJsonObject,
} from '../src/entities/calendar/model/bundledCalendarJsonByLanguage';

const repoRoot = path.join(__dirname, '..');

test('agreed language list matches bundled filename map 1:1', () => {
  const mapKeys = Object.keys(BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE).sort();
  const codes = [...AGREED_APP_LANGUAGE_CODES].sort();
  expect(mapKeys).toEqual(codes);
});

test('each bundled JSON file exists at repository root', () => {
  const uniqueFiles = new Set([
    ...Object.values(BUNDLED_CALENDAR_JSON_FILENAME_BY_LANGUAGE),
    ...Object.values(BUNDLED_CALENDAR_JSON_FILENAME_BY_REGION),
  ]);
  for (const file of uniqueFiles) {
    expect(fs.existsSync(path.join(repoRoot, file))).toBe(true);
  }
});

test('region list matches bundled filename map 1:1', () => {
  const mapKeys = Object.keys(BUNDLED_CALENDAR_JSON_FILENAME_BY_REGION).sort();
  const codes = [...BUNDLED_CALENDAR_REGION_CODES].sort();
  expect(mapKeys).toEqual(codes);
});

test('bundled calendar year constant matches plan year 2026', () => {
  expect(BUNDLED_CALENDAR_YEAR).toBe(2026);
});

test('each bundled JSON for an agreed language validates like an import', () => {
  for (const code of AGREED_APP_LANGUAGE_CODES) {
    const raw = getBundledCalendarJsonObject(code);
    const calendar = parseValidateAndNormalizeCalendarImport(raw);
    expect(calendar.year).toBe(BUNDLED_CALENDAR_YEAR);
    expect(calendar.days).toHaveLength(365);
  }
});

test('each bundled JSON for a region validates like an import', () => {
  for (const code of BUNDLED_CALENDAR_REGION_CODES) {
    const raw = getBundledCalendarJsonForRegion(code);
    const calendar = parseValidateAndNormalizeCalendarImport(raw);
    expect(calendar.year).toBe(BUNDLED_CALENDAR_YEAR);
    expect(calendar.days).toHaveLength(365);
  }
});
