import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  viewChildren,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ImageComponent } from '../image/image.component';
import { mergeClasses } from '../utils/merge-classes';
import { GalleriaItem, GalleriaPosition, GalleriaResponsiveOption } from './galleria.types';

const THUMB_SIZE_PX = 56;
const THUMB_GAP_PX = 8;

function parseBreakpointPx(breakpoint: string): number {
  return parseInt(breakpoint, 10);
}

/**
 * Galleria primitive (Tier 4): a large main image with a synchronized
 * thumbnail strip — a different composite shape than `CarouselComponent`
 * (one item template panning through a viewport), so it isn't built on top
 * of it. The main view reuses `ImageComponent` directly (`preview`), so
 * clicking the large image opens the same full-screen zoom overlay every
 * other `<med-image preview>` in this library already gives — one less
 * thing this component has to implement itself, and broken-image
 * fallback/retry comes along for free too.
 *
 * `activeIndex` is a `model()` (`[(activeIndex)]`), same two-way-bindable
 * "current position" precedent `CarouselComponent`/`TabsComponent` already
 * established. Prev/Next button visual treatment (a translucent round
 * button over the image, absolutely positioned) deliberately matches
 * Carousel's own — same role, same look.
 *
 * **`class` sizes the whole component (host), not just the main image
 * box**: Angular applies a consumer's *static* `class="..."` attribute to a
 * component's host natively, in addition to whatever the component does
 * with its own aliased `class` input — an earlier version routed `class`
 * only to the main-image `<div>` while the host stayed bare, so a consumer
 * height (e.g. `h-64`) landed on *both*, and the host's own box (which is
 * what the page's layout actually reserves space for) came out exactly as
 * tall as the main image alone, with no room left for the thumbnail row
 * below it — the thumbnails visibly overflowed past the component's own
 * footprint and overlapped whatever content followed it on the page. Fixed
 * by making the host the sized box and the main image `flex-1` inside it
 * (shrinks to fill whatever's left after the thumbnail row's own height),
 * so a `class="h-64"` now means "the whole widget is 256px tall", correctly
 * inclusive of the thumbnails, not "the image alone is 256px tall".
 *
 * **Autoplay/`circular`/`numVisible`/`responsiveOptions`/indicators/
 * `thumbnailsPosition`**.
 *
 * **`circular`** (default `false`): `prev()`/`next()` clamp at the edges, with the edge buttons
 * disappearing entirely — the same `@if (canPrev())`/`@if (canNext())` shape `CarouselComponent`
 * already uses for its own non-circular default. With `circular` on they wrap (`% count`). Autoplay
 * wraps back to index `0` at the end regardless of `circular`, same as `CarouselComponent`'s own
 * autoplay already documents — a looping slideshow, not silently stopping.
 *
 * **Autoplay ships with its own pause/play toggle button**, not asked for
 * explicitly in the audit line but required by the same WCAG 2.2.2 (Pause,
 * Stop, Hide) reasoning `CarouselComponent`'s own autoplay already
 * documents — auto-advancing content needs *some* stop mechanism reachable
 * by every input method, and this library already has one established,
 * working shape for it.
 *
 * **`numVisible`/`responsiveOptions`** size the thumbnail strip, not the main image (there's only
 * ever one main image showing at a time). Each thumbnail is a fixed `size-14` (56px) plus an `8px`
 * gap, so the strip's own length is just `numVisible * 56 + (numVisible - 1) * 8` pixels — beyond
 * that, the strip's native scroll reaches the rest, without needing Carousel's own paged
 * prev/next-thumbnail buttons re-implemented here. `responsiveOptions` resolution
 * (narrowest-fitting-breakpoint-wins, read via a client-only `afterNextRender` + `resize` listener)
 * is the same pattern `CarouselComponent`'s own `responsiveOptions` already established — see that
 * file's doc for the full SSR/hydration reasoning.
 *
 * **`thumbnailsPosition`/`indicatorsPosition`** (`'bottom'|'top'|'left'|'right'`): `left`/`right`
 * turn the thumbnail strip into a vertical column beside the main image instead of a horizontal row
 * below/above it — sized by `verticalThumbnailViewportHeight` (default `'300px'`) instead of the
 * `numVisible`-derived width the horizontal orientations use, since a vertical strip's natural
 * constraint is height, not width. Repositioning uses Tailwind's `order-first` on the thumbnail
 * strip rather than duplicating its markup for each of the four positions — the strip is always the
 * same DOM node, just reordered. Indicators (dots) are a small absolute overlay *within* the main
 * image box (not affecting the thumbnail strip's own layout at all), positioned to the edge
 * `indicatorsPosition` names.
 */
