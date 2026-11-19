import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChipComponent } from '../chip/chip.component';
import { IconComponent } from '../icon/icon.component';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { FieldVariant } from '../input-text/input-text.styles';
import { mergeClasses } from '../utils/merge-classes';
import { SelectPanelComponent } from '../select/select-panel.component';
import { SELECT_PANEL_CLASS, SelectSize, selectTriggerVariants } from '../select/select.styles';
import { SelectFilterEvent, SelectFilterMatchMode } from '../select/select.types';
import { MultiSelectChangeEvent, MultiSelectChipRemoveEvent, MultiSelectChipRemoveLabelFn, MultiSelectSelectAllEvent, MultiSelectValueContext } from './multi-select.types';
import { SelectOption, SelectOptionContext, SelectOptionDisabled, SelectOptionsInput } from '../select/select.types';
import { isSameOptionValue, normalizeSelectOptions } from '../select/select-options';

let nextMultiSelectId = 0;

/**
 * MultiSelect primitive (Tier 1). Same combobox architecture as Select —
 * same trigger CVA, same `SelectPanelComponent` overlay — the only real
 * differences are the value shape (`T[]` instead of `T | null`) and that
 * choosing an option toggles it and keeps the panel open instead of closing
 * it, since picking more than one option is the whole point.
 *
 * Trigger summary defaults to the simple v1 shape: 1-2 selections show
 * their labels joined by a comma, 3+ collapse to "N selected".
 *
 * `display="chip"` (added 2026-09-08) swaps that summary
 * for one removable `<med-chip>` per selection instead — dogfooding this
 * library's own Chip rather than a bespoke pill. Each chip's own remove
 * button calls `event.stopPropagation()` (via `ChipComponent`'s `removed`
 * now emitting the real `MouseEvent`, see its own doc comment) so removing
 * a selection never also toggles the trigger's dropdown open/closed — a
 * real DOM click still bubbles from the button through the chip into the
 * `role="combobox"` trigger it sits inside, independent of Angular's own
 * `(removed)` event chain. Clicking a chip's *label* (not its remove
 * button) still opens the dropdown, same as clicking anywhere else on the
 * trigger — propagation is only stopped at the remove button itself, not
 * the whole chip.
 *
 * **`showToggleAll`/`selectionLimit`** (added 2026-09-09)
 * both live on `SelectPanelComponent` itself — see that file's class doc for
 * the full reasoning; this component just forwards the inputs and re-emits
 * `toggleAllRequested` the same way it already does `optionToggled`.
 */
