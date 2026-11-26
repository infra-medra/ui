import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { roundToStepPrecision } from '../input-number/number-format';
import { mergeClasses } from '../utils/merge-classes';
import { SliderOrientation, SliderSize, sliderThumbVariants, trackBarVariants, trackFillVariants, trackWrapperVariants } from './slider.styles';
import { SliderRange, SliderValue } from './slider.types';

type Thumb = 'value' | 'start' | 'end';

/**
 * Slider primitive (Tier 3). WAI-ARIA APG "Slider" (single mode) / "Slider
 * (Multi-Thumb)" (`range` mode) — each thumb is its own `role="slider"`
 * div (not a native `<input type="range">`, which can't do two handles),
 * focusable and keyboard-driven independently of pointer dragging, same
 * "real interaction works without a mouse" bar the rest of this lib holds
 * to.
 *
 * A single set of pointer listeners lives on the *track*, not on each
 * thumb: pointerdown computes the clicked position, decides which thumb
 * it belongs to (in `range` mode, whichever thumb is closer), moves focus
 * there, and pointer-captures the track element itself — so drag and
 * click-to-jump are the same code path, and a click that starts on the
 * bare track can keep dragging without the user having to land exactly on
 * a ~16px handle first.
 *
 * **`range` picks the value shape at runtime** (`number` vs. `SliderRange`
 * `{ start, end }`), not a generic type parameter — same runtime-branching
 * choice DatePicker's `selectionMode` and SelectButton's `multiple` already
 * established. Dragging past the other handle clamps instead of crossing
 * (`start` can never exceed `end` and vice versa) — simpler and more
 * predictable than letting handles swap identity mid-drag.
 *
 * **No `null` value, unlike most other form controls in this lib**: a
 * slider thumb always sits at *some* position (same reasoning a native
 * `<input type="range">` never has a null value) — an unwritten value
 * defaults to `min` (single) or `{ start: min, end: max }` (range), and
 * `writeValue(null | undefined)` normalizes to that same default rather
 * than throwing.
 *
 * **`orientation="vertical"`** runs the track bottom (`min`) to top
 * (`max`): thumbs are placed with `bottom` and the fill grows by `height`,
 * and pointer presses map `clientY` against the track's height. A vertical
 * slider has no natural height the way a horizontal one has a default
 * width of 100%, so its track defaults to `h-56`; pass `class="h-40"` (or
 * any height) to change it, since `class` merges onto the track. The
 * keyboard map is the same in both orientations (ArrowUp and ArrowRight
 * increase the value).
 *
 * `minStepsBetweenHandles`/`disabledMinHandle`/`disabledMaxHandle` only
 * apply in `range` mode. The gap is enforced in the same place crossing
 * already was — `commitRangeThumb` clamps each thumb's target against the
 * *other* thumb's position, so a positive gap just tightens that clamp
 * instead of allowing a touch. A disabled handle keeps its own
 * `tabIndex`/pointer routing inert while the other handle stays fully
 * usable — pointer-down on the track routes to whichever handle isn't
 * disabled instead of "nearest", and if both are disabled the track
 * ignores pointer interaction entirely (same as the whole slider being
 * `disabled`, just scoped to `range` mode).
 */
