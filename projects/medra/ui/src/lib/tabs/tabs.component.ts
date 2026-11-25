import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, booleanAttribute, computed, contentChildren, effect, inject, input, model, signal, viewChild, viewChildren } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { TabComponent } from './tab.component';

let nextTabsId = 0;

/**
 * Tabs primitive (Tier 1). Panels are declared as real content children
 * (`<med-tabs><med-tab header="...">...</med-tab></med-tabs>`), not a
 * separate `tabs` data input + a matching index-based `<ng-content>` slot —
 * keeps arbitrary rich content per tab simple to author. `activeIndex` is a
 * `model()` for `[(activeIndex)]`.
 *
 * Keyboard model is "automatic activation" (ARIA APG Tabs pattern): arrow
 * keys both move focus AND switch the active tab immediately, using a
 * roving `tabindex` (only the active tab button is in the Tab order; arrow
 * keys move real DOM focus between the tab buttons, skipping disabled
 * ones) — not `aria-activedescendant`, since these are real, independently
 * focusable buttons, unlike Select/Menu's synthetic list rows.
 *
 * Responsive behavior follows Material Design 3's "scrollable tabs"
 * guidance (see m3.material.io/components/tabs/guidelines) rather than
 * hiding overflowing tabs behind a menu: each tab keeps its natural,
 * content-driven width (`shrink-0`), and the row scrolls horizontally
 * (`overflow-x-auto`) once the tabs don't fit — the same touch-scrollable
 * pattern M3 specifies, not a custom pattern of this library's own
 * invention. An earlier version of this component measured available space
 * and moved overflowing tabs into a "More tabs" menu instead; that was
 * reverted in favor of this simpler, spec-aligned behavior.
 *
 * **`showNavigators`**. This is *not* a reversal of the "no More-tabs-menu" decision above — it's a
 * complementary, opt-in pair of scroll-left/scroll-right buttons layered onto the same
 * `overflow-x-auto` row (still natively touch/drag-scrollable either way), for pointer/keyboard
 * users who'd rather click an arrow than drag. Default `false` (off): this component's existing
 * scrollable-row behavior is completely unchanged for every current consumer. Each button only
 * renders when that direction is actually scrollable right now (`canScrollPrev`/`canScrollNext`,
 * measured off the tab list element's real `scrollLeft`/`scrollWidth`/ `clientWidth`), kept in sync
 * via a `scroll` listener plus a `ResizeObserver` on the tab list itself (catches tabs being added/
 * removed or the container resizing without a scroll event), both wired up client-only inside
 * `afterNextRender()` — same SSR/hydration-safe pattern `CarouselComponent`'s/`GalleriaComponent`'s
 * own `resize` listeners already use, just scoped to one element via `ResizeObserver` instead of
 * the whole window. Clicking a button scrolls by 80% of the visible width (`scrollBy({ behavior:
 * 'smooth' })`) — a fixed "page" amount, not scrolling straight to the next/previous individual tab
 * boundary, since tabs have no fixed width to align a page to.
 */
@Component({
  selector: 'med-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [IconComponent, NgTemplateOutlet],
  template: `
    <div class="flex items-center gap-1">
      @if (showNavigators() && canScrollPrev()) {
        <button
          type="button"
          class="shrink-0 rounded p-1 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          [attr.aria-label]="scrollPrevLabel()"
          (click)="scrollBy(-1)"
        >
          <med-icon name="chevron-left" variant="mini" class="size-4" />
        </button>
      }
      <div #tabList role="tablist" [attr.aria-label]="ariaLabel()" [class]="tabListClass()" (scroll)="updateScrollState()">
        @for (tab of tabs(); track tab; let i = $index) {
          <button
            #tabButton
            type="button"
            role="tab"
            [id]="tabButtonId(i)"
            [attr.aria-selected]="i === activeIndex()"
            [attr.aria-controls]="panelId(i)"
            [attr.aria-disabled]="tab.disabled() ? 'true' : null"
            [tabIndex]="i === activeIndex() ? 0 : -1"
            [class]="tabButtonClass(tab, i)"
            (click)="selectIndex(i)"
            (keydown)="onKeydown($event, i)"
          >
            @if (tab.headerTemplate(); as headerTemplate) {
              <ng-container [ngTemplateOutlet]="headerTemplate" />
            } @else {
              {{ tab.header() }}
            }
          </button>
        }
      </div>
      @if (showNavigators() && canScrollNext()) {
        <button
          type="button"
          class="shrink-0 rounded p-1 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          [attr.aria-label]="scrollNextLabel()"
          (click)="scrollBy(1)"
        >
          <med-icon name="chevron-right" variant="mini" class="size-4" />
        </button>
      }
    </div>
    <ng-content />
  `,
})
export class TabsComponent {
  readonly activeIndex = model(0);
  readonly showNavigators = input(false, { transform: booleanAttribute });
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Tabs');
  readonly scrollPrevLabel = input('Scroll tabs left');
  readonly scrollNextLabel = input('Scroll tabs right');
  readonly class = input('', { alias: 'class' });

