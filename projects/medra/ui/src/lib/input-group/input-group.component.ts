import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/**
 * InputGroup primitive (Tier 3): a flex wrapper that visually joins an
 * input, buttons, and/or addons (`[medInputGroupAddon]`) into one
 * continuous field — `<med-input-group><span medInputGroupAddon>$</span>
 * <input medInputText class="rounded-l-none" /></med-input-group>`.
 *
 * **Deliberately doesn't try to auto-detect and restyle arbitrary projected
 * content** (no generic `[&>*]:rounded-none` cascade trick on the
 * wrapper): `InputTextDirective`/`ButtonDirective` each already bake their
 * own `rounded-md` into `inputTextVariants`/`buttonVariants` directly on
 * the element, at equal CSS specificity to any wrapper-level override —
 * which side wins would depend on Tailwind's build-time class ordering,
 * not anything this component controls, exactly the kind of fragile
 * cascade fight `mergeClasses()` (tailwind-merge) exists to avoid.
 * Instead, each grouped element sheds its own corner radius through its
 * *own* `class` input (`class="rounded-l-none"` on the middle/end pieces)
 * — resolved deterministically by that directive's own `mergeClasses()`
 * call, not a cross-component CSS cascade. `InputGroup` itself only owns
 * what nothing else already styles: collapsing the border gap between
 * adjacent pieces (`-ml-px`) and keeping a focused piece's ring above its
 * neighbors (`z-10`).
 */
@Component({
  selector: 'med-input-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <div [class]="wrapperClass()">
      <ng-content />
    </div>
  `,
})
export class InputGroupComponent {
  readonly class = input('', { alias: 'class' });

  protected readonly wrapperClass = computed(() =>
    mergeClasses('flex w-full items-stretch [&>*+*]:-ml-px [&>*:focus-within]:relative [&>*:focus-within]:z-10 [&>*:focus-visible]:relative [&>*:focus-visible]:z-10', this.class()),
  );
}