@Component({
  selector: 'med-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', '[attr.data-orientation]': 'orientation()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
  template: `
    <div
      #track
      [class]="wrapperClass()"
      (pointerdown)="onTrackPointerDown($event)"
      (pointermove)="onTrackPointerMove($event)"
      (pointerup)="onTrackPointerUp($event)"
      (pointercancel)="onTrackPointerUp($event)"
    >
      <div [class]="barClass()"></div>
      <div [class]="fillClass()" [style]="fillStyle()"></div>

      @if (!range()) {
        <div
          #valueThumb
          role="slider"
          [tabIndex]="isDisabled() ? -1 : 0"
          [attr.aria-valuemin]="min()"
          [attr.aria-valuemax]="max()"
          [attr.aria-valuenow]="numericValue()"
          [attr.aria-orientation]="orientation()"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-disabled]="isDisabled() ? 'true' : null"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [class]="thumbClass()"
          [style]="thumbStyle(numericValue())"
          (keydown)="onKeydown($event, 'value')"
        ></div>
      } @else {
        <div
          #startThumb
          role="slider"
          [tabIndex]="isHandleDisabled('start') ? -1 : 0"
          [attr.aria-valuemin]="min()"
          [attr.aria-valuemax]="rangeValue().end"
          [attr.aria-valuenow]="rangeValue().start"
          [attr.aria-orientation]="orientation()"
          [attr.aria-label]="startLabel()"
          [attr.aria-disabled]="isHandleDisabled('start') ? 'true' : null"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [class]="thumbClass()"
          [style]="thumbStyle(rangeValue().start)"
          (keydown)="onKeydown($event, 'start')"
        ></div>
        <div
          #endThumb
          role="slider"
          [tabIndex]="isHandleDisabled('end') ? -1 : 0"
          [attr.aria-valuemin]="rangeValue().start"
          [attr.aria-valuemax]="max()"
          [attr.aria-valuenow]="rangeValue().end"
          [attr.aria-orientation]="orientation()"
          [attr.aria-label]="endLabel()"
          [attr.aria-disabled]="isHandleDisabled('end') ? 'true' : null"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [class]="thumbClass()"
          [style]="thumbStyle(rangeValue().end)"
          (keydown)="onKeydown($event, 'end')"
        ></div>
      }
    </div>
  `,
})
export class SliderComponent implements ControlValueAccessor {
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly range = input(false, { transform: booleanAttribute });
  readonly minStepsBetweenHandles = input(0, { transform: numberAttribute });
  readonly disabledMinHandle = input(false, { transform: booleanAttribute });
  readonly disabledMaxHandle = input(false, { transform: booleanAttribute });
  readonly size = input<SliderSize>('default');
  /** Track direction. `vertical` runs bottom (`min`) to top (`max`) and defaults to a fixed height that `class` can override. */
  readonly orientation = input<SliderOrientation>('horizontal');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);
  readonly startLabel = input('Minimum value');
  readonly endLabel = input('Maximum value');
  readonly class = input('', { alias: 'class' });

  /** `undefined` = never written by the consumer — falls back to `min` / `{ start: min, end: max }`. */
  private readonly rawValue = signal<SliderValue | undefined>(undefined);
  private readonly formsDisabled = signal(false);
  /** Which thumb, if any, the current pointer drag (started on the track) is driving. */
  private readonly activeThumb = signal<Thumb | null>(null);

  private readonly trackRef = viewChild<ElementRef<HTMLElement>>('track');
  private readonly valueThumbRef = viewChild<ElementRef<HTMLElement>>('valueThumb');
  private readonly startThumbRef = viewChild<ElementRef<HTMLElement>>('startThumb');
  private readonly endThumbRef = viewChild<ElementRef<HTMLElement>>('endThumb');

  private onChange: (value: SliderValue) => void = () => {};
  private onTouched: () => void = () => {};
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  protected isHandleDisabled(which: Thumb): boolean {
    if (this.isDisabled()) {
      return true;
    }
    if (which === 'start') {
      return this.disabledMinHandle();
    }
    if (which === 'end') {
      return this.disabledMaxHandle();
    }
    return false;
  }

  protected readonly numericValue = computed(() => {
    const raw = this.rawValue();
    return this.clampToStep(typeof raw === 'number' ? raw : this.min());
  });

  protected readonly rangeValue = computed<SliderRange>(() => {
    const raw = this.rawValue();
    const r = raw !== undefined && typeof raw === 'object' ? raw : { start: this.min(), end: this.max() };
    return { start: this.clampToStep(r.start), end: this.clampToStep(r.end) };
  });

  private readonly isVertical = computed(() => this.orientation() === 'vertical');

  protected readonly wrapperClass = computed(() =>
    mergeClasses(trackWrapperVariants({ size: this.size(), orientation: this.orientation(), disabled: this.isDisabled() }), this.class()),
  );
  protected readonly barClass = computed(() => trackBarVariants({ size: this.size(), orientation: this.orientation() }));
  protected readonly fillClass = computed(() => trackFillVariants({ size: this.size(), orientation: this.orientation(), invalid: this.invalid() }));
  protected readonly thumbClass = computed(() => sliderThumbVariants({ size: this.size(), orientation: this.orientation(), invalid: this.invalid() }));

  /** The highlighted span along the track: measured from the left when horizontal, from the bottom when vertical. */
  protected readonly fillStyle = computed(() => {
    const fromPct = this.range() ? this.percentFor(this.rangeValue().start) : 0;
    const toPct = this.range() ? this.percentFor(this.rangeValue().end) : this.percentFor(this.numericValue());
    return this.isVertical()
      ? { bottom: `${fromPct}%`, height: `${toPct - fromPct}%` }
      : { left: `${fromPct}%`, width: `${toPct - fromPct}%` };
  });

  protected thumbStyle(value: number): Record<string, string> {
    return this.isVertical()
      ? { bottom: `${this.percentFor(value)}%`, transform: 'translate(-50%, 50%)' }
      : { left: `${this.percentFor(value)}%`, transform: 'translate(-50%, -50%)' };
  }

  private percentFor(value: number): number {
    const span = this.max() - this.min() || 1;
    return ((value - this.min()) / span) * 100;
  }

  private clampToStep(value: number): number {
    const min = this.min();
    const max = this.max();
    const step = this.step();
    const clamped = Math.min(max, Math.max(min, value));
    const stepped = min + Math.round((clamped - min) / step) * step;
    return roundToStepPrecision(Math.min(max, Math.max(min, stepped)), step, null);
  }

  private commitSingle(next: number): void {
    const clamped = this.clampToStep(next);
    if (this.numericValue() === clamped) {
      return;
    }
    this.rawValue.set(clamped);
    this.onChange(clamped);
  }

  /** Clamps so `start` stays at least `minStepsBetweenHandles` steps below `end` and vice versa — handles never cross, or (with a positive gap) even touch. */
  private commitRangeThumb(which: 'start' | 'end', rawTarget: number): void {
    const current = this.rangeValue();
    const clamped = this.clampToStep(rawTarget);
    const gap = this.minStepsBetweenHandles() * this.step();
    const next: SliderRange =
      which === 'start'
        ? { start: Math.max(this.min(), Math.min(clamped, current.end - gap)), end: current.end }
        : { start: current.start, end: Math.min(this.max(), Math.max(clamped, current.start + gap)) };
    if (next.start === current.start && next.end === current.end) {
      return;
    }
    this.rawValue.set(next);
    this.onChange(next);
  }

  /** Maps the pointer to a value: left-to-right when horizontal, bottom-to-top when vertical. */
  private valueFromPointer(event: PointerEvent): number {
    const rect = this.trackRef()!.nativeElement.getBoundingClientRect();
    const extent = this.isVertical() ? rect.height : rect.width;
    const offset = this.isVertical() ? rect.bottom - event.clientY : event.clientX - rect.left;
    const ratio = extent === 0 ? 0 : Math.min(1, Math.max(0, offset / extent));
    return this.min() + ratio * (this.max() - this.min());
  }

  private focusThumb(which: Thumb): void {
    const ref = which === 'value' ? this.valueThumbRef() : which === 'start' ? this.startThumbRef() : this.endThumbRef();
    ref?.nativeElement.focus();
  }

  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) {
      return;
    }
    event.preventDefault();
    this.trackRef()!.nativeElement.setPointerCapture(event.pointerId);
    this.onTouched();

    const target = this.valueFromPointer(event);
    if (this.range()) {
      const startDisabled = this.isHandleDisabled('start');
      const endDisabled = this.isHandleDisabled('end');
      if (startDisabled && endDisabled) {
        return;
      }
      const current = this.rangeValue();
      const which: 'start' | 'end' = startDisabled
        ? 'end'
        : endDisabled
          ? 'start'
          : Math.abs(target - current.start) <= Math.abs(target - current.end)
            ? 'start'
            : 'end';
      this.activeThumb.set(which);
      this.commitRangeThumb(which, target);
      this.focusThumb(which);
    } else {
      this.activeThumb.set('value');
      this.commitSingle(target);
      this.focusThumb('value');
    }
  }

  protected onTrackPointerMove(event: PointerEvent): void {
    const which = this.activeThumb();
    if (!which) {
      return;
    }
    const target = this.valueFromPointer(event);
    if (which === 'value') {
      this.commitSingle(target);
    } else {
      this.commitRangeThumb(which, target);
    }
  }

  protected onTrackPointerUp(_event: PointerEvent): void {
    this.activeThumb.set(null);
  }

  protected onKeydown(event: KeyboardEvent, which: Thumb): void {
    if (this.isHandleDisabled(which)) {
      return;
    }
    const step = this.step();
    let delta = 0;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        delta = step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -step;
        break;
      case 'PageUp':
        delta = step * 10;
        break;
      case 'PageDown':
        delta = -step * 10;
        break;
      case 'Home':
        event.preventDefault();
        this.onTouched();
        which === 'value' ? this.commitSingle(this.min()) : this.commitRangeThumb(which, this.min());
        return;
      case 'End':
        event.preventDefault();
        this.onTouched();
        which === 'value' ? this.commitSingle(this.max()) : this.commitRangeThumb(which, this.max());
        return;
      default:
        return;
    }
    event.preventDefault();
    this.onTouched();
    if (which === 'value') {
      this.commitSingle(this.numericValue() + delta);
    } else {
      this.commitRangeThumb(which, this.rangeValue()[which] + delta);
    }
  }

  writeValue(value: SliderValue | null | undefined): void {
    this.rawValue.set(value ?? undefined);
  }

  registerOnChange(fn: (value: SliderValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
