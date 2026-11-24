import {
  MAX_COLLAPSED_ROW_GROUPS,
  MAX_COLUMN_FILTER_LENGTH,
  MAX_COLUMN_WIDTH_PX,
  MAX_GLOBAL_FILTER_LENGTH,
  MAX_PAGE_SIZE,
  StoredTableStateContext,
  parseStoredColumnFilters,
  parseStoredTableState,
} from './data-table-state';

const COLUMNS: StoredTableStateContext['columns'] = [
  { field: 'name', filterType: 'text' },
  { field: 'team', filterType: 'text' },
  { field: 'price', filterType: 'numeric' },
  { field: 'released', filterType: 'date' },
];

function makeContext(rowsPerPageOptions: readonly number[] | null = null): StoredTableStateContext {
  return { columns: COLUMNS, rowsPerPageOptions };
}

describe('parseStoredTableState', () => {
  it('DAT-056: returns an empty object when the raw value is not a plain object', () => {
    const ctx = makeContext();
    expect(parseStoredTableState(null, ctx)).toEqual({});
    expect(parseStoredTableState(undefined, ctx)).toEqual({});
    expect(parseStoredTableState([], ctx)).toEqual({});
    expect(parseStoredTableState(42, ctx)).toEqual({});
    expect(parseStoredTableState('{"first":0}', ctx)).toEqual({});
    expect(parseStoredTableState(true, ctx)).toEqual({});
  });

  it('DAT-056: parses all 12 contract keys including falsy valid values and uses null-prototype records and Map', () => {
    const raw = {
      first: 0,
      sortField: null,
      sortOrder: null,
      expandedRowKeys: { '1': true, '2': false },
      columnFilters: {
        name: { matchMode: 'contains', value: 'wid' },
        price: { matchMode: 'gte', value: 10 },
        released: { matchMode: 'dateIs', value: '2026-03-10T00:00:00.000Z' },
      },
      columnOrder: ['price', 'name', 'team'],
      columnWidths: { name: 180 },
      columnVisibility: { name: true, team: false, price: true },
      collapsedRowGroups: ['A'],
      globalFilter: '',
      multiSortMeta: [
        { field: 'name', order: 'asc' },
        { field: 'price', order: 'desc' },
      ],
      rows: 5,
    };

    const parsed = parseStoredTableState(raw, makeContext([5, 10]));

    expect(parsed.first).toBe(0);
    expect(parsed.sortField).toBeNull();
    expect(parsed.sortOrder).toBeNull();
    expect(parsed.expandedRowKeys).toEqual({ '1': true });
    expect(Object.getPrototypeOf(parsed.expandedRowKeys)).toBeNull();
    expect(parsed.columnFilters).toEqual({
      name: { matchMode: 'contains', value: 'wid' },
      price: { matchMode: 'gte', value: 10 },
      released: { matchMode: 'dateIs', value: new Date('2026-03-10T00:00:00.000Z') },
    });
    expect(Object.getPrototypeOf(parsed.columnFilters)).toBeNull();
    expect(parsed.columnOrder).toEqual(['price', 'name', 'team']);
    expect(parsed.columnWidths).toBeInstanceOf(Map);
    expect(parsed.columnWidths?.get('name')).toBe(180);
    expect(parsed.columnVisibility).toEqual({ name: true, team: false, price: true });
    expect(Object.getPrototypeOf(parsed.columnVisibility)).toBeNull();
    expect(parsed.collapsedRowGroups).toEqual(['A']);
    expect(parsed.globalFilter).toBe('');
    expect(parsed.multiSortMeta).toEqual([
      { field: 'name', order: 'asc' },
      { field: 'price', order: 'desc' },
    ]);
    expect(parsed.rows).toBe(5);
  });

  describe('DAT-056.S3: saved entries for removed columns are skipped', () => {
    it('DAT-056.S3: skips undeclared columns in order, widths, visibility, multiSortMeta, sortField/sortOrder, and columnFilters', () => {
      const parsed = parseStoredTableState(
        {
          columnOrder: ['legacy', 'price', 'name', 'price', 123, null],
          columnWidths: { legacy: 220, name: 180 },
          columnVisibility: { legacy: false, team: false },
          multiSortMeta: [
            { field: 'legacy', order: 'asc' },
            { field: 'name', order: 'desc' },
            { field: 'name', order: 'asc' },
            { field: 'price', order: null },
          ],
          sortField: 'legacy',
          sortOrder: 'asc',
          columnFilters: {
            legacy: { matchMode: 'contains', value: 'x' },
            name: { matchMode: 'startsWith', value: 'w' },
          },
        },
        makeContext(),
      );

      expect(parsed.columnOrder).toEqual(['price', 'name']);
      expect(parsed.columnWidths).toEqual(new Map([['name', 180]]));
      expect(parsed.columnVisibility).toEqual({ team: false });
      expect(parsed.multiSortMeta).toEqual([{ field: 'name', order: 'desc' }]);
      expect('sortField' in parsed).toBe(false);
      expect('sortOrder' in parsed).toBe(false);
      expect(parsed.columnFilters).toEqual({ name: { matchMode: 'startsWith', value: 'w' } });
    });
  });

  describe('DAT-056.S4: a malformed field does not block the others', () => {
    it('DAT-056.S4: drops invalid columnWidths and negative rows while keeping valid globalFilter', () => {
      const parsed = parseStoredTableState(
        {
          columnWidths: 'wide',
          rows: -3,
          globalFilter: 'ab',
        },
        makeContext(),
      );

      expect('columnWidths' in parsed).toBe(false);
      expect('rows' in parsed).toBe(false);
      expect(parsed.globalFilter).toBe('ab');
    });
  });

  describe('DAT-056.S5: page size outside rowsPerPageOptions', () => {
    it('DAT-056.S5: rejects rows not present in rowsPerPageOptions and accepts rows in options or when unset', () => {
      expect('rows' in parseStoredTableState({ rows: 50 }, makeContext([5, 10]))).toBe(false);
      expect(parseStoredTableState({ rows: 5 }, makeContext([5, 10])).rows).toBe(5);
      expect(parseStoredTableState({ rows: 50 }, makeContext(null)).rows).toBe(50);
      expect('rows' in parseStoredTableState({ rows: 0 }, makeContext())).toBe(false);
      expect('rows' in parseStoredTableState({ rows: 5.5 }, makeContext())).toBe(false);
    });
  });

  describe('M-01: per-key wrong-type inputs (null, array, number, string, nested object)', () => {
    const wrongValues: Record<string, readonly unknown[]> = {
      first: [null, [], -1, 1.5, '0', { value: 0 }],
      sortField: [[], 123, 'unknown', { field: 'name' }],
      sortOrder: [[], 1, 'up', { order: 'asc' }],
      expandedRowKeys: [null, [], 1, 'row1'],
      columnFilters: [null, [], 1, 'filter'],
      columnOrder: [null, 1, 'name', { order: ['name'] }],
      columnWidths: [null, [], 100, '100px'],
      columnVisibility: [null, [], 1, 'true'],
      collapsedRowGroups: [null, 1, 'A', { group: 'A' }],
      globalFilter: [null, [], 123, { text: 'ab' }],
      multiSortMeta: [null, 1, 'name', { field: 'name', order: 'asc' }],
      rows: [null, [], 0, -5, 2.5, '10', { rows: 10 }],
    };

    for (const [key, samples] of Object.entries(wrongValues)) {
      const companionKey = key === 'globalFilter' ? 'first' : 'globalFilter';
      const companionValue = key === 'globalFilter' ? 1 : 'ok';
      it(`M-01: rejects wrong-type values for ${key} without blocking ${companionKey}`, () => {
        for (const bad of samples) {
          const parsed = parseStoredTableState({ [companionKey]: companionValue, [key]: bad }, makeContext());
          expect(key in parsed).toBe(false);
          expect(parsed[companionKey]).toBe(companionValue);
        }
      });
    }

    it('M-01: drops wrong-type entry values (null, array, number, string, nested object) inside record and array keys', () => {
      const parsed = parseStoredTableState(
        {
          expandedRowKeys: { a: null, b: [], c: 1, d: 'true', e: { nested: true }, valid: true },
          columnFilters: {
            name: null,
            team: [],
            price: 10,
            released: '2026-03-10',
          },
          columnOrder: [null, [], 1, { field: 'name' }, 'team'],
          columnWidths: { name: null, team: [], price: '100', released: { px: 100 } },
          columnVisibility: { name: null, team: [], price: 1, released: 'false' },
          collapsedRowGroups: [null, [], 1, { group: 'A' }, 'B'],
          multiSortMeta: [null, [], 1, 'name', { field: 'name', order: { dir: 'asc' } }],
        },
        makeContext(),
      );

      expect(parsed.expandedRowKeys).toEqual({ valid: true });
      expect(parsed.columnFilters).toEqual({});
      expect(parsed.columnOrder).toEqual(['team']);
      expect(parsed.columnWidths).toEqual(new Map());
      expect(parsed.columnVisibility).toEqual({});
      expect(parsed.collapsedRowGroups).toEqual(['B']);
      expect(parsed.multiSortMeta).toEqual([]);
    });

    it('M-01: skips columnFilters entries with nested object values', () => {
      const result = parseStoredColumnFilters(
        { name: { matchMode: 'contains', value: { nested: 'x' } } },
        COLUMNS,
      );
      expect(result).toEqual({});
    });
  });

  describe('M-02: prototype-key rejection (__proto__, constructor, toString)', () => {
    it('M-02: rejects __proto__, constructor and toString in expandedRowKeys, columnWidths, columnVisibility, columnFilters and outer object prototype', () => {
      const rawJson = JSON.parse(
        JSON.stringify({
          expandedRowKeys: { __proto__: true, constructor: true, toString: true, row1: true },
          columnWidths: { __proto__: 100, constructor: 100, toString: 100, name: 150 },
          columnVisibility: { __proto__: false, constructor: false, toString: false, team: false },
          columnFilters: {
            __proto__: { matchMode: 'contains', value: 'x' },
            constructor: { matchMode: 'contains', value: 'x' },
            toString: { matchMode: 'contains', value: 'x' },
            name: { matchMode: 'contains', value: 'w' },
          },
        }),
      );
      // Also test when raw itself has __proto__/constructor/toString as own keys on JSON.parse
      const protoRaw = JSON.parse('{"__proto__":{"polluted":true},"expandedRowKeys":{"__proto__":true,"constructor":true,"toString":true,"ok":true}}');

      const parsed = parseStoredTableState(rawJson, makeContext());
      expect(parsed.expandedRowKeys).toEqual({ row1: true });
      expect(Object.prototype.hasOwnProperty.call(parsed.expandedRowKeys, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(parsed.expandedRowKeys, 'constructor')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(parsed.expandedRowKeys, 'toString')).toBe(false);
      expect(parsed.expandedRowKeys?.['constructor']).toBeUndefined();
      expect(parsed.expandedRowKeys?.['toString']).toBeUndefined();
      expect(parsed.columnWidths).toEqual(new Map([['name', 150]]));
      expect(parsed.columnVisibility).toEqual({ team: false });
      expect(parsed.columnFilters).toEqual({ name: { matchMode: 'contains', value: 'w' } });

      const protoParsed = parseStoredTableState(protoRaw, makeContext());
      expect(protoParsed.expandedRowKeys).toEqual({ ok: true });
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();

      // Inherited properties on the outer object are ignored via Object.hasOwn
      const inherited = Object.create({ first: 10, globalFilter: 'inherited' });
      expect(parseStoredTableState(inherited, makeContext())).toEqual({});

      // Even if a column descriptor itself used a prototype key, reject it
      const maliciousCtx: StoredTableStateContext = {
        columns: [
          { field: '__proto__', filterType: 'text' },
          { field: 'constructor', filterType: 'text' },
          { field: 'toString', filterType: 'text' },
        ],
      };
      const maliciousInput = JSON.parse(
        '{"sortField":"constructor","sortOrder":"asc","columnOrder":["__proto__","constructor","toString"],"columnWidths":{"__proto__":100,"constructor":100,"toString":100},"columnVisibility":{"__proto__":true,"constructor":true,"toString":true},"columnFilters":{"constructor":{"matchMode":"contains","value":"a"}},"multiSortMeta":[{"field":"toString","order":"asc"}]}',
      );
      const maliciousParsed = parseStoredTableState(maliciousInput, maliciousCtx);
      expect('sortField' in maliciousParsed).toBe(false);
      expect('sortOrder' in maliciousParsed).toBe(false);
      expect(maliciousParsed.columnOrder).toEqual([]);
      expect(maliciousParsed.columnWidths).toEqual(new Map());
      expect(maliciousParsed.columnVisibility).toEqual({});
      expect(maliciousParsed.columnFilters).toEqual({});
      expect(maliciousParsed.multiSortMeta).toEqual([]);
    });
  });

  describe('M-03: upper-bound checks at the limit and one past it', () => {
    it('M-03: columnWidths accepts 10000 px and rejects 10001 px, 0, negative and non-finite', () => {
      const atLimit = parseStoredTableState({ columnWidths: { name: MAX_COLUMN_WIDTH_PX } }, makeContext());
      expect(atLimit.columnWidths?.get('name')).toBe(10000);

      const pastLimit = parseStoredTableState(
        { columnWidths: { name: MAX_COLUMN_WIDTH_PX + 1, team: 0, price: -5, released: Infinity } },
        makeContext(),
      );
      expect(pastLimit.columnWidths?.size).toBe(0);
    });

    it('M-03: collapsedRowGroups deduplicates and caps at 1000 unique items', () => {
      const exact = Array.from({ length: MAX_COLLAPSED_ROW_GROUPS }, (_, i) => `g-${i}`);
      const atLimit = parseStoredTableState({ collapsedRowGroups: exact }, makeContext());
      expect(atLimit.collapsedRowGroups).toHaveLength(1000);
      expect(atLimit.collapsedRowGroups?.[999]).toBe('g-999');

      const withDupesAndExtra = [
        ...exact.slice(0, 10),
        ...exact,
        'g-1000',
      ];
      const pastLimit = parseStoredTableState({ collapsedRowGroups: withDupesAndExtra }, makeContext());
      expect(pastLimit.collapsedRowGroups).toHaveLength(1000);
      expect(pastLimit.collapsedRowGroups).not.toContain('g-1000');
    });

    it('M-03: globalFilter accepts 1000 chars and rejects 1001 chars', () => {
      const exact = 'a'.repeat(MAX_GLOBAL_FILTER_LENGTH);
      expect(parseStoredTableState({ globalFilter: exact }, makeContext()).globalFilter).toBe(exact);

      const tooLong = 'a'.repeat(MAX_GLOBAL_FILTER_LENGTH + 1);
      expect('globalFilter' in parseStoredTableState({ globalFilter: tooLong }, makeContext())).toBe(false);
    });

    it('M-03: first accepts Number.MAX_SAFE_INTEGER and rejects Number.MAX_SAFE_INTEGER + 1', () => {
      expect(parseStoredTableState({ first: Number.MAX_SAFE_INTEGER }, makeContext()).first).toBe(Number.MAX_SAFE_INTEGER);
      expect('first' in parseStoredTableState({ first: Number.MAX_SAFE_INTEGER + 1 }, makeContext())).toBe(false);
    });

    it('M-03 (S-01): rows accepts MAX_PAGE_SIZE and rejects MAX_PAGE_SIZE + 1 when rowsPerPageOptions is null', () => {
      expect(parseStoredTableState({ rows: MAX_PAGE_SIZE }, makeContext(null)).rows).toBe(MAX_PAGE_SIZE);
      expect('rows' in parseStoredTableState({ rows: MAX_PAGE_SIZE + 1 }, makeContext(null))).toBe(false);
    });

    it('M-03 (S-03): columnFilters text value accepts MAX_COLUMN_FILTER_LENGTH chars and drops one past it', () => {
      const exact = 'x'.repeat(MAX_COLUMN_FILTER_LENGTH);
      const tooLong = 'x'.repeat(MAX_COLUMN_FILTER_LENGTH + 1);
      const parsed = parseStoredTableState(
        {
          columnFilters: {
            name: { matchMode: 'contains', value: exact },
            team: { matchMode: 'contains', value: tooLong },
          },
        },
        makeContext(),
      );
      expect(parsed.columnFilters?.['name']).toEqual({ matchMode: 'contains', value: exact });
      expect(parsed.columnFilters?.['team']).toBeUndefined();
    });
  });
});