@Component({
  selector: 'med-galleria',
  standalone: true,
  imports: [ImageComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: `
    @if (!fullScreen() || visible()) {
      @if (fullScreen()) {
        <div data-galleria-fullscreen="true" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-950/90 p-6">
          <button
            type="button"
            aria-label="Close"
            class="mb-4 self-end rounded-full bg-surface-0/90 p-2 text-surface-900 hover:bg-surface-100"
            (click)="visible.set(false)"
          >
            <med-icon name="x-mark" variant="mini" class="size-5" />
          </button>
          <div class="flex w-full max-w-4xl flex-col gap-3">
            <div [class]="mainAreaClass">
              @if (activeItem(); as item) {
                <med-image [src]="item.src" [alt]="item.alt ?? ''" preview class="h-full w-full object-cover" />
              }
              @if (showItemNavigators() && items().length > 1 && canPrev()) {
                <button type="button" [attr.aria-label]="previousLabel()" class="absolute inset-y-0 left-2 flex items-center" (click)="prev()">
                  <span class="rounded-full bg-surface-0/90 p-1.5 shadow-overlay-sm hover:bg-surface-100 dark:bg-surface-900/90 dark:hover:bg-surface-800">
                    <med-icon name="chevron-left" variant="mini" class="size-4" />
                  </span>
                </button>
              }
              @if (showItemNavigators() && items().length > 1 && canNext()) {
                <button type="button" [attr.aria-label]="nextLabel()" class="absolute inset-y-0 right-2 flex items-center" (click)="next()">
                  <span class="rounded-full bg-surface-0/90 p-1.5 shadow-overlay-sm hover:bg-surface-100 dark:bg-surface-900/90 dark:hover:bg-surface-800">
                    <med-icon name="chevron-right" variant="mini" class="size-4" />
                  </span>
                </button>
              }
            </div>
          </div>
        </div>
      } @else {
    <div [class]="mainAreaClass">
      @if (activeItem(); as item) {
        <med-image [src]="item.src" [alt]="item.alt ?? ''" preview class="h-full w-full object-cover" />
      }
      @if (showItemNavigators() && items().length > 1 && canPrev()) {
        <button type="button" [attr.aria-label]="previousLabel()" class="absolute inset-y-0 left-2 flex items-center" (click)="prev()">
          <span class="rounded-full bg-surface-0/90 p-1.5 shadow-overlay-sm hover:bg-surface-100 dark:bg-surface-900/90 dark:hover:bg-surface-800">
            <med-icon name="chevron-left" variant="mini" class="size-4" />
          </span>
        </button>
      }
      @if (showItemNavigators() && items().length > 1 && canNext()) {
        <button type="button" [attr.aria-label]="nextLabel()" class="absolute inset-y-0 right-2 flex items-center" (click)="next()">
          <span class="rounded-full bg-surface-0/90 p-1.5 shadow-overlay-sm hover:bg-surface-100 dark:bg-surface-900/90 dark:hover:bg-surface-800">
            <med-icon name="chevron-right" variant="mini" class="size-4" />
          </span>
        </button>
      }
      @if (showIndicators() && items().length > 1) {
        <div [class]="indicatorsWrapperClass()">
          @for (item of items(); track item; let i = $index) {
            <button
              type="button"
              [attr.aria-label]="goToLabel() + ' ' + (i + 1)"
              [attr.aria-current]="i === activeIndex() ? 'true' : null"
              class="block size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500"
              [class]="i === activeIndex() ? 'bg-surface-0' : 'bg-surface-0/50 hover:bg-surface-0/80'"
              (click)="selectThumb(i)"
            ></button>
          }
        </div>
      }
      @if (autoPlay() && items().length > 1) {
        <button
          type="button"
          [attr.aria-label]="paused() ? playLabel() : pauseLabel()"
          class="absolute right-2 bottom-2 rounded-full bg-surface-0/90 p-1.5 shadow-overlay-sm hover:bg-surface-100 dark:bg-surface-900/90 dark:hover:bg-surface-800"
          (click)="toggleAutoplay()"
        >
          <med-icon [name]="paused() ? 'play' : 'pause'" variant="mini" class="size-4" />
        </button>
      }
    </div>
    @if (showThumbnails() && items().length > 1) {
      <div [class]="thumbnailStripClass()" [style]="thumbnailStripStyle()" role="tablist" [attr.aria-label]="thumbnailsAriaLabel()">
        @for (item of items(); track item; let i = $index) {
          <button
            #thumbButton
            type="button"
            role="tab"
            [attr.aria-selected]="i === activeIndex()"
            [tabIndex]="i === activeIndex() ? 0 : -1"
            [class]="thumbClass(i)"
            (click)="selectThumb(i)"
            (keydown)="onThumbKeydown($event, i)"
          >
            @if (thumbFailed(item)) {
              <span class="flex h-full w-full items-center justify-center bg-surface-100 dark:bg-surface-800">
                <med-icon name="photo" variant="outline" class="size-5 text-surface-400 dark:text-surface-500" />
              </span>
            } @else {
              <img [src]="item.thumbnailSrc ?? item.src" [alt]="item.alt ?? ''" class="h-full w-full object-cover" (error)="onThumbError(item)" />
            }
          </button>
        }
      </div>
    }
      }
    }
  `,
})
export class GalleriaComponent {
  readonly items = input<readonly GalleriaItem[]>([]);
  readonly activeIndex = model(0);
  readonly fullScreen = input(false, { transform: booleanAttribute });
  readonly visible = model(false);
  readonly showItemNavigators = input(true, { transform: booleanAttribute });
  readonly showThumbnails = input(true, { transform: booleanAttribute });
  /** Clamps at the edges by default — see class doc. */
  readonly circular = input(false, { transform: booleanAttribute });
  readonly autoPlay = input(false, { transform: booleanAttribute });
  /** Milliseconds between auto-advances. */
  readonly transitionInterval = input(4000, { transform: numberAttribute });
  /** How many thumbnails the strip's own length is sized to show before its existing scroll takes over. */
  readonly numVisible = input(3, { transform: numberAttribute });
  /** Per-breakpoint `numVisible` overrides — same narrowest-fitting-wins resolution as `CarouselComponent`'s own. */
  readonly responsiveOptions = input<readonly GalleriaResponsiveOption[] | null>(null);
  readonly showIndicators = input(false, { transform: booleanAttribute });
  readonly indicatorsPosition = input<GalleriaPosition>('bottom');
  readonly thumbnailsPosition = input<GalleriaPosition>('bottom');
  /** Explicit strip length for `thumbnailsPosition="left"|"right"` — a vertical strip's natural constraint is height, not a `numVisible`-derived width. */
  readonly verticalThumbnailViewportHeight = input('300px');
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly previousLabel = input('Previous image');
  readonly nextLabel = input('Next image');
  readonly goToLabel = input('Go to image');
  readonly playLabel = input('Play');
  readonly pauseLabel = input('Pause');
  readonly thumbnailsAriaLabel = input('Image thumbnails');
  readonly class = input('', { alias: 'class' });

  private readonly thumbButtons = viewChildren<ElementRef<HTMLButtonElement>>('thumbButton');
  /** URLs whose thumbnail `<img>` failed to load — same "track the failed URL, retry on change" technique as `ImageComponent`. */
  private readonly failedThumbnails = signal<ReadonlySet<string>>(new Set());
  protected readonly paused = signal(false);
  /** `null` until `afterNextRender` runs (SSR, or before the first client paint) — falls back to the plain `numVisible()` input in that state, same as `CarouselComponent`'s own. */
  private readonly viewportWidth = signal<number | null>(null);

  protected readonly activeItem = computed(() => this.items()[this.activeIndex()] ?? null);

  protected readonly isVerticalThumbnails = computed(() => this.thumbnailsPosition() === 'left' || this.thumbnailsPosition() === 'right');

  protected readonly hostClass = computed(() => mergeClasses('flex gap-2', this.isVerticalThumbnails() ? 'flex-row' : 'flex-col', this.class()));

  protected readonly mainAreaClass = 'relative min-h-0 flex-1 overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-800';

  protected readonly canPrev = computed(() => this.circular() || this.activeIndex() > 0);
  protected readonly canNext = computed(() => this.circular() || this.activeIndex() < this.items().length - 1);

  private readonly activeResponsiveOption = computed<GalleriaResponsiveOption | null>(() => {
    const options = this.responsiveOptions();
    const width = this.viewportWidth();
    if (!options || options.length === 0 || width === null) {
      return null;
    }
    const fitting = options.filter((option) => width <= parseBreakpointPx(option.breakpoint));
    if (fitting.length === 0) {
      return null;
    }
    return fitting.reduce((narrowest, option) => (parseBreakpointPx(option.breakpoint) < parseBreakpointPx(narrowest.breakpoint) ? option : narrowest));
  });
  protected readonly effectiveNumVisible = computed(() => this.activeResponsiveOption()?.numVisible ?? this.numVisible());

  protected readonly indicatorsWrapperClass = computed(() => {
    const base = 'pointer-events-none absolute flex gap-1.5 p-2';
    switch (this.indicatorsPosition()) {
      case 'top':
        return `${base} inset-x-0 top-0 justify-center`;
      case 'left':
        return `${base} inset-y-0 left-0 flex-col justify-center`;
      case 'right':
        return `${base} inset-y-0 right-0 flex-col justify-center`;
      default:
        return `${base} inset-x-0 bottom-0 justify-center`;
    }
  });

  protected readonly thumbnailStripClass = computed(() => {
    const vertical = this.isVerticalThumbnails();
    const order = this.thumbnailsPosition() === 'top' || this.thumbnailsPosition() === 'left' ? 'order-first' : '';
    return mergeClasses('flex shrink-0 gap-2', vertical ? 'flex-col overflow-y-auto' : 'flex-row overflow-x-auto', order);
  });

  protected readonly thumbnailStripStyle = computed(() => {
    const n = Math.max(1, this.effectiveNumVisible());
    const lengthPx = `${n * THUMB_SIZE_PX + (n - 1) * THUMB_GAP_PX}px`;
    return this.isVerticalThumbnails() ? { height: this.verticalThumbnailViewportHeight(), maxWidth: '100%' } : { width: lengthPx, maxWidth: '100%' };
  });

  constructor() {
    effect((onCleanup) => {
      const interval = this.transitionInterval();
      if (!this.autoPlay() || this.paused() || this.items().length <= 1) {
        return;
      }
      const id = setInterval(() => this.advanceAutoplay(), interval);
      onCleanup(() => clearInterval(id));
    });

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof window === 'undefined') {
        return;
      }
      this.viewportWidth.set(window.innerWidth);
      const onResize = () => this.viewportWidth.set(window.innerWidth);
      window.addEventListener('resize', onResize, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
    });
  }

  protected thumbClass(index: number): string {
    return mergeClasses(
      'size-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors duration-(--transition-duration-base)',
      'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500',
      index === this.activeIndex() ? 'border-brand-500 dark:border-brand-400' : 'border-transparent opacity-70 hover:opacity-100',
    );
  }

  protected thumbFailed(item: GalleriaItem): boolean {
    return this.failedThumbnails().has(item.thumbnailSrc ?? item.src);
  }

  protected onThumbError(item: GalleriaItem): void {
    this.failedThumbnails.update((failed) => new Set(failed).add(item.thumbnailSrc ?? item.src));
  }

  protected selectThumb(index: number): void {
    this.activeIndex.set(index);
  }

  protected toggleAutoplay(): void {
    this.paused.update((value) => !value);
  }

  private advanceAutoplay(): void {
    const max = this.items().length - 1;
    this.activeIndex.set(this.activeIndex() >= max ? 0 : this.activeIndex() + 1);
  }

  /** Roving-tabindex arrow-key navigation, same model as `TabsComponent.onKeydown` — Left/Right (and Home/End) move focus and switch the active image immediately. */
  protected onThumbKeydown(event: KeyboardEvent, currentIndex: number): void {
    const count = this.items().length;
    if (count === 0) {
      return;
    }

    let targetIndex: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        targetIndex = (currentIndex + 1) % count;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        targetIndex = (currentIndex - 1 + count) % count;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = count - 1;
        break;
    }

    if (targetIndex !== null) {
      this.selectThumb(targetIndex);
      this.thumbButtons()[targetIndex]?.nativeElement.focus();
    }
  }

  protected prev(): void {
    if (!this.canPrev()) {
      return;
    }
    const count = this.items().length;
    this.activeIndex.set((this.activeIndex() - 1 + count) % count);
  }

  protected next(): void {
    if (!this.canNext()) {
      return;
    }
    const count = this.items().length;
    this.activeIndex.set((this.activeIndex() + 1) % count);
  }
}
