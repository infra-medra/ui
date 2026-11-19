import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, inject, input, model, numberAttribute, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';

/**
 * ImageCompare primitive (Tier 4): a before/after slider — two stacked
 * images, the top one clipped at `position` (a percentage, `model()` for
 * `[(position)]`) via `clip-path: inset(...)`, not `overflow: hidden` on a
 * width-animated wrapper — `clip-path` doesn't force a layout reflow on
 * every drag frame the way resizing an element's `width` would.
 *
 * Pointer handling mirrors `SliderComponent`'s own track: a single set of
 * listeners lives on the *container* (not the handle), so a click anywhere
 * on the image immediately jumps the divider there and can keep dragging
 * without the user having to land exactly on the thin handle first — same
 * "click-to-jump and drag are the same code path" reasoning, and pointer
 * capture on the container itself for the same "one element owns the whole
 * gesture" reasoning.
 *
 * The handle (`role="slider"`) carries the real keyboard interaction
 * (Arrow keys step, Home/End jump to 0/100) — the two stacked `<img>`s
 * themselves are `aria-hidden` with `draggable="false"` (this is a
 * comparison control, not a place to drag-save either image, and a screen
 * reader has nothing useful to announce about two overlapping copies of
 * visually similar content).
 *
 * **The host itself is the pointer-tracking container** (no separate
 * wrapper `<div>`): Angular applies a consumer's *static* `class="..."`
 * attribute to a component's host natively, in addition to whatever the
 * component does with its own aliased `class` input (see `ScrollPanel`'s
 * own doc for the full reasoning) — for this component specifically, that
 * would have been worse than cosmetic: `relative`/`overflow-hidden` (needed
 * for the clip-path and the absolutely-positioned handle to work at all)
 * lived on the inner wrapper while the consumer's sizing (`h-64 w-full`)
 * leaked onto a *different*, unsized host element, splitting the box the
 * whole component's geometry depends on across two elements instead of one.
 */
@Component({
  selector: 'med-image-compare',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'containerClass()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
  },
  template: `
    @if (afterFailed()) {
      <div class="flex h-full w-full items-center justify-center bg-surface-100 dark:bg-surface-800">
        <med-icon name="photo" variant="outline" class="size-8 text-surface-400 dark:text-surface-500" />
      </div>
    } @else {
      <img [src]="afterSrc()" [alt]="afterAlt()" aria-hidden="true" draggable="false" class="block h-full w-full select-none object-cover" (error)="onAfterError()" />
    }
    <div class="absolute inset-0 overflow-hidden" [style.clip-path]="clipPath()">
      @if (beforeFailed()) {
        <div class="flex h-full w-full items-center justify-center bg-surface-100 dark:bg-surface-800">
          <med-icon name="photo" variant="outline" class="size-8 text-surface-400 dark:text-surface-500" />
        </div>
      } @else {
        <img [src]="beforeSrc()" [alt]="beforeAlt()" aria-hidden="true" draggable="false" class="block h-full w-full select-none object-cover" (error)="onBeforeError()" />
      }
    </div>
    <div class="absolute inset-y-0 w-0.5 bg-surface-0" [style.left.%]="position()">
      <div
        role="slider"
        [tabIndex]="isDisabled() ? -1 : 0"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-valuenow]="position()"
        [attr.aria-label]="handleAriaLabel()"
        [attr.aria-disabled]="isDisabled() ? 'true' : null"
        class="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface-0 text-surface-700 shadow-overlay-md focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500"
        (keydown)="onKeydown($event)"
      >
        <med-icon name="chevron-left" variant="mini" class="size-3.5" />
        <med-icon name="chevron-right" variant="mini" class="-ml-1.5 size-3.5" />
      </div>
    </div>
  `,
})
export class ImageCompareComponent {
  readonly beforeSrc = input.required<string>();
  readonly afterSrc = input.required<string>();
  readonly beforeAlt = input('');
  readonly afterAlt = input('');
  readonly position = model(50);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly step = input(1, { transform: numberAttribute });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly handleAriaLabel = input('Comparison position');
  readonly class = input('', { alias: 'class' });

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly dragging = signal(false);
  private readonly beforeFailedUrl = signal<string | null>(null);
  private readonly afterFailedUrl = signal<string | null>(null);
  protected readonly isDisabled = computed(() => this.disabled());
  /** Same "track the failed URL, retry on change" technique as `ImageComponent`. */
  protected readonly beforeFailed = computed(() => this.beforeFailedUrl() === this.beforeSrc());
  protected readonly afterFailed = computed(() => this.afterFailedUrl() === this.afterSrc());

  protected readonly containerClass = computed(() =>
    mergeClasses(
      'relative block overflow-hidden select-none touch-none',
      this.isDisabled() ? 'pointer-events-none opacity-(--opacity-disabled)' : 'cursor-ew-resize',
      this.class(),
    ),
  );

  protected readonly clipPath = computed(() => `inset(0 ${100 - this.position()}% 0 0)`);

  private clampToStep(value: number): number {
    const step = this.step();
    const stepped = Math.round(value / step) * step;
    return Math.min(100, Math.max(0, stepped));
  }

  private commitFromPointer(event: PointerEvent): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    this.position.set(this.clampToStep(ratio * 100));
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) {
      return;
    }
    event.preventDefault();
    this.elementRef.nativeElement.setPointerCapture(event.pointerId);
    this.dragging.set(true);
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

  protected onBeforeError(): void {
    this.beforeFailedUrl.set(this.beforeSrc());
  }

  protected onAfterError(): void {
    this.afterFailedUrl.set(this.afterSrc());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const step = this.step();
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        this.position.set(this.clampToStep(this.position() + step));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        this.position.set(this.clampToStep(this.position() - step));
        break;
      case 'Home':
        event.preventDefault();
        this.position.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.position.set(100);
        break;
    }
  }
}
