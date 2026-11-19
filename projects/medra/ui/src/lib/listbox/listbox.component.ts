import { ChangeDetectionStrategy, Component, TemplateRef, afterNextRender, booleanAttribute, computed, contentChild, forwardRef, input, output, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { SelectPanelComponent } from '../select/select-panel.component';
import { selectCheckboxIndicatorVariants, selectOptionVariants } from '../select/select.styles';
import { isSameOptionValue, normalizeSelectOptions } from '../select/select-options';
import { SelectFilterEvent, SelectFilterMatchMode, SelectOption, SelectOptionContext, SelectOptionDisabled, SelectOptionsInput } from '../select/select.types';
import { ListboxChangeEvent, ListboxOptionEvent, ListboxSelectAllEvent } from './listbox.types';
import { mergeClasses } from '../utils/merge-classes';

let nextListboxId = 0;

/**
 * Listbox primitive (Tier 3): `SelectPanelComponent` — Select/MultiSelect's
 * shared dropdown content — rendered inline in a bordered box instead of
 * inside an `OverlayService` connected overlay. All the actual listbox
 * behavior (keyboard nav, virtualized rows, filtering, single vs. `multiple`
 * selection indicator) is that same component, unmodified; this one only
 * adds the always-visible container and a `ControlValueAccessor` — same
 * "the hard part already exists, don't duplicate it" reasoning already
 * applied to reusing `MenuPanelComponent` for ContextMenu/SplitButton's
 * dropdown.
 *
 * `closeRequested` (Tab, inside `SelectPanelComponent`) is a deliberate
 * no-op here — there's no overlay to close, and Tab already moves on
 * normally since there's nothing intercepting it downstream of that no-op.
 *
 * **`disabled` is enforced at the value layer, not the focus layer**: since
 * `SelectPanelComponent` always focuses and keyboard-activates itself on
 * init (unchanged from how Select/MultiSelect already rely on that), a
 * disabled Listbox still visually dims and blocks pointer interaction
 * (`pointer-events-none`) and rejects any `optionToggled` while disabled,
 * but doesn't retract focusability at the DOM level the way a real
 * `disabled` attribute would on a native control — a documented gap rather
 * than reaching into the shared panel to add a mode none of its other
 * three consumers need.
 *
 * **`showToggleAll`** (default `true` — multiple mode
 * only) adds a header checkbox above the list that selects/clears every
 * *enabled* option at once, tri-state (checked/indeterminate/unchecked).
 * In the default mode that header is `SelectPanelComponent`'s own, so it acts
 * on the options the filter currently shows, not the whole list; with
 * `dragdrop` there is no filter, so this component renders the same header
 * itself over the full list.
 *
 * **`dragdrop`** enables reordering via Angular CDK's own drag-drop module
 * (`cdkDropList`/`cdkDrag`, self-contained — no external directives
 * needed). This is a genuinely
 * separate, non-virtualized row template from `SelectPanelComponent`'s,
 * not a mode flag threaded through it: CDK's virtual-scroll viewport
 * recycles/reuses DOM nodes as rows scroll in and out, which conflicts with
 * `cdkDrag` needing a *stable* element to track through a drag gesture —
 * a well-known rough edge combining the two. Since Listbox (unlike Select's
 * dropdown, built for 10k+ option lists) is typically used with a modest,
 * fully-visible option count, rendering all rows for real when `dragdrop`
 * is on is the simpler, more reliable choice over trying to reconcile
 * virtual scroll with drag tracking. This component never mutates its own
 * `options()` (a plain `input()`, owned by the consumer) — `reorder` emits
 * the moved indices *and* a convenience pre-reordered copy of the array
 * (`moveItemInArray` already applied), so the consumer can just assign it
 * back to whatever they bind `options` to. **Scope cut**: dragdrop rows use
 * real tab order + CDK's own built-in keyboard reordering (focus a row,
 * Enter to pick up, arrows to move, Enter/Escape to drop/cancel) instead of
 * replicating `SelectPanelComponent`'s `aria-activedescendant` navigation
 * model — a materially different (though still fully keyboard-operable)
 * interaction pattern, appropriate for what's now a real per-row focusable
 * element rather than a virtualized list.
 */
@Component({
  selector: 'med-listbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    '[attr.data-striped]': 'striped() ? "true" : null',
    '[attr.data-checkmark]': 'checkmark() ? "true" : null',
  },
  imports: [SelectPanelComponent, IconComponent, CdkDropList, CdkDrag, CdkDragHandle],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ListboxComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="wrapperClass()" (focusin)="onFocusIn($event)" (focusout)="onFocusOut($event)">
      @if (dragdrop() && multiple() && showToggleAll() && !loading()) {
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
      @if (dragdrop()) {
        <div
          cdkDropList
          (cdkDropListDropped)="onDropped($event)"
          role="listbox"
          [class]="dropListClass()"
          [style.max-height]="scrollHeight()"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-labelledby]="ariaLabelledBy()"
          [attr.aria-multiselectable]="multiple() ? 'true' : null"
        >
          @for (option of normalizedOptions(); track option.value) {
            <div
              cdkDrag
              [cdkDragDisabled]="isDisabled() || !!option.disabled"
              role="option"
              tabindex="0"
              [attr.aria-selected]="isSelected(option.value)"
              [attr.aria-disabled]="option.disabled ? 'true' : null"
              [class]="rowClass(option)"
              (click)="onRowClick($event, option)"
              (dblclick)="onRowDoubleClick($event, option)"
              (keydown.enter)="onOptionToggled(option.value)"
            >
              @if (multiple()) {
                <span [class]="checkboxClass(isSelected(option.value))" aria-hidden="true">
                  @if (isSelected(option.value)) {
                    <med-icon name="check" variant="mini" class="size-2.5" />
                  }
                </span>
                <span class="flex-1 truncate">{{ option.label }}</span>
              } @else {
                <span class="flex-1 truncate">{{ option.label }}</span>
                @if (isSelected(option.value)) {
                  <med-icon data-testid="listbox-checkmark" name="check" variant="mini" class="size-4 shrink-0 text-brand-500 dark:text-brand-400" />
                }
              }
              <med-icon cdkDragHandle name="bars-3" variant="mini" class="size-4 shrink-0 cursor-grab text-surface-300 dark:text-surface-600" />
            </div>
          }
        </div>
      } @else {
        <med-select-panel
          [panelId]="panelId"
          [options]="normalizedOptions()"
          [dataKey]="dataKey()"
          [multiple]="multiple()"
          [selectedValue]="multiple() ? null : singleValue()"
          [selectedValues]="multiple() ? multiValue() : []"
          [filterable]="filter()"
          [filterBy]="filterBy()"
          [filterMatchMode]="filterMatchMode()"
          [filterPlaceholder]="filterPlaceholder()"
          [emptyLabel]="emptyLabel()"
          [loading]="loading()"
          [loadingLabel]="loadingLabel()"
          [showToggleAll]="multiple() && showToggleAll()"
          [toggleAllLabel]="toggleAllLabel()"
          [metaKeySelection]="metaKeySelection()"
          [scrollHeight]="scrollHeight()"
          [listTabindex]="tabindex() ?? -1"
          [listAriaLabel]="ariaLabel()"
          [listAriaLabelledBy]="ariaLabelledBy()"
          [listClass]="listStyleClass()"
          [optionTemplate]="optionTemplate() ?? null"
          [groupTemplate]="groupTemplate() ?? null"
          [headerTemplate]="headerTemplate() ?? null"
          [footerTemplate]="footerTemplate() ?? null"
          [emptyTemplate]="emptyTemplate() ?? null"
          [loadingIconTemplate]="loadingIconTemplate() ?? null"
          (optionToggled)="onOptionToggled($event)"
          (optionReplaced)="onOptionReplaced($event)"
          (filterChanged)="filtered.emit({ filter: $event })"
          (optionClicked)="onOptionClicked($event)"
          (optionDoubleClicked)="onOptionDoubleClicked($event)"
          (toggleAllRequested)="onToggleAllRequested($event)"
        />
      }
      @for (item of hiddenValues(); track $index) {
        <input type="hidden" [name]="name()" [value]="item" />
      }
    </div>
  `,
})
export class ListboxComponent<T = unknown> implements ControlValueAccessor {
  /**
   * The options: either `SelectOption` objects (`label`, `value`, `disabled`, `group`) or any
   * objects whose fields are read through `optionLabel`, `optionValue` and `optionDisabled`.
   */
  readonly options = input<SelectOptionsInput<T>>([]);
  /** Field read as each option's label. Default `'label'`. */
  readonly optionLabel = input('label');
  /** Field read as each option's value. Default `'value'`. */
  readonly optionValue = input('value');
  /** Field name holding a boolean, or a predicate over the consumer's option object, marking it disabled. Default `'disabled'`. */
  readonly optionDisabled = input<SelectOptionDisabled>('disabled');
  /** Field read as a group's header label when the data is grouped with `optionGroupChildren`; `null` falls back to `optionLabel`. Default `null`. */
  readonly optionGroupLabel = input<string | null>(null);
  /** Field holding each group's child options; `null` means the list is flat (or grouped by each option's own `group` field). Default `null`. */
  readonly optionGroupChildren = input<string | null>(null);
  /** Field that identifies an option object, so written values that are other references with the same field value still count as chosen. Default `null` (compare by reference). */
  readonly dataKey = input<string | null>(null);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly filter = input(false, { transform: booleanAttribute });
  /** Comma-separated option fields the filter searches; `null` searches the option's label. Default `null`. */
  readonly filterBy = input<string | null>(null);
  /** How the filter compares the typed text with the searched field. Default `'contains'`. */
  readonly filterMatchMode = input<SelectFilterMatchMode>('contains');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Blocks any change of the selection (toggle, plain click, "Select all") without disabling the list: focus, scrolling, filtering and click events still work. Default `false`. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Shows a spinner instead of the option list — for options fetched asynchronously. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly filterPlaceholder = input('Search');
  readonly emptyLabel = input('No results found');
  readonly loadingLabel = input('Loading...');
  /** Multiple mode only. See class doc. */
  readonly showToggleAll = input(true, { transform: booleanAttribute });
  readonly toggleAllLabel = input('Select all');
  /**
   * Multiple mode only. A plain click chooses only the clicked option; Ctrl or Cmd plus click
   * toggles it and keeps the others. The keyboard (Enter, Space) always toggles. Default `false`
   * (every click toggles).
   */
  readonly metaKeySelection = input(false, { transform: booleanAttribute });
  /** Name of the hidden `<input>` elements carrying the chosen values (one per value, like a native `<select multiple>`), so a native form submission includes them. `null` renders none. Default `null`. */
  readonly name = input<string | null>(null);
  /** `tabindex` of the list element. `null` keeps the default (`-1`). With `dragdrop` each row is already focusable, so this has no effect. Default `null`. */
  readonly tabindex = input<number | null>(null);
  /** `aria-label` of the list element. Default `null` (none). */
  readonly ariaLabel = input<string | null>(null);
  /** Id of the element that labels the list, set as its `aria-labelledby`. Default `null` (none). */
  readonly ariaLabelledBy = input<string | null>(null);
  /** Largest height of the options area, as a CSS length such as `'200px'`; the area scrolls past it. `null` keeps 240px. Default `null`. */
  readonly scrollHeight = input<string | null>(null);
  /** Extra CSS classes for the options area (the list element). Default `null`. */
  readonly listStyleClass = input<string | null>(null);
  readonly dragdrop = input(false, { transform: booleanAttribute });
  readonly checkmark = input(false, { transform: booleanAttribute });
  readonly striped = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  /** `#option` template for each option row. Context: the option (`SelectOption<T>`) as the implicit value and `selected` (whether it is chosen). The row keeps `role="option"` and its keyboard behaviour. Not used with `dragdrop`. */
  readonly optionTemplate = contentChild<TemplateRef<SelectOptionContext<T>>>('option');
  /** `#group` template for each group header. Context: the group label as the implicit value. Not used with `dragdrop`. */
  readonly groupTemplate = contentChild<TemplateRef<{ $implicit: string }>>('group');
  /** `#header` template shown above the list. No context. Not used with `dragdrop`. */
  readonly headerTemplate = contentChild<TemplateRef<void>>('header');
  /** `#footer` template shown below the list. No context. Not used with `dragdrop`. */
  readonly footerTemplate = contentChild<TemplateRef<void>>('footer');
  /** `#empty` template shown instead of `emptyLabel` when no option is left. No context. Not used with `dragdrop`. */
  readonly emptyTemplate = contentChild<TemplateRef<void>>('empty');
  /** `#loadingIcon` template replacing the loading indicator's icon while `loading` is on. No context. Not used with `dragdrop`. */
  readonly loadingIconTemplate = contentChild<TemplateRef<void>>('loadingIcon');

  /** Emitted after a drag-reorder — `options` is a convenience pre-reordered copy (`moveItemInArray` already applied) for the consumer to assign back to whatever they bind `options` to; this component never mutates its own `options()` input. */
  readonly reorder = output<{ previousIndex: number; currentIndex: number; options: readonly SelectOption<T>[] }>();

  /** Emitted when the user changes the selection: toggling or choosing an option, or "Select all". Not emitted when the list is disabled or `readonly`. */
  readonly selectionChanged = output<ListboxChangeEvent<T>>();
  /** Emitted when "Select all" is used: `checked` is `true` when it marked options and `false` when it cleared them. */
  readonly selectAllChanged = output<ListboxSelectAllEvent>();
  /** Emitted when an option is clicked, with its value and the DOM event. Not emitted for a disabled option or a disabled list. */
  readonly optionClicked = output<ListboxOptionEvent<T>>();
  /** Emitted when an option is double-clicked, with its value and the DOM event. Not emitted for a disabled option or a disabled list. */
  readonly optionDoubleClicked = output<ListboxOptionEvent<T>>();
  /** Emitted when focus enters the list from outside it. The focus the list takes when it first renders is not reported. */
  readonly listFocus = output<FocusEvent>();
  /** Emitted when focus leaves the list. */
  readonly listBlur = output<FocusEvent>();
  /** Emitted with the text typed in the filter box, on every change. */
  readonly filtered = output<SelectFilterEvent>();

  protected readonly panelId = `med-listbox-${nextListboxId++}`;

  constructor() {
    afterNextRender(() => {
      this.rendered = true;
    });
  }

  private readonly value = signal<T | readonly T[] | null>(null);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  /** Whether the selection is frozen: the whole list is disabled, or it is `readonly`. */
  private readonly selectionLocked = computed(() => this.isDisabled() || this.readonly());

  protected readonly singleValue = computed(() => (this.multiple() ? null : (this.value() as T | null)));
  protected readonly multiValue = computed(() => (this.multiple() ? ((this.value() as readonly T[] | null) ?? []) : []));

  private onChange: (value: T | readonly T[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly wrapperClass = computed(() =>
    mergeClasses(
      'overflow-hidden rounded-md border bg-surface-0 dark:bg-surface-900',
      this.invalid() ? 'border-danger-500 dark:border-danger-400' : 'border-surface-300 dark:border-surface-600',
      this.isDisabled() ? 'pointer-events-none opacity-(--opacity-disabled)' : '',
      this.class(),
    ),
  );

  /** The consumer's `options()` read into the flat `SelectOption` list the panel and the drag rows render. */
  protected readonly normalizedOptions = computed<SelectOption<T>[]>(() =>
    normalizeSelectOptions<T>(this.options(), {
      optionLabel: this.optionLabel(),
      optionValue: this.optionValue(),
      optionDisabled: this.optionDisabled(),
      optionGroupLabel: this.optionGroupLabel(),
      optionGroupChildren: this.optionGroupChildren(),
    }),
  );

  private readonly enabledOptionValues = computed(() => this.normalizedOptions().filter((option) => !option.disabled).map((option) => option.value));

  /** Always over the full `options()` list, never just `filter()`'s currently matching subset — see class doc. */
  protected readonly toggleAllState = computed<'true' | 'false' | 'mixed'>(() => {
    const enabled = this.enabledOptionValues();
    if (enabled.length === 0) {
      return 'false';
    }
    const selectedCount = this.multiValue().filter((value) => enabled.some((item) => isSameOptionValue(item, value, this.dataKey()))).length;
    if (selectedCount === 0) {
      return 'false';
    }
    return selectedCount === enabled.length ? 'true' : 'mixed';
  });

  /** Chosen values as text for the hidden form inputs: `String(value)`, or JSON for an object value. Empty without `name`. */
  protected readonly hiddenValues = computed(() => {
    if (this.name() === null) {
      return [];
    }
    const chosen = this.multiple() ? this.multiValue() : this.singleValue() === null || this.singleValue() === undefined ? [] : [this.singleValue() as T];
    return chosen.map((value) => (typeof value === 'object' ? JSON.stringify(value) : String(value)));
  });

  protected readonly toggleAllAriaChecked = computed(() => (this.toggleAllState() === 'mixed' ? 'mixed' : this.toggleAllState()));

  protected isSelected(optionValue: T): boolean {
    return this.multiple()
      ? this.multiValue().some((value) => isSameOptionValue(value, optionValue, this.dataKey()))
      : isSameOptionValue(this.singleValue(), optionValue, this.dataKey());
  }

  /** Classes of the `dragdrop` drop list; the 240px cap applies unless `scrollHeight` sets its own. */
  protected readonly dropListClass = computed(() =>
    mergeClasses('overflow-y-auto py-1 focus:outline-none', this.scrollHeight() ? '' : 'max-h-60', this.listStyleClass() ?? ''),
  );

  protected checkboxClass(checked: boolean): string {
    return selectCheckboxIndicatorVariants({ checked });
  }

  protected rowClass(option: SelectOption<T>): string {
    return selectOptionVariants({ disabled: !!option.disabled });
  }

  /** Writes a new selection and tells the form and the consumer. */
  private commit(next: T | readonly T[] | null, itemValue: T | null): void {
    this.value.set(next);
    this.onChange(next);
    this.selectionChanged.emit({ value: next, itemValue });
  }

  /** Applies a "Select all" result and reports whether it marked or cleared options. */
  private commitSelectAll(next: readonly T[]): void {
    const current = this.multiValue();
    const checked = next.some((item) => !current.some((value) => isSameOptionValue(value, item, this.dataKey())));
    this.commit(next, null);
    this.selectAllChanged.emit({ checked });
  }

  protected onToggleAll(): void {
    if (this.selectionLocked()) {
      return;
    }
    this.onTouched();
    this.commitSelectAll(this.toggleAllState() === 'true' ? [] : this.enabledOptionValues());
  }

  /** The shared panel computed the next value over the options the filter currently shows. */
  protected onToggleAllRequested(next: readonly T[]): void {
    if (this.selectionLocked()) {
      return;
    }
    this.onTouched();
    this.commitSelectAll(next);
  }

  protected onDropped(event: CdkDragDrop<readonly SelectOption<T>[]>): void {
    if (this.isDisabled() || event.previousIndex === event.currentIndex) {
      return;
    }
    const reordered = this.normalizedOptions().map((option) => (option.source ?? option) as SelectOption<T>);
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.reorder.emit({ previousIndex: event.previousIndex, currentIndex: event.currentIndex, options: reordered });
  }

  /** A click on a drag row: with `metaKeySelection`, a plain click replaces the selection. */
  protected onRowClick(event: MouseEvent, option: SelectOption<T>): void {
    if (this.multiple() && this.metaKeySelection() && !event.ctrlKey && !event.metaKey) {
      this.onOptionReplaced(option.value);
    } else {
      this.onOptionToggled(option.value);
    }
    this.onOptionClicked({ value: option.value, originalEvent: event }, option.disabled);
  }

  protected onRowDoubleClick(event: MouseEvent, option: SelectOption<T>): void {
    this.onOptionDoubleClicked({ value: option.value, originalEvent: event }, option.disabled);
  }

  /** Whether focus is currently somewhere inside the list (its filter, header, rows or panel). */
  private focusInside = false;
  /** Set after the first render: the focus `SelectPanelComponent` grabs while initializing must not count as the user focusing the list. */
  private rendered = false;

  protected onFocusIn(event: FocusEvent): void {
    if (this.focusInside) {
      return;
    }
    this.focusInside = true;
    if (this.rendered) {
      this.listFocus.emit(event);
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && (event.currentTarget as HTMLElement).contains(next)) {
      return;
    }
    this.focusInside = false;
    this.onTouched();
    this.listBlur.emit(event);
  }

  /** Re-emits a click on an enabled option; a disabled list reports nothing. */
  protected onOptionClicked(event: ListboxOptionEvent<T>, optionDisabled?: boolean): void {
    if (!this.isDisabled() && !optionDisabled) {
      this.optionClicked.emit(event);
    }
  }

  protected onOptionDoubleClicked(event: ListboxOptionEvent<T>, optionDisabled?: boolean): void {
    if (!this.isDisabled() && !optionDisabled) {
      this.optionDoubleClicked.emit(event);
    }
  }

  protected onOptionReplaced(optionValue: T): void {
    if (this.selectionLocked()) {
      return;
    }
    this.onTouched();
    this.commit([optionValue], optionValue);
  }

  protected onOptionToggled(optionValue: T): void {
    if (this.selectionLocked()) {
      return;
    }
    this.onTouched();
    if (this.multiple()) {
      const current = this.multiValue();
      const next = this.isSelected(optionValue) ? current.filter((v) => !isSameOptionValue(v, optionValue, this.dataKey())) : [...current, optionValue];
      this.commit(next, optionValue);
    } else {
      this.commit(optionValue, optionValue);
    }
  }

  writeValue(value: T | readonly T[] | null | undefined): void {
    this.value.set(value ?? (this.multiple() ? [] : null));
  }

  registerOnChange(fn: (value: T | readonly T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
