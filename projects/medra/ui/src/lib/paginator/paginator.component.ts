import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, input, model, numberAttribute, output, signal, viewChildren } from '@angular/core';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';

export interface PaginatorPageEvent {
  readonly first: number;
  readonly rows: number;
  readonly page: number;
  readonly pageCount: number;
}

/**
 * Paginator primitive (Tier 1). `first` (0-based index of the first record
 * on the current page) is a `model()` for simple `[(first)]` two-way
 * binding; `(pageChange)` additionally emits the full `{ first, rows, page,
 * pageCount }` for consumers that want page-count context in the same
 * handler (e.g. to disable a "load more" affordance).
 *
 * **Scope reduction for v1**: the page-number window is a plain contiguous
 * range centered on the current page (clamped at the edges) — no pinned
 * first/last page + ellipsis (`1 … 4 5 [6] 7 8 … 42`) like some paginators.
 * Simpler, and can be layered on later without an API change.
 *
 * **Roving-tabindex toolbar (Wave 2 fix — 2026-08-19):** Previous, every
 * visible page number, and Next together form a single `role="toolbar"`
 * with one shared Tab stop (ARIA APG pattern, same as `Dock`/`Steps`) —
 * ArrowLeft/Right move the roving stop with wraparound, Home/End jump to
 * the first/last *enabled* control, and a disabled Prev/Next (native
 * `[disabled]`, already unfocusable) is skipped over rather than being a
 * dead stop. The roving stop defaults to whichever control represents the
 * current page (falling back to the first enabled control if that page
 * somehow isn't in the enabled set), the same "land on the active one"
 * default `SelectButtonComponent` already uses for its own roving tabindex.
 *
 * `rowsPerPageOptions` (default `null`, hidden — "opt-in, absent by default") renders a plain
 * native `<select>` for choosing the page size, not the full `SelectComponent` overlay machinery:
 * this is a single, small, always-visible control, not a combobox with search/
 * virtualization/keyboard-panel needs. `rows` became a `model()` (was a plain `input()`) so the
 * dropdown can update it directly — existing one-way `[rows]="x"` consumers (DataTable, DataView)
 * are unaffected, since a `model()` input still accepts one-way binding exactly like a regular
 * `input()` does. Picking a new page size resets `first` to `0` (the current page's row offset is
 * almost never still valid at a different page size) and re-emits `pageChange` with the new state,
 * same as any other navigation action here.
 *
 * **`showFirstLastIcon`, `showJumpToPageInput`**, API
 *.
 *
 * **`showFirstLastIcon` defaults to `false`**: this component's roving-tabindex toolbar (Wave 2
 * fix) already has every consumer's keyboard behavior (Arrow/Home/End wraparound across `[Prev,
 * ...pages, Next]`) locked in — defaulting it to `true` would silently insert two more slots into
 * that sequence for every existing consumer, changing where Home/End/wraparound land without anyone
 * asking for it. Opt-in instead, same "opt-in, absent by default" shape `rowsPerPageOptions` on
 * this same component already uses. When on, First/Last join the roving toolbar as `[First, Prev,
 * ...pages, Next, Last]` — disabled together with Prev/Next respectively (first page reached = both
 * First and Prev disabled).
 *
 * **`showJumpToPageInput`** is a plain `<input type="number">` showing/setting the 1-based current
 * page directly, committed on Enter or blur. There is no dropdown variant listing every page
 * number: a `<select>` with one `<option>` per page doesn't scale past a moderate page count, and
 * `pageLinkCount`'s existing windowed page buttons already cover fast navigation through a large
 * page range; the number input covers "I know exactly which page I want" without that ceiling. It's
 * a plain standalone control (not part of the roving toolbar), same as the existing
 * `rowsPerPageOptions` `<select>` right next to it.
 */
