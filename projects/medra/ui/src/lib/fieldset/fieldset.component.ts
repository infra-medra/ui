import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChild, input, model, output } from '@angular/core';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { FieldsetLegendDirective } from './fieldset.directives';

let nextFieldsetId = 0;

/**
 * Fieldset primitive (Tier 2). Real `<fieldset>`/`<legend>`, not Panel's
 * generic `<div>`/`<h3>` — same collapsible-container job as Panel, but for
 * grouping actual form controls, where the semantic elements matter: a
 * screen reader announces the group's `legend` as context for every
 * control inside it, and `disabled` cascades to every descendant form
 * control automatically via the browser's own `<fieldset disabled>`
 * behavior, no custom logic needed to (un)disable each child individually.
 * The border's "cut-in" look around the legend is native `<legend>`
 * rendering too — no positioning CSS of our own.
 *
 * Toggle interaction mirrors Panel exactly: the whole legend is clickable
 * (mouse convenience, bigger hit target) via a click handler that bubbles
 * up from the real, independently keyboard-accessible toggle `<button>`
 * inside it — same single-source-of-truth reasoning, see Panel's own doc.
 *
 * **`medFieldsetLegend` slot and `beforeToggle`/`afterToggle`**. A rich legend fully *replaces* the
 * plain string, via the same marker- directive projection slot Card's `medCardTitle` already
 * established (rich alternative to a plain-string input, not a second content mechanism). The
 * `beforeToggle`/`afterToggle` events use this library's own bare-primitive-payload convention
 * (boolean payload only) — `beforeToggle` emits the *current* (pre-toggle) value and `afterToggle`
 * the *new* (post-toggle) one. `afterToggle` only fires when the toggle button/legend triggers the
 * change (unlike the `collapsed` `model()`'s own `collapsedChange`, which also fires for an
 * external/programmatic write) fires off its motion-animation-end lifecycle hook, which this
 * component has no equivalent of (the content just toggles `[hidden]`, no transition), so tying it
 * to the interactive toggle itself is the closest meaningful match.
 */
@Component({
  selector: 'med-fieldset',
  standalone: true,
  imports: [ButtonDirective, IconComponent, FieldsetLegendDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <fieldset [class]="fieldsetClass()" [disabled]="disabled()">
      <legend [class]="legendClass()" (click)="toggleable() && toggle()">
        <ng-content select="[medFieldsetLegend]" />
        @if (!hasLegendSlot() && legend()) {
          {{ legend() }}
        }
        @if (toggleable()) {
          <button
            medButton
            type="button"
            variant="text"
            severity="secondary"
            iconOnly
            class="size-6 p-1 align-middle"
            [attr.aria-expanded]="!collapsed()"
            [attr.aria-controls]="contentId"
            [attr.aria-label]="collapsed() ? expandLabel() : collapseLabel()"
          >
            <med-icon name="chevron-down" [class]="chevronClass()" />
          </button>
        }
      </legend>
      <div [id]="contentId" [hidden]="collapsed()" class="pt-2 text-sm text-surface-700 dark:text-surface-200">
        <ng-content />
      </div>
    </fieldset>
  `,
})
export class FieldsetComponent {
  readonly legend = input('');
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly collapsed = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly expandLabel = input('Expand');
  readonly collapseLabel = input('Collapse');
  readonly class = input('', { alias: 'class' });
  readonly beforeToggle = output<boolean>();
  readonly afterToggle = output<boolean>();

  protected readonly contentId = `med-fieldset-content-${nextFieldsetId++}`;

  private readonly legendSlot = contentChild(FieldsetLegendDirective);
  protected readonly hasLegendSlot = computed(() => !!this.legendSlot());

  protected readonly fieldsetClass = computed(() =>
    mergeClasses('rounded-lg border border-surface-200 px-4 pb-4 dark:border-surface-700', this.class()),
  );
  protected readonly legendClass = computed(() =>
    mergeClasses(
      'flex items-center gap-1 px-2 text-sm font-semibold text-surface-900 dark:text-surface-50',
      this.toggleable() ? 'cursor-pointer select-none' : '',
    ),
  );
  protected readonly chevronClass = computed(() =>
    mergeClasses('transition-transform duration-(--transition-duration-base)', this.collapsed() ? '-rotate-90' : ''),
  );

  protected toggle(): void {
    this.beforeToggle.emit(this.collapsed());
    this.collapsed.update((value) => !value);
    this.afterToggle.emit(this.collapsed());
  }
}
