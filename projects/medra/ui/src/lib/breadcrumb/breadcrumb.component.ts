import { ChangeDetectionStrategy, Component, TemplateRef, computed, contentChild, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { BreadcrumbHomeItem, BreadcrumbItem } from './breadcrumb.types';

/**
 * Breadcrumb primitive (Tier 1). Plain `<a [href]>` for navigable items
 * (real, working links even without JS) plus an `itemSelect` output on
 * every enabled, non-last item's click — a consumer using Angular Router
 * can `event.preventDefault()` in their own handler and navigate via
 * `Router.navigateByUrl()` for SPA routing instead of a full page load.
 * The library itself doesn't depend on `@angular/router`.
 *
 * The last item is always rendered as plain text with `aria-current="page"`
 * (never a link), regardless of whether it has a `url` — it represents the
 * current page, which isn't itself navigable.
 *
 * **`home`/`homeAriaLabel`, `itemTemplate`/`separatorTemplate`, `target`/`visible` per item**.
 *
 * **`home`** is a separate leading item (`BreadcrumbHomeItem` — same shape as `BreadcrumbItem` but
 * `label` is optional, since a home crumb is usually icon-only), not folded into `items()`: it
 * needs its own default icon (`'home'`, when `home()` doesn't set one) and its own `homeAriaLabel`
 * (an icon-only link needs *some* accessible name), neither of which any other item in `items()`
 * gets. Its separator only renders when both `home()` and at least one visible item in `items()`
 * exist.
 *
 * **`itemTemplate` (`<ng-template #item let-item>`) replaces only the icon+label *content* of each
 * item, not the `<a>`/`<span>` wrapper itself** — this component keeps that wrapper itself under
 * its own control so a consumer's template can't accidentally drop the working link/
 * `aria-current`/`aria-disabled` semantics the component already gets right — the same "consumer
 * decides display, component decides the interactive shell" split
 * `TableColumnComponent.cellTemplate` already uses for `<td>`. Context: `{ $implicit: item }`, used
 * for `home()` too.
 *
 * **`separatorTemplate` (`<ng-template #separator>`)** replaces the
 * default `chevron-right` icon between every pair of adjacent (visible)
 * items, no context — there's nothing per-separator to bind.
 *
 * **`target`** forwards straight to the rendered `<a target>`.
 * **`visible`** (default `true`) hides an item — and the separator right
 * after it — entirely.
 */
@Component({
  selector: 'med-breadcrumb',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ol [class]="listClass()">
        @if (home(); as homeItem) {
          <li class="flex items-center gap-1">
            @if (!homeItem.disabled) {
              <a
                [href]="homeItem.url ?? null"
                [target]="homeItem.target ?? null"
                [attr.aria-label]="homeAriaLabel()"
                class="flex items-center gap-1 text-surface-500 hover:text-surface-700 hover:underline dark:text-surface-400 dark:hover:text-surface-200"
                (click)="itemSelect.emit({ item: homeItem, event: $event })"
              >
                @if (itemTemplate(); as t) {
                  <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: homeItem }" />
                } @else {
                  <med-icon [name]="homeItem.icon ?? 'home'" variant="mini" class="size-4" />
                  @if (homeItem.label) {
                    {{ homeItem.label }}
                  }
                }
              </a>
            } @else {
              <span class="flex items-center gap-1 text-surface-400 dark:text-surface-500" aria-disabled="true">
                @if (itemTemplate(); as t) {
                  <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: homeItem }" />
                } @else {
                  <med-icon [name]="homeItem.icon ?? 'home'" variant="mini" class="size-4" />
                  @if (homeItem.label) {
                    {{ homeItem.label }}
                  }
                }
              </span>
            }
            @if (visibleItems().length > 0) {
              @if (separatorTemplate(); as t) {
                <ng-container [ngTemplateOutlet]="t" />
              } @else {
                <med-icon name="chevron-right" variant="mini" class="size-4 text-surface-300 dark:text-surface-600" />
              }
            }
          </li>
        }
        @for (item of visibleItems(); track item; let last = $last) {
          <li class="flex items-center gap-1">
            @if (!last && !item.disabled) {
              <a
                [href]="item.url ?? null"
                [target]="item.target ?? null"
                class="flex items-center gap-1 text-surface-500 hover:text-surface-700 hover:underline dark:text-surface-400 dark:hover:text-surface-200"
                (click)="itemSelect.emit({ item, event: $event })"
              >
                @if (itemTemplate(); as t) {
                  <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: item }" />
                } @else {
                  @if (item.icon) {
                    <med-icon [name]="item.icon" variant="mini" class="size-4" />
                  }
                  {{ item.label }}
                }
              </a>
            } @else {
              <span
                class="flex items-center gap-1"
                [class]="last ? 'font-medium text-surface-900 dark:text-surface-50' : 'text-surface-400 dark:text-surface-500'"
                [attr.aria-current]="last ? 'page' : null"
                [attr.aria-disabled]="!last && item.disabled ? 'true' : null"
              >
                @if (itemTemplate(); as t) {
                  <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: item }" />
                } @else {
                  @if (item.icon) {
                    <med-icon [name]="item.icon" variant="mini" class="size-4" />
                  }
                  {{ item.label }}
                }
              </span>
            }
            @if (!last) {
              @if (separatorTemplate(); as t) {
                <ng-container [ngTemplateOutlet]="t" />
              } @else {
                <med-icon name="chevron-right" variant="mini" class="size-4 text-surface-300 dark:text-surface-600" />
              }
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  readonly items = input<readonly BreadcrumbItem[]>([]);
  readonly home = input<BreadcrumbHomeItem | null>(null);
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Breadcrumb');
  /** Accessible name for `home()` — needed since it's commonly icon-only. Default is English, see above. */
  readonly homeAriaLabel = input('Home');
  readonly class = input('', { alias: 'class' });

  readonly itemSelect = output<{ item: BreadcrumbItem | BreadcrumbHomeItem; event: MouseEvent }>();

  protected readonly itemTemplate = contentChild('item', { read: TemplateRef });
  protected readonly separatorTemplate = contentChild('separator', { read: TemplateRef });

  protected readonly listClass = computed(() => mergeClasses('flex flex-wrap items-center gap-1 text-sm', this.class()));
  /** `visible: false` items are filtered out entirely before rendering — `$last` in the template's `@for` then naturally means "the last *visible* item," not just the last array entry. */
  protected readonly visibleItems = computed(() => this.items().filter((item) => item.visible ?? true));
}