@Component({
  selector: 'med-paginator',
  standalone: true,
  imports: [ButtonDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (alwaysShow() || pageCount() > 1) {
    <nav [attr.aria-label]="ariaLabel()" class="flex flex-wrap items-center justify-between gap-3 text-sm">
      @if (showSummary() && totalRecords() > 0) {
        <span class="text-surface-500 dark:text-surface-400">{{ summaryLabel() }}</span>
      }
      <ul class="flex items-center gap-1" role="toolbar" [attr.aria-label]="ariaLabel()">
        @if (showFirstLastIcon()) {
          <li>
            <button
              #navButton
              medButton
              type="button"
              variant="text"
              severity="secondary"
              iconOnly
              [disabled]="!canPrev()"
              [tabIndex]="tabIndexFor(firstButtonSlot())"
              [attr.aria-label]="firstPageLabel()"
              (click)="goToPage(0)"
              (focus)="onFocus(firstButtonSlot())"
              (keydown)="onKeydown($event, firstButtonSlot())"
            >
              <med-icon name="chevron-double-left" variant="mini" />
            </button>
          </li>
        }
        <li>
          <button
            #navButton
            medButton
            type="button"
            variant="text"
            severity="secondary"
            iconOnly
            [disabled]="!canPrev()"
            [tabIndex]="tabIndexFor(prevButtonSlot())"
            [attr.aria-label]="previousLabel()"
            (click)="prev()"
            (focus)="onFocus(prevButtonSlot())"
            (keydown)="onKeydown($event, prevButtonSlot())"
          >
            <med-icon name="chevron-left" variant="mini" />
          </button>
        </li>
        @for (page of visiblePages(); track page; let i = $index) {
          <li>
            <button
              #navButton
              medButton
              type="button"
              size="sm"
              [variant]="page === currentPage() ? 'filled' : 'text'"
              [severity]="page === currentPage() ? 'primary' : 'secondary'"
              [attr.aria-current]="page === currentPage() ? 'page' : null"
              [attr.aria-label]="pageLabel() + ' ' + (page + 1)"
              [tabIndex]="tabIndexFor(pageSlotOffset() + i)"
              (click)="goToPage(page)"
              (focus)="onFocus(pageSlotOffset() + i)"
              (keydown)="onKeydown($event, pageSlotOffset() + i)"
            >
              {{ page + 1 }}
            </button>
          </li>
        }
        <li>
          <button
            #navButton
            medButton
            type="button"
            variant="text"
            severity="secondary"
            iconOnly
            [disabled]="!canNext()"
            [tabIndex]="tabIndexFor(nextButtonSlot())"
            [attr.aria-label]="nextLabel()"
            (click)="next()"
            (focus)="onFocus(nextButtonSlot())"
            (keydown)="onKeydown($event, nextButtonSlot())"
          >
            <med-icon name="chevron-right" variant="mini" />
          </button>
        </li>
        @if (showFirstLastIcon()) {
          <li>
            <button
              #navButton
              medButton
              type="button"
              variant="text"
              severity="secondary"
              iconOnly
              [disabled]="!canNext()"
              [tabIndex]="tabIndexFor(lastButtonSlot())"
              [attr.aria-label]="lastPageLabel()"
              (click)="goToPage(pageCount() - 1)"
              (focus)="onFocus(lastButtonSlot())"
              (keydown)="onKeydown($event, lastButtonSlot())"
            >
              <med-icon name="chevron-double-right" variant="mini" />
            </button>
          </li>
        }
      </ul>
      @if (showJumpToPageInput()) {
        <label class="flex items-center gap-1.5 text-surface-500 dark:text-surface-400">
          {{ jumpToPageLabel() }}
          <input
            type="number"
            min="1"
            [max]="pageCount()"
            class="w-14 rounded-md border border-surface-300 bg-transparent px-2 py-1 text-surface-900 dark:border-surface-700 dark:text-surface-50"
            [attr.aria-label]="jumpToPageLabel()"
            [value]="currentPage() + 1"
            (change)="onJumpToPage($event)"
          />
        </label>
      }
      @if (rowsPerPageOptions()) {
        <label class="flex items-center gap-1.5 text-surface-500 dark:text-surface-400">
          {{ rowsPerPageLabel() }}
          <select
            class="rounded-md border border-surface-300 bg-transparent py-1 pr-6 pl-2 text-surface-900 dark:border-surface-700 dark:text-surface-50"
            [attr.aria-label]="rowsPerPageLabel()"
            [value]="rows()"
            (change)="onRowsChange($event)"
          >
            @for (option of rowsPerPageOptions(); track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        </label>
      }
    </nav>
    }
  `,
})
export class PaginatorComponent {
  readonly totalRecords = input(0, { transform: numberAttribute });
  readonly rows = model(10);
  readonly rowsPerPageOptions = input<readonly number[] | null>(null);
  readonly pageLinkCount = input(5, { transform: numberAttribute });
  readonly showSummary = input(true, { transform: booleanAttribute });
  readonly alwaysShow = input(true, { transform: booleanAttribute });
  /** Default `false`, see class doc. */
  readonly showFirstLastIcon = input(false, { transform: booleanAttribute });
  readonly showJumpToPageInput = input(false, { transform: booleanAttribute });
  readonly first = model(0);

  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Pagination');
  readonly previousLabel = input('Previous page');
  readonly nextLabel = input('Next page');
  readonly firstPageLabel = input('First page');
  readonly lastPageLabel = input('Last page');
  readonly pageLabel = input('Page');
  readonly rowsPerPageLabel = input('Rows per page');
  readonly jumpToPageLabel = input('Go to page');
  readonly currentPageReportTemplate = input<string | null>(null);
  readonly summaryLabelTemplate = input<(first: number, last: number, total: number) => string>(
    (first, last, total) => `Showing ${first}-${last} of ${total}`,
  );

  readonly pageChange = output<PaginatorPageEvent>();

  /** ARIA APG toolbar pattern: one tab stop for [Prev, ...pages, Next] as a whole, Arrow keys roving-focus between the enabled controls (Wave 2 fix — previously every page button was independently tabbable and Prev/Next had no Arrow-key relationship to them at all). */
  private readonly rovingIndex = signal(0);

  private readonly navButtons = viewChildren<ElementRef<HTMLButtonElement>>('navButton');

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.totalRecords() / Math.max(1, this.rows()))));
  protected readonly currentPage = computed(() => Math.min(this.pageCount() - 1, Math.floor(this.first() / Math.max(1, this.rows()))));
  protected readonly canPrev = computed(() => this.currentPage() > 0);
  protected readonly canNext = computed(() => this.currentPage() < this.pageCount() - 1);

  protected readonly visiblePages = computed(() => {
    const pageCount = this.pageCount();
    const windowSize = Math.min(this.pageLinkCount(), pageCount);
    const current = this.currentPage();
    let start = Math.max(0, current - Math.floor(windowSize / 2));
    const end = Math.min(pageCount, start + windowSize);
    start = Math.max(0, end - windowSize);
    return Array.from({ length: end - start }, (_, i) => start + i);
  });

  protected readonly summaryLabel = computed(() => {
    const total = this.totalRecords();
    const first = total === 0 ? 0 : Math.min(total, this.first() + 1);
    const last = Math.min(total, this.first() + this.rows());
    const reportTemplate = this.currentPageReportTemplate();
    if (reportTemplate !== null) {
      return reportTemplate
        .replaceAll('{first}', String(first))
        .replaceAll('{last}', String(last))
        .replaceAll('{totalRecords}', String(total))
        .replaceAll('{currentPage}', String(this.currentPage() + 1))
        .replaceAll('{totalPages}', String(this.pageCount()))
        .replaceAll('{rows}', String(this.rows()));
    }
    return this.summaryLabelTemplate()(first, last, total);
  });

  /** Roving toolbar slot layout: `[First?, Prev, ...pages, Next, Last?]` — `First`/`Last` only occupy a slot when `showFirstLastIcon()` is on, see class doc. */
  protected readonly firstButtonSlot = computed(() => (this.showFirstLastIcon() ? 0 : -1));
  protected readonly prevButtonSlot = computed(() => (this.showFirstLastIcon() ? 1 : 0));
  protected readonly pageSlotOffset = computed(() => this.prevButtonSlot() + 1);
  protected readonly nextButtonSlot = computed(() => this.pageSlotOffset() + this.visiblePages().length);
  protected readonly lastButtonSlot = computed(() => (this.showFirstLastIcon() ? this.nextButtonSlot() + 1 : -1));

  protected prev(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected next(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected goToPage(page: number): void {
    const clamped = Math.min(this.pageCount() - 1, Math.max(0, page));
    this.first.set(clamped * this.rows());
    this.pageChange.emit({ first: this.first(), rows: this.rows(), page: clamped, pageCount: this.pageCount() });
  }

  protected onRowsChange(event: Event): void {
    const rows = Number((event.target as HTMLSelectElement).value);
    this.rows.set(rows);
    this.first.set(0);
    this.pageChange.emit({ first: 0, rows, page: 0, pageCount: this.pageCount() });
  }

  /** Commits on `change` (Enter or blur) — clamps to `[1, pageCount()]`, same clamping `goToPage()` already applies for any other navigation action. */
  protected onJumpToPage(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isNaN(value)) {
      return;
    }
    this.goToPage(value - 1);
  }

  /** Total toolbar slots: `[First?, Prev, ...visiblePages, Next, Last?]`, see `firstButtonSlot`/etc. above. */
  private slotCount(): number {
    return (this.lastButtonSlot() >= 0 ? this.lastButtonSlot() : this.nextButtonSlot()) + 1;
  }

  private isSlotEnabled(slot: number): boolean {
    if (slot === this.firstButtonSlot() || slot === this.prevButtonSlot()) {
      return this.canPrev();
    }
    if (slot === this.nextButtonSlot() || slot === this.lastButtonSlot()) {
      return this.canNext();
    }
    return true; // page-number slots are always clickable
  }

  private enabledSlots(): number[] {
    return Array.from({ length: this.slotCount() }, (_, i) => i).filter((i) => this.isSlotEnabled(i));
  }

  /** Falls back to the current page's slot (or the first enabled slot) if the last-focused control became disabled/out of range, e.g. after `totalRecords`/`first` changed under the toolbar. */
  private effectiveRovingIndex(): number {
    const enabled = this.enabledSlots();
    if (enabled.length === 0) {
      return 0;
    }
    const current = this.rovingIndex();
    if (enabled.includes(current)) {
      return current;
    }
    const currentPageSlot = this.visiblePages().indexOf(this.currentPage()) + this.pageSlotOffset();
    if (currentPageSlot >= this.pageSlotOffset() && enabled.includes(currentPageSlot)) {
      return currentPageSlot;
    }
    return enabled[0];
  }

  /** Roving tabindex: only the current roving control is in the Tab order (`0`); every other enabled control is `-1` and reachable via Arrow keys instead. */
  protected tabIndexFor(slot: number): number {
    return this.effectiveRovingIndex() === slot ? 0 : -1;
  }

  /** Focusing a control (Tab, or a roving-tabindex Arrow move) makes it the toolbar's single tab stop. */
  protected onFocus(slot: number): void {
    this.rovingIndex.set(slot);
  }

  protected onKeydown(event: KeyboardEvent, slot: number): void {
    const enabled = this.enabledSlots();
    if (enabled.length === 0) {
      return;
    }

    const position = enabled.indexOf(slot);
    let targetSlot: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        targetSlot = enabled[(position + 1 + enabled.length) % enabled.length];
        break;
      case 'ArrowLeft':
        event.preventDefault();
        targetSlot = enabled[(position - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        event.preventDefault();
        targetSlot = enabled[0];
        break;
      case 'End':
        event.preventDefault();
        targetSlot = enabled[enabled.length - 1];
        break;
    }

    if (targetSlot !== null) {
      this.rovingIndex.set(targetSlot);
      this.navButtons()[targetSlot]?.nativeElement.focus();
    }
  }
}
