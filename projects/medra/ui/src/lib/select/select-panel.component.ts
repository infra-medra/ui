import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, OnInit, ChangeDetectionStrategy, Component, ElementRef, TemplateRef, booleanAttribute, computed, effect, input, output, signal, viewChild } from '@angular/core';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IconComponent } from '../icon/icon.component';
import { selectCheckboxIndicatorVariants, selectOptionVariants } from './select.styles';
import { isSameOptionValue } from './select-options';
import { SelectFilterMatchMode, SelectOption, SelectOptionContext } from './select.types';
import { mergeClasses } from '../utils/merge-classes';

function matchesFilter(candidate: string, text: string, mode: SelectFilterMatchMode): boolean {
  switch (mode) {
    case 'notContains':
      return !candidate.includes(text);
    case 'startsWith':
      return candidate.startsWith(text);
    case 'endsWith':
      return candidate.endsWith(text);
    case 'equals':
      return candidate === text;
    case 'notEquals':
      return candidate !== text;
    default:
      return candidate.includes(text);
  }
}

/** Row height in px — must match the `px-3 py-2 text-sm` row classes below; kept in sync manually since `CdkFixedSizeVirtualScroll` needs a fixed number, not a CSS value. */
const OPTION_ROW_HEIGHT = 36;

/**
 * `cdk-virtual-scroll-viewport` uses `contain: strict` internally, so it
 * never derives a height from its (virtualized) content the way a normal
 * element would — a bare `max-h-*` class alone left it collapsed to 0px
 * (panel looked empty even though rows were actually rendered underneath).
 * It needs an explicit pixel height, computed per open from the option
 * count so short lists don't reserve empty space below their last row.
 */
const MAX_PANEL_HEIGHT = 240;

/** One virtualized row: either a real option or a non-interactive group header (see `SelectOption.group`). */
export type PanelRow<T> = { readonly kind: 'option'; readonly option: SelectOption<T>; readonly flatIndex: number } | { readonly kind: 'group'; readonly label: string };

/** Never matches a real group label — lets the very first option's group render its header too. */
const NO_GROUP = Symbol('no-group');

/**
 * Flattens `options` into virtualized rows, inserting a `group` header row
 * right before the first option of each new (consecutive) group — pure and
 * exported so its behavior can be unit-tested directly, independent of
 * `cdk-virtual-scroll-viewport`'s DOM output (see the spec file for why that
 * matters: the viewport never lays out real rows in jsdom).
 */
export function buildPanelRows<T>(options: readonly SelectOption<T>[]): PanelRow<T>[] {
  const result: PanelRow<T>[] = [];
  let previousGroup: string | typeof NO_GROUP = NO_GROUP;
  options.forEach((option, flatIndex) => {
    if (option.group !== undefined && option.group !== previousGroup) {
      result.push({ kind: 'group', label: option.group });
    }
    previousGroup = option.group ?? NO_GROUP;
    result.push({ kind: 'option', option, flatIndex });
  });
  return result;
}

