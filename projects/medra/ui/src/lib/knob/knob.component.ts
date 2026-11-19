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
import { ButtonSeverity, SOLID_SEVERITY_TEXT } from '../button/button.styles';
import { roundToStepPrecision } from '../input-number/number-format';
import { mergeClasses } from '../utils/merge-classes';

/** Degrees, in the convention 0° = 3 o'clock, 90° = 6 o'clock (SVG's y-axis points down, so angles increase clockwise). */
const START_ANGLE = 135;
/** Leaves a 90° gap centered at the bottom (6 o'clock) — the universally recognized "physical knob" shape, not a full 360° dial. */
const SWEEP = 270;

function polarToPoint(radius: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) };
}

/** SVG arc `d` path from `startAngle` to `startAngle + sweepDeg`, on a fixed 100x100 viewBox centered at (50,50). */
function describeArc(radius: number, sweepDeg: number): string {
  if (sweepDeg <= 0) {
    return '';
  }
  const start = polarToPoint(radius, START_ANGLE);
  const end = polarToPoint(radius, START_ANGLE + sweepDeg);
  const largeArcFlag = sweepDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

/**
 * Maps an arbitrary pointer angle to a 0..1 fraction along the arc,
 * clamping to whichever end is closer when the pointer is dragged into the
 * bottom gap (there's no valid value there, same "drag past the edge just
 * clamps" precedent `SliderComponent` already established for its own
 * track).
 */
function angleToFraction(angleDeg: number): number {
  const relative = (((angleDeg - START_ANGLE) % 360) + 360) % 360;
  if (relative <= SWEEP) {
    return relative / SWEEP;
  }
  const gapMidpoint = SWEEP + (360 - SWEEP) / 2;
  return relative < gapMidpoint ? 1 : 0;
}

/**
 * Knob primitive (Tier 4): a circular dial, functionally the same
 * discrete-numeric-value contract `SliderComponent` already implements
 * (`ControlValueAccessor`, `min`/`max`/`step`, Arrow/Home/End keyboard
 * model, drag-to-set), just laid out radially instead of linearly. Drawn as
 * two SVG arcs (background track + value fill) on a fixed `0 0 100 100`
 * viewBox — geometry math never has to re-run when `size` changes, since
 * the viewBox-to-pixel scaling is the SVG's own job, not this component's.
 *
 * The arc spans 270°, leaving a 90° gap at the bottom (6 o'clock) — the
 * shape everyone actually recognizes as "a knob" (a volume dial, not a full
 * circular progress ring). Dragging into that gap clamps to whichever end
 * is angularly closer, the same "can't produce an invalid value by
 * dragging past the edge" guarantee Slider's track already gives.
 *
 * The `<svg>` itself is the interactive element (`role="slider"`,
 * `tabindex`, all pointer/keyboard listeners) — same "the track owns the
 * whole gesture via pointer capture on itself" technique Slider uses, just
 * with one draggable region instead of a thumb, since a knob has no visual
 * handle to grab separately from the ring itself.
 */
@Component({
  selector: 'med-knob',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KnobComponent),
      multi: true,
    },
  ],
  template: `
    <svg
      #svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 100 100"
      [class]="svgClass()"
      role="slider"
      [attr.tabindex]="isInteractive() ? 0 : -1"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="numericValue()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [attr.aria-disabled]="isDisabled() ? 'true' : null"
      [attr.aria-readonly]="readonly() ? 'true' : null"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
      (keydown)="onKeydown($event)"
    >
      <path [attr.d]="trackPath()" fill="none" [attr.stroke-width]="strokeWidth()" class="stroke-surface-200 dark:stroke-surface-700" [style.stroke]="rangeColor()" stroke-linecap="round" />
      <path [attr.d]="valuePath()" fill="none" [attr.stroke-width]="strokeWidth()" class="stroke-current" [class]="valueColorClass()" [style.stroke]="valueColor()" stroke-linecap="round" />
      @if (showValue()) {
        <text x="50" y="50" text-anchor="middle" dominant-baseline="central" class="select-none fill-surface-900 text-[1.15rem] font-medium dark:fill-surface-50" [style.fill]="textColor()">{{ displayValue() }}</text>
      }
    </svg>
  `,
})
export class KnobComponent implements ControlValueAccessor {
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  /** Rendered diameter, in pixels. Default `100`. */
  readonly size = input(100, { transform: numberAttribute });
  readonly strokeWidth = input(10, { transform: numberAttribute });
  readonly severity = input<ButtonSeverity>('primary');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Shows the current value but ignores pointer/keyboard input. */
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly showValue = input(true, { transform: booleanAttribute });
  /** Overrides the value arc's color regardless of `severity`/`invalid` — any valid CSS color string. */
  readonly valueColor = input<string | null>(null);
  /** Overrides the background track's color (default: a neutral surface gray). */
  readonly rangeColor = input<string | null>(null);
  /** Overrides the displayed value text's color. */
  readonly textColor = input<string | null>(null);
  /** Formats the displayed value text — defaults to the plain number. */
  readonly valueTemplate = input<string | ((value: number) => string) | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  private readonly rawValue = signal<number | undefined>(undefined);
  private readonly formsDisabled = signal(false);
  private readonly dragging = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly isInteractive = computed(() => !this.isDisabled() && !this.readonly());
  protected readonly numericValue = computed(() => this.clampToStep(this.rawValue() ?? this.min()));
  protected readonly fraction = computed(() => {
    const span = this.max() - this.min() || 1;
    return (this.numericValue() - this.min()) / span;
  });

  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly radius = computed(() => 45 - this.strokeWidth() / 2);

