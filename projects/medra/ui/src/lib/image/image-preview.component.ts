import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';

/**
 * Internal overlay content for `ImageComponent`'s `preview` mode (not part
 * of the public API — consumers only ever see `<med-image>`). Opened
 * directly via `OverlayService.openGlobal()` from `ImageComponent` itself,
 * same "component owns its own overlay lifecycle" pattern SplitButton's
 * dropdown already uses, rather than a separate injectable service — there
 * is no arbitrary consumer content here to route through `DialogService`'s
 * `DIALOG_DATA`/shell machinery, just a fixed image + zoom + close layout.
 *
 * **`role="dialog"`/`aria-modal="true"` (Wave 2 fix — 2026-08-19)**: this
 * panel is opened via `OverlayService.openGlobal()` directly rather than
 * `DialogService`, so it never inherited `DialogShellComponent`'s own
 * `role="dialog"`/`aria-modal="true"` host bindings
 * (`dialog-shell.component.ts:42-48`) even though it's every bit as modal —
 * Esc/backdrop-click/focus-trap/focus-restore already all come from
 * `OverlayService` unchanged. The host now declares the same pair directly,
 * plus `aria-label` so the dialog has an accessible name even with no
 * visible heading: `alt` when the consumer provided one, else a generic
 * fallback (there's still an image on screen — this is a real dialog, not a
 * decorative one, so it always gets a name, unlike `ImageComponent`'s own
 * fallback icon which can legitimately have none).
 *
 * **Rotate**: `rotateLeft()`/`rotateRight()` step by ±90°, unbounded (`rotate += 90`/`rotate -=
 * 90`), so repeated clicks keep spinning past 360°/-360° instead of clamping. Combined with `zoom`
 * in one `transform: rotate(...) scale(...)` on the image. No distinct Heroicons "rotate
 * left"/"rotate right" pair exists, so both buttons reuse `arrow-path` (a circular refresh arrow) —
 * the left one horizontally flipped (`-scale-x-100`) rather than reusing an unrelated icon.
 */
@Component({
  selector: 'med-image-preview',
  standalone: true,
  imports: [ButtonDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex max-h-[90vh] max-w-[90vw] flex-col',
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-label]': 'dialogLabel()',
  },
  template: `
    <div class="flex justify-end gap-1 p-2">
      <button medButton type="button" variant="text" severity="secondary" iconOnly [attr.aria-label]="rotateLeftLabel()" (click)="rotateLeft()">
        <med-icon name="arrow-path" variant="mini" class="-scale-x-100" />
      </button>
      <button medButton type="button" variant="text" severity="secondary" iconOnly [attr.aria-label]="rotateRightLabel()" (click)="rotateRight()">
        <med-icon name="arrow-path" variant="mini" />
      </button>
      <button medButton type="button" variant="text" severity="secondary" iconOnly [disabled]="!canZoomOut()" [attr.aria-label]="zoomOutLabel()" (click)="zoomOut()">
        <med-icon name="magnifying-glass-minus" variant="mini" />
      </button>
      <button medButton type="button" variant="text" severity="secondary" iconOnly [disabled]="!canZoomIn()" [attr.aria-label]="zoomInLabel()" (click)="zoomIn()">
        <med-icon name="magnifying-glass-plus" variant="mini" />
      </button>
      <button medButton type="button" variant="text" severity="secondary" iconOnly [attr.aria-label]="closeLabel()" (click)="closeRequested.emit()">
        <med-icon name="x-mark" variant="mini" />
      </button>
    </div>
    <div class="flex flex-1 items-center justify-center overflow-auto px-4 pb-4">
      <img [src]="src()" [alt]="alt()" class="max-h-full max-w-full object-contain transition-transform duration-(--transition-duration-base)" [style.transform]="imageTransform()" />
    </div>
  `,
})
export class ImagePreviewComponent {
  readonly src = input.required<string>();
  readonly alt = input('');

  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly zoomInLabel = input('Zoom in');
  readonly zoomOutLabel = input('Zoom out');
  readonly rotateLeftLabel = input('Rotate left');
  readonly rotateRightLabel = input('Rotate right');
  readonly closeLabel = input('Close');

  readonly closeRequested = output<void>();

  /** `alt` when set, else a generic English default — see roadmap/decisoes-produto.md, Phase 2, "i18n support" for the pattern. */
  protected readonly dialogLabel = computed(() => this.alt() || 'Image preview');

  protected readonly zoom = signal(1);
  protected readonly canZoomIn = computed(() => this.zoom() < 3);
  protected readonly canZoomOut = computed(() => this.zoom() > 1);

  /** Degrees, unbounded (±90 per click) — never clamped, so repeated clicks keep spinning past 360/-360 rather than stopping. */
  protected readonly rotation = signal(0);
  protected readonly imageTransform = computed(() => `rotate(${this.rotation()}deg) scale(${this.zoom()})`);

  protected zoomIn(): void {
    this.zoom.update((z) => Math.min(3, z + 0.5));
  }

  protected zoomOut(): void {
    this.zoom.update((z) => Math.max(1, z - 0.5));
  }

  protected rotateRight(): void {
    this.rotation.update((deg) => deg + 90);
  }

  protected rotateLeft(): void {
    this.rotation.update((deg) => deg - 90);
  }
}
