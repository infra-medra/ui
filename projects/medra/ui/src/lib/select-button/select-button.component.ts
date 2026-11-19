import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, forwardRef, input, signal, viewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonSize, INVALID_RING_CLASS, buttonVariants } from '../button/button.styles';
import { RippleDirective } from '../ripple/ripple.directive';
import { SelectOption } from '../select/select.types';
import { mergeClasses } from '../utils/merge-classes';

/**
 * SelectButton primitive (Tier 2). A connected row of `ToggleButton`-style
 * options driven by data (`options`, same `SelectOption<T>` shape
 * Select/MultiSelect use), not content-projected children — picking one
 * (or, in `multiple` mode, several) is exactly the same shape of choice as
 * Select/RadioButton, just rendered as a segmented control instead of a
 * dropdown or a stack of separate inputs.
 *
 * `multiple` picks both the value shape at runtime (single: `T | null`;
 * multiple: `readonly T[]`) — same runtime-branching choice DatePicker's
 * `selectionMode` and Accordion's `multiple` already established — and the
 * ARIA role: single mode is a real `role="radiogroup"` of `role="radio"`
 * buttons with roving tabindex and arrow-key automatic activation (same
 * keyboard model as Tabs). Multiple mode is a plain `role="group"` of
 * independently `aria-pressed` buttons, each with normal `tabindex="0"` —
 * no roving tabindex, since none of them are mutually exclusive.
 *
 * `allowEmpty` (default `true`) governs whether clicking
 * an already-selected option clears it: in single mode, back to `null`; in
 * multiple mode, down to (but never below) one remaining selection when
 * `allowEmpty` is `false`.
 */
@Component({
  selector: 'med-select-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  imports: [RippleDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectButtonComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="groupClass()" [attr.role]="multiple() ? 'group' : 'radiogroup'" [attr.aria-label]="ariaLabel()">
      @for (option of resolvedOptions(); track option.value; let i = $index) {
        <button
          #optionButton
          type="button"
          [attr.role]="multiple() ? null : 'radio'"
          [attr.aria-pressed]="multiple() ? isSelected(option.value) : null"
          [attr.aria-checked]="multiple() ? null : isSelected(option.value)"
          [attr.aria-disabled]="isDisabled() || option.disabled ? 'true' : null"
          [tabIndex]="tabIndexFor(option, i)"
          [class]="optionClass(option, i)"
          medRipple
          [medRippleDisabled]="isDisabled() || !!option.disabled"
          (click)="selectOption(option)"
          (keydown)="onKeydown($event, i)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class SelectButtonComponent<T = unknown> implements ControlValueAccessor {
  readonly options = input<readonly (SelectOption<T> | Record<string, unknown> | T)[]>([]);
  readonly optionLabel = input('label');
  readonly optionValue = input('value');
  readonly optionDisabled = input('disabled');
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly allowEmpty = input(true, { transform: booleanAttribute });
  readonly size = input<ButtonSize>('default');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  private readonly value = signal<T | readonly T[] | null>(null);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  private readonly optionButtons = viewChildren<ElementRef<HTMLButtonElement>>('optionButton');

  private onChange: (value: T | readonly T[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly groupClass = computed(() => mergeClasses('inline-flex flex-wrap', this.class()));

  protected readonly resolvedOptions = computed<readonly SelectOption<T>[]>(() => {
    const labelKey = this.optionLabel();
    const valueKey = this.optionValue();
    const disabledKey = this.optionDisabled();

    return this.options().map((raw) => {
      if (raw !== null && typeof raw === 'object') {
        const record = raw as Record<string, unknown>;
        return {
          label: String(record[labelKey] ?? ''),
          value: (valueKey in record ? record[valueKey] : raw) as T,
          disabled: Boolean(record[disabledKey]),
        };
      }
      return {
        label: String(raw),
        value: raw as T,
        disabled: false,
      };
    });
  });

  protected isSelected(value: T): boolean {
    const current = this.value();
    return this.multiple() ? Array.isArray(current) && (current as readonly T[]).includes(value) : current === value;
  }

  protected optionClass(option: SelectOption<T>, index: number): string {
    const selected = this.isSelected(option.value);
    return mergeClasses(
      buttonVariants({ severity: selected ? 'primary' : 'secondary', variant: selected ? 'filled' : 'outlined', size: this.size() }),
      'rounded-none focus-visible:z-10 first:rounded-l-md last:rounded-r-md',
      index > 0 ? '-ml-px' : '',
      this.invalid() ? INVALID_RING_CLASS : '',
      // `buttonVariants`' own `disabled:*` classes key off the native
      // `:disabled` pseudo-class, which this button never gets (aria-disabled
      // only, same convention as the rest of the lib) — without this, a
      // per-option `disabled: true` had no visual/cursor treatment at all,
      // so a disabled option looked identical to an enabled one that simply
      // did nothing on click.
      this.isDisabled() || option.disabled ? 'pointer-events-none cursor-not-allowed opacity-(--opacity-disabled)' : '',
    );
  }

  protected tabIndexFor(option: SelectOption<T>, index: number): number {
    if (this.isDisabled() || option.disabled) {
      return -1;
    }
    if (this.multiple()) {
      return 0;
    }
    if (this.value() === option.value) {
      return 0;
    }
    const opts = this.resolvedOptions();
    const noneSelected = opts.every((o) => o.value !== this.value());
    const firstEnabledIndex = opts.findIndex((o) => !o.disabled);
    return noneSelected && index === firstEnabledIndex ? 0 : -1;
  }

  protected selectOption(option: SelectOption<T>): void {
    if (this.isDisabled() || option.disabled) {
      return;
    }
    this.onTouched();
    if (this.multiple()) {
      const current = (this.value() as readonly T[] | null) ?? [];
      const isSelected = current.includes(option.value);
      if (isSelected && !this.allowEmpty() && current.length === 1) {
        return;
      }
      const next = isSelected ? current.filter((v) => v !== option.value) : [...current, option.value];
      this.value.set(next);
      this.onChange(next);
    } else if (this.value() === option.value) {
      if (!this.allowEmpty()) {
        return;
      }
      this.value.set(null);
      this.onChange(null);
    } else {
      this.value.set(option.value);
      this.onChange(option.value);
    }
  }

  protected onKeydown(event: KeyboardEvent, currentIndex: number): void {
    if (this.multiple()) {
      return;
    }
    const opts = this.resolvedOptions();
    const enabled = opts.map((o, i) => (this.isDisabled() || o.disabled ? -1 : i)).filter((i) => i !== -1);
    if (enabled.length === 0) {
      return;
    }

    const position = enabled.indexOf(currentIndex);
    let targetIndex: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = enabled[(position + 1 + enabled.length) % enabled.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
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
      this.selectOption(opts[targetIndex]);
      this.optionButtons()[targetIndex]?.nativeElement.focus();
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
