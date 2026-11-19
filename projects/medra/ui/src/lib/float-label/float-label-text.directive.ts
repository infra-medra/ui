import { Directive, computed, input, signal } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

export type FloatLabelVariant = 'on' | 'in' | 'over';

/**
 * The *floating* (focused/has-a-value) position, per `variant` — the one piece that actually
 * differs between them. `over` (default) floats the label clear above the field entirely, like a
 * standalone form label — this is where `translate-y-0` replaces the resting/on/in state's
 * `-translate-y-1/2`, since a fixed top offset (not a value centered around it) is what the active
 * state needs. `on` is the classic "notch cut into the field's own border line" look (a
 * `bg-surface-0` patch behind the label text is what creates the cutout). `in` keeps it inside the
 * field's own bounds, near the top — the projected input's own top padding (auto-applied by
 * `FloatLabelComponent`'s own `variant`, see that file's doc) makes room for it so it never
 * overlaps typed text.
 */
const FLOATING_CLASS: Record<FloatLabelVariant, string> = {
  on: 'top-0 -translate-y-1/2 origin-top-left scale-75 bg-surface-0 px-1 text-xs text-surface-500 dark:bg-surface-900 dark:text-surface-400',
  over: '-top-6 translate-y-0 origin-top-left scale-75 bg-transparent px-0 text-xs text-surface-500 dark:text-surface-500',
  in: 'top-2.5 -translate-y-1/2 origin-top-left scale-75 bg-transparent px-0 text-xs text-surface-500 dark:text-surface-500',
};

/**
 * The *resting* (empty + unfocused, overlapping the placeholder) position
 * — identical across all three variants, since at rest every variant just
 * looks like a normal placeholder sitting inside the field.
 */
const RESTING_CLASS =
  'peer-[&:placeholder-shown:not(:focus)]:top-1/2 peer-[&:placeholder-shown:not(:focus)]:-translate-y-1/2 peer-[&:placeholder-shown:not(:focus)]:origin-center peer-[&:placeholder-shown:not(:focus)]:scale-100 peer-[&:placeholder-shown:not(:focus)]:bg-transparent peer-[&:placeholder-shown:not(:focus)]:px-0 peer-[&:placeholder-shown:not(:focus)]:text-(length:--text-field-base) peer-[&:placeholder-shown:not(:focus)]:text-surface-400 dark:peer-[&:placeholder-shown:not(:focus)]:text-surface-500';

/**
 * The floating `<label medFloatLabelText for="...">` inside
 * `<med-float-label>`. Default classes are the *floating* (up, small)
 * state; a single arbitrary `peer-*` variant overrides back down to the
 * *resting* (inside the field, placeholder-sized) state, and only that one
 * — `peer-[&:placeholder-shown:not(:focus)]:...` bakes both conditions
 * ("empty" and "not focused") into one compound peer selector, rather than
 * two separately-conditioned class groups (e.g. `peer-focus:` +
 * `peer-placeholder-shown:`) whose relative precedence would depend on
 * Tailwind's internal variant ordering instead of anything this component
 * declares — the same kind of cross-rule cascade fragility already avoided
 * in `InputGroupComponent`/`IconFieldComponent`, just resolved here by
 * collapsing the two conditions into a single selector instead of by
 * pushing the override onto each consumer element. Both `FLOATING_CLASS`
 * and `RESTING_CLASS` restate their own `translate-y-*` explicitly (rather
 * than one relying on a `-translate-y-1/2` declared once, unconditionally,
 * elsewhere) for the same reason: Tailwind's `transform`-family utilities
 * all compose into one shared `transform` CSS property, so a value left
 * unstated in one branch would silently inherit whatever another branch
 * last set, rather than reset — every state has to be fully self-describing.
 *
 * **`variant`** (moved to `FloatLabelComponent`) is pushed in by the parent `FloatLabelComponent`
 * as a plain signal, not an `@Input()` on this directive. The parent applies the input's required
 * top padding through a variant-keyed class on the wrapper's own host element, so consumers don't
 * have to hand-guess a matching `pt-*` class. This directive's own positioning can't be pure-CSS
 * (Tailwind's `peer-*` state-dependent classes have to live on the label element itself, not be
 * injected from an ancestor selector), so `variant` is still read here, pushed down reactively from
 * the wrapper, the same one-directional convention
 * `AccordionTabComponent.expanded`/`SplitterPanelComponent.flexBasis` already use for "parent owns
 * the public input, child reads a pushed-in signal." **Not meant to be set directly by consumers.**
 */
@Directive({
  selector: '[medFloatLabelText]',
  standalone: true,
  host: { '[class]': 'hostClass()' },
})
export class FloatLabelTextDirective {
  readonly variant = signal<FloatLabelVariant>('over');
  readonly class = input('', { alias: 'class' });

  protected readonly hostClass = computed(() =>
    mergeClasses(
      'pointer-events-none absolute left-(--spacing-field-x) transition-all duration-(--transition-duration-base)',
      FLOATING_CLASS[this.variant()],
      'peer-focus:text-brand-600 dark:peer-focus:text-brand-400',
      RESTING_CLASS,
      this.class(),
    ),
  );
}
