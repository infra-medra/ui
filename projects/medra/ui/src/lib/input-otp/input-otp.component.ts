import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, booleanAttribute, computed, contentChild, forwardRef, input, numberAttribute, signal, viewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldVariant } from '../input-text/input-text.styles';
import { mergeClasses } from '../utils/merge-classes';
import { InputOtpSize, otpBoxVariants } from './input-otp.styles';

/**
 * InputOtp primitive (Tier 3): `length` single-character boxes standing in
 * for one control — value is a plain joined `string` via
 * `ControlValueAccessor`, same "the segmented UI is a rendering detail, the
 * form value is the simple type a consumer actually wants" reasoning
 * DatePicker/InputNumber already apply to their own formatted display vs.
 * committed value.
 *
 * Typing a valid character auto-advances to the next box; `Backspace` on
 * an already-empty box clears the *previous* box and moves back into it
 * (the box's own native Backspace, when it still holds a character, just
 * clears that one box in place — no extra handling needed there, the
 * native `(input)` event already does it). Pasting a full code into any
 * box distributes it across the remaining boxes from that point on, the
 * expected "paste the code from a text message" flow — a more reliable
 * cross-browser path than segmented-input autofill, which this component
 * still attempts (`autocomplete="one-time-code"` on every box) but doesn't
 * depend on.
 *
 * `integerOnly` (default `true`) rejects non-digit characters at entry
 * time; `mask` (default `false`) swaps the displayed character for a dot,
 * same masking concept `PasswordComponent` uses, just applied per-box.
 */
@Component({
  selector: 'med-input-otp',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'fluid() ? "block w-full" : "inline-block"',
    '[attr.data-variant]': 'variant()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputOtpComponent),
      multi: true,
    },
  ],
  template: `
    <div role="group" [attr.aria-label]="ariaLabel()" class="flex gap-2">
      @for (digit of digits(); track $index; let i = $index) {
        @if (inputTemplate(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: digit, index: i, events: slotEvents(i) }" />
        } @else {
          <input
            #box
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            [attr.aria-label]="digitLabel() + ' ' + (i + 1)"
            [attr.aria-invalid]="invalid() ? 'true' : null"
            [disabled]="isDisabled()"
            [value]="mask() && digit ? '•' : digit"
            [class]="boxClass()"
            (input)="onInput($event, i)"
            (keydown)="onKeydown($event, i)"
            (paste)="onPaste($event, i)"
            (blur)="onTouched()"
          />
        }
      }
    </div>
  `,
})
export class InputOtpComponent implements ControlValueAccessor {
  readonly length = input(6, { transform: numberAttribute });
  readonly mask = input(false, { transform: booleanAttribute });
  readonly integerOnly = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly size = input<InputOtpSize>('default');
  readonly variant = input<FieldVariant>('outlined');
  readonly fluid = input(false, { transform: booleanAttribute });

  readonly inputTemplate = contentChild<TemplateRef<{
    $implicit: string;
    index: number;
    events: {
      input: (event: Event) => void;
      keydown: (event: KeyboardEvent) => void;
      paste: (event: ClipboardEvent) => void;
      blur: () => void;
    };
  }>>('input');

  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('One-time code');
  readonly digitLabel = input('Digit');

  private readonly rawDigits = signal<readonly string[]>([]);
  protected readonly digits = computed(() => {
    const len = this.length();
    const current = this.rawDigits();
    return Array.from({ length: len }, (_, i) => current[i] ?? '');
  });

  private readonly boxRefs = viewChildren<ElementRef<HTMLInputElement>>('box');
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  protected readonly boxClass = computed(() =>
    mergeClasses(
      otpBoxVariants({ size: this.size(), invalid: this.invalid() }),
      this.variant() === 'filled' ? 'bg-surface-100 border-transparent dark:bg-surface-800' : '',
    ),
  );

  protected slotEvents(index: number) {
    return {
      input: (event: Event) => this.onInput(event, index),
      keydown: (event: KeyboardEvent) => this.onKeydown(event, index),
      paste: (event: ClipboardEvent) => this.onPaste(event, index),
      blur: () => this.onTouched(),
    };
  }

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let char = input.value.slice(-1);
    if (this.integerOnly() && char && !/^[0-9]$/.test(char)) {
      char = '';
    }
    this.setDigit(index, char);
    if (char && index < this.length() - 1) {
      this.boxRefs()[index + 1]?.nativeElement.focus();
    }
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    if (this.isDisabled()) {
      return;
    }
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      event.preventDefault();
      this.setDigit(index - 1, '');
      this.boxRefs()[index - 1]?.nativeElement.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.boxRefs()[index - 1]?.nativeElement.focus();
    } else if (event.key === 'ArrowRight' && index < this.length() - 1) {
      event.preventDefault();
      this.boxRefs()[index + 1]?.nativeElement.focus();
    }
  }

  protected onPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    if (this.isDisabled()) {
      return;
    }
    const pasted = event.clipboardData?.getData('text') ?? '';
    const chars = (this.integerOnly() ? pasted.replace(/[^0-9]/g, '') : pasted).split('');
    if (chars.length === 0) {
      return;
    }

    const next = [...this.digits()];
    let cursor = index;
    for (const char of chars) {
      if (cursor >= this.length()) {
        break;
      }
      next[cursor] = char;
      cursor++;
    }
    this.rawDigits.set(next);
    this.commit();
    this.boxRefs()[Math.min(cursor, this.length() - 1)]?.nativeElement.focus();
  }

  private setDigit(index: number, char: string): void {
    const next = [...this.digits()];
    next[index] = char;
    this.rawDigits.set(next);
    this.commit();
  }

  private commit(): void {
    this.onTouched();
    this.onChange(this.digits().join(''));
  }

  writeValue(value: string | null | undefined): void {
    this.rawDigits.set((value ?? '').slice(0, this.length()).split(''));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
