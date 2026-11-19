import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerType = 'solid' | 'dashed' | 'dotted';
export type DividerAlign = 'start' | 'center' | 'end';

/**
 * Simple separator line (Tier 1). The host element itself is the line — no
 * wrapping markup. Deliberately doesn't support an inline label for v1
 * (common in other libraries, but not needed yet); can be added later
 * without breaking this API if a real need comes up.
 *
 * **`type`** (default `'solid'`, matching). `'solid'` keeps the exact
 * technique already used — a filled `bg-surface-*` line — since a CSS
 * `background-color` has no dashed/dotted rendering of its own; those two
 * variants switch to a `border` (`border-t`/`border-l` with
 * `border-style`) instead, the only CSS mechanism that can actually
 * express a dashed or dotted line.
 */
@Component({
  selector: 'med-divider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[class]': 'hostClass()',
  },
  template: `<ng-content />`,
})
export class DividerComponent {
  readonly orientation = input<DividerOrientation>('horizontal');
  readonly type = input<DividerType>('solid');
  readonly align = input<DividerAlign | undefined>(undefined);
  readonly class = input('', { alias: 'class' });

  protected readonly hostClass = computed(() => {
    const horizontal = this.orientation() === 'horizontal';
    const type = this.type();
    const align = this.align();
    if (align) {
      const alignClass = align === 'start' ? 'justify-start' : align === 'end' ? 'justify-end' : 'justify-center';
      return mergeClasses(
        horizontal ? `flex w-full items-center gap-3 ${alignClass}` : `inline-flex h-full flex-col items-center gap-3 ${alignClass}`,
        this.class(),
      );
    }
    if (type === 'solid') {
      return mergeClasses(horizontal ? 'block h-px w-full bg-surface-200 dark:bg-surface-700' : 'inline-block h-full w-px bg-surface-200 dark:bg-surface-700', this.class());
    }
    const borderStyle = type === 'dashed' ? 'border-dashed' : 'border-dotted';
    return mergeClasses(
      horizontal ? `block h-0 w-full border-t ${borderStyle} border-surface-200 dark:border-surface-700` : `inline-block h-full w-0 border-l ${borderStyle} border-surface-200 dark:border-surface-700`,
      this.class(),
    );
  });
}