  private readonly instanceId = nextTabsId++;
  protected readonly tabs = contentChildren(TabComponent);
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  private readonly tabList = viewChild<ElementRef<HTMLElement>>('tabList');

  protected readonly canScrollPrev = signal(false);
  protected readonly canScrollNext = signal(false);

  /**
   * `overflow-x-auto` with a thin custom scrollbar (same treatment as the
   * DatePicker's year list) instead of the browser's default: a chunky OS
   * scrollbar under a one-line tab bar reads as more of a layout glitch than
   * an affordance, especially since M3 scrollable tabs are meant to be
   * driven by touch/drag, not scrollbar-dragging. `overflow-y-hidden` is
   * required, not cosmetic: setting only `overflow-x` leaves `overflow-y` at
   * its default `visible`, and per the CSS Overflow spec a browser silently
   * promotes a `visible` axis to `auto` the moment the other axis isn't
   * `visible` — so the tab row (whose `-mb-px` border-overlap trick leaves
   * ~1px of vertical overflow) was popping a real vertical scrollbar under a
   * single-line tab bar.
   */
  protected readonly tabListClass = computed(() =>
    mergeClasses(
      'flex gap-1 overflow-x-auto overflow-y-hidden border-b border-surface-200 [scrollbar-width:thin] dark:border-surface-700 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-300 dark:[&::-webkit-scrollbar-thumb]:bg-surface-600',
      this.class(),
    ),
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const tabs = this.tabs();
      const active = this.activeIndex();
      tabs.forEach((tab, i) => {
        tab.active.set(i === active);
        tab.panelId.set(this.panelId(i));
        tab.tabButtonId.set(this.tabButtonId(i));
      });
    });

    // Re-measures whenever a tab is added/removed — a `ResizeObserver` on the
    // tab list alone wouldn't catch this: adding a tab can grow `scrollWidth`
    // without the list's own (container-constrained) box size changing at all.
    effect(() => {
      this.tabs();
      if (this.showNavigators()) {
        this.updateScrollState();
      }
    });

    afterNextRender(() => {
      if (!this.showNavigators()) {
        return;
      }
      this.updateScrollState();
      const el = this.tabList()?.nativeElement;
      if (!el) {
        return;
      }
      const observer = new ResizeObserver(() => this.updateScrollState());
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Real measurement off the tab list's own `scrollLeft`/`scrollWidth`/`clientWidth` — see class doc. */
  protected updateScrollState(): void {
    const el = this.tabList()?.nativeElement;
    if (!el) {
      return;
    }
    this.canScrollPrev.set(el.scrollLeft > 0);
    this.canScrollNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  protected scrollBy(direction: 1 | -1): void {
    const el = this.tabList()?.nativeElement;
    if (!el) {
      return;
    }
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  protected tabButtonId(index: number): string {
    return `med-tabs-${this.instanceId}-tab-${index}`;
  }

  protected panelId(index: number): string {
    return `med-tabs-${this.instanceId}-panel-${index}`;
  }

  protected tabButtonClass(tab: TabComponent, index: number): string {
    const isActive = index === this.activeIndex();
    return mergeClasses(
      '-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-(--transition-duration-base)',
      isActive
        ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
        : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200',
      tab.disabled() ? 'cursor-not-allowed opacity-(--opacity-disabled)' : 'cursor-pointer',
    );
  }

  protected selectIndex(index: number): void {
    const tab = this.tabs()[index];
    if (!tab || tab.disabled()) {
      return;
    }
    this.activeIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const tabs = this.tabs();
    const enabled = tabs.map((tab, i) => (tab.disabled() ? -1 : i)).filter((i) => i !== -1);
    if (enabled.length === 0) {
      return;
    }

    let targetIndex: number | null = null;
    const position = enabled.indexOf(currentIndex);
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        targetIndex = enabled[(position + 1 + enabled.length) % enabled.length];
        break;
      case 'ArrowLeft':
        event.preventDefault();
        targetIndex = enabled[(position - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = enabled[0];
        break;
      case 'End':
        event.preventDefault();
        targetIndex = enabled[enabled.length - 1];
        break;
    }

    if (targetIndex !== null) {
      this.selectIndex(targetIndex);
      this.tabButtons()[targetIndex]?.nativeElement.focus();
    }
  }
}
