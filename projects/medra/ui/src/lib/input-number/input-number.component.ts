import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, forwardRef, input, numberAttribute, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { FieldVariant, InputTextSize, inputTextVariants } from '../input-text/input-text.styles';
import { INPUT_NUMBER_STACKED_TRAILING_PADDING_REM, InputNumberButtonLayout, stepButtonVariants } from './input-number.styles';
import { InputNumberCurrencyDisplay, InputNumberMode, NumberFormatOptions, formatNumber, parseNumber, roundToStepPrecision } from './number-format';

/**
 * InputNumber primitive (Tier 2). A real `<input role="spinbutton">`
 * (WAI-ARIA APG "Spin Button"): the accessible interaction is entirely
 * keyboard-driven on the input itself (ArrowUp/Down step by `step`,
 * PageUp/Down step by `step * 10`, Home/End jump to `min`/`max`) —
 * `showButtons` only adds pointer affordances that call the exact same
 * `stepBy()` path, never a second source of truth.
 *
 * Like DatePicker, typed text is tracked separately from the committed
 * value (`rawText`/`editingText`): a keystroke only commits (and fires
 * `onChange`) once it parses into a real number within `[min, max]`, so a
 * mid-edit string like `"-"` or `"12."` is never silently coerced away.
 * Blur (or Enter) always reformats the field from the last *committed*
 * value, reverting any leftover unparseable/out-of-range text.
 *
 * `mode`/`currency`/`locale`/fraction-digit inputs are a thin pass-through
 * to `Intl.NumberFormat` (see `number-format.ts`) — parsing is
 * correspondingly lenient: grouping separators, currency symbols, and
 * `prefix`/`suffix` text are simply filtered out rather than round-tripped
 * through the exact same formatter, which keeps mid-edit text (e.g. a
 * lone `"$"` before any digits are typed) from fighting the user.
 */
@Component({
  selector: 'med-input-number',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()', '[attr.data-variant]': 'variant()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputNumberComponent),
      multi: true,
    },
  ],
  template: `
    @if (showButtons() && buttonLayout() === 'horizontal') {
      <button
        type="button"
        [class]="horizontalLeadingButtonClass()"
        [disabled]="isDisabled() || atMin()"
        [attr.aria-label]="decrementLabel()"
        (click)="stepBy(-step())"
      >
        <med-icon name="minus" variant="mini" class="size-3.5" />
      </button>
    }
    @if (showButtons() && buttonLayout() === 'vertical') {
      <button type="button" [class]="verticalLeadingButtonClass()" [disabled]="isDisabled() || atMax()" [attr.aria-label]="incrementLabel()" (click)="stepBy(step())">
        <med-icon name="chevron-up" variant="mini" class="size-3.5" />
      </button>
    }
    <div [class]="inputWrapperClass()">
      <input
        #trigger
        type="text"
        inputmode="decimal"
        role="spinbutton"
        [id]="inputId()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="numericValue()"
        [attr.aria-valuetext]="formattedValue()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [class]="inputClass()"
        [style.paddingInlineEnd]="trailingPadding()"
        [disabled]="isDisabled()"
        [value]="displayText()"
        [placeholder]="placeholder()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="onBlur()"
      />
      @if (showButtons() && buttonLayout() === 'stacked') {
        <span
          class="pointer-events-none absolute inset-y-0 right-0 flex w-6 flex-col divide-y divide-surface-300 overflow-hidden rounded-r-md border-l border-surface-300 dark:divide-surface-600 dark:border-surface-600"
        >
          <button type="button" [class]="stackedButtonClass()" [disabled]="isDisabled() || atMax()" [attr.aria-label]="incrementLabel()" (click)="stepBy(step())">
            <med-icon name="chevron-up" variant="mini" class="size-3" />
          </button>
          <button type="button" [class]="stackedButtonClass()" [disabled]="isDisabled() || atMin()" [attr.aria-label]="decrementLabel()" (click)="stepBy(-step())">
            <med-icon name="chevron-down" variant="mini" class="size-3" />
          </button>
        </span>
      }
      @if (showClearButton()) {
        <button
          type="button"
          class="absolute inset-y-0 flex items-center justify-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
          [style.right]="clearButtonRight()"
          [attr.aria-label]="clearLabel()"
          (click)="clear()"
        >
          <med-icon name="x-mark" variant="mini" class="size-3.5" />
        </button>
      }
    </div>
    @if (showButtons() && buttonLayout() === 'horizontal') {
      <button
        type="button"
        [class]="horizontalTrailingButtonClass()"
        [disabled]="isDisabled() || atMax()"
        [attr.aria-label]="incrementLabel()"
        (click)="stepBy(step())"
      >
        <med-icon name="plus" variant="mini" class="size-3.5" />
      </button>
    }
    @if (showButtons() && buttonLayout() === 'vertical') {
      <button type="button" [class]="verticalTrailingButtonClass()" [disabled]="isDisabled() || atMin()" [attr.aria-label]="decrementLabel()" (click)="stepBy(-step())">
        <med-icon name="chevron-down" variant="mini" class="size-3.5" />
      </button>
    }
  `,
})
export class InputNumberComponent implements ControlValueAccessor {
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly step = input(1, { transform: numberAttribute });
  readonly mode = input<InputNumberMode>('decimal');
  readonly currency = input('USD');
  readonly currencyDisplay = input<InputNumberCurrencyDisplay>('symbol');
  readonly locale = input('en-US');
  readonly minFractionDigits = input<number | null>(null);
  readonly maxFractionDigits = input<number | null>(null);
  readonly useGrouping = input(true, { transform: booleanAttribute });
  readonly showButtons = input(false, { transform: booleanAttribute });
  readonly buttonLayout = input<InputNumberButtonLayout>('stacked');
  readonly prefix = input('');
  readonly suffix = input('');
  readonly size = input<InputTextSize>('default');
  readonly variant = input<FieldVariant>('outlined');
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly placeholder = input('');
  readonly inputId = input<string | null>(null);
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly incrementLabel = input('Increment');
  readonly decrementLabel = input('Decrement');
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly clearLabel = input('Clear');
  readonly class = input('', { alias: 'class' });

