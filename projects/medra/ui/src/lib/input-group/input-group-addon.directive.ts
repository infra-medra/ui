import { Directive, computed, input } from '@angular/core';
import { cva } from 'class-variance-authority';
import { mergeClasses } from '../utils/merge-classes';

export type InputGroupAddonSize = 'sm' | 'default' | 'lg';

/** Same shared form-field size tokens `inputTextVariants` uses, so an addon's height always matches the field(s) it sits next to. */
const addonVariants = cva(
  [
    'inline-flex items-center rounded-md border border-surface-300 bg-surface-100 text-surface-500',
    'dark:border-surface-600 dark:bg-surface-800 dark:text-surface-400',
  ],
  {
    variants: {
      size: {
        sm: 'px-(--spacing-field-sm-x) py-(--spacing-field-sm-y) text-(length:--text-field-sm)',
        default: 'px-(--spacing-field-x) py-(--spacing-field-y) text-(length:--text-field-base)',
        lg: 'px-(--spacing-field-lg-x) py-(--spacing-field-lg-y) text-(length:--text-field-lg)',
      },
    },
    defaultVariants: { size: 'default' },
  },
);

/**
 * A prefix/suffix addon inside `<med-input-group>` — `<span
 * medInputGroupAddon>$</span>`. Owns its border/background/radius from
 * scratch (nothing else styles a plain `<span>`), unlike
 * `InputTextDirective`/`ButtonDirective`, which is exactly why this one
 * *can* just apply its classes directly instead of needing the
 * per-instance `class="rounded-*-none"` override those two rely on inside
 * a group — see `InputGroupComponent`'s own doc comment for why the
 * wrapper doesn't try to do this generically for arbitrary content.
 */
@Directive({
  selector: '[medInputGroupAddon]',
  standalone: true,
  host: { '[class]': 'hostClass()' },
})
export class InputGroupAddonDirective {
  readonly size = input<InputGroupAddonSize>('default');
  readonly class = input('', { alias: 'class' });

  protected readonly hostClass = computed(() => mergeClasses(addonVariants({ size: this.size() }), this.class()));
}
