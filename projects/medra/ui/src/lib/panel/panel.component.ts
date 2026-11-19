import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model } from '@angular/core';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';

let nextPanelId = 0;

/**
 * Titled container primitive (Tier 1): header row + body, optionally
 * collapsible. `collapsed` is a `model()` (two-way bindable, `[(collapsed)]`)
 * rather than a form control — it's local UI state, not a value the
 * consumer submits. The whole header row is clickable when `toggleable`
 * (not just the chevron button) — a native `<button>`'s Enter/Space
 * activation dispatches a real `click` that bubbles to the header's own
 * handler, so a single handler there covers mouse, keyboard, and touch
 * without the header and the button needing separate logic (and without
 * risking a double-toggle from both firing).
 * **Scope reduction for v1**: no expand/collapse animation — content is
 * shown/hidden via the `hidden` attribute (kept in the DOM either way, so
 * `aria-controls` always points at a real element), not a height
 * transition; can be layered on later without an API change.
 *
 * **`toggler`/`iconPos`/`showHeader`**:
 *
 * `toggler` ('header' | 'icon') controls whether the whole header row toggles on click, or only the
 * chevron button does. The default is `'header'`, keeping the deliberate "bigger hit target"
 * decision already documented above ; `'icon'` opts into the narrower target. Whichever mode is
 * active, only *one* of the header/button click handlers ever calls `toggle()` — the other is a
 * no-op for that mode — so a button click (which always bubbles to the header) never
 * double-toggles.
 *
 * `iconPos` ('start' | 'end' | 'center') positions the toggle button relative to the title. This
 * library bakes concrete Tailwind utility classes directly into the component instead of shipping a
 * separate themeable CSS layer, so `iconPos` gets a real, working implementation here: `'start'`
 * reorders the button before the title (`order-first`), `'center'` switches the header from
 * `justify-between` to `justify-center` so title+button sit together as a centered group, `'end'`
 * is the existing default layout, unchanged.
 *
 * `showHeader` hides the header row entirely (title + toggle button) when `false` — this also
 * removes the only visible way to toggle when combined with `toggleable`; `collapsed` can still be
 * driven programmatically via `[(collapsed)]`.
 */
@Component({
  selector: 'med-panel',
  standalone: true,
  imports: [ButtonDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div [class]="panelClass()">
      @if (showHeader()) {
        <div [class]="headerClass()" (click)="toggleable() && toggler() === 'header' && toggle()">
          <h3 class="text-sm font-semibold text-surface-900 dark:text-surface-50">{{ header() }}</h3>
          @if (toggleable()) {
            <button
              medButton
              type="button"
              variant="text"
              severity="secondary"
              iconOnly
              [class]="toggleButtonClass()"
              [attr.aria-expanded]="!collapsed()"
              [attr.aria-controls]="contentId"
              [attr.aria-label]="collapsed() ? expandLabel() : collapseLabel()"
              (click)="toggler() === 'icon' && toggle()"
            >
              <med-icon name="chevron-down" [class]="chevronClass()" />
            </button>
          }
        </div>
      }
      <div [id]="contentId" [hidden]="collapsed()" class="p-4 text-sm text-surface-700 dark:text-surface-200">
        <ng-content />
      </div>
    </div>
  `,
})
export class PanelComponent {
  readonly header = input('');
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly collapsed = model(false);
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly expandLabel = input('Expand');
  readonly collapseLabel = input('Collapse');
  readonly class = input('', { alias: 'class' });
  /** Default is `'header'` — see class doc. */
  readonly toggler = input<'header' | 'icon'>('header');
  readonly iconPos = input<'start' | 'end' | 'center'>('end');
  readonly showHeader = input(true, { transform: booleanAttribute });

  protected readonly contentId = `med-panel-content-${nextPanelId++}`;

  protected readonly panelClass = computed(() =>
    mergeClasses(
      'overflow-hidden rounded-lg border border-surface-200 bg-surface-0 dark:border-surface-700 dark:bg-surface-800',
      this.class(),
    ),
  );
  protected readonly headerClass = computed(() =>
    mergeClasses(
      'flex items-center gap-2 border-b border-surface-200 px-4 py-3 dark:border-surface-700',
      this.iconPos() === 'center' ? 'justify-center' : 'justify-between',
      this.toggleable() && this.toggler() === 'header' ? 'cursor-pointer select-none' : '',
    ),
  );
  protected readonly toggleButtonClass = computed(() =>
    mergeClasses('size-7 p-1', this.iconPos() === 'start' ? 'order-first' : ''),
  );
  protected readonly chevronClass = computed(() =>
    mergeClasses('transition-transform duration-(--transition-duration-base)', this.collapsed() ? '-rotate-90' : ''),
  );

  protected toggle(): void {
    this.collapsed.update((value) => !value);
  }
}
