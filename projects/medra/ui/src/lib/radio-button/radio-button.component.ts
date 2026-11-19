import { ChangeDetectionStrategy, Component, booleanAttribute, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldVariant } from '../input-text/input-text.styles';
import { mergeClasses } from '../utils/merge-classes';
import { DOT_SIZE_CLASS, RadioButtonSize, radioRingVariants } from './radio-button.styles';

/**
 * RadioButton primitive (Tier 1). Same architecture as Checkbox: a real,
 * visually-hidden native `<input type="radio">` drives all interaction
 * state via `peer-*` Tailwind variants against a decorative ring; the
 * "selected" dot is just conditionally rendered, not animated by state.
 *
 * Unlike Checkbox's binary value, a radio's value is arbitrary (whatever
 * the group compares by `===`), so there's no falsy-value ambiguity to
 * guard against — `undefined`/`null`/`0`/`false` all compare correctly.
 */
@Component({
  selector: 'med-radio-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center', '[attr.data-variant]': 'variant()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonComponent),
      multi: true,
    },
  ],
  template: `
    <span class="relative inline-flex">
      <input
        type="radio"
        class="peer absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        [name]="name()"
        [id]="inputId()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        (change)="onNativeChange()"
        (blur)="onTouched()"
      />
      <span [class]="ringClass()" aria-hidden="true">
        @if (checked()) {
          <span [class]="dotClass()"></span>
        }
      </span>
    </span>
  `,
})
export class RadioButtonComponent<T = unknown> implements ControlValueAccessor {
  readonly name = input.required<string>();
  readonly value = input.required<T>();
  readonly size = input<RadioButtonSize>('default');
  readonly variant = input<FieldVariant>('outlined');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  private readonly groupValue = signal<T | undefined>(undefined);
  private readonly formsDisabled = signal(false);
  protected readonly checked = computed(() => this.groupValue() === this.value());
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  private onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly ringClass = computed(() =>
    mergeClasses(
      radioRingVariants({ size: this.size(), invalid: this.invalid() }),
      this.variant() === 'filled' ? 'bg-surface-100 dark:bg-surface-800' : '',
      this.class(),
    ),
  );
  protected readonly dotClass = computed(() => `${DOT_SIZE_CLASS[this.size()]} rounded-full bg-brand-500 dark:bg-brand-400`);

  protected onNativeChange(): void {
    const value = this.value();
    this.groupValue.set(value);
    this.onChange(value);
  }

  writeValue(value: T): void {
    this.groupValue.set(value);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
