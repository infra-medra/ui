import { FILTER_MODES_BY_TYPE, isRuleActive, matchesColumnFilter } from './data-table-column-filter';
import { TableColumnFilter, TableFilterMatchMode } from './data-table.types';

function shown<T>(cells: readonly T[], rule: TableColumnFilter, type: 'text' | 'numeric' | 'date'): T[] {
  return cells.filter((cell) => matchesColumnFilter(cell, rule, type));
}

function makeRule(matchMode: string, value: unknown): TableColumnFilter {
  return { matchMode: matchMode as TableFilterMatchMode, value: value as TableColumnFilter['value'] };
}

describe('matchesColumnFilter', () => {
  describe('DAT-039.S1 text modes', () => {
    const cells = ['Widget', 'Gadget', 'widget pro'];
    const rule = (matchMode: TableFilterMatchMode, value: string): TableColumnFilter => ({ matchMode, value });

    it('DAT-039.S1 startsWith "wid" shows Widget and widget pro', () => {
      expect(shown(cells, rule('startsWith', 'wid'), 'text')).toEqual(['Widget', 'widget pro']);
    });

    it('DAT-039.S1 endsWith "GET" shows Widget and Gadget', () => {
      expect(shown(cells, rule('endsWith', 'GET'), 'text')).toEqual(['Widget', 'Gadget']);
    });

    it('DAT-039.S1 notEquals "widget" shows Gadget and widget pro', () => {
      expect(shown(cells, rule('notEquals', 'widget'), 'text')).toEqual(['Gadget', 'widget pro']);
    });

    it('DAT-039.S1 contains, notContains and equals are case-insensitive', () => {
      expect(shown(cells, rule('contains', 'DGE'), 'text')).toEqual(['Widget', 'Gadget', 'widget pro']);
      expect(shown(cells, rule('notContains', 'pro'), 'text')).toEqual(['Widget', 'Gadget']);
      expect(shown(cells, rule('equals', 'WIDGET'), 'text')).toEqual(['Widget']);
    });

    it('DAT-039.S1 a missing cell is read as the empty string', () => {
      expect(matchesColumnFilter(null, rule('notContains', 'x'), 'text')).toBe(true);
      expect(matchesColumnFilter(undefined, rule('contains', 'x'), 'text')).toBe(false);
    });

    it('DAT-039.S1 an inactive rule (empty value) matches every row', () => {
      expect(shown(cells, rule('equals', ''), 'text')).toEqual(cells);
      expect(shown(cells, { matchMode: 'equals', value: null }, 'text')).toEqual(cells);
    });
  });

  describe('DAT-039.S2 numeric modes', () => {
    const cells: unknown[] = [5, 10, 20, 'n/a'];
    const rule = (matchMode: TableFilterMatchMode, value: number): TableColumnFilter => ({ matchMode, value });

    it('DAT-039.S2 gte 10 shows 10 and 20 and not "n/a"', () => {
      expect(shown(cells, rule('gte', 10), 'numeric')).toEqual([10, 20]);
    });

    it('DAT-039.S2 every numeric mode compares numbers', () => {
      expect(shown(cells, rule('equals', 10), 'numeric')).toEqual([10]);
      expect(shown(cells, rule('notEquals', 10), 'numeric')).toEqual([5, 20]);
      expect(shown(cells, rule('lt', 10), 'numeric')).toEqual([5]);
      expect(shown(cells, rule('lte', 10), 'numeric')).toEqual([5, 10]);
      expect(shown(cells, rule('gt', 10), 'numeric')).toEqual([20]);
    });

    it('DAT-039.S2 a non-finite or non-number cell matches no numeric mode, even notEquals', () => {
      expect(matchesColumnFilter('n/a', rule('notEquals', 10), 'numeric')).toBe(false);
      expect(matchesColumnFilter(Infinity, rule('gt', 1), 'numeric')).toBe(false);
      expect(matchesColumnFilter(NaN, rule('notEquals', 1), 'numeric')).toBe(false);
    });

    it('DAT-039.S2 a zero value is an active rule', () => {
      expect(shown([0, 1], rule('equals', 0), 'numeric')).toEqual([0]);
    });
  });

  describe('DAT-039.S3 date modes compare days', () => {
    const cells: unknown[] = [new Date(2026, 2, 9, 23, 30), new Date(2026, 2, 10, 8, 0), new Date(2026, 2, 11, 0, 0)];
    const rule = (matchMode: TableFilterMatchMode, value: Date): TableColumnFilter => ({ matchMode, value });

    it('DAT-039.S3 dateBefore 2026-03-11 shows the first two rows', () => {
      expect(shown(cells, rule('dateBefore', new Date(2026, 2, 11)), 'date')).toEqual([cells[0], cells[1]]);
    });

    it('DAT-039.S3 dateIs 2026-03-10 shows only the second row', () => {
      expect(shown(cells, rule('dateIs', new Date(2026, 2, 10, 15, 0)), 'date')).toEqual([cells[1]]);
    });

    it('DAT-039.S3 dateIsNot and dateAfter', () => {
      expect(shown(cells, rule('dateIsNot', new Date(2026, 2, 10)), 'date')).toEqual([cells[0], cells[2]]);
      expect(shown(cells, rule('dateAfter', new Date(2026, 2, 9)), 'date')).toEqual([cells[1], cells[2]]);
    });

    it('DAT-039.S3 YYYY-MM-DD string cells compare by their own day, never through UTC', () => {
      const strings = ['2026-03-09', '2026-03-10', '2026-03-11'];
      expect(shown(strings, rule('dateIs', new Date(2026, 2, 10)), 'date')).toEqual(['2026-03-10']);
      expect(shown(strings, rule('dateBefore', new Date(2026, 2, 11)), 'date')).toEqual(['2026-03-09', '2026-03-10']);
    });

    it('DAT-039.S3 a cell that is neither a Date nor an ISO date matches no date mode', () => {
      expect(matchesColumnFilter('soon', rule('dateIsNot', new Date(2026, 2, 10)), 'date')).toBe(false);
      expect(matchesColumnFilter(42, rule('dateAfter', new Date(2026, 2, 10)), 'date')).toBe(false);
      expect(matchesColumnFilter(new Date('nope'), rule('dateIsNot', new Date(2026, 2, 10)), 'date')).toBe(false);
    });
  });

  describe('DAT-039.S2 & DAT-039.S3 FILTER_MODES_BY_TYPE includes between and in', () => {
    it('DAT-039 offers in for text, and between + in for numeric and date', () => {
      expect(FILTER_MODES_BY_TYPE.text).toContain('in');
      expect(FILTER_MODES_BY_TYPE.text).not.toContain('between');
      expect(FILTER_MODES_BY_TYPE.numeric).toEqual(expect.arrayContaining(['between', 'in']));
      expect(FILTER_MODES_BY_TYPE.date).toEqual(expect.arrayContaining(['between', 'in']));
    });
  });

  describe('DAT-039.S2 between mode', () => {
    it('DAT-039.S2 numeric between [15, 50] matches 25 and 50 inclusively and ignores non-finite cells', () => {
      const prices: unknown[] = [10, 25, 50, 15, 'n/a', NaN, Infinity];
      expect(shown(prices, makeRule('between', [15, 50]), 'numeric')).toEqual([25, 50, 15]);
    });

    it('DAT-039.S2 date between ["2026-01-10", "2026-01-20"] matches "2026-01-15" and inclusive bounds', () => {
      const dates = ['2026-01-01', '2026-01-10', '2026-01-15', '2026-01-20', '2026-02-01'];
      expect(shown(dates, makeRule('between', ['2026-01-10', '2026-01-20']), 'date')).toEqual(['2026-01-10', '2026-01-15', '2026-01-20']);

      const dateObjs = [new Date(2026, 0, 1), new Date(2026, 0, 15, 14, 0), new Date(2026, 1, 1)];
      expect(shown(dateObjs, makeRule('between', [new Date(2026, 0, 10), new Date(2026, 0, 20)]), 'date')).toEqual([dateObjs[1]]);
    });

    it('DAT-039.S2 partial bounds ignore null bound for numeric and date (including 0 lower bound)', () => {
      expect(shown([0, 10, 25, 50], makeRule('between', [25, null]), 'numeric')).toEqual([25, 50]);
      expect(shown([0, 10, 25, 50], makeRule('between', [null, 25]), 'numeric')).toEqual([0, 10, 25]);
      expect(shown([0, 10, 25], makeRule('between', [0, null]), 'numeric')).toEqual([0, 10, 25]);

      const dates = ['2026-01-01', '2026-01-15', '2026-02-01'];
      expect(shown(dates, makeRule('between', ['2026-01-15', null]), 'date')).toEqual(['2026-01-15', '2026-02-01']);
      expect(shown(dates, makeRule('between', [null, '2026-01-15']), 'date')).toEqual(['2026-01-01', '2026-01-15']);
    });

    it('DAT-039.S2 empty/null between bounds are inactive and match every row', () => {
      expect(isRuleActive(makeRule('between', [null, null]))).toBe(false);
      expect(isRuleActive(makeRule('between', ['', '']))).toBe(false);
      expect(shown([10, 'n/a'], makeRule('between', [null, null]), 'numeric')).toEqual([10, 'n/a']);
      expect(shown(['2026-01-01', 'bad'], makeRule('between', [null, null]), 'date')).toEqual(['2026-01-01', 'bad']);
    });

    it('DAT-039.S2 non-date cells do not match active date between', () => {
      expect(matchesColumnFilter('not-a-date', makeRule('between', ['2026-01-10', '2026-01-20']), 'date')).toBe(false);
      expect(matchesColumnFilter(42, makeRule('between', ['2026-01-10', '2026-01-20']), 'date')).toBe(false);
    });
  });

  describe('DAT-039.S3 in mode', () => {
    it('DAT-039.S3 text in ["a", "C"] matches "A" and "C" case-insensitively and excludes "B"', () => {
      expect(shown(['A', 'B', 'C'], makeRule('in', ['a', 'C']), 'text')).toEqual(['A', 'C']);
      expect(shown([null, 'A'], makeRule('in', ['a']), 'text')).toEqual(['A']);
      expect(shown([null, 'A'], makeRule('in', ['']), 'text')).toEqual([null]);
    });

    it('DAT-039.S3 numeric in matches finite numbers and rejects non-finite cells', () => {
      expect(shown([10, 25, 50, 'n/a', NaN], makeRule('in', [10, 50]), 'numeric')).toEqual([10, 50]);
    });

    it('DAT-039.S3 date in matches calendar days for Date and ISO strings', () => {
      const dates = ['2026-01-01', '2026-01-15', '2026-02-01', 'invalid'];
      expect(shown(dates, makeRule('in', ['2026-01-01', new Date(2026, 1, 1)]), 'date')).toEqual(['2026-01-01', '2026-02-01']);
    });

    it('DAT-039.S3 empty in array is inactive and matches every row', () => {
      expect(isRuleActive(makeRule('in', []))).toBe(false);
      expect(shown(['A', 'B', 'C'], makeRule('in', []), 'text')).toEqual(['A', 'B', 'C']);
      expect(shown([10, 'n/a'], makeRule('in', []), 'numeric')).toEqual([10, 'n/a']);
    });
  });
});
