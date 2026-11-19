import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/**
 * Layout primitive (Tier 2): a header/action bar with three named
 * projection slots (`<div medToolbarStart>`/`medToolbarCenter`/`medToolbarEnd`).
 * `start`/`end` are equal `flex-1` siblings around `center` — the classic
 * "holy grail" trick, so `center` sits at true visual center regardless of
 * how wide `start`/`end` are, without measuring anything in JS. The whole
 * bar (and each slot individually) wraps on narrow viewports rather than
 * overflowing.
 *
 * **Scope cut**: `role="toolbar"` is applied as a semantic grouping label only — this does *not*
 * implement the full WAI-ARIA APG "Toolbar" pattern's roving-tabindex arrow-key navigation between
 * items. Projected content can be anything (buttons, inputs, a whole other component), so a generic
 * roving-tabindex implementation would have to special-case every possible focusable child; normal
 * Tab order between toolbar items already covers keyboard access.
 */
@Component({
  selector: 'med-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div [class]="toolbarClass()" role="toolbar" [attr.aria-label]="ariaLabel()">
      <div class="flex flex-1 flex-wrap items-center gap-2">
        <ng-content select="[medToolbarStart]" />
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <ng-content select="[medToolbarCenter]" />
      </div>
      <div class="flex flex-1 flex-wrap items-center justify-end gap-2">
        <ng-content select="[medToolbarEnd]" />
      </div>
    </div>
  `,
})
export class ToolbarComponent {
  readonly ariaLabel = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  protected readonly toolbarClass = computed(() =>
    mergeClasses(
      'flex flex-wrap items-center gap-2 rounded-lg border border-surface-200 bg-surface-0 p-2 dark:border-surface-700 dark:bg-surface-800',
      this.class(),
    ),
  );
}
