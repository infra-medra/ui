import { buildVirtualHeightIndex, findRowAtOffset, rangeAtVariableOffset, rangeHeight } from './data-table-virtual-heights';

describe('data-table-virtual-heights', () => {
  describe('buildVirtualHeightIndex', () => {
    it('returns [0] for an empty row set', () => {
      const offsets = buildVirtualHeightIndex(0, 40, () => 80);
      expect(offsets).toBeInstanceOf(Float64Array);
      expect(Array.from(offsets)).toEqual([0]);
    });

    it('DAT-061.S1: builds cumulative prefix sums for variable row heights', () => {
      const offsets = buildVirtualHeightIndex(50, 40, (index) => (index % 2 === 0 ? 80 : 40));
      expect(offsets.length).toBe(51);
      expect(offsets[0]).toBe(0);
      expect(offsets[1]).toBe(80);
      expect(offsets[2]).toBe(120);
      expect(offsets[20]).toBe(1200);
      expect(offsets[50]).toBe(3000);
    });

    it('clamps finite row heights below 1px to 1px and falls back to defaultSize for non-finite values', () => {
      const inputs: (number | null | undefined)[] = [0, -15, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, undefined, null, 25];
      const offsets = buildVirtualHeightIndex(inputs.length, 40, (i) => inputs[i] as number);
      expect(Array.from(offsets)).toEqual([
        0,
        1, // 0 -> 1
        2, // -15 -> 1
        42, // NaN -> 40
        82, // +Inf -> 40
        122, // -Inf -> 40
        162, // undefined -> 40
        202, // null -> 40
        227, // 25 -> 25
      ]);
    });

    it('clamps defaultSize below 1px to 1px', () => {
      const offsets = buildVirtualHeightIndex(2, 0, () => Number.NaN);
      expect(Array.from(offsets)).toEqual([0, 1, 2]);
    });
  });

  describe('findRowAtOffset', () => {
    const offsets = buildVirtualHeightIndex(50, 40, (index) => (index % 2 === 0 ? 80 : 40));

    it('returns 0 for empty offsets or non-positive offsets', () => {
      expect(findRowAtOffset(new Float64Array([0]), 100)).toBe(0);
      expect(findRowAtOffset(offsets, 0)).toBe(0);
      expect(findRowAtOffset(offsets, -50)).toBe(0);
      expect(findRowAtOffset(offsets, Number.NaN)).toBe(0);
    });

    it('returns the largest row index whose start offset is <= offset', () => {
      expect(findRowAtOffset(offsets, 79)).toBe(0);
      expect(findRowAtOffset(offsets, 80)).toBe(1);
      expect(findRowAtOffset(offsets, 119)).toBe(1);
      expect(findRowAtOffset(offsets, 120)).toBe(2);
      expect(findRowAtOffset(offsets, 1200)).toBe(20);
      expect(findRowAtOffset(offsets, 1279)).toBe(20);
      expect(findRowAtOffset(offsets, 1280)).toBe(21);
    });

    it('clamps offsets at or beyond the total height to the last row index', () => {
      expect(findRowAtOffset(offsets, 2999)).toBe(49);
      expect(findRowAtOffset(offsets, 3000)).toBe(49);
      expect(findRowAtOffset(offsets, 99999)).toBe(49);
    });
  });

  describe('rangeAtVariableOffset', () => {
    const offsets = buildVirtualHeightIndex(50, 40, (index) => (index % 2 === 0 ? 80 : 40));

    it('returns { start: 0, end: 0 } for an empty index', () => {
      expect(rangeAtVariableOffset(new Float64Array([0]), 0, 200, 5)).toEqual({ start: 0, end: 0 });
    });

    it('DAT-061.S1: computes buffered visible range at offset 0 and offset 1200 with 200px viewport', () => {
      expect(rangeAtVariableOffset(offsets, 0, 200, 5)).toEqual({ start: 0, end: 8 });
      expect(rangeAtVariableOffset(offsets, 1200, 200, 5)).toEqual({ start: 15, end: 28 });
    });

    it('includes partially visible trailing rows without overshooting exact boundaries', () => {
      expect(rangeAtVariableOffset(offsets, 1200, 200, 0)).toEqual({ start: 20, end: 23 });
      expect(rangeAtVariableOffset(offsets, 1201, 200, 0)).toEqual({ start: 20, end: 24 });
    });

    it('clamps ranges near the end of the dataset', () => {
      expect(rangeAtVariableOffset(offsets, 2800, 200, 5)).toEqual({ start: 41, end: 50 });
      expect(rangeAtVariableOffset(offsets, 3000, 200, 0)).toEqual({ start: 50, end: 50 });
    });
  });

  describe('rangeHeight', () => {
    const offsets = buildVirtualHeightIndex(50, 40, (index) => (index % 2 === 0 ? 80 : 40));

    it('computes spacer and window heights in O(1) summing to total height', () => {
      const top = rangeHeight(offsets, 0, 15);
      const window = rangeHeight(offsets, 15, 28);
      const bottom = rangeHeight(offsets, 28, 50);

      expect(top).toBe(920);
      expect(window).toBe(760);
      expect(bottom).toBe(1320);
      expect(top + window + bottom).toBe(3000);
      expect(rangeHeight(offsets, 0, 50)).toBe(3000);
    });

    it('returns 0 for empty or inverted ranges and clamps out-of-bounds indices', () => {
      expect(rangeHeight(offsets, 10, 10)).toBe(0);
      expect(rangeHeight(offsets, 15, 10)).toBe(0);
      expect(rangeHeight(offsets, -5, 2)).toBe(120);
      expect(rangeHeight(offsets, 48, 999)).toBe(120);
    });
  });
});
