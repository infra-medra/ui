import { ChangeDetectionStrategy, Component, computed, contentChild, effect, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { FloatLabelTextDirective, FloatLabelVariant } from './float-label-text.directive';

/**
 * Auto-applies the projected `<input>`/`<textarea>`'s own top/bottom padding for `variant="in"` : a
 * plain descendant selector keyed off a variant class on the wrapper. No JS/DI needed for this part
 * — a Tailwind arbitrary child-selector on the wrapper's own host class does the same job.
 * `on`/`over` need no extra room from the field itself (the label sits on the border or clear above
 * it, never inside the padding box), so they're a no-op here.
 */
const INPUT_PADDING_CLASS: Record<FloatLabelVariant, string> = {
  on: '',
  over: '',
  in: '[&>input]:pt-6 [&>input]:pb-2 [&>textarea]:pt-6 [&>textarea]:pb-2',
};

/**
 * Reserves the vertical room `variant="over"` needs above the field for
 * its own floated label (see `FloatLabelTextDirective`'s `-top-6`) —
 * baked into the wrapper's own default classes instead of left for every
 * consumer to guess via an external `class="mt-..."` (the original
 * showcase's own `mt-8` guess is exactly what read as cramped/inconsistent
 * in practice). `on`/`in` never escape the field's own box, so neither
 * needs extra margin.
 */
const WRAPPER_SPACING_CLASS: Record<FloatLabelVariant, string> = {
  on: '',
  over: 'mt-6',
  in: '',
};

/**
 * FloatLabel primitive (Tier 3): a positioning wrapper for the classic
 * "floats up out of the field on focus/value" label —
 * `<med-float-label><input medInputText placeholder=" " class="peer" />
 * <label medFloatLabelText for="...">Email</label></med-float-label>`.
 *
 * Pure CSS, no JS reaching into the input's live value (same "don't couple
 * the wrapper to arbitrary projected content" stance already taken by
 * `InputGroupComponent`/`IconFieldComponent`): the label positions itself
 * off the input's own `:placeholder-shown`/`:focus` state via Tailwind's
 * `peer-*` variants, which is why the input needs `class="peer"` and a
 * non-empty `placeholder` (a single space is enough — `:placeholder-shown`
 * only engages when the attribute is actually present) added by the
 * consumer, same "compose through each element's own class" pattern.
 *
 * **`variant`** (default `'over'`) lives on this wrapper, which lets it apply the exact input
 * padding / reserved space each variant needs on its own
 * (`INPUT_PADDING_CLASS`/`WRAPPER_SPACING_CLASS` above), instead of every consumer hand-guessing a
 * matching `pt-*`/`mt-*` value. The label directive still needs to know `variant` for its own
 * peer-state-dependent positioning classes (Tailwind's `peer-*` can't be authored from an
 * ancestor's selector), so it's pushed down via `contentChild()` + a plain writable signal — the
 * same one-directional convention `AccordionComponent`/`SplitterComponent` already use for their
 * own multi-part children.
 */
@Component({
  selector: 'med-float-label',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: `<ng-content />`,
})
export class FloatLabelComponent {
  readonly variant = input<FloatLabelVariant>('over');

  private readonly labelDirective = contentChild(FloatLabelTextDirective);

  protected readonly hostClass = computed(() =>
    mergeClasses('relative inline-block', WRAPPER_SPACING_CLASS[this.variant()], INPUT_PADDING_CLASS[this.variant()]),
  );

  constructor() {
    effect(() => this.labelDirective()?.variant.set(this.variant()));
  }
}
