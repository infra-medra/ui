import { mergeClasses } from './merge-classes';

describe('mergeClasses', () => {
  it('combines multiple class inputs into a single string', () => {
    expect(mergeClasses('flex', 'items-center')).toBe('flex items-center');
  });

  it('ignores falsy inputs (conditionals)', () => {
    expect(mergeClasses('flex', false && 'hidden', undefined, 'gap-2')).toBe('flex gap-2');
  });

  it('resolves Tailwind utility class conflicts by keeping the last value', () => {
    expect(mergeClasses('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('lets the consumer class win over the internally generated class (e.g. CVA)', () => {
    const internalClasses = 'rounded-md bg-brand-500';
    const consumerOverride = 'rounded-full';

    expect(mergeClasses(internalClasses, consumerOverride)).toBe('bg-brand-500 rounded-full');
  });
});
