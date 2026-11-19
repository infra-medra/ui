import { ChangeDetectionStrategy, Component, ElementRef, computed, input, model, viewChildren } from '@angular/core';
import { MenuRouterLinkDirective } from '../menu/menu-router-link.directive';
import { visibleEntries } from '../menu/menu-visibility';
import { MenuItem } from '../menu/menu.types';
import { mergeClasses } from '../utils/merge-classes';

/**
 * TabMenu primitive (Tier 4, last item — completes Tier 4). Visually the
 * same tab bar `TabsComponent` renders (same roving-tabindex "automatic
 * activation" keyboard model: Arrow keys both move focus and switch the
 * active item immediately, Home/End jump to the first/last enabled one),
 * but driven by `items` (`MenuItem[]`, the same label/command/disabled
 * shape Menu/SplitButton/ContextMenu/Dock already share) instead of owning
 * projected `<med-tab>` content panels — confirmed as a real, distinct
 * component from `TabsComponent` (roadmap/decisoes-produto.md, 2026-07-02): this
 * one is pure navigation, each item's `command()` is responsible for
 * whatever happens next (routing, swapping some other view), it never
 * renders a panel of its own.
 */
@Component({
  selector: 'med-tab-menu',
  standalone: true,
  imports: [MenuRouterLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div role="tablist" [attr.aria-label]="ariaLabel()" [class]="tabListClass()">
      @for (entry of entries(); track entry.item) {
        @let item = entry.item;
        @let i = entry.index;
        @if (item.routerLink !== undefined && !item.disabled) {
          <a
            #tabButton
            role="tab"
            [medMenuRouterLink]="item"
            [target]="item.target ?? null"
            [attr.aria-selected]="i === activeIndex()"
            [tabIndex]="i === activeIndex() ? 0 : -1"
            [class]="tabButtonClass(item, i)"
            (click)="onActivate(item, i)"
            (keydown)="onKeydown($event, i)"
          >
            {{ item.label }}
            @if (item.badge) {
              <span class="ml-1.5 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item.badge }}</span>
            }
          </a>
        } @else if (item.url && !item.disabled) {
          <a
            #tabButton
            role="tab"
            [href]="item.url"
            [target]="item.target ?? null"
            [attr.aria-selected]="i === activeIndex()"
            [tabIndex]="i === activeIndex() ? 0 : -1"
            [class]="tabButtonClass(item, i)"
            (click)="onActivate(item, i)"
            (keydown)="onKeydown($event, i)"
          >
            {{ item.label }}
            @if (item.badge) {
              <span class="ml-1.5 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item.badge }}</span>
            }
          </a>
        } @else {
          <button
            #tabButton
            type="button"
            role="tab"
            [attr.aria-selected]="i === activeIndex()"
            [attr.aria-disabled]="item.disabled ? 'true' : null"
            [tabIndex]="i === activeIndex() ? 0 : -1"
            [class]="tabButtonClass(item, i)"
            (click)="onActivate(item, i)"
            (keydown)="onKeydown($event, i)"
          >
            {{ item.label }}
            @if (item.badge) {
              <span class="ml-1.5 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item.badge }}</span>
            }
          </button>
        }
      }
    </div>
  `,
})
export class TabMenuComponent {
  readonly items = input<readonly MenuItem[]>([]);
  readonly activeIndex = model(0);
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Tab menu');
  readonly class = input('', { alias: 'class' });

  /** Visible items paired with their index in the original `items` array — `activeIndex` keeps pointing at the same tab when another one is hidden (D-04). */
  protected readonly entries = computed(() => visibleEntries(this.items()));

  private readonly tabButtons = viewChildren<ElementRef<HTMLElement>>('tabButton');

  protected readonly tabListClass = computed(() =>
    mergeClasses(
      'flex gap-1 overflow-x-auto overflow-y-hidden border-b border-surface-200 [scrollbar-width:thin] dark:border-surface-700 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-300 dark:[&::-webkit-scrollbar-thumb]:bg-surface-600',
      this.class(),
    ),
  );

  protected tabButtonClass(item: MenuItem, index: number): string {
    const isActive = index === this.activeIndex();
    return mergeClasses(
      '-mb-px shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-(--transition-duration-base)',
      isActive
        ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
        : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200',
      item.disabled ? 'cursor-not-allowed opacity-(--opacity-disabled)' : 'cursor-pointer',
    );
  }

  protected onActivate(item: MenuItem, index: number): void {
    if (item.disabled) {
      return;
    }
    this.activeIndex.set(index);
    item.command?.();
  }

  protected onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const entries = this.entries();
    const enabled = entries.filter((entry) => !entry.item.disabled);
    if (enabled.length === 0) {
      return;
    }

    let target: (typeof enabled)[number] | null = null;
    const position = enabled.findIndex((entry) => entry.index === currentIndex);
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        target = enabled[(position + 1 + enabled.length) % enabled.length];
        break;
      case 'ArrowLeft':
        event.preventDefault();
        target = enabled[(position - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        event.preventDefault();
        target = enabled[0];
        break;
      case 'End':
        event.preventDefault();
        target = enabled[enabled.length - 1];
        break;
    }

    if (target) {
      this.onActivate(target.item, target.index);
      // `tabButtons` follows the rendered (filtered) order, not the original indexes.
      this.tabButtons()[entries.indexOf(target)]?.nativeElement.focus();
    }
  }
}
