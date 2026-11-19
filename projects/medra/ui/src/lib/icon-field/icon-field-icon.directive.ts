import { Directive, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

export type IconFieldIconPosition = 'left' | 'right';

/**
 * The overlaid icon inside `<med-icon-field>` —
 * `<med-icon name="..." medIconFieldIcon />` (left, the default) or
 * `<med-icon name="..." medIconFieldIcon position="right" />`.
 * `position` is its own input, not aliased to the `medIconFieldIcon`
 * selector itself (unlike, say, `IconFieldIconDirective`'s bare marker
 * usage on `ButtonDirective`/`InputTextDirective`) — aliasing a typed
 * string-literal input to the selector name would make the common bare
 * `medIconFieldIcon` (no value) usage fail Angular's template type
 * checking, since a value-less attribute binds the *empty string* to
 * whatever it's aliased to, and `''` isn't a valid `IconFieldIconPosition`.
 *
 * `pointer-events-none` by default: a decorative icon sitting visually on
 * top of the input's own padding must not steal clicks meant to focus the
 * input underneath it — override via `class="pointer-events-auto"` for the
 * (less common) case of a real clickable icon-button in that slot instead
 * of a decorative one.
 */
@Directive({
  selector: '[medIconFieldIcon]',
  standalone: true,
  host: { '[class]': 'hostClass()' },
})
export class IconFieldIconDirective {
  readonly position = input<IconFieldIconPosition>('left');
  readonly class = input('', { alias: 'class' });

  protected readonly hostClass = computed(() =>
    mergeClasses(
      'pointer-events-none absolute top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500',
      this.position() === 'right' ? 'right-3' : 'left-3',
      this.class(),
    ),
  );
}
