import { cva, type VariantProps } from 'class-variance-authority';

/**
 * CVA definition for `<med-button-group>`.
 * Joins adjacent `button[medButton]` / `a[medButton]` children horizontally by
 * removing inner corner radii, collapsing overlapping 1px borders (`-ml-px`),
 * and lifting hovered/focused children above siblings (`z-10`) so focus rings
 * are never clipped.
 */
export const buttonGroupVariants = cva([
  'inline-flex items-center',
  '[&>*:not(:first-child)]:rounded-l-none',
  '[&>*:not(:last-child)]:rounded-r-none',
  '[&>*:not(:first-child)]:-ml-px',
  '[&>*:hover]:z-10',
  '[&>*:focus-visible]:z-10',
]);

export type ButtonGroupVariantProps = VariantProps<typeof buttonGroupVariants>;
