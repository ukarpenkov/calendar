import {
  notifyCalendarSyncOnAppLanguageChange,
  registerCalendarSyncOnAppLanguageChange,
} from '../src/features/calendar-language-sync';

beforeEach(() => {
  registerCalendarSyncOnAppLanguageChange(null);
});

test('notifyCalendarSyncOnAppLanguageChange does nothing without handler', () => {
  expect(() =>
    notifyCalendarSyncOnAppLanguageChange('ru', 'tr'),
  ).not.toThrow();
});

test('notifyCalendarSyncOnAppLanguageChange invokes registered handler', () => {
  const fn = jest.fn();
  registerCalendarSyncOnAppLanguageChange(fn);
  notifyCalendarSyncOnAppLanguageChange('en', 'tr');
  expect(fn).toHaveBeenCalledWith('en', 'tr');
});

test('registerCalendarSyncOnAppLanguageChange(null) clears handler', () => {
  const fn = jest.fn();
  registerCalendarSyncOnAppLanguageChange(fn);
  registerCalendarSyncOnAppLanguageChange(null);
  notifyCalendarSyncOnAppLanguageChange('ru', 'ja');
  expect(fn).not.toHaveBeenCalled();
});
