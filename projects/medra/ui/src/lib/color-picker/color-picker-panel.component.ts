import { ChangeDetectionStrategy, Component, ElementRef, computed, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { Hsb, hexToHsb, hsbToHex } from './color-picker.utils';

/**
 * Internal overlay content for ColorPicker (not part of the public API —
 * consumers only ever see `<med-color-picker>`). A saturation/brightness
 * area plus a hue track, each its own pointer-draggable + keyboard-operable
 * region — same "pointer listeners on the track, not the handle" shape
 * `SliderComponent` already established, so a click anywhere in either
 * region jumps the handle there and can keep dragging without first landing
 * exactly on a small handle.
 *
 * **`role="slider"` on the saturation/brightness area is informal, not a
 * full APG pattern** — the ARIA slider role models one axis, this area has
 * two (saturation × brightness). `aria-valuetext` carries both as a single
 * readable string; there's no standard two-axis widget role to reach for
 * instead (same "informal, not full APG" scope cut this codebase already
 * made for Tree's role="tree"-adjacent markup). Arrow keys still move both
 * axes independently once focused, so the control stays fully
 * keyboard-operable even though the ARIA role only partially describes it.
 *
 * The hex `<input>` keeps its own draft signal separate from the derived
 * `hsb`-driven hex string: typing "3b8" is a real intermediate state that
 * `hexToHsb` can't parse yet, and re-deriving the displayed value from
 * `hsb()` on every keystroke would fight the user's own typing. The draft
 * only resolves (parses and commits, or silently reverts if unparseable)
 * on blur/Enter.
 */
@Component({
  selector: 'med-color-picker-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block p-3' },
  template: `
    <div class="flex w-52 flex-col gap-3">
      <div
        #svArea
        role="slider"
        tabindex="0"
        [style.background]="svAreaBackground()"
        [attr.aria-label]="saturationBrightnessLabel()"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="100"
        [attr.aria-valuenow]="hsb().s"
        [attr.aria-valuetext]="svValueText()"
        class="relative h-40 w-full touch-none rounded-md"
        (pointerdown)="onSvPointerDown($event)"
        (pointermove)="onSvPointerMove($event)"
        (pointerup)="onSvPointerUp($event)"
        (pointercancel)="onSvPointerUp($event)"
        (keydown)="onSvKeydown($event)"
      >
        <div
          class="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ring-1 ring-black/30"
          [style.left.%]="hsb().s"
          [style.top.%]="100 - hsb().b"
          [style.background]="currentHex()"
        ></div>
      </div>

      <div
        #hueTrack
        role="slider"
        tabindex="0"
        [attr.aria-label]="hueLabel()"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="359"
        [attr.aria-valuenow]="hsb().h"
        class="relative h-3 w-full touch-none rounded-full"
        style="background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
        (pointerdown)="onHuePointerDown($event)"
        (pointermove)="onHuePointerMove($event)"
        (pointerup)="onHuePointerUp($event)"
        (pointercancel)="onHuePointerUp($event)"
        (keydown)="onHueKeydown($event)"
      >
        <div class="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" [style.left.%]="(hsb().h / 360) * 100" [style.background]="hueSwatch()"></div>
      </div>

      <div class="flex items-center gap-2">
        <div class="size-7 shrink-0 rounded-sm border border-surface-200 dark:border-surface-700" [style.background]="currentHex()"></div>
        <input
          type="text"
          [value]="hexDraft() ?? currentHex()"
          [attr.aria-label]="hexInputLabel()"
          class="min-w-0 flex-1 rounded-md border border-surface-300 bg-surface-0 px-2 py-1 text-sm text-surface-900 focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-brand-500 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-50 dark:focus-visible:ring-brand-400"
          (input)="onHexInput($event)"
          (blur)="commitHexDraft()"
          (keydown.enter)="commitHexDraft()"
        />
      </div>
    </div>
  `,
})
export class ColorPickerPanelComponent {
  readonly initialHsb = input<Hsb>({ h: 0, s: 100, b: 100 });
  readonly colorChange = output<Hsb>();

  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly saturationBrightnessLabel = input('Saturation and brightness');
  readonly hueLabel = input('Hue');
  readonly hexInputLabel = input('Hex color');

