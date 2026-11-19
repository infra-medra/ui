import { ChangeDetectionStrategy, Component, booleanAttribute, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { mergeClasses } from '../utils/merge-classes';
import { ToggleSwitchSize, thumbVariants, trackVariants } from './toggle-switch.styles';

/**
 * ToggleSwitch primitive (Tier 2). Same architecture as Checkbox: a real,
 * visually-hidden native `<input type="checkbox">` drives all interaction
 * state (checked, focus, hover, disabled) via `peer-*` variants on two
 * decorative siblings (track + thumb) — neither tracks its own copy of
 * that state. `role="switch"` on the native checkbox is the standard HTML
 * pattern for this (same element, same Space-to-toggle keyboard behavior
 * as a checkbox already has for free — only how screen readers announce
 * it changes, "on/off" instead of "checked/unchecked").
 *
 * No `label`/`onLabel`/`offLabel` inputs: this is the plain iOS-style
 * switch only — a labeled toggle with text is `ToggleButton`'s job (a
 * separate Tier 2 component), not this one's.
 */
@Component({
  selector: 'med-toggle-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleSwitchComponent),
      multi: true,
    },
  ],
  template: `
    <span class="relative inline-flex shrink-0">
      <input
        type="checkbox"
        role="switch"
        class="peer absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        [id]="inputId()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-readonly]="isReadonly() ? 'true' : null"
        (change)="onNativeChange($event)"
        (blur)="onTouched()"
      />
      <span [class]="trackClass()" aria-hidden="true"></span>
      <span [class]="thumbClass()" aria-hidden="true"></span>
    </span>
  `,
})
export class ToggleSwitchComponent implements ControlValueAccessor {
  readonly size = input<ToggleSwitchSize>('default');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly isReadonly = input(false, { transform: booleanAttribute, alias: 'readonly' });
  readonly trueValue = input<unknown>(true);
  readonly falseValue = input<unknown>(false);
  readonly inputId = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  private readonly rawValue = signal<unknown>(undefined);
  protected readonly checked = computed(() => this.rawValue() === this.trueValue());
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly trackClass = computed(() => mergeClasses(trackVariants({ size: this.size(), invalid: this.invalid() }), this.class()));
  protected readonly thumbClass = computed(() => thumbVariants({ size: this.size() }));

  protected onNativeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isReadonly()) {
      input.checked = this.checked();
      return;
    }
    const next = input.checked ? this.trueValue() : this.falseValue();
    this.rawValue.set(next);
    this.onChange(next);
  }

  writeValue(value: unknown): void {
    this.rawValue.set(value ?? this.falseValue());
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
