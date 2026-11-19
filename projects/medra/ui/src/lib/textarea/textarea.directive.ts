import { Directive, ElementRef, afterNextRender, booleanAttribute, computed, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { mergeClasses } from '../utils/merge-classes';
import { FieldVariant, InputTextSize, inputTextVariants } from '../input-text/input-text.styles';

/**
 * Textarea primitive (Tier 1). Same attribute-directive pattern as
 * InputText, over a native `<textarea>` instead of `<input>`, reusing the
 * exact same field CVA (`inputTextVariants`) — the field chrome
 * (border/padding/focus/invalid/disabled) is identical, only the element
 * and its native multi-line behavior differ.
 *
 * `autoResize` grows the textarea's own height to fit its content instead of scrolling internally —
 * the manual `resize-y` handle is dropped in favor of `resize-none overflow-hidden` while it's on,
 * since a user dragging the handle would immediately get overwritten by the next auto-adjustment
 * anyway. No `minRows`/`maxRows` cap: growth isn't bounded, and a consumer that needs a ceiling can
 * already do so with a plain `max-h-*`/`overflow-y-auto` on `class` (the auto-height still sets an
 * explicit pixel height past that point, but the container clips and scrolls it, which is the same
 * trade-off a hard `maxRows` would make).
 */
@Directive({
  selector: 'textarea[medTextarea]',
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
      useExisting: forwardRef(() => TextareaDirective),
      multi: true,
    },
  ],
})
export class TextareaDirective implements ControlValueAccessor {
  private readonly elementRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);

  readonly size = input<InputTextSize>('default');
  readonly variant = input<FieldVariant>('outlined');
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly autoResize = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly hostClass = computed(() =>
    mergeClasses(
      inputTextVariants({ size: this.size(), invalid: this.invalid(), variant: this.variant() }),
      this.autoResize() ? 'resize-none overflow-hidden' : 'resize-y',
      this.fluid() ? 'w-full' : '',
      this.class(),
    ),
  );

  constructor() {
    // Sizes to any initial content (e.g. a default value with newlines, or a value already
    // written by the time this runs) once the element is actually in the DOM.
    afterNextRender(() => this.adjustHeight());
  }

  protected onInput(event: Event): void {
    this.onChange((event.target as HTMLTextAreaElement).value);
    this.adjustHeight();
  }

  writeValue(value: string | null | undefined): void {
    this.elementRef.nativeElement.value = value ?? '';
    this.adjustHeight();
  }

  private adjustHeight(): void {
    if (!this.autoResize()) {
      return;
    }
    const el = this.elementRef.nativeElement;
    // Collapsing first is what lets scrollHeight shrink back down when content is removed —
    // otherwise a tall textarea would never get shorter as the user deletes lines.
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
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