/**
 * Internal overlay content for both Select and MultiSelect (not part of the
 * public API — consumers only ever see `<med-select>`/`<med-multi-select>`).
 * Owns the whole `role="listbox"` + `aria-activedescendant` keyboard-nav
 * pattern (ARIA APG "Select-Only Combobox") so it isn't duplicated between
 * the two: `multiple` only changes the selection indicator (checkbox vs.
 * trailing check mark) and `aria-multiselectable` — whether an emitted
 * selection also closes the panel is entirely up to the owning component.
 *
 * Rows are virtualized (`CdkVirtualScrollViewport`, fixed row height): with
 * thousands of options, rendering one real `<li>` per row froze the panel on
 * open and made typing in the filter box janky — only the ~10-15 rows
 * actually visible are ever in the DOM, regardless of list size.
 *
 * Group headers (`rows()`) are just another fixed-height row in the same
 * virtualized list, not a nested `role="group"` — ARIA's grouped-listbox
 * pattern assumes every option DOM node exists up front, which virtual
 * scrolling deliberately doesn't do here. Headers are `role="presentation"`
 * and excluded from keyboard nav/`aria-activedescendant` (`activeIndex`
 * still addresses options only, via `flatIndex`); visually grouped, not a
 * fully nested ARIA group.
 *
 * **`lazy`** (added 2026-09-09) forwards the already-virtualized viewport's own
 * `renderedRangeStream` as `rangeChanged` — the range of rows currently rendered, in flat
 * (post-filter) indices. This is real lazy loading (scroll-position-triggered), not a rename of the
 * client-side virtualization above: virtual scrolling only ever limits DOM nodes for data *already
 * fully in memory* via `options()`; `lazy` is about there not being that much data client-side to
 * begin with, letting a consumer fetch more of it as the visible range nears the end of what's
 * currently loaded. Piggybacking on the viewport CDK already renders (rather than adding a second
 * scroll listener) means this fires for free, at zero extra layout cost, whenever
 * `filteredOptions()` changes too — not just on a raw scroll event.
 *
 * **`showToggleAll`/`selectionLimit`** (added 2026-09-09; * `multiple` mode only —
 * `MultiSelectComponent`'s own consumer today, though nothing here is MultiSelect-specific) live
 * here rather than on the owning trigger component because both need direct access to state this
 * panel already privately owns: `showToggleAll`'s tri-state header checkbox operates on
 * `filteredOptions()` (the *currently visible* subset, unlike `ListboxComponent`'s own simpler
 * all-or-nothing implementation — see that file's class doc for why it couldn't do the same, not
 * having filter text of its own to read), and `selectionLimit` needs to gate every option row's
 * disabled state directly. Once `selectedValues().length` reaches `selectionLimit()`, every
 * *not-yet-selected* option becomes disabled (already-selected ones stay clickable, so the user can
 * still deselect down from the cap) — `isOptionDisabled()` is now the one place every keyboard/
 * pointer/ARIA path checks, instead of reading `option.disabled` directly. `showToggleAll` is
 * force-hidden whenever `selectionLimit` is set (bulk- selecting past a hard cap makes no sense) —
 * a `showToggleAll && !selectionLimit` gate.
 *
 * **`grabFocus`** (default `true`) gates the `ngAfterViewInit()` focus grab. `SelectComponent`'s
 * own `editable` mode (added 2026-09-09) sets this to `false`: real DOM focus needs to *stay on its
 * `<input>`* so typing keeps working while the panel is open). With focus never moving here, this
 * panel's own `(keydown)` binding never fires on its own — the owning component instead forwards
 * relevant key events via the public `handleExternalKeydown()` facade, using the *same* switch/case
 * this file already had (including its existing `event.target.tagName === 'INPUT'` guard on Space,
 * which already does the right thing for an external input passed in as `event.target` without any
 * change here).
 *
 * **`setActiveByPrefix()`/`initialSearchText`** (added 2026-09-09, same `editable` fix) provide the
 * typeahead-highlight half of editable typing: opening the panel also highlights whichever option's
 * label starts with what's typed so far (case-insensitive), *without* filtering the visible list.
 * `setActiveByPrefix()` is the live version, called on every keystroke once the panel is already
 * open; `initialSearchText` covers the one keystroke that can't use it — the very first one, which
 * opens this panel from scratch, so `ngAfterViewInit()`'s own `initialActiveIndex()` call
 * (synchronously the moment this instance exists) is the earliest point a match can be seeded from.
 */