  protected readonly hsb = linkedSignal(() => this.initialHsb());
  private readonly hexDraftSignal = signal<string | null>(null);
  protected readonly hexDraft = this.hexDraftSignal.asReadonly();

  protected readonly currentHex = computed(() => hsbToHex(this.hsb()));
  protected readonly hueSwatch = computed(() => hsbToHex({ h: this.hsb().h, s: 100, b: 100 }));
  protected readonly svAreaBackground = computed(
    () => `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), ${this.hueSwatch()}`,
  );
  protected readonly svValueText = computed(() => `Saturation ${Math.round(this.hsb().s)}%, brightness ${Math.round(this.hsb().b)}%`);

  private readonly svAreaRef = viewChild<ElementRef<HTMLElement>>('svArea');
  private readonly hueTrackRef = viewChild<ElementRef<HTMLElement>>('hueTrack');
  private draggingSv = false;
  private draggingHue = false;

  private setHsb(next: Hsb): void {
    this.hsb.set(next);
    this.colorChange.emit(next);
  }

  private svFromPointer(event: PointerEvent): { s: number; b: number } {
    const rect = this.svAreaRef()!.nativeElement.getBoundingClientRect();
    const xRatio = rect.width === 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const yRatio = rect.height === 0 ? 0 : Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    return { s: xRatio * 100, b: (1 - yRatio) * 100 };
  }

  protected onSvPointerDown(event: PointerEvent): void {
    event.preventDefault();
    this.svAreaRef()!.nativeElement.setPointerCapture(event.pointerId);
    this.svAreaRef()!.nativeElement.focus();
    this.draggingSv = true;
    const { s, b } = this.svFromPointer(event);
    this.setHsb({ ...this.hsb(), s, b });
  }

  protected onSvPointerMove(event: PointerEvent): void {
    if (!this.draggingSv) {
      return;
    }
    const { s, b } = this.svFromPointer(event);
    this.setHsb({ ...this.hsb(), s, b });
  }

  protected onSvPointerUp(_event: PointerEvent): void {
    this.draggingSv = false;
  }

  protected onSvKeydown(event: KeyboardEvent): void {
    const current = this.hsb();
    let { s, b } = current;
    switch (event.key) {
      case 'ArrowRight':
        s = Math.min(100, s + 1);
        break;
      case 'ArrowLeft':
        s = Math.max(0, s - 1);
        break;
      case 'ArrowUp':
        b = Math.min(100, b + 1);
        break;
      case 'ArrowDown':
        b = Math.max(0, b - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setHsb({ ...current, s, b });
  }

  private hueFromPointer(event: PointerEvent): number {
    const rect = this.hueTrackRef()!.nativeElement.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return Math.min(359, ratio * 360);
  }

  protected onHuePointerDown(event: PointerEvent): void {
    event.preventDefault();
    this.hueTrackRef()!.nativeElement.setPointerCapture(event.pointerId);
    this.hueTrackRef()!.nativeElement.focus();
    this.draggingHue = true;
    this.setHsb({ ...this.hsb(), h: this.hueFromPointer(event) });
  }

  protected onHuePointerMove(event: PointerEvent): void {
    if (!this.draggingHue) {
      return;
    }
    this.setHsb({ ...this.hsb(), h: this.hueFromPointer(event) });
  }

  protected onHuePointerUp(_event: PointerEvent): void {
    this.draggingHue = false;
  }

  protected onHueKeydown(event: KeyboardEvent): void {
    const current = this.hsb();
    let h = current.h;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        h = Math.min(359, h + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        h = Math.max(0, h - 1);
        break;
      case 'Home':
        h = 0;
        break;
      case 'End':
        h = 359;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setHsb({ ...current, h });
  }

  protected onHexInput(event: Event): void {
    this.hexDraftSignal.set((event.target as HTMLInputElement).value);
  }

  protected commitHexDraft(): void {
    const draft = this.hexDraftSignal();
    if (draft !== null) {
      const parsed = hexToHsb(draft);
      if (parsed) {
        this.setHsb(parsed);
      }
      this.hexDraftSignal.set(null);
    }
  }
}
