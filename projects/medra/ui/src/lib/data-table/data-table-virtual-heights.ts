/**
 * Builds a `Float64Array` prefix-sum index of length `total + 1` where
 * `offsets[0] = 0` and `offsets[i + 1] = offsets[i] + rowHeight(i)`.
 * Finite heights are clamped to at least 1px; non-finite or missing values
 * fall back to `defaultSize` (also clamped to at least 1px).
 */
export function buildVirtualHeightIndex(
  total: number,
  defaultSize: number,
  resolveHeight: (index: number) => number | null | undefined,
): Float64Array {
  const count = Math.max(0, Math.floor(Number.isFinite(total) ? total : 0));
  const fallback = Math.max(1, Number.isFinite(defaultSize) ? defaultSize : 1);
  const offsets = new Float64Array(count + 1);
  offsets[0] = 0;
  for (let i = 0; i < count; i++) {
    const raw = resolveHeight(i);
    const height = typeof raw === 'number' && Number.isFinite(raw) ? Math.max(1, raw) : fallback;
    offsets[i + 1] = offsets[i] + height;
  }
  return offsets;
}

/**
 * Binary-searches `offsets` for the largest row index `i` (`0 <= i < total`)
 * with `offsets[i] <= offset`. Returns `0` when the index is empty or
 * `offset <= 0`.
 */
export function findRowAtOffset(offsets: Float64Array, offset: number): number {
  const total = offsets.length - 1;
  if (total <= 0 || !Number.isFinite(offset) || offset <= 0) {
    return 0;
  }
  let lo = 0;
  let hi = total - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (offsets[mid] <= offset) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo;
}

/**
 * Computes the buffered virtual window `[start, end)` for a body scroll
 * `scrollTopOffset` and `viewportHeight`.
 */
export function rangeAtVariableOffset(
  offsets: Float64Array,
  scrollTopOffset: number,
  viewportHeight: number,
  bufferRows: number,
): { readonly start: number; readonly end: number } {
  const total = offsets.length - 1;
  if (total <= 0) {
    return { start: 0, end: 0 };
  }
  const safeOffset = Math.max(0, Number.isFinite(scrollTopOffset) ? scrollTopOffset : 0);
  const safeViewport = Math.max(0, Number.isFinite(viewportHeight) ? viewportHeight : 0);
  const safeBuffer = Math.max(0, Math.floor(Number.isFinite(bufferRows) ? bufferRows : 0));
  const totalHeight = offsets[total];

  const firstVisible = safeOffset >= totalHeight ? total : findRowAtOffset(offsets, safeOffset);
  const bottom = safeOffset + safeViewport;
  let lastVisible: number;
  if (bottom <= 0) {
    lastVisible = 0;
  } else if (bottom >= totalHeight) {
    lastVisible = total;
  } else {
    const idx = findRowAtOffset(offsets, bottom);
    lastVisible = offsets[idx] < bottom ? idx + 1 : idx;
  }

  const start = Math.min(total, Math.max(0, firstVisible - safeBuffer));
  const end = Math.min(total, Math.max(start, lastVisible + safeBuffer));
  return { start, end };
}

/**
 * Returns the cumulative pixel height of rows `[fromIndex, toIndex)` in O(1).
 */
export function rangeHeight(offsets: Float64Array, fromIndex: number, toIndex: number): number {
  const total = offsets.length - 1;
  if (total <= 0) {
    return 0;
  }
  const from = Math.max(0, Math.min(total, Math.floor(fromIndex)));
  const to = Math.max(from, Math.min(total, Math.floor(toIndex)));
  return offsets[to] - offsets[from];
}
