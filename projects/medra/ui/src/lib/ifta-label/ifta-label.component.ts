import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/**
 * IftaLabel primitive (Tier 3): "In-Field Top-Aligned" label — unlike
 * `FloatLabelComponent`, the label never moves; it's always small and
 * pinned to the top of the field, stacked above the value. No dynamic
 * `:focus`/`:placeholder-shown` state to track, so (unlike FloatLabel)
 * this is a plain static flex-column layout, not a CSS peer-selector
 * trick — `<med-ifta-label><label medIftaLabelText for="...">Username
 * </label><input medInputText id="..." class="border-0 bg-transparent p-0
 * focus:outline-none focus:ring-0" /></med-ifta-label>`.
 *
 * The wrapper owns the field's single border/background/focus-ring
 * (`focus-within:*`, since the actual focusable element is the input, not
 * the wrapper itself); the input strips its own via its own `class` —
 * same "compose through each element's own escape hatch" reasoning
 * already used for `InputGroupComponent`/`IconFieldComponent`/
 * `FloatLabelComponent`, rather than the wrapper fighting
 * `inputTextVariants`' baked-in border/radius at equal CSS specificity.
 */
@Component({
  selector: 'med-ifta-label',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div [class]="wrapperClass()">
      <ng-content />
    </div>
  `,
})
export class IftaLabelComponent {
  readonly class = input('', { alias: 'class' });

  protected readonly wrapperClass = computed(() =>
    mergeClasses(
      'flex flex-col gap-0.5 rounded-md border border-surface-300 bg-surface-0 px-(--spacing-field-x) pt-1.5 pb-1',
      'transition-colors duration-(--transition-duration-base)',
      'focus-within:border-brand-500 focus-within:ring-(--focus-ring-width) focus-within:ring-brand-500',
      'dark:border-surface-600 dark:bg-surface-900',
      this.class(),
    ),
  );
}
