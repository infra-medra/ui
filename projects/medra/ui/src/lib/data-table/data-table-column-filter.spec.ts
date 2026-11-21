import { matchesColumnFilter } from './data-table-column-filter';
import { TableColumnFilter, TableFilterMatchMode } from './data-table.types';

function shown<T>(cells: readonly T[], rule: TableColumnFilter, type: 'text' | 'numeric' | 'date'): T[] {
  return cells.filter((cell) => matchesColumnFilter(cell, rule, type));
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
});
