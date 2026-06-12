/**
 * @format
 */

import { enTranslations } from '../src/shared/lib/i18n/messages/en';
import { ruTranslations } from '../src/shared/lib/i18n/messages/ru';
import { trTranslations } from '../src/shared/lib/i18n/messages/tr';
import { idTranslations } from '../src/shared/lib/i18n/messages/id';
import { jaTranslations } from '../src/shared/lib/i18n/messages/ja';

const vacationKeys = Object.keys(enTranslations).filter(key =>
  key.startsWith('vacation.'),
);

const targets = [
  { name: 'ru', translations: ruTranslations },
  { name: 'tr', translations: trTranslations },
  { name: 'id', translations: idTranslations },
  { name: 'ja', translations: jaTranslations },
] as const;

describe('vacation i18n key consistency', () => {
  it('en.ts contains vacation keys', () => {
    expect(vacationKeys.length).toBeGreaterThan(0);
  });

  for (const { name, translations } of targets) {
    it(`all vacation keys present in ${name}.ts`, () => {
      const missing = vacationKeys.filter(
        key => !(key in translations),
      );
      expect(missing).toEqual([]);
    });

    it(`no empty values in ${name}.ts vacation keys`, () => {
      const empty = vacationKeys.filter(
        key =>
          !translations[key as keyof typeof translations] ||
          translations[key as keyof typeof translations].trim() === '',
      );
      expect(empty).toEqual([]);
    });
  }
});
