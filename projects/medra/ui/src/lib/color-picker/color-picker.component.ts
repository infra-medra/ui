import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, booleanAttribute, computed, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { mergeClasses } from '../utils/merge-classes';
import { ColorPickerPanelComponent } from './color-picker-panel.component';
import { Hsb, hexToHsb, hexToRgb, hsbToHex, hsbToHsbString, parseHsbString, parseRgbString, rgbToHex, rgbToRgbString } from './color-picker.utils';

export type ColorPickerSize = 'sm' | 'default' | 'lg';
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsb';

const DEFAULT_HSB: Hsb = { h: 0, s: 0, b: 0 };

/** Converts a hex color to the given `format`'s external string representation. */
function hexToFormat(hex: string, format: ColorPickerFormat): string {
  switch (format) {
    case 'rgb':
      return rgbToRgbString(hexToRgb(hex) ?? { r: 0, g: 0, b: 0 });
    case 'hsb':
      return hsbToHsbString(hexToHsb(hex) ?? DEFAULT_HSB);
    default:
      return hex;
  }
}

/** Parses a `format`-shaped string back to hex — `null` if it doesn't match that format. */
function formatToHex(value: string, format: ColorPickerFormat): string | null {
  switch (format) {
    case 'rgb': {
      const rgb = parseRgbString(value);
      return rgb ? rgbToHex(rgb) : null;
    }
    case 'hsb': {
      const hsb = parseHsbString(value);
      return hsb ? hsbToHex(hsb) : null;
    }
    default:
      return hexToRgb(value) ? value : null;
  }
}

const SIZE_CLASS: Record<ColorPickerSize, string> = {
  sm: 'size-6',
  default: 'size-8',
  lg: 'size-10',
};

const DEFAULT_HEX = '#000000';

/**
 * ColorPicker primitive (Tier 4): a swatch trigger button opening
 * `ColorPickerPanelComponent` (a saturation/brightness area + hue track +
 * hex input, see that file's doc) — same trigger-opens-overlay-panel shape
 * `TreeSelectComponent`/`CascadeSelectComponent` already established.
 *
 * **Unlike those pickers, the panel never closes on interaction**: picking
 * a color is a continuous drag, not a one-shot selection — the overlay's
 * own default Escape/outside-click handling is the only close path,
 * matching how a native `<input type="color">` popover behaves.
 * `colorChange` updates the form value on every drag frame (not just on
 * close), so a consumer watching the value live-previews the color as the
 * user drags — same reasoning `Slider` commits on every pointer move
 * rather than only on release.
 *
 * **Value is a hex string (`"#3b82f6"`), not an HSB/RGB object**: hex is
 * the one representation a consumer is likely to already have on hand
 * (design tokens, CSS custom properties, a `<input type="color">`
 * fallback) — HSB stays purely internal to the panel's own math.
 *
 * **No `null` value, same reasoning `Slider` documents for itself**: a
 * swatch always shows *some* color, so an unwritten value defaults to
 * `#000000` rather than rendering blank.
 *
 * **`format`**: `'hex'` (default) keeps the value a hex
 * string exactly as above; `'rgb'`/`'hsb'` instead read/write a CSS-style
 * `"rgb(r, g, b)"`/`"hsb(h, s%, b%)"` string — still a string either way
 * (not a structured object), so a consumer only has to change what they
 * parse/format, not the shape of their binding. Internally the picker
 * always drags/derives in hex/HSB regardless of `format` — only
 * `writeValue`/the emitted `onChange` value cross the format boundary.
 *
 * **`inline`**: renders `ColorPickerPanelComponent`
 * directly instead of the swatch-button-opens-overlay flow — same
 * "shared panel embedded permanently instead of recreated per-open"
 * reuse `ListboxComponent` already established for `SelectPanelComponent`.
 * Same tradeoff documented there: the panel's `initialHsb` only seeds
 * up until this component's own view has initialized, because
 * continuously re-deriving it from a live `hex()` for the panel's whole
 * lifetime would fight the user's own drag every frame — each
 * hex->HSB->hex round trip introduces rounding, and
 * `ColorPickerPanelComponent`'s own `linkedSignal` treats any new
 * `initialHsb` value as a request to reset.
 *
 * **Three real bugs found seeding `inlineInitialHsb`, all invisible to
 * Jest tests that call `writeValue()` directly and only ever showed up
 * against a real `NgModel` binding in an actual live showcase screenshot**
 * (2026-09-09): (1) a first attempt seeded from a constructor
 * `afterRenderEffect` — too late, since the embedded panel child is
 * constructed as part of the very first render, from whatever
 * `inlineInitialHsb` held at that point (its just-initialized default);
 * the effect's later correction couldn't reach back and un-construct it.
 * (2) moving the seed into `writeValue()` itself, but only latching once
 * (on the *first* call) — broke because `NgModel` calls `writeValue(null)`
 * once before the real value, so the guard locked onto that spurious
 * `null` and ignored the real value entirely; fixed by re-seeding on
 * *every* pre-settle `writeValue()` call instead of just the first.
 * (3) gating "pre-settle" on `ngAfterViewInit()` (synchronously) still
 * missed the real value, because `NgModel` doesn't apply its initial
 * value inside `ngOnChanges` at all — Angular defers it one microtask via
 * `resolvedPromise.then()`, specifically to dodge
 * `ExpressionChangedAfterItHasBeenCheckedError`, so it lands *after*
 * `ngAfterViewInit` has already run. Fixed by flipping `viewInitialized`
 * from a `queueMicrotask()` inside `ngAfterViewInit()` instead of
 * synchronously — queued later than whatever `NgModel` already queued
 * during `ngOnChanges`, so strict microtask-queue FIFO order guarantees
 * it runs after that deferred value lands, not before. A `writeValue()`
 * after that still repaints the swatch preview (`hex()` itself has no
 * such limit) — it just no longer rewinds the picker's own in-progress
 * drag.
 */
