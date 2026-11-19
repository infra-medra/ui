import { Directive, ElementRef, booleanAttribute, computed, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MED_FLUID_CONTEXT } from '../fluid/fluid.directive';
import { mergeClasses } from '../utils/merge-classes';
import { FieldVariant, InputTextSize, inputTextVariants } from './input-text.styles';

/**
 * InputText primitive (Trilha 3, pilot #3). Like Button, implemented as an
 * attribute directive on the native `<input>` rather than a wrapping
 * component, so native behavior (autocomplete, IME composition, native
 * `type` variants, IDL `value`/`disabled` properties Reactive Forms
 * expects) keeps working exactly as consumers expect — nothing to
 * reimplement or fall out of sync with the platform.
 */
@Directive({
  selector: 'input[medInputText]',
  standalone: true,
  host: {
    '[class]': 'hostClass()',
    '[attr.data-variant]': 'variant()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
    '(input)': 'onInput($event)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextDirective),
      multi: true,
    },
  ],
})
export class InputTextDirective implements ControlValueAccessor {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly fluidContext = inject(MED_FLUID_CONTEXT, { optional: true });

  readonly size = input<InputTextSize>('default');
  readonly variant = input<FieldVariant>('outlined');
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly hostClass = computed(() =>
    mergeClasses(
      inputTextVariants({ size: this.size(), invalid: this.invalid(), variant: this.variant() }),
      this.fluid() || (this.fluidContext?.() ?? false) ? 'w-full' : '',
      this.class(),
    ),
  );

  protected onInput(event: Event): void {
    this.onChange((event.target as HTMLInputElement).value);
  }

  writeValue(value: string | null | undefined): void {
    this.elementRef.nativeElement.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.elementRef.nativeElement.disabled = isDisabled;
  }
}
