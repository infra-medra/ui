import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  contentChild,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChipComponent } from '../chip/chip.component';
import { IconComponent } from '../icon/icon.component';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.component';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { mergeClasses } from '../utils/merge-classes';
import { InputTextSize, inputTextVariants } from '../input-text/input-text.styles';
import { inputChipsWrapperVariants } from '../input-chips/input-chips.styles';
import { SELECT_PANEL_CLASS } from '../select/select.styles';
import { SelectOption } from '../select/select.types';
import { AutocompletePanelComponent } from './autocomplete-panel.component';
import { AutocompleteGroupContext, AutocompleteItemContext } from './autocomplete.types';

let nextAutocompleteId = 0;

/**
 * Extra `padding-inline-end` reserved for the trailing clear-button/spinner
 * slot, per size — applied via inline style rather than an extra `pr-*`
 * Tailwind class: `inputTextVariants` already emits `px-*` for the base
 * field padding, and tailwind-merge keeps both `px-*` and a later `pr-*`
 * class in the output (they don't fully conflict in its default config) —
 * which one actually wins for `padding-right` then depends on the generated
 * stylesheet's rule order, not on class string order, which isn't something
 * to depend on. An inline style always wins over both, unambiguously.
 */
const TRAILING_PADDING_REM: Record<InputTextSize, string> = { sm: '1.75rem', default: '2rem', lg: '2.25rem' };

/** Same slot plus a second one for the `dropdown` toggle button, reserved unconditionally whenever `dropdown` is on — same static-reservation approach `PasswordComponent`/`DatePickerComponent` already use for their own combined trailing slots. */
const TRAILING_PADDING_WITH_DROPDOWN_REM: Record<InputTextSize, string> = { sm: '3.25rem', default: '3.75rem', lg: '4.25rem' };

/**
 * Autocomplete primitive (Tier 2). WAI-ARIA APG "Editable Combobox With List
 * Autocomplete": `role="combobox"` lives directly on the real `<input>`
 * (unlike Select, whose trigger is a `<div>`) because the user types free
 * text into it. DOM focus never leaves that input while the suggestion
 * panel is open — `aria-activedescendant` on the input just points
 * assistive tech at the "virtually active" row, and all keyboard handling
 * (arrows/Enter/Escape) happens on the input itself instead of being
 * delegated to the panel (contrast with `SelectPanelComponent`, which owns
 * its own keydown handling because focus actually moves into it).
 *
 * Suggestions are consumer-driven, not filtered locally: typing emits `(search)` (debounced by
 * `searchDelay`, once the query reaches `minLength`) and the consumer sets `[suggestions]` in
 * response — supporting both a local in-memory filter and a real server-side search behind the same
 * API. `loading` is a plain input the consumer flips around its own fetch, shown as a spinner in
 * place of the clear button — the *only* loading affordance; the panel itself never opens with a
 * "searching" placeholder (see `scheduleSearch()`/ `openWhenSearchSettles`), since showing a
 * dropdown just to say "searching" and then immediately replacing it with the real answer reads as
 * more noise than signal. Since the panel is an imperatively-opened overlay (not template-bound),
 * an `effect()` pushes `suggestions`/`activeIndex`/ selection changes into it for as long as it's
 * open.
 *
 * Value type is `SelectOption<T> | null`, not bare `T` like Select: unlike
 * Select, there's no always-available full option list to resolve a label
 * from when `writeValue()` seeds an initial value — the option carries its
 * own label so the input can always display it, regardless of what the
 * consumer's `suggestions` currently holds.
 *
 * **Scope reduced for v1**: picking a suggestion is the only way to produce
 * a value — no `forceSelection`-style "commit free text" or "revert to last
 * selection on blur". Typing without picking anything just leaves the
 * control's value at whatever it last was. Can be added later without an
 * API break if a real free-text use case shows up.
 *
 * **`multiple` (added 2026-09-08)**: value becomes
 * `readonly SelectOption<T>[]` instead of `SelectOption<T> | null` — same
 * runtime-mode-decides-the-value-shape precedent `DatePickerComponent`
 * already established for `selectionMode` (`Date | null` vs. `{ start,
 * end }`), just here toggled by a boolean instead of a string enum. Picked
 * suggestions render as removable `<med-chip>`s (dogfooding Chip, same as
 * `MultiSelect`'s own `display="chip"`) inside a styled wrapper that also
 * hosts the search `<input>` inline — the same "chips + input in one
 * flex-wrap container" shape `InputChipsComponent` already uses, though
 * this component's `<input>` stays purely a search query, never itself
 * becoming a chip. Selecting a suggestion appends to the array (skipping an
 * exact duplicate `value`), clears the query text, and closes the panel —
 * same close-after-select flow single mode already has, so the next
 * keystroke starts a fresh search rather than reopening a stale list. Only
 * the trigger's own markup branches on `multiple()`; every existing
 * search/debounce/loading/keyboard mechanic above is untouched and shared
 * by both modes.
 *
 * **`dropdown`** adds a chevron button that searches with an empty string (bypassing `minLength`)
 * when clicked while closed, or just closes the panel when clicked while open — the `dropdownMode:
 * 'blank'` default. Goes through the same `scheduleSearch()`/`awaitingResults()` machinery as
 * typing (minus the debounce, since a click is already a deliberate one-shot action), so a consumer
 * that flips `loading` around its fetch still gets the panel opened only once real results land,
 * exactly like a typed search.
 *
 * **`virtualScroll`** renders only the visible rows of a long suggestion
 * list, and **`lazy`** emits `lazyLoad` with the visible range when the list
 * scrolls near its end, so the consumer can append the next page of
 * suggestions. Home/End jump to the first/last suggestion while the virtual
 * panel is open.
 */