  protected readonly trackPath = computed(() => describeArc(this.radius(), SWEEP));
  protected readonly valuePath = computed(() => describeArc(this.radius(), this.fraction() * SWEEP));

  protected readonly svgClass = computed(() =>
    mergeClasses(
      'transition-transform duration-(--transition-duration-base)',
      this.isInteractive() ? 'cursor-pointer touch-none' : '',
      this.isDisabled() ? 'opacity-(--opacity-disabled)' : '',
      'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400 rounded-full',
      this.class(),
    ),
  );

  /**
   * Drives the value arc's `currentColor` (see the `stroke-current` static
   * class alongside this on the `<path>`) — same "`text-*` class sets the
   * color, `stroke-current`/`stroke-*-current` reads it back" technique
   * `ProgressSpinnerComponent` already uses, not a `stroke-*` class derived
   * by string-replacing a `text-*` one: Tailwind's scanner only picks up
   * utility classes it can find as literal text in the source, so a
   * runtime-constructed `stroke-*` class would never actually get its CSS
   * generated.
   */
  protected readonly valueColorClass = computed(() => (this.invalid() ? 'text-danger-500 dark:text-danger-400' : SOLID_SEVERITY_TEXT[this.severity()]));

  protected readonly displayValue = computed(() => {
    const value = this.numericValue();
    const template = this.valueTemplate();
    if (typeof template === 'function') {
      return template(value);
    }
    if (typeof template === 'string') {
      return template.replace(/\{value\}/g, String(value));
    }
    return String(value);
  });

  private clampToStep(value: number): number {
    const min = this.min();
    const max = this.max();
    const step = this.step();
    const clamped = Math.min(max, Math.max(min, value));
    const stepped = min + Math.round((clamped - min) / step) * step;
    return roundToStepPrecision(Math.min(max, Math.max(min, stepped)), step, null);
  }

  private commit(next: number): void {
    const clamped = this.clampToStep(next);
    if (this.numericValue() === clamped) {
      return;
    }
    this.rawValue.set(clamped);
    this.onChange(clamped);
  }

  private commitFromPointer(event: PointerEvent): void {
    const rect = this.svgRef()!.nativeElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let angleDeg = (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI;
    if (angleDeg < 0) {
      angleDeg += 360;
    }
    const fraction = angleToFraction(angleDeg);
    this.commit(this.min() + fraction * (this.max() - this.min()));
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.isInteractive()) {
      return;
    }
    event.preventDefault();
    this.svgRef()!.nativeElement.setPointerCapture(event.pointerId);
    this.dragging.set(true);
    this.onTouched();
    this.commitFromPointer(event);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }
    this.commitFromPointer(event);
  }

  protected onPointerUp(_event: PointerEvent): void {
    this.dragging.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isInteractive()) {
      return;
    }
    const step = this.step();
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        this.onTouched();
        this.commit(this.numericValue() + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        this.onTouched();
        this.commit(this.numericValue() - step);
        break;
      case 'Home':
        event.preventDefault();
        this.onTouched();
        this.commit(this.min());
        break;
      case 'End':
        event.preventDefault();
        this.onTouched();
        this.commit(this.max());
        break;
    }
  }

  writeValue(value: number | null | undefined): void {
    this.rawValue.set(value ?? undefined);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
