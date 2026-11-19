import { ChangeDetectionStrategy, Component, booleanAttribute, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { ButtonSize, INVALID_RING_CLASS, buttonVariants } from '../button/button.styles';
import { RippleDirective } from '../ripple/ripple.directive';
import { mergeClasses } from '../utils/merge-classes';

/**
 * ToggleButton primitive (Tier 2). A labeled two-state button — the
 * WAI-ARIA "pressed button" pattern (`aria-pressed`), not the "switch"
 * pattern ToggleSwitch uses — for a state that reads better as text
 * ("Yes"/"No", "Public"/"Private") than a bare on/off pill. Reuses
 * Button's own `buttonVariants` CVA directly (`filled`+`primary` when
 * pressed, `outlined`+`secondary` when not) instead of a parallel color
 * system, so any future Button restyle applies here automatically.
 *
 * A real native `<button>` gets Enter/Space activation for free — no
 * custom keydown handling needed, same reasoning as Panel's toggle button.
 */
@Component({
  selector: 'med-toggle-button',
  standalone: true,
  imports: [IconComponent, RippleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleButtonComponent),
      multi: true,
    },
  ],
  template: `
    <button
      type="button"
      [id]="inputId()"
      [attr.aria-pressed]="checked()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [attr.aria-readonly]="readonly() ? 'true' : null"
      [disabled]="isDisabled()"
      [class]="buttonClass()"
      medRipple
      [medRippleDisabled]="isDisabled() || readonly()"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      @if (icon() && iconPos() === 'left') {
        <med-icon [name]="icon()!" />
      }
      {{ label() }}
      @if (icon() && iconPos() === 'right') {
        <med-icon [name]="icon()!" />
      }
    </button>
  `,
})
export class ToggleButtonComponent implements ControlValueAccessor {
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly onLabel = input('Yes');
  readonly offLabel = input('No');
  readonly onIcon = input<string | null>(null);
  readonly offIcon = input<string | null>(null);
  readonly size = input<ButtonSize>('default');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly inputId = input<string | null>(null);
  /** Position of the state icon relative to the label. */
  readonly iconPos = input<'left' | 'right'>('left');
  /** Prevents user interaction from toggling state while keeping the button focusable. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** When false, prevents unpressing an already-active toggle button. */
  readonly allowEmpty = input(true, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  protected readonly checked = signal(false);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly label = computed(() => (this.checked() ? this.onLabel() : this.offLabel()));
  protected readonly icon = computed(() => (this.checked() ? this.onIcon() : this.offIcon()));

  protected readonly buttonClass = computed(() =>
    mergeClasses(
      buttonVariants({
        severity: this.checked() ? 'primary' : 'secondary',
        variant: this.checked() ? 'filled' : 'outlined',
        size: this.size(),
      }),
      this.invalid() ? INVALID_RING_CLASS : '',
      this.class(),
    ),
  );

  protected toggle(): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }
    if (!this.allowEmpty() && this.checked()) {
      return;
    }
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
  }

  writeValue(value: boolean | null): void {
    this.checked.set(value === true);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
