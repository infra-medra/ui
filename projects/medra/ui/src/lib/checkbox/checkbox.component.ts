import { ChangeDetectionStrategy, Component, booleanAttribute, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldVariant } from '../input-text/input-text.styles';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { CheckboxSize, checkboxBoxVariants } from './checkbox.styles';

const ICON_SIZE_CLASS: Record<CheckboxSize, string> = {
  sm: 'size-3',
  default: 'size-3.5',
  lg: 'size-4',
};

/**
 * Checkbox primitive (Trilha 3, pilot #2). A real, visually-hidden native
 * `<input type="checkbox">` drives all interaction state (checked, focus,
 * hover, disabled) via the `peer-*` Tailwind variants — the decorative box
 * never tracks its own copy of that state, so there's nothing to fall out
 * of sync.
 *
 * `writeValue` normalizes with `=== true` rather than a truthiness check, so
 * `false`/`null`/`undefined` all resolve to unchecked instead of `false` being treated as "unset".
 *
 * **Two value modes**, switched by whether `value` is set:
 * - **Scalar** (default, `value` unset): the classic single on/off box.
 *   `trueValue`/`falseValue` (default `true`/`false`) let the emitted/read
 *   value be something other than a raw boolean (e.g. `'yes'`/`'no'`)
 *   without changing anything else about the component.
 * - **Group-by-array** (`value` set): several checkboxes share one
 *   `[(ngModel)]`/`FormControl` array — each instance's own `value` decides
 *   membership, `checked` becomes "is my `value` in that array", and
 *   toggling adds/removes just that entry instead of writing a scalar.
 *   `trueValue`/`falseValue` don't apply in this mode (there's no boolean
 *   to represent.
 */
@Component({
  selector: 'med-checkbox',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center', '[attr.data-variant]': 'variant()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <span class="relative inline-flex">
      <input
        type="checkbox"
        [class]="inputClass()"
        [id]="inputId()"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="isDisabled()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-readonly]="isReadonly() ? 'true' : null"
        (change)="onNativeChange($event)"
        (blur)="onTouched()"
      />
      <span [class]="boxClass()" aria-hidden="true">
        @if (indeterminate()) {
          <med-icon name="minus" variant="solid" [class]="iconClass()" />
        } @else if (checked()) {
          <med-icon name="check" variant="solid" [class]="iconClass()" />
        }
      </span>
    </span>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly size = input<CheckboxSize>('default');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Focusable, visible, but never toggles from a click/keypress — unlike `disabled`, no dimmed opacity, and `formsDisabled/setDisabledState` state stays independent of it. Native `<input readonly>` doesn't actually block checkbox toggling in any browser (the HTML spec only defines it for text-like inputs), so this is enforced by hand in `onNativeChange`. */
  readonly isReadonly = input(false, { transform: booleanAttribute, alias: 'readonly' });
  readonly inputId = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  /** Set to switch into group-by-array mode — see the class doc comment. */
  readonly value = input<unknown>(undefined);
  readonly binary = input<boolean | undefined>(undefined);
  readonly variant = input<FieldVariant>('outlined');
  readonly trueValue = input<unknown>(true);
  readonly falseValue = input<unknown>(false);

  private readonly rawValue = signal<unknown>(undefined);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly isGroupMode = computed(() =>
    this.binary() !== undefined ? !this.binary() : this.value() !== undefined,
  );
  protected readonly checked = computed(() => {
    const current = this.rawValue();
    return this.isGroupMode() ? Array.isArray(current) && current.includes(this.value()) : current === this.trueValue();
  });

  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly boxClass = computed(() =>
    mergeClasses(
      checkboxBoxVariants({ size: this.size(), invalid: this.invalid() }),
      this.variant() === 'filled' ? 'bg-surface-100 dark:bg-surface-800' : '',
      this.class(),
    ),
  );
  protected readonly iconClass = computed(() => ICON_SIZE_CLASS[this.size()]);
  protected readonly inputClass = computed(() =>
    mergeClasses('peer absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed', this.isReadonly() ? 'cursor-default' : ''),
  );

  protected onNativeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.isReadonly()) {
      // See the `isReadonly` doc comment above — the browser already flipped
      // `input.checked` by the time this handler runs, so undo that by hand.
      input.checked = this.checked();
      return;
    }
    const isChecked = input.checked;
    if (this.isGroupMode()) {
      const current = Array.isArray(this.rawValue()) ? (this.rawValue() as readonly unknown[]) : [];
      const next = isChecked ? [...current, this.value()] : current.filter((entry) => entry !== this.value());
      this.rawValue.set(next);
      this.onChange(next);
    } else {
      const next = isChecked ? this.trueValue() : this.falseValue();
      this.rawValue.set(next);
      this.onChange(next);
    }
  }

  writeValue(value: unknown): void {
    this.rawValue.set(value ?? (this.isGroupMode() ? [] : this.falseValue()));
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
