import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * IconField primitive (Tier 3): a plain positioning wrapper —
 * `<med-icon-field><med-icon name="magnifying-glass" medIconFieldIcon />
 * <input medInputText class="pl-9" /></med-icon-field>`. Like
 * `InputGroupComponent`, it doesn't reach into the projected `<input>` to
 * add the padding that keeps typed text clear of the overlaid icon — the
 * consumer adds that via the input's own `class` (`pl-9`/`pr-9`), same
 * "each element composes through its own escape hatch" reasoning already
 * used there, rather than a wrapper-level cascade override fighting
 * `inputTextVariants`' own classes at equal CSS specificity.
 */
@Component({
  selector: 'med-icon-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative inline-block' },
  template: `<ng-content />`,
})
export class IconFieldComponent {}