  private readonly value = signal<number | null>(null);
  private readonly rawText = signal('');
  private readonly editingText = signal(false);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  private readonly triggerRef = viewChild.required<ElementRef<HTMLInputElement>>('trigger');

  private onChange: (value: number | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly hostClass = computed(() => {
    if (!this.showButtons()) {
      return 'block w-full';
    }
    switch (this.buttonLayout()) {
      case 'horizontal':
        return 'flex w-full';
      case 'vertical':
        return 'flex flex-col w-full';
      default:
        return 'block w-full';
    }
  });

  /** Wraps just the `<input>` (+ its overlaid `stacked`/clear affordances) as its own positioning context — `flex-1` only matters in `horizontal`'s row layout, where it's a flex sibling of the two side buttons instead of the sole child. */
  protected readonly inputWrapperClass = computed(() =>
    mergeClasses('relative inline-block w-full', this.showButtons() && this.buttonLayout() === 'horizontal' ? 'flex-1' : ''),
  );

  protected readonly formatOptions = computed<NumberFormatOptions>(() => ({
    locale: this.locale(),
    mode: this.mode(),
    currency: this.currency(),
    currencyDisplay: this.currencyDisplay(),
    minFractionDigits: this.minFractionDigits(),
    maxFractionDigits: this.maxFractionDigits(),
    useGrouping: this.useGrouping(),
    prefix: this.prefix(),
    suffix: this.suffix(),
  }));

  protected readonly inputClass = computed(() => {
    const base = inputTextVariants({ size: this.size(), invalid: this.invalid(), variant: this.variant() });
    const layout = this.showButtons() ? this.buttonLayout() : null;
    const squareCorners = layout === 'horizontal' ? 'rounded-none' : layout === 'vertical' ? 'rounded-none' : '';
    return mergeClasses(base, squareCorners, this.class());
  });

  protected readonly horizontalLeadingButtonClass = computed(() => stepButtonVariants({ layout: 'horizontal', position: 'leading' }));
  protected readonly horizontalTrailingButtonClass = computed(() => stepButtonVariants({ layout: 'horizontal', position: 'trailing' }));
  protected readonly verticalLeadingButtonClass = computed(() => stepButtonVariants({ layout: 'vertical', position: 'leading' }));
  protected readonly verticalTrailingButtonClass = computed(() => stepButtonVariants({ layout: 'vertical', position: 'trailing' }));
  protected readonly stackedButtonClass = computed(() => mergeClasses('pointer-events-auto', stepButtonVariants({ layout: 'stacked' })));

  protected readonly showClearButton = computed(() => this.showClear() && !this.isDisabled() && this.value() !== null);

  /** When `stacked` buttons are also showing, the clear button sits just to their left instead of at the input's own edge, so the two never overlap. */
  protected readonly clearButtonRight = computed(() =>
    this.showButtons() && this.buttonLayout() === 'stacked' ? INPUT_NUMBER_STACKED_TRAILING_PADDING_REM[this.size()] : '0.5rem',
  );

  protected readonly trailingPadding = computed(() => {
    const parts: string[] = [];
    if (this.showButtons() && this.buttonLayout() === 'stacked') {
      parts.push(INPUT_NUMBER_STACKED_TRAILING_PADDING_REM[this.size()]);
    }
    if (this.showClearButton()) {
      parts.push('1.75rem');
    }
    return parts.length === 0 ? null : parts.length === 1 ? parts[0] : `calc(${parts.join(' + ')})`;
  });

  protected readonly atMin = computed(() => {
    const current = this.value();
    const min = this.min();
    return current !== null && min !== null && current <= min;
  });
  protected readonly atMax = computed(() => {
    const current = this.value();
    const max = this.max();
    return current !== null && max !== null && current >= max;
  });

  protected readonly numericValue = computed(() => this.value());

  protected readonly formattedValue = computed(() => {
    const current = this.value();
    return current === null ? null : formatNumber(current, this.formatOptions());
  });

  protected readonly displayText = computed(() => (this.editingText() ? this.rawText() : (this.formattedValue() ?? '')));

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.editingText.set(true);
    this.rawText.set(text);
    const parsed = parseNumber(text, this.formatOptions());
    if (parsed !== null && this.isWithinBounds(parsed)) {
      this.value.set(parsed);
      this.onChange(parsed);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.stepBy(this.step());
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.stepBy(-this.step());
        break;
      case 'PageUp':
        event.preventDefault();
        this.stepBy(this.step() * 10);
        break;
      case 'PageDown':
        event.preventDefault();
        this.stepBy(-this.step() * 10);
        break;
      case 'Home': {
        const min = this.min();
        if (min !== null) {
          event.preventDefault();
          this.commitValue(min);
        }
        break;
      }
      case 'End': {
        const max = this.max();
        if (max !== null) {
          event.preventDefault();
          this.commitValue(max);
        }
        break;
      }
      case 'Enter':
        this.reformatFromCommittedValue();
        break;
    }
  }

