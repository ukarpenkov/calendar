import {
  getMaxVacationDays,
  overlapsVacation,
} from '../src/features/vacation/lib';

const periods = [
  { id: 1, startDate: '2028-02-10', endDate: '2028-02-14', color: '#3B82F6' },
  { id: 2, startDate: '2028-02-20', endDate: '2028-02-25', color: '#3B82F6' },
];

describe('vacation availability', () => {
  it('treats both endpoints as occupied and detects enclosed vacations', () => {
    expect(overlapsVacation('2028-02-01', '2028-02-10', periods)).toBe(true);
    expect(overlapsVacation('2028-02-14', '2028-02-16', periods)).toBe(true);
    expect(overlapsVacation('2028-02-01', '2028-02-28', periods)).toBe(true);
    expect(overlapsVacation('2028-02-15', '2028-02-19', periods)).toBe(false);
  });

  it('limits the duration to the next vacation regardless of sorting', () => {
    expect(getMaxVacationDays('2028-02-01', 2028, [...periods].reverse())).toBe(
      9,
    );
    expect(getMaxVacationDays('2028-02-15', 2028, periods)).toBe(5);
    expect(getMaxVacationDays('2028-02-10', 2028, periods)).toBe(0);
  });

  it('handles leap years and year-spanning existing vacations', () => {
    expect(getMaxVacationDays('2028-01-01', 2028, [])).toBe(366);
    expect(getMaxVacationDays('2028-12-31', 2028, [])).toBe(1);
    expect(getMaxVacationDays('2029-01-01', 2028, [])).toBe(0);
    expect(
      getMaxVacationDays('2028-01-01', 2028, [
        { ...periods[0], startDate: '2027-12-28', endDate: '2028-01-03' },
      ]),
    ).toBe(0);
    expect(
      getMaxVacationDays('2028-12-25', 2028, [
        { ...periods[0], startDate: '2028-12-28', endDate: '2029-01-03' },
      ]),
    ).toBe(3);
  });
});
