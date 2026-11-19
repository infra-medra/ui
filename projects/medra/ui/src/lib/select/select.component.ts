import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  TemplateRef,
  OnDestroy,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  output,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { mergeClasses } from '../utils/merge-classes';
import { FieldVariant, inputTextVariants } from '../input-text/input-text.styles';
import { isSameOptionValue, normalizeSelectOptions } from './select-options';
import { SelectPanelComponent } from './select-panel.component';
import { SELECT_PANEL_CLASS, SelectSize, selectTriggerVariants } from './select.styles';
import { SelectChangeEvent, SelectFilterEvent, SelectFilterMatchMode, SelectOption, SelectOptionContext, SelectOptionDisabled, SelectOptionsInput, SelectValueContext } from './select.types';

let nextSelectId = 0;

/** Same slot(s) as the non-editable trigger's own trailing icons, reserved for the real `<input>` used when `editable` is on. */
const EDITABLE_TRAILING_PADDING_REM: Record<SelectSize, string> = { sm: '1.75rem', default: '2rem', lg: '2.25rem' };
const EDITABLE_TRAILING_PADDING_WITH_CLEAR_REM: Record<SelectSize, string> = { sm: '3.25rem', default: '3.75rem', lg: '4.25rem' };

/**
 * Select primitive (Tier 1). Custom combobox, not a styled native
 * `<select>` — the WAI-ARIA APG "Select-Only Combobox" pattern (a
 * `role="combobox"` trigger driving a `role="listbox"` overlay panel), which
 * is what gives full control over option styling and behavior (filter,
 * disabled options) that the native element can't offer.
 *
 * The trigger is a `<div>`, not a `<button>`: it needs to contain a real
 * nested `<button>` for the optional clear affordance, and a `<button>`
 * can't nest another `<button>`. Disabled state is therefore expressed via
 * `aria-disabled` (see `select.styles.ts`), not the `:disabled` pseudo-class.
 *
 * The dropdown panel (`SelectPanelComponent`) is shared with MultiSelect —
 * see that file for the keyboard-nav/filter logic.
 *
 * **`editable`** (added 2026-09-09) swaps the trigger for a real `<input>` whose typed text commits
 * live as the value, on every keystroke (typing never needs a blur/Enter to confirm, and an empty
 * field commits `null`). This inherently loosens the type-safety `SelectComponent<T>` otherwise
 * gives: a typed value is always a raw `string`, cast to `T` — meaningful only when `T` is (or
 * accepts) `string`.
 *
 * Typing a non-empty value auto-opens the panel — but unlike the non-editable trigger, DOM focus
 * deliberately never moves into that panel here (`SelectPanelComponent`'s `grabFocus` input, set to
 * `false` only in this mode): the whole point is to keep typing while it's open, which real focus
 * moving away would break immediately after the first keystroke. Since the panel's own `(keydown)`
 * binding therefore never fires, `onEditableKeydown()` forwards the *same* keyboard event straight
 * into it via its `handleExternalKeydown()` facade whenever it's open — same switch/case every
 * other consumer gets, not a reimplementation. Clicking the field also opens it (matching the
 * non-editable trigger and every other combobox in this lib), and blurring it closes it (the panel
 * never took focus to begin with, so "focus genuinely left" is exactly what a blur on this input
 * means — same reasoning `AutocompleteComponent`'s own `onBlur()` already documents).
 *
 * **Scope cut for v1**: typing does not *filter* the panel's own option
 * list the way `AutoComplete`'s does — `filter()` stays independent and
 * opt-in, so a consumer wanting both a live filter and free-text entry
 * turns `filter` on explicitly rather than getting it bundled into
 * `editable` implicitly.
 *
 * **`lazy`/`lazyLoad`** (added 2026-09-09) forwards
 * `SelectPanelComponent`'s own `rangeChanged` — see that file's class doc
 * for why this is real scroll-position-triggered lazy loading, not a rename
 * of the client-side virtualization the panel already always does.
 */
