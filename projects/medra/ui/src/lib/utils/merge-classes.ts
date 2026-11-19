import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Custom twMerge with MedraUi's own utility class groups (see
 * tailwind-theme-medraui.css) so that consumer override classes correctly
 * resolve conflicts with these internal classes.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['field-sm', 'field-base', 'field-lg'] }],
      rounded: [{ rounded: ['xs', 'sm', 'md', 'lg', 'xl'] }],
    },
  },
});

/**
 * Combines internally generated classes (e.g. CVA output) with the class
 * provided by the consumer via `@Input('class')`, ensuring the consumer's
 * class wins in case of a Tailwind utility class conflict.
 */
export function mergeClasses(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