@Component({
  selector: 'med-select-panel',
  standalone: true,
  imports: [IconComponent, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `w-full`, not just `block`: `.cdk-overlay-pane` is a flex container, so a
  // plain block child sizes to shrink-to-fit content instead of the pane's
  // (explicitly set, see `select.component.ts`/`multi-select.component.ts`)
  // width — and `CdkVirtualScrollViewport`'s `contain: strict` reports zero
  // intrinsic width to that shrink-to-fit calculation, collapsing the whole
  // panel to 0px wide whenever there's no filter `<input>` around to
  // accidentally paper over it with its own default intrinsic width.
  host: { class: 'block w-full', '(mousedown)': 'onPanelMouseDown($event)' },
  template: `
    @if (headerTemplate(); as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" />
    }
    @if (multiple() && showToggleAll() && !selectionLimit() && !loading()) {
      <div
        role="checkbox"
        tabindex="0"
        [attr.aria-checked]="toggleAllAriaChecked()"
        class="flex cursor-pointer items-center gap-2 border-b border-surface-200 px-3 py-2 text-sm text-surface-900 dark:border-surface-700 dark:text-surface-50"
        (click)="onToggleAll()"
        (keydown.enter)="onToggleAll()"
        (keydown.space)="$event.preventDefault(); onToggleAll()"
      >
        <span [class]="checkboxClass(toggleAllState() === 'true')" aria-hidden="true">
          @if (toggleAllState() === 'true') {
            <med-icon name="check" variant="mini" class="size-2.5" />
          } @else if (toggleAllState() === 'mixed') {
            <med-icon name="minus" variant="mini" class="size-2.5" />
          }
        </span>
        <span>{{ toggleAllLabel() }}</span>
      </div>
    }
    @if (filterable()) {
      <div class="flex items-center gap-2 border-b border-surface-200 px-3 py-2 dark:border-surface-700">
        <med-icon name="magnifying-glass" variant="mini" class="size-4 shrink-0 text-surface-400" />
        <input
          #filterInput
          type="text"
          class="w-full bg-transparent text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none dark:text-surface-50 dark:placeholder:text-surface-500"
          [placeholder]="filterPlaceholder()"
          [attr.aria-label]="filterPlaceholder()"
          [value]="filterText()"
          (input)="onFilterInput($event)"
          (keydown)="onKeydown($event)"
        />
      </div>
    }
    <div
      #list
      [id]="panelId()"
      role="listbox"
      [attr.tabindex]="listTabindex()"
      [attr.aria-label]="listAriaLabel()"
      [attr.aria-labelledby]="listAriaLabelledBy()"
      [class]="listClassName()"
      [attr.aria-multiselectable]="multiple() ? 'true' : null"
      [attr.aria-activedescendant]="activeOptionId()"
      (keydown)="onKeydown($event)"
    >
      @if (loading()) {
        <div class="flex items-center gap-2 px-3 py-4 text-sm text-surface-400 dark:text-surface-500">
          @if (loadingIconTemplate(); as tpl) {
            <ng-container [ngTemplateOutlet]="tpl" />
          } @else {
            <med-icon [name]="loadingIcon()" variant="mini" class="size-4 shrink-0 animate-spin" />
          }
          <span>{{ loadingLabel() }}</span>
        </div>
      } @else if (filteredOptions().length === 0) {
        @if (emptyTemplate(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" />
        } @else {
          <p class="px-3 py-2 text-sm text-surface-400 dark:text-surface-500">{{ emptyLabel() }}</p>
        }
      } @else {
        <cdk-virtual-scroll-viewport #viewport [itemSize]="rowHeight" [style.height.px]="viewportHeightPx()" class="py-1">
          <div *cdkVirtualFor="let row of rows(); trackBy: trackByRow">
            @if (row.kind === 'group') {
              <div role="presentation" class="truncate px-3 py-2 text-xs font-semibold text-surface-400 dark:text-surface-500">
                @if (groupTemplate(); as tpl) {
                  <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: row.label }" />
                } @else {
                  {{ row.label }}
                }
              </div>
            } @else {
              <div
                [id]="optionElementId(row.flatIndex)"
                role="option"
                [attr.aria-selected]="isSelected(row.option)"
                [attr.aria-disabled]="isOptionDisabled(row.option) ? 'true' : null"
                [class]="rowClass(row.option, row.flatIndex)"
                (pointerdown)="onOptionPointerDown($event, row.option)"
                (click)="onOptionClick($event, row.option)"
                (dblclick)="onOptionDoubleClick($event, row.option)"
                (pointerenter)="onOptionPointerEnter(row.flatIndex, row.option)"
              >
                @if (multiple()) {
                  <span [class]="checkboxClass(isSelected(row.option))" aria-hidden="true">
                    @if (isSelected(row.option)) {
                      <med-icon name="check" variant="mini" class="size-2.5" />
                    }
                  </span>
                  @if (optionTemplate(); as tpl) {
                    <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: row.option, selected: isSelected(row.option) }" />
                  } @else {
                    <span class="truncate">{{ row.option.label }}</span>
                  }
                } @else {
                  @if (optionTemplate(); as tpl) {
                    <span class="flex-1 truncate">
                      <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: row.option, selected: isSelected(row.option) }" />
                    </span>
                  } @else {
                    <span class="flex-1 truncate">{{ row.option.label }}</span>
                  }
                  @if (isSelected(row.option)) {
                    <med-icon data-testid="listbox-checkmark" name="check" variant="mini" class="size-4 shrink-0 text-brand-500 dark:text-brand-400" />
                  }
                }
              </div>
            }
          </div>
        </cdk-virtual-scroll-viewport>
      }
    </div>
    @if (footerTemplate(); as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" />
    }
  `,
})
export class SelectPanelComponent<T = unknown> implements OnInit, AfterViewInit {
  readonly panelId = input.required<string>();
  readonly options = input.required<readonly SelectOption<T>[]>();
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly selectedValue = input<T | null>(null);
  readonly selectedValues = input<readonly T[]>([]);
  /** Field that identifies an object value, so a selection written as a different reference still matches its option. `null` (default) compares by reference. */
  readonly dataKey = input<string | null>(null);
  /** Largest height of the option list, as a pixel length such as `'200px'`; `null` (default) keeps 240px. Shorter lists still shrink to their content. */
  readonly scrollHeight = input<string | null>(null);
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Search');
  /** Comma-separated fields of the consumer's option object the filter compares; `null` (default) compares the option label. */
  readonly filterBy = input<string | null>(null);
  /** How the filter compares the typed text with each option's text. */
  readonly filterMatchMode = input<SelectFilterMatchMode>('contains');
  /** Text the filter box starts with when the panel opens, so the owner can keep the typed text between openings. */
  readonly initialFilterText = input('');
  /** Whether the filter box takes focus when the panel opens; when off, the option list takes it instead. */
  readonly autofocusFilter = input(true, { transform: booleanAttribute });
  readonly emptyLabel = input('No results found');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingIcon = input('arrow-path');
  readonly loadingLabel = input('Loading...');
  readonly lazy = input(false, { transform: booleanAttribute });
  /** Multiple mode only — see class doc. */
  readonly showToggleAll = input(false, { transform: booleanAttribute });
  readonly toggleAllLabel = input('Select all');
  /** Multiple mode only — `null` (the default) means no limit. See class doc. */
  readonly selectionLimit = input<number | null>(null);
  /** Template for each option row, handed over by the owner (`#option`); `null` renders the default label. The row keeps `role="option"`. */
  readonly optionTemplate = input<TemplateRef<SelectOptionContext<T>> | null>(null);
  /** Template for each group header, handed over by the owner (`#group`); `null` renders the default label. */
  readonly groupTemplate = input<TemplateRef<{ $implicit: string }> | null>(null);
  /** Template shown above the toggle-all row, the filter and the list, handed over by the owner (`#header`). */
  readonly headerTemplate = input<TemplateRef<void> | null>(null);
  /** Template shown below the list, handed over by the owner (`#footer`). */
  readonly footerTemplate = input<TemplateRef<void> | null>(null);
  /** Template shown instead of the `emptyLabel` text when no option is left, handed over by the owner (`#empty`). */
  readonly emptyTemplate = input<TemplateRef<void> | null>(null);
  /** Template replacing the loading indicator's icon, handed over by the owner (`#loadingIcon`). */
  readonly loadingIconTemplate = input<TemplateRef<void> | null>(null);
  /** See class doc. */
  readonly grabFocus = input(true, { transform: booleanAttribute });
  /** Seeds `initialActiveIndex()` with a prefix match instead of the usual "selected, else first enabled" — only meaningful alongside `grabFocus: false`, when `ngAfterViewInit()` runs synchronously right after the very keystroke that opened this panel (see class doc). */
  readonly initialSearchText = input<string | null>(null);

  /**
   * Multiple mode only. When `true`, a pointer press on an option without Ctrl or Cmd held emits
   * `optionReplaced` (choose only that option) instead of `optionToggled`; with Ctrl or Cmd it
   * still toggles. Keyboard selection always toggles. Default `false`.
   */
  readonly metaKeySelection = input(false, { transform: booleanAttribute });

  /** `tabindex` of the `role="listbox"` element. Default `-1`. */
  readonly listTabindex = input(-1);
  /** `aria-label` of the `role="listbox"` element; `null` (default) sets none. */
  readonly listAriaLabel = input<string | null>(null);
  /** `aria-labelledby` of the `role="listbox"` element; `null` (default) sets none. */
  readonly listAriaLabelledBy = input<string | null>(null);
  /** Extra CSS classes for the `role="listbox"` element; `null` (default) adds none. */
  readonly listClass = input<string | null>(null);

  protected readonly listClassName = computed(() => mergeClasses('focus:outline-none', this.listClass() ?? ''));

  readonly optionToggled = output<T>();
  /** Emitted instead of `optionToggled` for a plain pointer press when `metaKeySelection` is on: the value of the only option to keep chosen. */
  readonly optionReplaced = output<T>();
  /** Emitted when an enabled option is clicked, with its value and the DOM event. */
  readonly optionClicked = output<{ value: T; originalEvent: MouseEvent }>();
  /** Emitted when an enabled option is double-clicked, with its value and the DOM event. */
  readonly optionDoubleClicked = output<{ value: T; originalEvent: MouseEvent }>();
  readonly closeRequested = output<void>();
  /** Emitted with the text typed into the filter box, on every change. */
  readonly filterChanged = output<string>();
  /** Flat (post-filter) row indices currently rendered by the viewport — see the class doc's `lazy` section. Only emitted while `lazy()` is on. */
  readonly rangeChanged = output<{ first: number; last: number }>();
  /** Emitted with the full next selection array — see class doc's `showToggleAll` section for why it operates on `filteredOptions()`. */
  readonly toggleAllRequested = output<readonly T[]>();

  protected readonly rowHeight = OPTION_ROW_HEIGHT;
  protected readonly trackByRow = (_index: number, row: PanelRow<T>) => (row.kind === 'group' ? `group:${row.label}` : row.option.value);

  protected readonly filterText = signal('');
  protected readonly activeIndex = signal(-1);

  private readonly listRef = viewChild.required<ElementRef<HTMLDivElement>>('list');
  private readonly filterInputRef = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  private readonly viewportRef = viewChild<CdkVirtualScrollViewport>('viewport');

  /**
   * Re-subscribes whenever the viewport instance itself changes (e.g. the
   * `@else` branch in the template mounts/unmounts it as `loading()`/
   * `filteredOptions()` toggle between empty and non-empty) — `viewChild()`
   * only flips from `undefined` to a real instance once Angular has actually
   * rendered the `cdk-virtual-scroll-viewport`, so this effect naturally
   * fires again exactly when that happens, same precedent
   * `DatePickerPanelComponent.focusActiveContainer` already established.
   */
  private readonly emitRangeChanges = effect((onCleanup) => {
    const viewport = this.viewportRef();
    if (!viewport || !this.lazy()) {
      return;
    }
    const subscription = viewport.renderedRangeStream.subscribe((range) => {
      this.rangeChanged.emit({ first: range.start, last: range.end });
    });
    onCleanup(() => subscription.unsubscribe());
  });

  protected readonly filteredOptions = computed(() => {
    const text = this.filterText().trim().toLowerCase();
    if (!text) {
      return this.options();
    }
    const fields = this.filterBy()
      ?.split(',')
      .map((field) => field.trim())
      .filter(Boolean);
    const mode = this.filterMatchMode();
    return this.options().filter((option) => {
      const candidates = fields?.length ? fields.map((field) => this.filterFieldText(option, field)) : [option.label.toLowerCase()];
      // A negative mode must hold for every field, a positive one for any of them.
      return mode === 'notContains' || mode === 'notEquals' ? candidates.every((c) => matchesFilter(c, text, mode)) : candidates.some((c) => matchesFilter(c, text, mode));
    });
  });

  /** The lowercased text of `field` on the consumer's original object (`source`); empty when the option has none or the field is unset. */
  private filterFieldText(option: SelectOption<T>, field: string): string {
    const raw = (option.source as Record<string, unknown> | null | undefined)?.[field];
    return raw == null ? '' : String(raw).toLowerCase();
  }

  protected readonly rows = computed<PanelRow<T>[]>(() => buildPanelRows(this.filteredOptions()));

  protected readonly activeOptionId = computed(() => {
    const index = this.activeIndex();
    return index >= 0 ? this.optionElementId(index) : null;
  });

  /** Largest height of the list in px: `scrollHeight()` when it is a pixel length, otherwise the default. */
  private readonly maxHeightPx = computed(() => {
    const match = /^\s*(\d+(?:\.\d+)?)px\s*$/.exec(this.scrollHeight() ?? '');
    return match ? Number(match[1]) : MAX_PANEL_HEIGHT;
  });

  protected readonly viewportHeightPx = computed(() => Math.min(this.rows().length * OPTION_ROW_HEIGHT, this.maxHeightPx()));

  ngOnInit(): void {
    this.filterText.set(this.initialFilterText());
  }

  ngAfterViewInit(): void {
    this.activeIndex.set(this.initialActiveIndex());
    this.scrollActiveIntoView();
    if (this.grabFocus()) {
      ((this.autofocusFilter() ? this.filterInputRef()?.nativeElement : undefined) ?? this.listRef().nativeElement).focus();
    }
  }

  /** Public facade for a caller whose own trigger element holds focus instead of this panel (see `grabFocus`) to forward a keydown event into the same handling every other consumer gets via the template's own `(keydown)` binding. */
  handleExternalKeydown(event: KeyboardEvent): void {
    this.onKeydown(event);
  }

  /**
   * Prefix-match typeahead (case-insensitive `label.startsWith(typed text)`), highlighting the
   * match without filtering the visible list — `SelectComponent`'s `editable` mode calls this on
   * every keystroke once the panel is already open (the very first keystroke that opens it goes
   * through `initialSearchText` instead, see that input's doc, since this panel doesn't exist yet
   * at that point in the same call stack). A miss leaves `activeIndex` untouched.
   */
  setActiveByPrefix(text: string): void {
    if (!text) {
      return;
    }
    const index = this.findPrefixMatchIndex(text);
    if (index !== -1) {
      this.activeIndex.set(index);
      this.scrollActiveIntoView();
    }
  }

  private findPrefixMatchIndex(text: string): number {
    const normalized = text.toLowerCase();
    return this.filteredOptions().findIndex((option) => !this.isOptionDisabled(option) && option.label.toLowerCase().startsWith(normalized));
  }

  protected optionElementId(index: number): string {
    return `${this.panelId()}-option-${index}`;
  }

  protected isSelected(option: SelectOption<T>): boolean {
    const dataKey = this.dataKey();
    return this.multiple()
      ? this.selectedValues().some((value) => isSameOptionValue(value, option.value, dataKey))
      : isSameOptionValue(this.selectedValue(), option.value, dataKey);
  }

  /** `option.disabled` plus `selectionLimit`: once reached, every not-yet-selected option is disabled too (already-selected ones stay clickable, so the user can still deselect down from the cap) — see class doc. */
  protected isOptionDisabled(option: SelectOption<T>): boolean {
    if (option.disabled) {
      return true;
    }
    const limit = this.selectionLimit();
    return this.multiple() && limit !== null && this.selectedValues().length >= limit && !this.isSelected(option);
  }

  protected rowClass(option: SelectOption<T>, index: number): string {
    return selectOptionVariants({ active: index === this.activeIndex(), disabled: this.isOptionDisabled(option) });
  }

  protected checkboxClass(checked: boolean): string {
    return selectCheckboxIndicatorVariants({ checked });
  }

  /** Over `filteredOptions()` (currently visible), not the full `options()` — see class doc. */
  private enabledFilteredValues(): T[] {
    return this.filteredOptions()
      .filter((option) => !option.disabled)
      .map((option) => option.value);
  }

  protected readonly toggleAllState = computed<'true' | 'false' | 'mixed'>(() => {
    const enabled = this.enabledFilteredValues();
    if (enabled.length === 0) {
      return 'false';
    }
    const selected = this.selectedValues();
    const selectedCount = enabled.filter((value) => selected.some((chosen) => isSameOptionValue(chosen, value, this.dataKey()))).length;
    if (selectedCount === 0) {
      return 'false';
    }
    return selectedCount === enabled.length ? 'true' : 'mixed';
  });

  protected readonly toggleAllAriaChecked = computed(() => (this.toggleAllState() === 'mixed' ? 'mixed' : this.toggleAllState()));

  /** Toggling only ever adds/removes the currently-*filtered* enabled options, preserving any selection outside the active filter untouched. */
  protected onToggleAll(): void {
    const enabled = this.enabledFilteredValues();
    const selected = this.selectedValues();
    const dataKey = this.dataKey();
    const inList = (list: readonly T[], value: T) => list.some((item) => isSameOptionValue(item, value, dataKey));
    const next = this.toggleAllState() === 'true' ? selected.filter((value) => !inList(enabled, value)) : [...selected, ...enabled.filter((value) => !inList(selected, value))];
    this.toggleAllRequested.emit(next);
  }

  protected onFilterInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.filterText.set(text);
    this.filterChanged.emit(text);
    this.activeIndex.set(this.firstEnabledIndex());
    this.scrollActiveIntoView();
  }

  /**
   * When the owner keeps focus in its own text field (`grabFocus: false`, the editable Select), a mouse press
   * on any non-focusable part of the panel — its scrollbars included — would move focus off that field, and the
   * field's blur closes the panel. Cancel the press's default so focus stays put; scrollbar dragging and
   * clicks still work. Text fields inside the panel (the filter) keep their normal focus behavior.
   */
  protected onPanelMouseDown(event: MouseEvent): void {
    if (this.grabFocus()) {
      return;
    }
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return;
    }
    event.preventDefault();
  }

  protected onOptionPointerDown(event: Event, option: SelectOption<T>): void {
    // Keep focus in the panel (input/listbox) instead of it jumping to the <li>.
    event.preventDefault();
    if (this.isOptionDisabled(option)) {
      return;
    }
    const pointer = event as MouseEvent;
    if (this.multiple() && this.metaKeySelection() && !pointer.ctrlKey && !pointer.metaKey) {
      this.optionReplaced.emit(option.value);
    } else {
      this.optionToggled.emit(option.value);
    }
  }

  protected onOptionClick(event: MouseEvent, option: SelectOption<T>): void {
    if (!this.isOptionDisabled(option)) {
      this.optionClicked.emit({ value: option.value, originalEvent: event });
    }
  }

  protected onOptionDoubleClick(event: MouseEvent, option: SelectOption<T>): void {
    if (!this.isOptionDisabled(option)) {
      this.optionDoubleClicked.emit({ value: option.value, originalEvent: event });
    }
  }

  protected onOptionPointerEnter(index: number, option: SelectOption<T>): void {
    if (!this.isOptionDisabled(option)) {
      this.activeIndex.set(index);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.loading() && event.key !== 'Tab') {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex());
        this.scrollActiveIntoView();
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.lastEnabledIndex());
        this.scrollActiveIntoView();
        break;
      case 'Enter':
        event.preventDefault();
        this.selectActive();
        break;
      case ' ':
        if ((event.target as HTMLElement).tagName === 'INPUT') {
          return; // let Space type into the filter box
        }
        event.preventDefault();
        this.selectActive();
        break;
      case 'Tab':
        // No preventDefault: closeRequested() synchronously refocuses the
        // trigger (see OverlayService.close()), so the browser's own
        // still-pending Tab action then moves focus on from there.
        this.closeRequested.emit();
        break;
    }
  }

  private selectActive(): void {
    const option = this.filteredOptions()[this.activeIndex()];
    if (option && !this.isOptionDisabled(option)) {
      this.optionToggled.emit(option.value);
    }
  }

  private enabledIndexes(): number[] {
    return this.filteredOptions()
      .map((option, index) => (this.isOptionDisabled(option) ? -1 : index))
      .filter((index) => index !== -1);
  }

  private firstEnabledIndex(): number {
    return this.enabledIndexes()[0] ?? -1;
  }

  private lastEnabledIndex(): number {
    const enabled = this.enabledIndexes();
    return enabled[enabled.length - 1] ?? -1;
  }

  private moveActive(step: 1 | -1): void {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return;
    }
    const currentPosition = enabled.indexOf(this.activeIndex());
    const nextPosition =
      currentPosition === -1 ? (step === 1 ? 0 : enabled.length - 1) : (currentPosition + step + enabled.length) % enabled.length;
    this.activeIndex.set(enabled[nextPosition]);
    this.scrollActiveIntoView();
  }

  private initialActiveIndex(): number {
    const searchText = this.initialSearchText();
    if (searchText) {
      const matchIndex = this.findPrefixMatchIndex(searchText);
      if (matchIndex !== -1) {
        return matchIndex;
      }
    }
    const selectedIndex = this.filteredOptions().findIndex((option) => this.isSelected(option));
    return selectedIndex !== -1 ? selectedIndex : this.firstEnabledIndex();
  }

  private scrollActiveIntoView(): void {
    const flatIndex = this.activeIndex();
    if (flatIndex < 0) {
      return;
    }
    const rowIndex = this.rows().findIndex((row) => row.kind === 'option' && row.flatIndex === flatIndex);
    if (rowIndex >= 0) {
      this.viewportRef()?.scrollToIndex(rowIndex);
    }
  }
}