@Component({
  selector: 'med-color-picker',
  standalone: true,
  imports: [ColorPickerPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
  template: `
    @if (inline()) {
      <med-color-picker-panel [initialHsb]="inlineInitialHsb()" (colorChange)="onInlineColorChange($event)" />
    } @else {
      <button
        #trigger
        type="button"
        [class]="triggerClass()"
        [style.background]="hex()"
        [disabled]="isDisabled()"
        aria-haspopup="dialog"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-label]="triggerAriaLabel()"
        (click)="onTriggerClick()"
        (blur)="onTouched()"
      ></button>
    }
  `,
})
export class ColorPickerComponent implements ControlValueAccessor, OnDestroy, AfterViewInit {
  private readonly overlayService = inject(OverlayService);

  readonly size = input<ColorPickerSize>('default');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly format = input<ColorPickerFormat>('hex');
  readonly inline = input(false, { transform: booleanAttribute });
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Pick a color');
  readonly class = input('', { alias: 'class' });

  private readonly rawValue = signal<string | undefined>(undefined);
  private readonly formsDisabled = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly inlineInitialHsb = signal<Hsb>(DEFAULT_HSB);
  private viewInitialized = false;

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private handle: OverlayHandle<ColorPickerPanelComponent, void> | null = null;

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly hex = computed(() => this.rawValue() ?? DEFAULT_HEX);
  protected readonly triggerAriaLabel = computed(() => `${this.ariaLabel()}: ${this.hex()}`);

  protected readonly triggerClass = computed(() =>
    mergeClasses(
      SIZE_CLASS[this.size()],
      'rounded-md border border-surface-300 transition-shadow duration-(--transition-duration-base) dark:border-surface-600',
      'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400',
      'disabled:pointer-events-none disabled:opacity-(--opacity-disabled)',
      this.invalid() ? 'ring-2 ring-danger-500 dark:ring-danger-400' : '',
      this.class(),
    ),
  );

  protected onTriggerClick(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.isOpen()) {
      this.handle?.close();
    } else {
      this.open();
    }
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }

  private open(): void {
    if (this.isOpen()) {
      return;
    }
    this.isOpen.set(true);
    this.onTouched();

    const handle = this.overlayService.openConnected<ColorPickerPanelComponent, void>(this.triggerRef().nativeElement, ColorPickerPanelComponent);
    this.handle = handle;

    handle.componentRef.setInput('initialHsb', hexToHsb(this.hex()) ?? DEFAULT_HSB);
    handle.componentRef.instance.colorChange.subscribe((next: Hsb) => this.commitHsb(next));

    handle.closed$.subscribe(() => {
      this.isOpen.set(false);
      this.handle = null;
    });
  }

  protected onInlineColorChange(next: Hsb): void {
    this.commitHsb(next);
  }

  private commitHsb(next: Hsb): void {
    const nextHex = hsbToHex(next);
    this.rawValue.set(nextHex);
    this.onChange(hexToFormat(nextHex, this.format()));
  }

  writeValue(value: string | null | undefined): void {
    const hex = (value == null ? null : formatToHex(value, this.format())) ?? undefined;
    this.rawValue.set(hex);
    if (!this.viewInitialized) {
      // Re-seeds on every pre-settle writeValue() call, not just the first —
      // see the `inline` doc comment above for why "only the first call"
      // broke on NgModel's own writeValue(null) that precedes the real
      // initial value.
      this.inlineInitialHsb.set(hexToHsb(hex ?? DEFAULT_HEX) ?? DEFAULT_HSB);
    }
  }

  ngAfterViewInit(): void {
    // Deliberately not synchronous — see the class doc comment: NgModel's
    // *real* initial value arrives one microtask after ngOnChanges/
    // ngAfterViewInit (Angular defers it via `resolvedPromise.then()` to
    // dodge ExpressionChangedAfterItHasBeenCheckedError), so flipping this
    // flag here directly would lock `viewInitialized` in before that
    // deferred writeValue() ever lands. Queuing this on a *later*
    // microtask instead — same queue, so strict FIFO order guarantees it
    // runs after anything NgModel already queued during ngOnChanges — is
    // what actually catches it.
    queueMicrotask(() => {
      this.viewInitialized = true;
    });
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