@Component({
  selector: 'med-autocomplete',
  standalone: true,
  imports: [IconComponent, ProgressSpinnerComponent, ChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative inline-block w-full' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
  template: `
    @if (multiple()) {
      <div [class]="multipleWrapperClass()" [style.paddingInlineEnd]="trailingPaddingRem()" (click)="focusInput()">
        @for (option of selectedMultiple(); track $index) {
          <med-chip [removable]="!readonly()" [removeLabel]="'Remove ' + option.label" (removed)="removeChip($event, option.value)">{{ option.label }}</med-chip>
        }
        <input
          #trigger
          type="text"
          role="combobox"
          autocomplete="off"
          [id]="inputId()"
          aria-autocomplete="list"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-controls]="isOpen() ? panelElementId : null"
          [attr.aria-activedescendant]="activeOptionId()"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          class="min-w-16 flex-1 border-0 bg-transparent p-0 text-inherit text-surface-900 outline-none placeholder:text-surface-400 disabled:cursor-not-allowed dark:text-surface-50 dark:placeholder:text-surface-500"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [value]="queryText()"
          [placeholder]="selectedMultiple().length === 0 ? placeholder() : ''"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          (focus)="onFocus($event)"
          (blur)="onBlur($event)"
        />
      </div>
    } @else {
      <input
        #trigger
        type="text"
        role="combobox"
        autocomplete="off"
        [id]="inputId()"
        aria-autocomplete="list"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="isOpen() ? panelElementId : null"
        [attr.aria-activedescendant]="activeOptionId()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [class]="inputClass()"
        [style.paddingInlineEnd]="trailingPaddingRem()"
        [disabled]="isDisabled()"
        [readOnly]="readonly()"
        [value]="queryText()"
        [placeholder]="placeholder()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (focus)="onFocus($event)"
        (blur)="onBlur($event)"
      />
    }
    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 pr-(--spacing-field-x)">
      @if (loading()) {
        <med-progress-spinner size="sm" />
      } @else if (showClear() && hasSelection() && !isDisabled() && !readonly()) {
        <button
          type="button"
          class="pointer-events-auto inline-flex items-center justify-center rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
          [attr.aria-label]="clearLabel()"
          (click)="clear($event)"
        >
          <med-icon name="x-mark" variant="mini" class="size-3.5" />
        </button>
      }
      @if (dropdown()) {
        <button
          type="button"
          class="pointer-events-auto inline-flex items-center justify-center rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
          [disabled]="isDisabled() || readonly()"
          [attr.aria-label]="dropdownAriaLabel()"
          (click)="onDropdownClick($event)"
        >
          <med-icon name="chevron-down" variant="mini" class="size-4" />
        </button>
      }
    </span>
  `,
})
export class AutocompleteComponent<T = unknown> implements ControlValueAccessor, OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly instanceId = nextAutocompleteId++;
  protected readonly panelElementId = `med-autocomplete-panel-${this.instanceId}`;

  readonly suggestions = input<readonly SelectOption<T>[]>([]);
  readonly size = input<InputTextSize>('default');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly dropdown = input(false, { transform: booleanAttribute });
  readonly dropdownAriaLabel = input('Show suggestions');
  readonly minLength = input(1, { transform: numberAttribute });
  readonly searchDelay = input(300, { transform: numberAttribute });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly placeholder = input('Search');
  readonly emptyLabel = input('No results found');
  readonly clearLabel = input('Clear');
  readonly inputId = input<string | null>(null);
  readonly multiple = input(false, { transform: booleanAttribute });
  /**
   * Restricts the value to a picked suggestion. On blur, typed text that was
   * not picked from the suggestions is discarded: the field returns to the
   * label of the picked suggestion, or becomes empty when there is none (the
   * control value is then `null`, or unchanged in `multiple` mode). While
   * on, typing no longer clears the current pick, since the pick is kept
   * until blur. Defaults to `false`, which keeps free text in the field.
   */
  /**
   * Searches as soon as the field receives focus, with the current text even
   * when empty (bypassing `minLength`, like the `dropdown` button). Never
   * searches when the field is disabled. Defaults to `false`.
   */
  readonly completeOnFocus = input(false, { transform: booleanAttribute });
  /**
   * Shows the value without allowing typing, opening the panel, clearing or
   * removing chips. Defaults to `false`.
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * Highlights the first enabled suggestion when the panel opens, so Enter
   * picks it right away. Defaults to `true`; when `false`, no suggestion is
   * active until the user moves with the arrow keys or the pointer.
   */
  readonly autoHighlight = input(true, { transform: booleanAttribute });
  /**
   * Prevents picking the same value twice in `multiple` mode. Defaults to
   * `true`; when `false`, a repeated pick appends the value again. Removing
   * a chip removes every chip with that value, whether or not `unique` is on.
   */
  readonly unique = input(true, { transform: booleanAttribute });
  /**
   * Maximum height of the suggestion list, as any CSS length (`'120px'`,
   * `'20rem'`). Taller lists scroll inside the panel. Defaults to `'15rem'`.
   */
  readonly scrollHeight = input('15rem');
  /**
   * Renders only the visible rows of the suggestion list, for lists of
   * thousands of items. Rows have a fixed height (`virtualScrollItemSize`).
   * Defaults to `false`.
   */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /**
   * Row height in px of the virtual list. A taller `#item` template needs a
   * matching value. Defaults to `36`.
   */
  readonly virtualScrollItemSize = input(36, { transform: numberAttribute });
  /**
   * With `virtualScroll`, emits `lazyLoad` when the list scrolls near its
   * end. Defaults to `false`.
   */
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly forceSelection = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  readonly search = output<string>();
  /** Emits the suggestion that was just picked. */
  readonly optionSelected = output<SelectOption<T>>();
  /** Emits the option whose chip was just removed, in `multiple` mode. */
  readonly optionRemoved = output<SelectOption<T>>();
  /** Emits when the input receives focus. */
  readonly inputFocus = output<FocusEvent>();
  /** Emits when the input loses focus. */
  readonly inputBlur = output<FocusEvent>();
  /** Emits when the clear button empties the field. */
  readonly cleared = output<void>();
  /** Emits when the suggestion panel opens. */
  readonly panelShow = output<void>();
  /** Emits when the suggestion panel closes. */
  readonly panelHide = output<void>();
  /** Emits when the dropdown button is clicked. */
  readonly dropdownClick = output<MouseEvent>();
  /** Emits the visible row range (`{ first, last }`) when a `lazy` virtual list scrolls near its end. */
  readonly lazyLoad = output<{ first: number; last: number }>();

  private readonly selected = signal<SelectOption<T> | null>(null);
  protected readonly selectedMultiple = signal<readonly SelectOption<T>[]>([]);
  protected readonly queryText = signal('');
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly selectedOption = computed(() => this.selected());
  protected readonly hasSelection = computed(() => (this.multiple() ? this.selectedMultiple().length > 0 : this.selected() !== null));
  /** Passed to the panel as `selectedValue` so it can check-mark every already-picked suggestion, not just one. */
  private readonly selectedValues = computed(() => (this.multiple() ? this.selectedMultiple().map((o) => o.value) : (this.selected()?.value ?? null)));

  protected readonly activeOptionId = computed(() => {
    const index = this.activeIndex();
    return this.isOpen() && index >= 0 ? `${this.panelElementId}-option-${index}` : null;
  });

  /**
   * Template for each suggestion row, by named reference `#item` (context `AutocompleteItemContext`).
   * Rows keep `role="option"`, so keyboard navigation and ARIA are unchanged; a taller
   * `#item` needs a matching `virtualScrollItemSize` when virtualized.
   */
  readonly itemTemplate = contentChild<TemplateRef<AutocompleteItemContext<T>>>('item');
  /** Template for each group header row, by named reference `#group` (context `AutocompleteGroupContext`). */
  readonly groupTemplate = contentChild<TemplateRef<AutocompleteGroupContext>>('group');
  /** Template for the empty state shown when no suggestion matches, by named reference `#empty`. */
  readonly emptyTemplate = contentChild<TemplateRef<void>>('empty');
  /** Template shown in place of the list while `loading` is on and the panel is open, by named reference `#loader`. */
  readonly loaderTemplate = contentChild<TemplateRef<void>>('loader');

  private readonly triggerRef = viewChild.required<ElementRef<HTMLInputElement>>('trigger');
  private handle: OverlayHandle<AutocompletePanelComponent<T>, void> | null = null;
  private searchTimeoutId: ReturnType<typeof setTimeout> | undefined;
  /** Set while a dispatched search hasn't produced its answer yet — see `scheduleSearch()`. */
  private readonly awaitingResults = signal(false);

  private onChange: (value: SelectOption<T> | readonly SelectOption<T>[] | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly inputClass = computed(() => mergeClasses(inputTextVariants({ size: this.size(), invalid: this.invalid() }), this.class()));
  protected readonly multipleWrapperClass = computed(() =>
    mergeClasses(inputChipsWrapperVariants({ size: this.size(), invalid: this.invalid(), disabled: this.isDisabled() }), this.class()),
  );
  protected readonly trailingPaddingRem = computed(() =>
    this.dropdown() ? TRAILING_PADDING_WITH_DROPDOWN_REM[this.size()] : TRAILING_PADDING_REM[this.size()],
  );

  /**
   * Keeps the (imperatively-opened) overlay panel in sync while it's open —
   * see class doc. Also re-clamps `activeIndex` whenever `suggestions`
   * changes: the consumer's `suggestions` update (in response to `search`)
   * usually lands one change-detection tick after `open()` already
   * snapshotted an active index from the previous (often empty/stale) list,
   * so without this, the highlighted row could point past the end of the
   * real list, or land on a now-disabled option, or stay at -1 forever even
   * though real suggestions did arrive.
   */
  private readonly syncPanel = effect(() => {
    const options = this.suggestions();
    const requestedActiveIndex = this.activeIndex();
    const selectedValue = this.selectedValues();
    const emptyLabel = this.emptyLabel();
    const autoHighlight = this.autoHighlight();
    const itemTemplate = this.itemTemplate() ?? null;
    const groupTemplate = this.groupTemplate() ?? null;
    const emptyTemplate = this.emptyTemplate() ?? null;
    const loaderTemplate = this.loaderTemplate() ?? null;
    const loading = this.loading();
    if (!this.handle) {
      return;
    }
    const stillValid = requestedActiveIndex >= 0 && requestedActiveIndex < options.length && !options[requestedActiveIndex]?.disabled;
    const activeIndex = stillValid ? requestedActiveIndex : (autoHighlight ? options.findIndex((option) => !option.disabled) : -1);
    if (activeIndex !== requestedActiveIndex) {
      this.activeIndex.set(activeIndex);
    }
    this.handle.componentRef.setInput('options', options);
    this.handle.componentRef.setInput('activeIndex', activeIndex);
    this.handle.componentRef.setInput('selectedValue', selectedValue);
    this.handle.componentRef.setInput('emptyLabel', emptyLabel);
    this.handle.componentRef.setInput('itemTemplate', itemTemplate);
    this.handle.componentRef.setInput('groupTemplate', groupTemplate);
    this.handle.componentRef.setInput('emptyTemplate', emptyTemplate);
    this.handle.componentRef.setInput('loaderTemplate', loaderTemplate);
    this.handle.componentRef.setInput('loading', loading);
  });

  /**
   * `scheduleSearch()` defers opening the panel while a dispatched search is
   * still in flight (`awaitingResults`) instead of opening it right away
   * with whatever's still in `suggestions` (the *previous* query's answer)
   * — this effect is what actually opens it, once `loading` flips back to
   * `false` and there's a real answer to show. The input's own spinner is
   * the only "something is happening" affordance; the panel only ever shows
   * up already holding its final answer (a match list, or "no results").
   */
  private readonly openWhenSearchSettles = effect(() => {
    const loading = this.loading();
    if (this.awaitingResults() && !loading) {
      this.awaitingResults.set(false);
      this.open();
    }
  });

  protected onInput(event: Event): void {
    if (this.readonly()) {
      return;
    }
    const text = (event.target as HTMLInputElement).value;
    this.queryText.set(text);
    // Only single mode clears the current pick on typing — the query is the
    // value there. In multiple mode the chips are separate committed
    // selections, unrelated to whatever's still being typed in the query.
    if (!this.multiple() && !this.forceSelection() && this.selected() !== null) {
      this.setValue(null);
    }
    this.scheduleSearch(text);
  }

  protected focusInput(): void {
    this.triggerRef().nativeElement.focus();
  }

  protected removeChip(event: MouseEvent | KeyboardEvent, optionValue: T): void {
    if (this.readonly()) {
      return;
    }
    event.stopPropagation(); // a real DOM click still bubbles from the chip's remove button through the wrapper's own (click)="focusInput()" — harmless either way, but stopped here for the same predictable-and-explicit reasoning `MultiSelectComponent.removeChip` already documents.
    const removed = this.selectedMultiple().find((option) => option.value === optionValue);
    this.setMultiValue(this.selectedMultiple().filter((option) => option.value !== optionValue));
    if (removed) {
      this.optionRemoved.emit(removed);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen() ? this.moveActive(1) : this.open();
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this.moveActive(-1);
        }
        break;
      case 'Enter':
        if (this.isOpen()) {
          event.preventDefault();
          this.selectActive();
        }
        break;
      case 'Home':
      case 'End':
        // Only the virtual list takes these over; elsewhere they keep moving the caret in the input.
        if (this.isOpen() && this.virtualScroll()) {
          event.preventDefault();
          this.jumpActive(event.key === 'Home' ? 'first' : 'last');
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close();
        }
        break;
    }
  }

  protected onFocus(event: FocusEvent): void {
    this.inputFocus.emit(event);
    if (!this.completeOnFocus() || this.isDisabled() || this.readonly()) {
      return;
    }
    clearTimeout(this.searchTimeoutId);
    this.search.emit(this.queryText());
    this.awaitingResults.set(true);
  }

  protected onBlur(event: FocusEvent): void {
    this.inputBlur.emit(event);
    this.onTouched();
    this.awaitingResults.set(false);
    this.close();
    if (this.forceSelection()) {
      this.queryText.set(this.multiple() ? '' : (this.selected()?.label ?? ''));
    }
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.multiple()) {
      this.setMultiValue([]);
    } else {
      this.setValue(null);
    }
    this.queryText.set('');
    this.awaitingResults.set(false);
    this.close();
    this.cleared.emit();
    this.triggerRef().nativeElement.focus();
  }

  protected onDropdownClick(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled() || this.readonly()) {
      return;
    }
    this.dropdownClick.emit(event as MouseEvent);
    if (this.isOpen()) {
      this.close();
      return;
    }
    clearTimeout(this.searchTimeoutId);
    this.search.emit('');
    this.awaitingResults.set(true);
    this.focusInput();
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimeoutId);
    this.handle?.close();
  }

  private scheduleSearch(text: string): void {
    clearTimeout(this.searchTimeoutId);
    if (text.trim().length < this.minLength()) {
      this.awaitingResults.set(false);
      this.close();
      return;
    }
    this.searchTimeoutId = setTimeout(() => {
      this.close(); // hide any previous query's (now stale) results while this one is outstanding
      // Deliberately not deciding "open now vs. wait" from here by reading
      // `this.loading()` synchronously: `search.emit()` below calls the
      // consumer's handler *synchronously*, but if it flips its own
      // `loading` signal in response, that change reaches our `loading`
      // input through a change-detection pass that hasn't run yet at this
      // point in the callback — reading it here would see the stale
      // pre-search value every time. `openWhenSearchSettles()` re-evaluates
      // once that pass (and any effect flush) has actually happened, so it
      // sees the real value — for a synchronous consumer that never sets
      // `loading` at all, `loading()` is simply always false and it opens
      // right away, same as before.
      this.search.emit(text);
      this.awaitingResults.set(true);
    }, this.searchDelay());
  }

  private open(): void {
    if (this.isOpen()) {
      return;
    }
    this.activeIndex.set(this.autoHighlight() ? this.firstEnabledIndex() : -1);
    this.isOpen.set(true);

    const handle = this.overlayService.openConnected<AutocompletePanelComponent<T>, void>(this.triggerRef().nativeElement, AutocompletePanelComponent, {
      panelClass: SELECT_PANEL_CLASS,
      // Origin (for positioning) is the bare input, but the host also
      // contains the clear/dropdown buttons — without this, clicking either
      // one reads as an "outside" click (its own pointerdown/click listener
      // hasn't even run yet by the time CDK's own capturing document
      // listener decides that and closes the panel first), so
      // `onDropdownClick`'s own open/closed check would always see it as
      // already closed and reopen instead of closing.
      exclusionElement: this.hostRef.nativeElement,
    });
    this.handle = handle;
    handle.overlayRef.overlayElement.style.width = `${this.triggerRef().nativeElement.offsetWidth}px`;

    handle.componentRef.setInput('panelId', this.panelElementId);
    handle.componentRef.setInput('options', this.suggestions());
    handle.componentRef.setInput('activeIndex', this.activeIndex());
    handle.componentRef.setInput('selectedValue', this.selectedValues());
    handle.componentRef.setInput('emptyLabel', this.emptyLabel());
    handle.componentRef.setInput('itemTemplate', this.itemTemplate() ?? null);
    handle.componentRef.setInput('groupTemplate', this.groupTemplate() ?? null);
    handle.componentRef.setInput('emptyTemplate', this.emptyTemplate() ?? null);
    handle.componentRef.setInput('loaderTemplate', this.loaderTemplate() ?? null);
    handle.componentRef.setInput('loading', this.loading());
    handle.componentRef.setInput('scrollHeight', this.scrollHeight());
    handle.componentRef.setInput('virtualScroll', this.virtualScroll());
    handle.componentRef.setInput('virtualScrollItemSize', this.virtualScrollItemSize());
    handle.componentRef.setInput('lazy', this.lazy());

    handle.componentRef.instance.optionSelect.subscribe((option: SelectOption<T>) => this.selectOption(option));
    handle.componentRef.instance.rangeChanged.subscribe((range: { first: number; last: number }) => this.lazyLoad.emit(range));
    handle.componentRef.instance.optionHover.subscribe((index: number) => this.activeIndex.set(index));

    handle.closed$.subscribe(() => {
      this.isOpen.set(false);
      this.handle = null;
      this.panelHide.emit();
    });
    this.panelShow.emit();
  }

  private close(): void {
    this.handle?.close();
  }

  private selectOption(option: SelectOption<T>): void {
    this.optionSelected.emit(option);
    if (this.multiple()) {
      const current = this.selectedMultiple();
      if (!this.unique() || !current.some((selected) => selected.value === option.value)) {
        this.setMultiValue([...current, option]);
      }
      this.queryText.set('');
    } else {
      this.setValue(option);
      this.queryText.set(option.label);
    }
    // No explicit refocus needed: the panel is always open when this runs,
    // and `OverlayService.close()` already restores focus to whatever was
    // focused when it opened — the host <input> itself (contrast with
    // `clear()`, where the panel is typically already closed, so there's no
    // such auto-restore to rely on).
    this.close();
  }

  private selectActive(): void {
    const option = this.suggestions()[this.activeIndex()];
    if (option && !option.disabled) {
      this.selectOption(option);
    }
  }

  private firstEnabledIndex(): number {
    return this.suggestions().findIndex((option) => !option.disabled);
  }

  private jumpActive(edge: 'first' | 'last'): void {
    const options = this.suggestions();
    const indexes = options.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index !== -1);
    if (indexes.length > 0) {
      this.activeIndex.set(edge === 'first' ? indexes[0] : indexes[indexes.length - 1]);
    }
  }

  private moveActive(step: 1 | -1): void {
    const enabledIndexes = this.suggestions()
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index !== -1);
    if (enabledIndexes.length === 0) {
      return;
    }
    const currentPosition = enabledIndexes.indexOf(this.activeIndex());
    const nextPosition =
      currentPosition === -1 ? (step === 1 ? 0 : enabledIndexes.length - 1) : (currentPosition + step + enabledIndexes.length) % enabledIndexes.length;
    this.activeIndex.set(enabledIndexes[nextPosition]);
  }

  private setValue(value: SelectOption<T> | null): void {
    this.selected.set(value);
    this.onChange(value);
  }

  private setMultiValue(value: readonly SelectOption<T>[]): void {
    this.selectedMultiple.set(value);
    this.onChange(value);
  }

  writeValue(value: SelectOption<T> | readonly SelectOption<T>[] | null | undefined): void {
    if (this.multiple()) {
      this.selectedMultiple.set((value as readonly SelectOption<T>[] | null | undefined) ?? []);
      this.queryText.set('');
    } else {
      const option = (value as SelectOption<T> | null | undefined) ?? null;
      this.selected.set(option);
      this.queryText.set(option?.label ?? '');
    }
  }

  registerOnChange(fn: (value: SelectOption<T> | readonly SelectOption<T>[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