@Component({
  selector: 'med-multi-select',
  standalone: true,
  imports: [IconComponent, ChipComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block w-full', '[class.med-multi-select-fluid]': 'fluid()', '[attr.data-virtual-scroll]': 'virtualScroll() ? "true" : null' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  template: `
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
      @if (display() === 'chip' && selectedOptions().length > 0) {
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          @for (option of selectedOptions(); track option.value) {
            <med-chip removable [removeLabel]="removeChipLabel(option)" (removed)="removeChip($event, option.value)">@if (chipTemplate(); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: option }" />
            } @else {
              {{ option.label }}
            }
            @if (chipRemoveIconTemplate(); as removeIcon) {
              <ng-template #removeicon><ng-container [ngTemplateOutlet]="removeIcon" /></ng-template>
            }
          </med-chip>
          }
        </div>
      } @else if (valueTemplate() && selectedOptions().length > 0) {
        <ng-container [ngTemplateOutlet]="valueTemplate()!" [ngTemplateOutletContext]="{ $implicit: value(), options: selectedOptions() }" />
      } @else if (triggerSummary(); as summary) {
        <span class="truncate">{{ summary }}</span>
      } @else {
        <span class="truncate text-surface-400 dark:text-surface-500">{{ placeholder() }}</span>
      }
      <span class="flex shrink-0 items-center gap-1">
        @if (showClear() && selectedOptions().length > 0 && !isDisabled()) {
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
    @if (name(); as fieldName) {
      @for (item of hiddenValues(); track $index) {
        <input type="hidden" [name]="fieldName" [value]="item" />
      }
    }
  `,
})
export class MultiSelectComponent<T = unknown> implements ControlValueAccessor, OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly instanceId = nextMultiSelectId++;
  protected readonly panelElementId = `med-multi-select-panel-${this.instanceId}`;

  /** The options to choose from: `SelectOption` objects, or any objects read through the `option*` mapping inputs. */
  readonly options = input<SelectOptionsInput<T>>([]);
  /** Field read as each option's label. Default `'label'`. */
  readonly optionLabel = input('label');
  /** Field read as each option's value. Default `'value'`. */
  readonly optionValue = input('value');
  /** Field name holding a boolean, or a predicate over the consumer's option object, marking it disabled. Default `'disabled'`. */
  readonly optionDisabled = input<SelectOptionDisabled>('disabled');
  /** Field read as a group's header label; `null` (the default) falls back to `optionLabel`. */
  readonly optionGroupLabel = input<string | null>(null);
  /** Field holding a group's child options; `null` (the default) means the list is flat. Nested groups are flattened into the flat `group` label the panel renders. */
  readonly optionGroupChildren = input<string | null>(null);
  /** Field that identifies an object value, so form values that are not the same references as the options still match. `null` (the default) compares by reference. */
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
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly placeholder = input('Select options');
  readonly filterPlaceholder = input('Search');
  readonly emptyLabel = input('No results found');
  readonly loadingLabel = input('Loading...');
  readonly clearLabel = input('Clear');
  readonly inputId = input<string | null>(null);
  readonly display = input<'comma' | 'chip'>('comma');
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". Interpolated with the option's own label, e.g. "Remove Blue". */
  readonly removeChipLabelTemplate = input<MultiSelectChipRemoveLabelFn>((optionLabel) => `Remove ${optionLabel}`);
  /** Force-hidden whenever `selectionLimit` is set — see `SelectPanelComponent`'s class doc. */
  readonly showToggleAll = input(true, { transform: booleanAttribute });
  readonly toggleAllLabel = input('Select all');
  /** `null` (the default) means no limit. */
  readonly selectionLimit = input<number | null>(null);
  readonly maxSelectedLabels = input<number>(2);
  readonly selectedItemsLabel = input('{0} selected');
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** Name of the hidden `<input>` elements carrying the chosen values (one per value, like a native `<select multiple>`), so a native form submission includes them. */
  readonly name = input<string | null>(null);
  /** Tab order of the field (default `0`). A disabled field always uses `-1`. */
  readonly tabindex = input(0, { transform: numberAttribute });
  /** Accessible name of the field (`aria-label`). */
  readonly ariaLabel = input<string | null>(null);
  /** Id of the element that labels the field (`aria-labelledby`). */
  readonly ariaLabelledBy = input<string | null>(null);
  /** Marks the field as required for assistive technology (`aria-required`); it does not validate. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Focuses the field once it has rendered, unless it is disabled. */
  readonly autofocus = input(false, { transform: booleanAttribute });
  /** Visual style of the field: `'outlined'` (default) or `'filled'`. */
  readonly variant = input<FieldVariant>('outlined');
  /** Makes the field fill the width of its container. The host is always full width, so this only adds the `med-multi-select-fluid` marker class. */
  readonly fluid = input(false, { transform: booleanAttribute });
  /** Extra CSS class added to the panel. */
  readonly panelStyleClass = input<string | null>(null);
  /** Largest height of the option list, as a pixel length such as `'200px'`; `null` (default) keeps 240px. */
  readonly scrollHeight = input<string | null>(null);
  /** Where the panel is attached: `'body'` (default), `'self'` (inside this component) or an element of the consumer. */
  readonly appendTo = input<'body' | 'self' | HTMLElement>('body');
  readonly class = input('', { alias: 'class' });

  /** `#value` template replacing the summary while options are chosen, with `display="comma"` only. Context: `MultiSelectValueContext<T>`. */
  readonly valueTemplate = contentChild<TemplateRef<MultiSelectValueContext<T>>>('value');
  /** `#chip` template replacing each chip's label, with `display="chip"`. Context: the chosen option (`SelectOption<T>`) as the implicit value. The chip stays removable. */
  readonly chipTemplate = contentChild<TemplateRef<{ $implicit: SelectOption<T> }>>('chip');
  /** `#triggerIcon` template replacing the field's open icon. No context. */
  readonly triggerIconTemplate = contentChild<TemplateRef<void>>('triggerIcon');
  /** `#clearIcon` template replacing the clear button's icon. No context. */
  readonly clearIconTemplate = contentChild<TemplateRef<void>>('clearIcon');
  /** `#loadingIcon` template replacing the panel's loading indicator icon. No context. */
  readonly loadingIconTemplate = contentChild<TemplateRef<void>>('loadingIcon');
  /** `#chipRemoveIcon` template replacing the remove icon of each chip, with `display="chip"`. No context. */
  readonly chipRemoveIconTemplate = contentChild<TemplateRef<void>>('chipRemoveIcon');
  /** `#option` template for each option row. Context: the option (`SelectOption<T>`) as the implicit value and `selected` (whether it is chosen). The row keeps `role="option"` and its keyboard behaviour. */
  readonly optionTemplate = contentChild<TemplateRef<SelectOptionContext<T>>>('option');
  /** `#group` template for each group header. Context: the group label as the implicit value. */
  readonly groupTemplate = contentChild<TemplateRef<{ $implicit: string }>>('group');
  /** `#header` template shown above the panel's list. No context. */
  readonly headerTemplate = contentChild<TemplateRef<void>>('header');
  /** `#footer` template shown below the panel's list. No context. */
  readonly footerTemplate = contentChild<TemplateRef<void>>('footer');
  /** `#empty` template shown instead of `emptyLabel` when no option is left. No context. */
  readonly emptyTemplate = contentChild<TemplateRef<void>>('empty');

  /** Emits the new list of values and the toggled option's value (`null` when cleared or after "select all"). */
  readonly selectionChanged = output<MultiSelectChangeEvent<T>>();
  /** Emits the value of the option whose chip the user removed (`display="chip"`). */
  readonly chipRemoved = output<MultiSelectChipRemoveEvent<T>>();
  /** Emits when "select all" is used, with whether it marked (`true`) or unmarked (`false`) the options. */
  readonly selectAllChanged = output<MultiSelectSelectAllEvent>();
  /** Emits when the clear button empties the field. */
  readonly cleared = output<void>();
  /** Emits with the click event when the user clicks the field (not when it is disabled). */
  readonly fieldClick = output<MouseEvent>();
  /** Emits when the field receives focus. */
  readonly inputFocus = output<FocusEvent>();
  /** Emits when the field loses focus; focus moving into the open panel is not reported. */
  readonly inputBlur = output<FocusEvent>();
  /** Emits the text typed in the panel's filter box each time it changes. */
  readonly filtered = output<SelectFilterEvent>();
  /** Emits just before the panel opens. */
  readonly panelBeforeShow = output<void>();
  /** Emits once the panel has opened. */
  readonly panelShow = output<void>();
  /** Emits just before the panel closes. Not emitted once the component is destroyed. */
  readonly panelBeforeHide = output<void>();
  /** Emits once the panel has closed. Not emitted once the component is destroyed. */
  readonly panelHide = output<void>();

  protected readonly value = signal<readonly T[]>([]);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly isOpen = signal(false);
  private readonly normalizedOptions = computed(() =>
    normalizeSelectOptions<T>(this.options(), {
      optionLabel: this.optionLabel(),
      optionValue: this.optionValue(),
      optionDisabled: this.optionDisabled(),
      optionGroupLabel: this.optionGroupLabel(),
      optionGroupChildren: this.optionGroupChildren(),
    }),
  );
  protected readonly selectedOptions = computed(() => this.normalizedOptions().filter((option) => this.value().some((value) => isSameOptionValue(value, option.value, this.dataKey()))));
  protected readonly triggerSummary = computed(() => {
    const selected = this.selectedOptions();
    if (selected.length === 0) {
      return null;
    }
    return selected.length <= this.maxSelectedLabels()
      ? selected.map((option) => option.label).join(', ')
      : this.selectedItemsLabel().replace('{0}', String(selected.length));
  });

  /** Values written to the hidden form inputs, one per chosen option, each as text. */
  protected readonly hiddenValues = computed(() =>
    this.value().map((value) => {
      const selected = this.selectedOptions().find((option) => isSameOptionValue(option.value, value, this.dataKey()))?.value ?? value;
      return typeof selected === 'object' ? JSON.stringify(selected) : String(selected);
    }),
  );

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private destroyed = false;
  private handle: OverlayHandle<SelectPanelComponent<T>, void> | null = null;

  constructor() {
    afterNextRender(() => {
      if (this.autofocus() && !this.isDisabled()) {
        this.triggerRef().nativeElement.focus();
      }
    });
  }

  private onChange: (value: readonly T[]) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly triggerClass = computed(() =>
    mergeClasses(selectTriggerVariants({ size: this.size(), invalid: this.invalid(), variant: this.variant() }), this.class()),
  );

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
    // Focus handed to the open panel is not the field losing focus to the outside, so it is not reported.
    const next = event.relatedTarget as Node | null;
    if (next && this.handle?.overlayRef.overlayElement.contains(next)) {
      return;
    }
    this.inputBlur.emit(event);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.setValue([]);
    this.handle?.componentRef.setInput('selectedValues', []);
    this.cleared.emit();
    this.selectionChanged.emit({ value: [], itemValue: null });
  }

  protected removeChipLabel(option: SelectOption<T>): string {
    return this.removeChipLabelTemplate()(option.label);
  }

  /** `event.stopPropagation()` here — not just inside `ChipComponent` itself — is what actually keeps removing a chip from also toggling the trigger's own dropdown; see the class doc comment. */
  protected removeChip(event: MouseEvent | KeyboardEvent, optionValue: T): void {
    event.stopPropagation();
    this.chipRemoved.emit({ value: optionValue });
    this.toggleValue(optionValue);
  }

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
    handle.componentRef.setInput('multiple', true);
    handle.componentRef.setInput('scrollHeight', this.scrollHeight());
    handle.componentRef.setInput('dataKey', this.dataKey());
    handle.componentRef.setInput('selectedValues', this.value());
    handle.componentRef.setInput('filterable', this.filter());
    handle.componentRef.setInput('filterPlaceholder', this.filterPlaceholder());
    handle.componentRef.setInput('initialFilterText', this.filterText);
    handle.componentRef.setInput('autofocusFilter', this.autofocusFilter());
    handle.componentRef.setInput('filterBy', this.filterBy());
    handle.componentRef.setInput('filterMatchMode', this.filterMatchMode());
    handle.componentRef.setInput('emptyLabel', this.emptyLabel());
    handle.componentRef.setInput('loading', this.loading());
    handle.componentRef.setInput('loadingLabel', this.loadingLabel());
    handle.componentRef.setInput('showToggleAll', this.showToggleAll());
    handle.componentRef.setInput('toggleAllLabel', this.toggleAllLabel());
    handle.componentRef.setInput('selectionLimit', this.selectionLimit());
    handle.componentRef.setInput('optionTemplate', this.optionTemplate() ?? null);
    handle.componentRef.setInput('groupTemplate', this.groupTemplate() ?? null);
    handle.componentRef.setInput('headerTemplate', this.headerTemplate() ?? null);
    handle.componentRef.setInput('footerTemplate', this.footerTemplate() ?? null);
    handle.componentRef.setInput('emptyTemplate', this.emptyTemplate() ?? null);
    handle.componentRef.setInput('loadingIconTemplate', this.loadingIconTemplate() ?? null);

    handle.componentRef.instance.optionToggled.subscribe((optionValue: T) => this.toggleValue(optionValue));
    handle.componentRef.instance.toggleAllRequested.subscribe((next: readonly T[]) => {
      const checked = next.length > this.value().length;
      this.setValue(next);
      handle.componentRef.setInput('selectedValues', next);
      this.selectAllChanged.emit({ checked });
      this.selectionChanged.emit({ value: next, itemValue: null });
    });
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());
    handle.componentRef.instance.filterChanged.subscribe((filter: string) => {
      this.filterText = filter;
      this.filtered.emit({ filter });
    });

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

  private toggleValue(optionValue: T): void {
    const current = this.value();
    const dataKey = this.dataKey();
    const isChosen = current.some((value) => isSameOptionValue(value, optionValue, dataKey));
    const next = isChosen ? current.filter((value) => !isSameOptionValue(value, optionValue, dataKey)) : [...current, optionValue];
    this.setValue(next);
    this.handle?.componentRef.setInput('selectedValues', next);
    this.selectionChanged.emit({ value: next, itemValue: optionValue });
  }

  private setValue(value: readonly T[]): void {
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: readonly T[] | null | undefined): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: readonly T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
