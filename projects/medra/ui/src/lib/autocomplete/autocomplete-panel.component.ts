import { NgTemplateOutlet } from '@angular/common';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, effect, input, output, viewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { buildPanelRows, PanelRow } from '../select/select-panel.component';
import { selectOptionVariants } from '../select/select.styles';
import { SelectOption } from '../select/select.types';
import { AutocompleteGroupContext, AutocompleteItemContext } from './autocomplete.types';

/** How many rows from the end of the virtual list count as "near the end" for `lazy`. */
const NEAR_END_ROWS = 10;

/**
 * Internal overlay content for Autocomplete (not part of the public API).
 * Deliberately not a reuse of `SelectPanelComponent`: this pattern (WAI-ARIA
 * APG "Editable Combobox With List Autocomplete") keeps real DOM focus on
 * the host `<input>` the whole time the panel is open — `aria-activedescendant`
 * on that input just points assistive tech at a row here. So unlike
 * `SelectPanelComponent`, this panel never calls `.focus()` on itself and
 * owns no keydown handling or internal active-index state at all —
 * `AutocompleteComponent` drives `activeIndex` (arrow keys happen on the
 * input) and only reacts to pointer selection/hover here.
 *
 * Rows are a plain `@for` by default, because `suggestions` are usually an
 * already-filtered handful of matches. With `virtualScroll` they render
 * through a `cdk-virtual-scroll-viewport` of fixed-height rows (group headers
 * flattened into rows by `buildPanelRows`, like `SelectPanelComponent`), so a
 * list of thousands keeps only the visible rows in the DOM. Row styling
 * reuses `selectOptionVariants` directly rather than duplicating the CVA.
 *
 * While `loading` is on and the consumer provides a `#loader` template, the
 * panel shows that template in place of the list. `AutocompleteComponent` only
 * opens the panel once a dispatched search has settled (see its
 * `scheduleSearch()`/`openWhenSearchSettles`), so a typed search never shows
 * the loader; it appears when `loading` turns on with the panel already open.
 *
 * Grouping (`SelectOption.group`) is supported here too, via
 * `isGroupStart()` — non-virtualized, so it's a plain header row inserted
 * ahead of the first option of each group rather than the row-list
 * flattening `SelectPanelComponent` needs for its virtual scroll.
 */
