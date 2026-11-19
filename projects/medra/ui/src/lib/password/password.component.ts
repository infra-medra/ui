import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { mergeClasses } from '../utils/merge-classes';
import { InputTextSize, inputTextVariants } from '../input-text/input-text.styles';
import {
  PASSWORD_CLEAR_AND_TOGGLE_TRAILING_PADDING_REM,
  PASSWORD_CLEAR_TRAILING_PADDING_REM,
  PASSWORD_TOGGLE_TRAILING_PADDING_REM,
} from './password.styles';
import { PasswordFeedbackPanelComponent } from './password-feedback-panel.component';
import { DEFAULT_MEDIUM_REGEX, DEFAULT_STRONG_REGEX, classifyPasswordStrength } from './password-strength';

let nextPasswordId = 0;

/**
 * Password primitive (Tier 2). A real `<input type="password">` (swapped to
 * `type="text"` only while `toggleMask`'s reveal button is held toggled on)
 * — same reasoning as InputText for staying native rather than
 * reimplementing masking.
 *
 * `feedback` opens a small non-interactive overlay panel on focus (3-segment
 * strength meter, classified via `mediumRegex`/`strongRegex` against the
 * live value) — same non-focus-stealing pattern `TooltipDirective` already
 * established (`trapFocus: false`, `restoreFocus: false`): DOM focus never
 * actually leaves the input, so closing on the input's own `blur` is
 * correct and sufficient, no separate dismissal wiring needed.
 */
@Component({
  selector: 'med-password',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative inline-block w-full' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordComponent),
      multi: true,
    },
  ],
  template: `
    <input
      #trigger
      [type]="inputType()"
      autocomplete="new-password"
      [id]="inputId()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [attr.aria-describedby]="isFeedbackOpen() ? panelId : null"
      [class]="inputClass()"
      [style.paddingInlineEnd]="trailingPaddingRem()"
      [disabled]="isDisabled()"
      [value]="currentValue()"
      [placeholder]="placeholder()"
      (input)="onInput($event)"
      (focus)="onFocus()"
      (blur)="onBlur()"
    />
    @if (toggleMask() || showClear()) {
      <span class="absolute inset-y-0 right-0 flex items-center gap-1 pr-(--spacing-field-x)">
        @if (showClearButton()) {
          <button
            type="button"
            class="flex items-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            [attr.aria-label]="clearLabel()"
            (click)="clear()"
          >
            <med-icon name="x-mark" variant="mini" class="size-3.5" />
          </button>
        }
        @if (toggleMask()) {
          <button
            type="button"
            class="flex items-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            [disabled]="isDisabled()"
            [attr.aria-label]="masked() ? showLabel() : hideLabel()"
            (click)="toggleMaskVisibility()"
          >
            <med-icon [name]="masked() ? 'eye' : 'eye-slash'" variant="mini" class="size-4" />
          </button>
        }
      </span>
    }
  `,
})
export class PasswordComponent implements ControlValueAccessor {
  private readonly overlayService = inject(OverlayService);
  private readonly instanceId = nextPasswordId++;
  protected readonly panelId = `med-password-feedback-${this.instanceId}`;

  readonly toggleMask = input(false, { transform: booleanAttribute });
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly feedback = input(false, { transform: booleanAttribute });
  readonly mediumRegex = input<RegExp>(DEFAULT_MEDIUM_REGEX);
  readonly strongRegex = input<RegExp>(DEFAULT_STRONG_REGEX);
  readonly size = input<InputTextSize>('default');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly placeholder = input('');
  readonly inputId = input<string | null>(null);
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly showLabel = input('Show password');
  readonly hideLabel = input('Hide password');
  readonly clearLabel = input('Clear');
  readonly promptLabel = input('Please enter a password');
  readonly weakLabel = input('Weak');
  readonly mediumLabel = input('Medium');
  readonly strongLabel = input('Strong');
  readonly class = input('', { alias: 'class' });

  private readonly value = signal('');
  protected readonly masked = signal(true);
  protected readonly isFeedbackOpen = signal(false);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  private readonly triggerRef = viewChild.required<ElementRef<HTMLInputElement>>('trigger');
  private handle: OverlayHandle<PasswordFeedbackPanelComponent, void> | null = null;

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly currentValue = computed(() => this.value());
  protected readonly inputType = computed(() => (this.toggleMask() && !this.masked() ? 'text' : 'password'));
  protected readonly inputClass = computed(() => mergeClasses(inputTextVariants({ size: this.size(), invalid: this.invalid() }), this.class()));
  protected readonly showClearButton = computed(() => this.showClear() && !this.isDisabled() && this.value() !== '');

  /** Reserved statically off `toggleMask`/`showClear` config, not off whether the clear button currently renders — avoids the input's text shifting as the value is typed/cleared. */
  protected readonly trailingPaddingRem = computed(() => {
    if (this.toggleMask() && this.showClear()) {
      return PASSWORD_CLEAR_AND_TOGGLE_TRAILING_PADDING_REM[this.size()];
    }
    if (this.showClear()) {
      return PASSWORD_CLEAR_TRAILING_PADDING_REM[this.size()];
    }
    if (this.toggleMask()) {
      return PASSWORD_TOGGLE_TRAILING_PADDING_REM[this.size()];
    }
    return null;
  });

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.value.set(text);
    this.onChange(text);
    this.handle?.componentRef.setInput('strength', this.currentStrength());
  }

  protected onFocus(): void {
    if (this.isDisabled() || !this.feedback() || this.handle) {
      return;
    }
    this.isFeedbackOpen.set(true);
    const handle = this.overlayService.openConnected<PasswordFeedbackPanelComponent, void>(this.triggerRef().nativeElement, PasswordFeedbackPanelComponent, {
      hasBackdrop: false,
      trapFocus: false,
      restoreFocus: false,
    });
    this.handle = handle;
    handle.componentRef.setInput('panelId', this.panelId);
    handle.componentRef.setInput('strength', this.currentStrength());
    handle.componentRef.setInput('promptLabel', this.promptLabel());
    handle.componentRef.setInput('weakLabel', this.weakLabel());
    handle.componentRef.setInput('mediumLabel', this.mediumLabel());
    handle.componentRef.setInput('strongLabel', this.strongLabel());

    handle.closed$.subscribe(() => {
      this.isFeedbackOpen.set(false);
      this.handle = null;
    });
  }

  protected onBlur(): void {
    this.onTouched();
    this.handle?.close();
  }

  protected toggleMaskVisibility(): void {
    this.masked.update((current) => !current);
    this.triggerRef().nativeElement.focus();
  }

  protected clear(): void {
    if (this.isDisabled()) {
      return;
    }
    this.value.set('');
    this.onChange('');
    this.onTouched();
    this.handle?.componentRef.setInput('strength', this.currentStrength());
    this.triggerRef().nativeElement.focus();
  }

  private currentStrength() {
    return classifyPasswordStrength(this.value(), this.mediumRegex(), this.strongRegex());
  }

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
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
