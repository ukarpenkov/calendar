/**
 * @format
 */

import React, { useEffect } from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import {
  AppLocalizationProvider,
  useAppLocalization,
} from '../src/app/providers/localization';
import {
  getStoredLanguage,
  setStoredLanguage,
} from '../src/shared/lib/settings';

jest.mock('../src/shared/lib/i18n', () => ({
  ...jest.requireActual('../src/shared/lib/i18n'),
  detectDeviceLanguage: () => 'en',
}));

jest.mock('../src/shared/lib/settings', () => ({
  getStoredLanguage: jest.fn(),
  setStoredLanguage: jest.fn(),
}));

const mockedGetStoredLanguage = jest.mocked(getStoredLanguage);
const mockedSetStoredLanguage = jest.mocked(setStoredLanguage);

type ProbeProps = {
  onLanguageReady?: (
    setLanguage: ReturnType<typeof useAppLocalization>['setLanguage'],
  ) => void;
};

function LanguageProbe({ onLanguageReady }: ProbeProps) {
  const { language, setLanguage } = useAppLocalization();

  useEffect(() => {
    onLanguageReady?.(setLanguage);
  }, [onLanguageReady, setLanguage]);

  return <Text>{language}</Text>;
}

beforeEach(() => {
  mockedGetStoredLanguage.mockReset();
  mockedSetStoredLanguage.mockReset();
  mockedSetStoredLanguage.mockResolvedValue(undefined);
});

test('hydrates the saved language on startup', async () => {
  mockedGetStoredLanguage.mockResolvedValue('ru');

  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppLocalizationProvider>
        <LanguageProbe />
      </AppLocalizationProvider>,
    );
  });

  expect(JSON.stringify(renderer!.toJSON())).toContain('ru');
});

test('persists a newly selected language', async () => {
  mockedGetStoredLanguage.mockResolvedValue(null);

  let setLanguageFromProbe:
    | ReturnType<typeof useAppLocalization>['setLanguage']
    | undefined;

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <AppLocalizationProvider>
        <LanguageProbe
          onLanguageReady={setLanguage => {
            setLanguageFromProbe = setLanguage;
          }}
        />
      </AppLocalizationProvider>,
    );
  });

  await ReactTestRenderer.act(async () => {
    setLanguageFromProbe?.('ru');
  });

  expect(mockedSetStoredLanguage).toHaveBeenCalledWith('ru');
});
