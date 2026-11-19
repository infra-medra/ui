import { ChangeDetectionStrategy, Component, OnDestroy, booleanAttribute, computed, inject, input, numberAttribute, output, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { mergeClasses } from '../utils/merge-classes';
import { ImagePreviewComponent } from './image-preview.component';

/**
 * Image primitive (Tier 3). `preview` (default `false`) wraps the thumbnail
 * in a button that opens a full-screen overlay (`ImagePreviewComponent`,
 * via `OverlayService.openGlobal()` directly) with pan-free zoom in/out and
 * a close button — Esc/backdrop-click/focus-trap/focus-restore all come
 * from `OverlayService` unchanged, same as every other overlay in this lib.
 *
 * **Broken-image fallback reuses Avatar's exact technique**: a `failedUrl`
 * signal tracks the URL that errored, and `imageFailed` compares it against
 * the current `src` — switching to a new URL always retries loading rather
 * than getting stuck showing the fallback forever. The fallback (a generic
 * photo icon) is never itself clickable, even with `preview` on — there is
 * nothing to preview.
 *
 * **Fallback icon accessible name (Wave 2 fix — 2026-08-19)**: the fallback
 * `<med-icon>` is given `[ariaLabel]` — `IconComponent`'s own existing
 * mechanism for choosing between `role="img"`/`aria-label` and
 * `aria-hidden` (`icon.component.ts:48-50,63-64`) — rather than any new
 * ARIA plumbing here. When the original `alt` describes what the image was
 * supposed to be, that context isn't thrown away just because it broke: the
 * fallback announces "Image failed to load: {alt}". With no `alt` at all
 * there's genuinely nothing to say, so the icon falls through to
 * `IconComponent`'s own decorative default (`aria-hidden`) — the same
 * decorative-by-default call Avatar's own all-defaults fix already makes.
 *
 * `width`/`height` (plain unitless numbers, same as the native `<img>`
 * attributes) let the browser reserve the image's box before it loads —
 * without them the surrounding layout jumps once the real image dimensions
 * arrive (a CLS regression a real deployment would get flagged for).
 * `srcSet`/`sizes` pass straight through to the native attributes for
 * responsive images; neither is applied to `ImagePreviewComponent`'s own
 * `<img>` — the full-screen preview wants the single largest source, not a
 * viewport-relative pick.
 *
 * **`imageError`/`opened`/`closed`**: `imageError` emits the native `error` `Event` alongside the
 * existing internal broken-image fallback logic — a consumer that wants to log/report a broken
 * source doesn't have to reach past this component's own fallback handling to get at the raw event.
 * `opened`/`closed` fire when the `preview` overlay actually opens/ closes — `void` payloads
 * `onHide`), and named past-tense rather than `onXxx`, matching this library's own event-naming
 * convention elsewhere (e.g. `MessageComponent.closed`). `opened` emits synchronously once the
 * overlay is requested (this library's `OverlayService` has no open/enter-animation lifecycle hook
 * to key off); `closed` emits once `OverlayHandle.closed$` actually fires.
 */
@Component({
  selector: 'med-image',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  imports: [IconComponent],
  template: `
    @if (imageFailed()) {
      <span [class]="fallbackClass()">
        <med-icon name="photo" variant="outline" class="size-8 text-surface-400 dark:text-surface-500" [ariaLabel]="brokenImageLabel()" />
      </span>
    } @else if (preview()) {
      <button type="button" class="group relative block overflow-hidden" [attr.aria-label]="previewLabel()" (click)="openPreview()">
        <img [src]="src()" [alt]="alt()" [class]="imgClass()" [attr.width]="width()" [attr.height]="height()" [attr.srcset]="srcSet()" [attr.sizes]="sizes()" (error)="onImageError($event)" />
        <span class="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface-950/0 opacity-0 transition-opacity duration-(--transition-duration-base) group-hover:bg-surface-950/40 group-hover:opacity-100">
          <med-icon name="magnifying-glass-plus" variant="solid" class="size-6 text-white" />
        </span>
      </button>
    } @else {
      <img [src]="src()" [alt]="alt()" [class]="imgClass()" [attr.width]="width()" [attr.height]="height()" [attr.srcset]="srcSet()" [attr.sizes]="sizes()" (error)="onImageError($event)" />
    }
  `,
})
export class ImageComponent implements OnDestroy {
  private readonly overlayService = inject(OverlayService);

  readonly src = input.required<string>();
  readonly alt = input('');
  readonly preview = input(false, { transform: booleanAttribute });
  readonly previewLabel = input('View larger image');
  readonly width = input<number | null>(null, { transform: numberAttribute });
  readonly height = input<number | null>(null, { transform: numberAttribute });
  readonly srcSet = input<string | null>(null);
  readonly sizes = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  readonly imageError = output<Event>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  private readonly failedUrl = signal<string | null>(null);
  protected readonly imageFailed = computed(() => this.failedUrl() === this.src());

  private handle: OverlayHandle<ImagePreviewComponent, void> | null = null;

  protected readonly imgClass = computed(() => mergeClasses('block max-w-full', this.class()));
  protected readonly fallbackClass = computed(() => mergeClasses('flex items-center justify-center bg-surface-100 dark:bg-surface-800', this.class() || 'size-32'));
  /** `null` (decorative, `IconComponent`'s own `aria-hidden` default) when there's no `alt` to carry over; otherwise a label describing what failed to load. */
  protected readonly brokenImageLabel = computed(() => (this.alt() ? `Image failed to load: ${this.alt()}` : null));

  protected onImageError(event: Event): void {
    this.failedUrl.set(this.src());
    this.imageError.emit(event);
  }

  protected openPreview(): void {
    if (this.handle) {
      return;
    }
    const handle = this.overlayService.openGlobal<ImagePreviewComponent, void>(ImagePreviewComponent, { panelClass: [] });
    this.handle = handle;
    handle.componentRef.setInput('src', this.src());
    handle.componentRef.setInput('alt', this.alt());
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());
    handle.closed$.subscribe(() => {
      this.handle = null;
      this.closed.emit();
    });
    this.opened.emit();
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }
}