@Component({
  selector: 'med-autocomplete-panel',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div [id]="panelId()" role="listbox" class="py-1" [class.overflow-y-auto]="!virtualScroll()" [style.max-height]="scrollHeight()">
      @if (loading() && loaderTemplate(); as loader) {
        <ng-container [ngTemplateOutlet]="loader" />
      } @else if (options().length === 0) {
        @if (emptyTemplate(); as empty) {
          <ng-container [ngTemplateOutlet]="empty" />
        } @else {
          <p class="px-3 py-2 text-sm text-surface-400 dark:text-surface-500">{{ emptyLabel() }}</p>
        }
      } @else if (virtualScroll()) {
        <cdk-virtual-scroll-viewport #viewport [itemSize]="virtualScrollItemSize()" [style.height]="viewportHeight()">
          <div *cdkVirtualFor="let row of rows(); trackBy: trackByRow">
            @if (row.kind === 'group') {
              <ng-container [ngTemplateOutlet]="groupRow" [ngTemplateOutletContext]="{ $implicit: row.label }" />
            } @else {
              <ng-container [ngTemplateOutlet]="optionRow" [ngTemplateOutletContext]="{ $implicit: row.option, index: row.flatIndex }" />
            }
          </div>
        </cdk-virtual-scroll-viewport>
      } @else {
        @for (option of options(); track option.value; let i = $index) {
          @if (isGroupStart(i)) {
            <ng-container [ngTemplateOutlet]="groupRow" [ngTemplateOutletContext]="{ $implicit: option.group }" />
          }
          <ng-container [ngTemplateOutlet]="optionRow" [ngTemplateOutletContext]="{ $implicit: option, index: i }" />
        }
      }
    </div>

    <ng-template #groupRow let-label>
      <div role="presentation" class="truncate px-3 py-2 text-xs font-semibold text-surface-400 dark:text-surface-500" [style.height.px]="virtualScroll() ? virtualScrollItemSize() : null">
        @if (groupTemplate(); as groupTpl) {
          <ng-container [ngTemplateOutlet]="groupTpl" [ngTemplateOutletContext]="{ $implicit: label }" />
        } @else {
          {{ label }}
        }
      </div>
    </ng-template>

    <ng-template #optionRow let-option let-i="index">
      <div
        [id]="optionElementId(i)"
        role="option"
        [attr.aria-selected]="isSelected(option)"
        [attr.aria-disabled]="option.disabled ? 'true' : null"
        [class]="rowClass(option, i)"
        [style.height.px]="virtualScroll() ? virtualScrollItemSize() : null"
        (pointerdown)="onOptionPointerDown($event, option)"
        (pointerenter)="onOptionPointerEnter(i, option)"
      >
        @if (itemTemplate(); as itemTpl) {
          <span class="flex-1 truncate">
            <ng-container [ngTemplateOutlet]="itemTpl" [ngTemplateOutletContext]="{ $implicit: option, index: i }" />
          </span>
        } @else {
          <span class="flex-1 truncate">{{ option.label }}</span>
        }
        @if (isSelected(option)) {
          <med-icon name="check" variant="mini" class="size-4 shrink-0 text-brand-500 dark:text-brand-400" />
        }
      </div>
    </ng-template>
  `,
})
export class AutocompletePanelComponent<T = unknown> {
  readonly panelId = input.required<string>();
  readonly options = input.required<readonly SelectOption<T>[]>();
  readonly activeIndex = input(-1);
  /** A single value (single mode) or an array of them (`multiple` mode) — `isSelected` checks membership either way. */
  readonly selectedValue = input<T | readonly T[] | null>(null);
  readonly emptyLabel = input('No results found');
  /** Consumer templates (UI-019); each falls back to the default rendering when `null`. */
  readonly itemTemplate = input<TemplateRef<AutocompleteItemContext<T>> | null>(null);
  readonly groupTemplate = input<TemplateRef<AutocompleteGroupContext> | null>(null);
  readonly emptyTemplate = input<TemplateRef<void> | null>(null);
  readonly loaderTemplate = input<TemplateRef<void> | null>(null);
  /** While `true` and a `loaderTemplate` exists, the loader replaces the list. */
  readonly loading = input(false);
  /** Maximum height of the list as a CSS length; longer lists scroll inside it. Defaults to `'15rem'`. */
  readonly scrollHeight = input('15rem');
  /** Renders only the visible rows through a `cdk-virtual-scroll-viewport`. Defaults to `false`. */
  readonly virtualScroll = input(false);
  /** Fixed row height in px used by the virtual list. Defaults to `36`. */
  readonly virtualScrollItemSize = input(36);
  /** While `true`, emits `rangeChanged` when the virtual list scrolls near its end. Defaults to `false`. */
  readonly lazy = input(false);

  readonly optionSelect = output<SelectOption<T>>();
  readonly optionHover = output<number>();
  /** Visible row range, emitted in `lazy` mode when the list scrolls near its last rows. */
  readonly rangeChanged = output<{ first: number; last: number }>();

  private readonly viewportRef = viewChild(CdkVirtualScrollViewport);
  protected readonly rows = computed<PanelRow<T>[]>(() => buildPanelRows(this.options()));
  protected readonly trackByRow = (_index: number, row: PanelRow<T>) => (row.kind === 'group' ? `group:${row.label}` : row.option.value);
  /** The viewport has `contain: strict`, so it needs an explicit height: the content height, capped by `scrollHeight`. */
  protected readonly viewportHeight = computed(() => `min(${this.rows().length * this.virtualScrollItemSize()}px, calc(${this.scrollHeight()} - 0.5rem))`);

  /** Emits the rendered range once it reaches the last rows, so the consumer can append the next page. */
  private readonly emitRangeChanges = effect((onCleanup) => {
    const viewport = this.viewportRef();
    if (!viewport || !this.lazy()) {
      return;
    }
    const subscription = viewport.renderedRangeStream.subscribe((range) => {
      if (range.end >= this.rows().length - NEAR_END_ROWS) {
        this.rangeChanged.emit({ first: range.start, last: range.end });
      }
    });
    onCleanup(() => subscription.unsubscribe());
  });

  /** Keyboard navigation happens in `AutocompleteComponent` (see class doc) — this just follows `activeIndex` to keep the highlighted row in view. */
  private readonly scrollActiveIntoView = effect(() => {
    const index = this.activeIndex();
    if (index >= 0 && this.virtualScroll()) {
      this.scrollVirtualRowIntoView(index);
    } else if (index >= 0) {
      document.getElementById(this.optionElementId(index))?.scrollIntoView({ block: 'nearest' });
    }
  });

  /** Scrolls the viewport just enough to show `flatIndex`; its row may not be in the DOM yet. */
  private scrollVirtualRowIntoView(flatIndex: number): void {
    const viewport = this.viewportRef();
    if (!viewport) {
      return;
    }
    const rowIndex = this.rows().findIndex((row) => row.kind === 'option' && row.flatIndex === flatIndex);
    if (rowIndex < 0) {
      return;
    }
    const size = this.virtualScrollItemSize();
    const top = rowIndex * size;
    const current = viewport.measureScrollOffset();
    const height = viewport.getViewportSize();
    if (top < current) {
      viewport.scrollToOffset(top);
    } else if (top + size > current + height) {
      viewport.scrollToOffset(top + size - height);
    }
  }

  protected optionElementId(index: number): string {
    return `${this.panelId()}-option-${index}`;
  }

  /** True when `option` at `index` starts a new `group` — i.e. the group header should render right above it (see `SelectOption.group`). */
  protected isGroupStart(index: number): boolean {
    const option = this.options()[index];
    if (option.group === undefined) {
      return false;
    }
    return index === 0 || this.options()[index - 1].group !== option.group;
  }

  protected isSelected(option: SelectOption<T>): boolean {
    const selected = this.selectedValue();
    return Array.isArray(selected) ? selected.includes(option.value) : selected === option.value;
  }

  protected rowClass(option: SelectOption<T>, index: number): string {
    return selectOptionVariants({ active: index === this.activeIndex(), disabled: !!option.disabled });
  }

  protected onOptionPointerDown(event: Event, option: SelectOption<T>): void {
    // Keep focus on the host <input> — never let it jump anywhere else.
    event.preventDefault();
    if (!option.disabled) {
      this.optionSelect.emit(option);
    }
  }

  protected onOptionPointerEnter(index: number, option: SelectOption<T>): void {
    if (!option.disabled) {
      this.optionHover.emit(index);
    }
  }
}