  protected onBlur(): void {
    this.onTouched();
    this.reformatFromCommittedValue();
  }

  protected stepBy(delta: number): void {
    if (this.isDisabled()) {
      return;
    }
    const base = this.value() ?? this.startingValue();
    const next = roundToStepPrecision(this.clamp(base + delta), this.step(), this.maxFractionDigits());
    this.commitValue(next);
    this.triggerRef().nativeElement.focus();
  }

  protected clear(): void {
    if (this.isDisabled()) {
      return;
    }
    this.value.set(null);
    this.rawText.set('');
    this.editingText.set(false);
    this.onChange(null);
    this.onTouched();
    this.triggerRef().nativeElement.focus();
  }

  /** Where stepping starts from when there's no value yet: `min` if set (never start below it), else 0 clamped to `max` if that's negative. */
  private startingValue(): number {
    const min = this.min();
    if (min !== null) {
      return min;
    }
    const max = this.max();
    return max !== null ? Math.min(0, max) : 0;
  }

  private clamp(candidate: number): number {
    let result = candidate;
    const min = this.min();
    const max = this.max();
    if (min !== null) {
      result = Math.max(min, result);
    }
    if (max !== null) {
      result = Math.min(max, result);
    }
    return result;
  }

  private isWithinBounds(candidate: number): boolean {
    return this.clamp(candidate) === candidate;
  }

  private commitValue(next: number): void {
    this.value.set(next);
    this.rawText.set(formatNumber(next, this.formatOptions()));
    this.editingText.set(false);
    this.onChange(next);
  }

  private reformatFromCommittedValue(): void {
    this.rawText.set(this.formattedValue() ?? '');
    this.editingText.set(false);
  }

  writeValue(value: number | null | undefined): void {
    const next = value ?? null;
    this.value.set(next);
    this.rawText.set(next === null ? '' : formatNumber(next, this.formatOptions()));
    this.editingText.set(false);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
