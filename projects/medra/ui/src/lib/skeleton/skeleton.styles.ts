import { cva, type VariantProps } from 'class-variance-authority';

export type SkeletonShape = 'rectangle' | 'circle';
export type SkeletonAnimation = 'wave' | 'none';

/**
 * The shimmer itself is an `after:` pseudo-element (no extra DOM node),
 * translated across the box by the shared `animate-skeleton-wave` utility
 * (`--animate-skeleton-wave`, tailwind-theme-medraui.css) — `overflow-hidden`
 * on the box clips it to the shape, which is what makes it read as "sweeping
 * across a rectangle/circle" instead of a rectangle sweeping behind one.
 * `animation: 'none'` only omits the `after:` gradient/animation classes;
 * the base placeholder color is unconditional either way.
 */
export const skeletonVariants = cva(['relative block overflow-hidden bg-surface-200 dark:bg-surface-700'], {
  variants: {
    shape: {
      rectangle: 'rounded-md',
      circle: 'rounded-full',
    },
    animation: {
      wave: [
        'after:absolute after:inset-0 after:-translate-x-full after:animate-skeleton-wave',
        'after:bg-gradient-to-r after:from-transparent after:via-surface-0/40 after:to-transparent',
        'dark:after:via-surface-50/10',
      ],
      none: '',
    },
  },
  defaultVariants: {
    shape: 'rectangle',
    animation: 'wave',
  },
});

export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;