@Component({
  selector: 'med-select',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative inline-block w-full', '[class.med-select-fluid]': 'fluid()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    @if (editable()) {
      <input
        #trigger
        type="text"
        role="combobox"
        autocomplete="off"
        [id]="inputId()"
        [attr.tabindex]="isDisabled() ? -1 : tabindex()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="ariaLabelledBy()"
        [attr.aria-required]="required() ? 'true' : null"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="isOpen() ? panelElementId : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [class]="editableTriggerClass()"
        [style.paddingInlineEnd]="editableTrailingPaddingRem()"
        [disabled]="isDisabled()"
        [value]="editableDisplayValue()"
        [placeholder]="placeholder()"
        (click)="onEditableTriggerClick($event)"
        (focus)="inputFocus.emit($event)"
        (input)="onEditableInput($event)"
        (keydown)="onEditableKeydown($event)"
        (blur)="onEditableBlur($event)"
      />
      <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 pr-(--spacing-field-x)">
        @if (showClear() && editableDisplayValue() && !isDisabled()) {
          <button
            type="button"
            class="pointer-events-auto inline-flex items-center justify-center rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            [attr.aria-label]="clearLabel()"
            (click)="clear($event)"
          >
            @if (clearIconTemplate(); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl" />
            } @else {
              <med-icon name="x-mark" variant="mini" class="size-3.5" />
            }
          </button>
        }
        @if (triggerIconTemplate(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" />
        } @else {
          <med-icon name="chevron-down" variant="mini" class="size-4 text-surface-400" />
        }
      </span>
    } @else {
      <div
        #trigger
        role="combobox"
        [id]="inputId()"
        [attr.tabindex]="isDisabled() ? -1 : tabindex()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="ariaLabelledBy()"
        [attr.aria-required]="required() ? 'true' : null"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="isOpen() ? panelElementId : null"
        [attr.aria-disabled]="isDisabled() ? 'true' : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [class]="triggerClass()"
        (click)="onTriggerClick($event)"
        (keydown)="onTriggerKeydown($event)"
        (focus)="inputFocus.emit($event)"
        (blur)="onTriggerBlur($event)"
      >
        @if (selectedOption(); as option) {
          @if (valueTemplate(); as tpl) {
            <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: option.value, option: option }" />
          } @else {
            <span class="truncate">{{ option.label }}</span>
          }
        } @else {
          <span class="truncate text-surface-400 dark:text-surface-500">{{ placeholder() }}</span>
        }
        <span class="flex shrink-0 items-center gap-1">
          @if (showClear() && selectedOption() && !isDisabled()) {
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
              [attr.aria-label]="clearLabel()"
              (click)="clear($event)"
            >
              @if (clearIconTemplate(); as tpl) {
                <ng-container [ngTemplateOutlet]="tpl" />
              } @else {
                <med-icon name="x-mark" variant="mini" class="size-3.5" />
              }
            </button>
          }
          @if (triggerIconTemplate(); as tpl) {
            <ng-container [ngTemplateOutlet]="tpl" />
          } @else {
            <med-icon name="chevron-down" variant="mini" class="size-4 text-surface-400" />
          }
        </span>
      </div>
    }
    @if (name(); as fieldName) {
      <input type="hidden" [name]="fieldName" [value]="hiddenValue()" />
    }
  `,
})
export class SelectComponent<T = unknown> implements ControlValueAccessor, OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly instanceId = nextSelectId++;
  protected readonly panelElementId = `med-select-panel-${this.instanceId}`;

  /** Options as the consumer holds them: the `SelectOption` shape, or any objects read through the `option*` mapping inputs. */
  readonly options = input<SelectOptionsInput<T>>([]);
  /** Field read as the option label (default `'label'`). */
  readonly optionLabel = input('label');
  /** Field read as the option value (default `'value'`). */
  readonly optionValue = input('value');
  /** Field name, or predicate over the consumer's option object, that marks an option disabled (default `'disabled'`). */
  readonly optionDisabled = input<SelectOptionDisabled>('disabled');
  /** Field read as a group's header label; `null` falls back to `optionLabel`. */
  readonly optionGroupLabel = input<string | null>(null);
  /** Field holding each group's child options; `null` (default) means `options` is a flat list. */
  readonly optionGroupChildren = input<string | null>(null);
  /** Field that identifies an object value, so a value written as a different reference still matches its option (default: compare by reference). */
  readonly dataKey = input<string | null>(null);
  readonly size = input<SelectSize>('default');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly filter = input(false, { transform: booleanAttribute });
  /** Comma-separated fields of the option object the filter compares; `null` (default) compares the option label. */
  readonly filterBy = input<string | null>(null);
  /** How the filter compares the typed text with each option: contains (default), notContains, startsWith, endsWith, equals or notEquals. */
  readonly filterMatchMode = input<SelectFilterMatchMode>('contains');
  /** Clears the filter text when the panel closes; off (default), the text is kept and shown again on the next opening. */
  readonly resetFilterOnHide = input(false, { transform: booleanAttribute });
  /** Whether the filter box takes focus when the panel opens. */
  readonly autofocusFilter = input(true, { transform: booleanAttribute });
  readonly showClear = input(false, { transform: booleanAttribute });
  /** Shows a spinner in the panel instead of the option list — for options fetched asynchronously. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Real, always-typeable `<input>` trigger whose text commits directly as the value — see class doc. */
  readonly editable = input(false, { transform: booleanAttribute });
  /** Forwards the panel's own scroll-position-triggered `rangeChanged` — see class doc. */
  readonly lazy = input(false, { transform: booleanAttribute });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly placeholder = input('Select an option');
  readonly filterPlaceholder = input('Search');
  readonly emptyLabel = input('No results found');
  readonly loadingLabel = input('Loading...');
  readonly clearLabel = input('Clear');
  readonly inputId = input<string | null>(null);
  /** Name of a hidden `<input>` carrying the selected value, so a native form submission includes it. */
  readonly name = input<string | null>(null);
  /** Tab order of the field (default 0); a disabled field is always -1. */
  readonly tabindex = input(0, { transform: numberAttribute });
  /** Accessible name of the field (`aria-label`). */
  readonly ariaLabel = input<string | null>(null);
  /** Id of the element that labels the field (`aria-labelledby`). */
  readonly ariaLabelledBy = input<string | null>(null);
  /** Marks the field as required for assistive technology (`aria-required`); it does not validate. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Focuses the field once, when it is first rendered. */
  readonly autofocus = input(false, { transform: booleanAttribute });
  /** `outlined` (default) or `filled`: the filled field uses the tinted background of the theme. */
  readonly variant = input<FieldVariant>('outlined');
  /** Makes the field fill the width of its container. The host is always full width, so this only adds the `med-select-fluid` marker class. */
  readonly fluid = input(false, { transform: booleanAttribute });
  /** Extra class for the panel overlay. Default: `null`. */
  readonly panelStyleClass = input<string | null>(null);
  /** Largest height of the option list, as a pixel length such as `'200px'`; `null` (default) keeps 240px. */
  readonly scrollHeight = input<string | null>(null);
  /**
   * Where the panel is attached: `'body'` (default) keeps it in the overlay container of the CDK,
   * `'self'` moves it inside this component, and an `HTMLElement` moves it inside that element.
   */
  readonly appendTo = input<'body' | 'self' | HTMLElement>('body');
  readonly class = input('', { alias: 'class' });

  /** Template for the displayed value, by named reference `#value` (context `SelectValueContext`). Ignored in `editable` mode, whose field is a real `<input>`. */
  readonly valueTemplate = contentChild<TemplateRef<SelectValueContext<T>>>('value');
  /** Template for each option row, by named reference `#option` (context `SelectOptionContext`). Rows keep `role="option"` and the keyboard behavior. */
  readonly optionTemplate = contentChild<TemplateRef<SelectOptionContext<T>>>('option');
  /** Template for each group header, by named reference `#group`; the group label is the implicit value. */
  readonly groupTemplate = contentChild<TemplateRef<{ $implicit: string }>>('group');
  /** Template shown above the filter and the list, by named reference `#header`. */
  readonly headerTemplate = contentChild<TemplateRef<void>>('header');
  /** Template shown below the list, by named reference `#footer`. */
  readonly footerTemplate = contentChild<TemplateRef<void>>('footer');
  /** Template shown instead of the empty-state text, by named reference `#empty`. */
  readonly emptyTemplate = contentChild<TemplateRef<void>>('empty');
  /** Template replacing the open (chevron) icon, by named reference `#triggerIcon`. */
  readonly triggerIconTemplate = contentChild<TemplateRef<void>>('triggerIcon');
  /** Template replacing the loading indicator of the panel, by named reference `#loadingIcon`. */
  readonly loadingIconTemplate = contentChild<TemplateRef<void>>('loadingIcon');
  /** Template replacing the clear button's icon, by named reference `#clearIcon`. */
  readonly clearIconTemplate = contentChild<TemplateRef<void>>('clearIcon');

  readonly lazyLoad = output<{ first: number; last: number }>();
  /** Emits `{ value }` when the user picks an option from the panel. */
  readonly optionSelected = output<SelectChangeEvent<T>>();
  /** Emits just before the panel opens. A notification: it cannot cancel the opening. */
  readonly panelBeforeShow = output<void>();
  /** Emits once the panel is open. */
  readonly panelShow = output<void>();
  /** Emits just before the panel closes, whichever way it closes (pick, Escape, Tab, outside click). A notification: it cannot cancel the closing. */
  readonly panelBeforeHide = output<void>();
  /** Emits once the panel has closed. */
  readonly panelHide = output<void>();
  /** Emits the click event when the field is clicked while enabled. */
  readonly fieldClick = output<MouseEvent>();
  /** Emits when the user clears the value with the clear button. */
  readonly cleared = output<void>();
  /** Emits `{ filter }` with the text typed into the panel's filter box. */
  readonly filtered = output<SelectFilterEvent>();
  /** Emits when the field receives focus. */
  readonly inputFocus = output<FocusEvent>();
  /** Emits when focus leaves the field and its open panel; moving focus into the open panel does not emit. */
  readonly inputBlur = output<FocusEvent>();

  private readonly value = signal<T | null>(null);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly isOpen = signal(false);
  /** `options()` read through the mapping inputs into the flat shape the panel renders. */
  private readonly normalizedOptions = computed(() =>
    normalizeSelectOptions<T>(this.options(), {
      optionLabel: this.optionLabel(),
      optionValue: this.optionValue(),
      optionDisabled: this.optionDisabled(),
      optionGroupLabel: this.optionGroupLabel(),
      optionGroupChildren: this.optionGroupChildren(),
    }),
  );
  /** Value written to the hidden form input: the option's value as text, or empty when nothing is selected. */
  protected readonly hiddenValue = computed(() => {
    const current = this.value();
    if (current === null || current === undefined) {
      return '';
    }
    const selected = this.selectedOption()?.value ?? current;
    return typeof selected === 'object' ? JSON.stringify(selected) : String(selected);
  });
  protected readonly selectedOption = computed(() => this.normalizedOptions().find((option) => isSameOptionValue(option.value, this.value(), this.dataKey())) ?? null);

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private handle: OverlayHandle<SelectPanelComponent<T>, void> | null = null;

  constructor() {
    afterNextRender(() => {
      if (this.autofocus() && !this.isDisabled()) {
        this.triggerRef().nativeElement.focus();
      }
    });
  }

  private onChange: (value: T | null) => void = () => {};
  protected onTouched: () => void = () => {};

  /**
   * Pushes `options()` updates into the already-open panel while `lazy()` is
   * on — without this, a consumer appending freshly-loaded items in response
   * to `lazyLoad` would never see them reflected in the still-open panel,
   * since every other `setInput` call in `open()` only ever runs once, at
   * open time. Gated to `lazy()` so the ordinary (non-lazy) case keeps its
   * existing "options are a snapshot taken at open time" behavior unchanged.
   */
  private readonly syncLazyOptions = effect(() => {
    const options = this.normalizedOptions();
    if (this.handle && this.lazy()) {
      this.handle.componentRef.setInput('options', options);
    }
  });

  protected readonly triggerClass = computed(() =>
    mergeClasses(selectTriggerVariants({ size: this.size(), invalid: this.invalid(), variant: this.variant() }), this.class()),
  );

  protected readonly editableTriggerClass = computed(() => mergeClasses(inputTextVariants({ size: this.size(), invalid: this.invalid(), variant: this.variant() }), this.class()));

  protected readonly editableTrailingPaddingRem = computed(() =>
    this.showClear() ? EDITABLE_TRAILING_PADDING_WITH_CLEAR_REM[this.size()] : EDITABLE_TRAILING_PADDING_REM[this.size()],
  );

  /** A picked option's label takes priority; otherwise, whatever raw text was last typed (only ever a `string` in editable mode — see class doc). */
  protected readonly editableDisplayValue = computed(() => {
    const option = this.selectedOption();
    if (option) {
      return option.label;
    }
    const current = this.value();
    return typeof current === 'string' ? current : '';
  });

  protected onTriggerClick(event: MouseEvent): void {
    if (!this.isDisabled()) {
      this.fieldClick.emit(event);
      this.toggle();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.open();
        break;
    }
  }

  protected onTriggerBlur(event: FocusEvent): void {
    this.onTouched();
    this.emitInputBlur(event);
  }

  /** Focus handed to the open panel is not the field losing focus to the outside, so it is not reported. */
  private emitInputBlur(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.handle?.overlayRef.overlayElement.contains(next)) {
      return;
    }
    this.inputBlur.emit(event);
  }

  protected onEditableTriggerClick(event: MouseEvent): void {
    if (!this.isDisabled()) {
      this.fieldClick.emit(event);
      this.open();
    }
  }

  /**
   * While closed, ArrowDown/Up open the panel, same as the non-editable
   * trigger. Once open, every key (this input's own focus never leaves for
   * the panel — see class doc) is forwarded verbatim to the panel's own
   * handler, which already does the right thing for an `<input>` `target`
   * (its existing Space guard was written for its own internal filter box,
   * but applies just as correctly to this external one) — so plain letters
   * still type normally (never `preventDefault()`-ed there) while
   * Arrow/Home/End/Enter drive the panel underneath.
   */
  protected onEditableKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    if (!this.isOpen()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.open();
      }
      return;
    }
    this.handle?.componentRef.instance.handleExternalKeydown(event);
  }

  /**
   * Commits the typed text live, on every keystroke — an empty field
   * commits `null`. Opens the panel
   * once there's something to show a match against
   * own `onEditableInput` — which also highlights (never filters) whichever
   * option's label starts with the typed text; if the panel isn't open yet,
   * `open()` seeds that highlight via `initialSearchText` since the panel
   * doesn't exist to call `setActiveByPrefix()` on until after this method
   * returns; if it's already open, call it directly for a live update.
   */
  protected onEditableInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.setValue((text === '' ? null : text) as unknown as T | null);
    if (this.isOpen()) {
      this.handle?.componentRef.instance.setActiveByPrefix(text);
    } else if (text !== '') {
      this.open();
    }
  }

  /** The panel never takes real focus in this mode (see class doc), so a blur here means focus genuinely left — close it, same reasoning `AutocompleteComponent.onBlur()` already documents. */
  protected onEditableBlur(event: FocusEvent): void {
    this.onTouched();
    this.emitInputBlur(event);
    this.handle?.close();
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.setValue(null);
    this.cleared.emit();
  }

  /** Set on destroy so the panel closing with the component does not emit through already-destroyed outputs. */
  private destroyed = false;

  ngOnDestroy(): void {
    this.destroyed = true;
    this.handle?.close();
  }

  /** Text last typed in the panel's filter box, handed back to the next panel opening unless `resetFilterOnHide` clears it. */
  private filterText = '';

  private toggle(): void {
    if (this.isOpen()) {
      this.handle?.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    if (this.isOpen()) {
      return;
    }
    this.panelBeforeShow.emit();
    this.isOpen.set(true);

    const handle = this.overlayService.openConnected<SelectPanelComponent<T>, void>(this.triggerRef().nativeElement, SelectPanelComponent, {
      panelClass: this.panelStyleClass() ? [...SELECT_PANEL_CLASS, this.panelStyleClass() as string] : SELECT_PANEL_CLASS,
    });
    this.handle = handle;
    handle.overlayRef.overlayElement.style.width = `${this.triggerRef().nativeElement.offsetWidth}px`;

    const appendTo = this.appendTo();
    const target = appendTo === 'body' ? null : appendTo === 'self' ? this.hostRef.nativeElement : appendTo;
    if (target) {
      target.appendChild(handle.overlayRef.hostElement);
    }

    handle.componentRef.setInput('panelId', this.panelElementId);
    handle.componentRef.setInput('options', this.normalizedOptions());
    handle.componentRef.setInput('selectedValue', this.value());
    handle.componentRef.setInput('dataKey', this.dataKey());
    handle.componentRef.setInput('scrollHeight', this.scrollHeight());
    handle.componentRef.setInput('filterable', this.filter());
    handle.componentRef.setInput('filterPlaceholder', this.filterPlaceholder());
    handle.componentRef.setInput('initialFilterText', this.filterText);
    handle.componentRef.setInput('autofocusFilter', this.autofocusFilter());
    handle.componentRef.setInput('filterBy', this.filterBy());
    handle.componentRef.setInput('filterMatchMode', this.filterMatchMode());
    handle.componentRef.setInput('emptyLabel', this.emptyLabel());
    handle.componentRef.setInput('loading', this.loading());
    handle.componentRef.setInput('loadingLabel', this.loadingLabel());
    handle.componentRef.setInput('lazy', this.lazy());
    handle.componentRef.setInput('optionTemplate', this.optionTemplate() ?? null);
    handle.componentRef.setInput('groupTemplate', this.groupTemplate() ?? null);
    handle.componentRef.setInput('headerTemplate', this.headerTemplate() ?? null);
    handle.componentRef.setInput('footerTemplate', this.footerTemplate() ?? null);
    handle.componentRef.setInput('emptyTemplate', this.emptyTemplate() ?? null);
    handle.componentRef.setInput('loadingIconTemplate', this.loadingIconTemplate() ?? null);
    handle.componentRef.setInput('grabFocus', !this.editable());
    handle.componentRef.setInput('initialSearchText', this.editable() && typeof this.value() === 'string' ? (this.value() as unknown as string) : null);

    handle.componentRef.instance.optionToggled.subscribe((value: T) => {
      this.setValue(value);
      this.optionSelected.emit({ value });
      handle.close();
    });
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());
    handle.componentRef.instance.filterChanged.subscribe((filter: string) => {
      this.filterText = filter;
      this.filtered.emit({ filter });
    });
    handle.componentRef.instance.rangeChanged.subscribe((range) => this.lazyLoad.emit(range));

    handle.closed$.subscribe(() => {
      if (this.resetFilterOnHide()) {
        this.filterText = '';
      }
      if (!this.destroyed) {
        this.panelBeforeHide.emit();
      }
      this.isOpen.set(false);
      this.handle = null;
      if (!this.destroyed) {
        this.panelHide.emit();
      }
    });

    this.panelShow.emit();
  }

  private setValue(value: T | null): void {
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: T | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
