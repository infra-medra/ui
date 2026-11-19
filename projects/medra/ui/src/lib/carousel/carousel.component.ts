import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

/** One breakpoint tier for `responsiveOptions` — `breakpoint` is a plain pixel length (e.g. `'768px'`), applied via `window.innerWidth <= <that value>`, not a real CSS media query. */
export interface CarouselResponsiveOption {
  readonly breakpoint: string;
  readonly numVisible: number;
  readonly numScroll: number;
}

export type CarouselOrientation = 'horizontal' | 'vertical';

function parseBreakpointPx(breakpoint: string): number {
  return parseInt(breakpoint, 10);
}

/**
 * Carousel primitive (Tier 3): pages through a `T[]`, `numVisible` items at
 * a time, sliding via a CSS `transform: translate...(...)` track — item
 * markup is entirely consumer-templated via a projected
 * `<ng-template #item let-item>` (`NgTemplateOutlet`), same per-item
 * projection DataView just established as this lib's pattern for
 * "arbitrary item content" (as opposed to Select's fixed `SelectOption<T>`
 * shape).
 *
 * **`#item` is now a named template reference, not a bare unnamed
 * `<ng-template>`**
 * `contentChild.required(TemplateRef)` could no longer reliably tell them
 * apart, since it just grabs the first `ng-template` it finds regardless of
 * which one that is): same named-`contentChild` idiom
 * `TableColumnComponent.editTemplate` already established for "more than
 * one projected template per component," not a new mechanism. `header`/
 * `footer` are optional (`contentChild`, not `.required`) and render
 * outside the sliding track — above/below it respectively — same
 * unstyled, consumer-owns-the-markup slot philosophy `Card`'s
 * `medCardHeader`/`medCardFooter` already uses, just via template
 * references instead of attribute directives (this component already had
 * a `<ng-template>`-based mechanism for the item slot, so extending that
 * was more consistent than introducing a second projection style here).
 *
 * **`orientation: 'vertical'`** swaps the sliding axis (`translateY` instead of `translateX`, a
 * `flex-col` track, prev/next arrows on top/ bottom instead of left/right with
 * `chevron-up`/`chevron-down` instead of `chevron-left`/`chevron-right`) and requires an explicit
 * `verticalViewPortHeight` (default `'300px'`) on the clipping container — unlike the horizontal
 * track, a vertical one has no natural width to size the viewport from, only the items' own content
 * height, which the whole point of `overflow-hidden` paging is to *not* just render in full.
 *
 * **`showNavigators`** independently toggles the prev/next arrow buttons,
 * separate from `showIndicators`' dots — previously the only way to hide
 * them was `canPrev()`/`canNext()` both being false (fewer items than fit
 * in one page), not a real per-instance choice.
 *
 * **`pageChange`** emits the new page index (a plain `number` — this library emits a bare primitive
 * whenever an event only ever carries one piece of information, e.g.
 * `DatePickerComponent.dateSelect`) whenever `prev()`/`next()`/ `goToPage()`/autoplay actually
 * crosses a page boundary — not on every `firstIndex` write, since a clamped no-op nav (prev at the
 * first page, next at the last) doesn't change which page is current.
 *
 * **No circular/infinite looping for v1**: prev/next clamp at the edges
 * (same reduced scope Paginator's own page-window already settled for —
 * "a plain contiguous range ... simpler, and can be layered on later
 * without an API change") rather than the clone-the-edge-items trick real
 * seamless looping needs. Autoplay *does* wrap back to the first page when
 * it reaches the end — that's just resetting `firstIndex` to `0`, not
 * seamless sliding, so it doesn't need the same infrastructure.
 *
 * **Autoplay pauses via an explicit, always-visible toggle button, not
 * hover/focus**: hover-only pausing leaves keyboard and touch users with
 * no way to stop auto-advancing content, which is exactly the WCAG 2.2.2
 * (Pause, Stop, Hide) failure mode — a persistent button any input method
 * can activate is the simpler, more robust fix, so that's the only pause
 * mechanism here for v1.
 *
 * The last page always shows a full `numVisible` items (never a trailing
 * partial page with empty space) — `firstIndex` is clamped to
 * `value().length - numVisible`, so scrolling to "the end" means the last
 * item lines up with the track's right edge, same convention most
 * production carousels use.
 *
 * `responsiveOptions` swaps `numVisible`/`numScroll` for a breakpoint tier
 * (the smallest `breakpoint` still `>= window.innerWidth`) instead of the
 * fixed defaults — everywhere else in this component that used to read
 * `numVisible()`/`effectiveNumScroll()` now reads through
 * `effectiveNumVisible()`/`effectiveNumScroll()`, which fall back to the
 * plain inputs when no tier applies (SSR, no `responsiveOptions`, or a
 * viewport wider than every configured breakpoint). Read via a `resize`
 * listener registered inside `afterNextRender` — client-only and
 * *after* the first render, deliberately, so the server-rendered/hydrated
 * markup always starts from the plain `numVisible()`/`numScroll()` inputs;
 * correcting to the real breakpoint is a second, client-only paint, never
 * something the server has to guess at (there is no reliable viewport
 * width during SSR) or that could produce a hydration mismatch.
 *
 * **`#previousicon`/`#nexticon`**: named `TemplateRef<void>` slots (no context) replacing the fixed
 * `chevron-left`/`chevron-right` (or `chevron-up`/ `chevron-down` in `orientation="vertical"`) icon
 * when projected, same named-`contentChild` idiom `#header`/`#footer` already use here.
 */
@Component({
  selector: 'med-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [NgTemplateOutlet, IconComponent],
  template: `
    <div class="relative" role="region" [attr.aria-roledescription]="'carousel'" [attr.aria-label]="ariaLabel()">
      @if (headerTemplate(); as header) {
        <div class="mb-3">
          <ng-container [ngTemplateOutlet]="header" />
        </div>
      }

      <div class="relative">
        <div class="overflow-hidden" [style.height]="isVertical() ? verticalViewPortHeight() : null">
          <div [class]="trackClass()" [style.transform]="trackTransform()">
            @for (item of value(); track trackByFn(item, $index)) {
              <div class="shrink-0" [style.flex]="itemFlexBasis()">
                <ng-container [ngTemplateOutlet]="itemTemplate()" [ngTemplateOutletContext]="{ $implicit: item }" />
              </div>
            }
          </div>
        </div>

        @if (showNavigators() && canPrev()) {
          <button type="button" [attr.aria-label]="previousLabel()" [class]="prevButtonClass()" (click)="prev()">
            <span class="rounded-full bg-surface-0/90 p-1.5 shadow-overlay-sm hover:bg-surface-100 dark:bg-surface-900/90 dark:hover:bg-surface-800">
              @if (previousIconTemplate(); as tpl) {
                <ng-container [ngTemplateOutlet]="tpl" />
              } @else {
                <med-icon [name]="isVertical() ? 'chevron-up' : 'chevron-left'" variant="mini" class="size-4" />
              }
            </span>
          </button>
        }
        @if (showNavigators() && canNext()) {
          <button type="button" [attr.aria-label]="nextLabel()" [class]="nextButtonClass()" (click)="next()">
            <span class="rounded-full bg-surface-0/90 p-1.5 shadow-overlay-sm hover:bg-surface-100 dark:bg-surface-900/90 dark:hover:bg-surface-800">
              @if (nextIconTemplate(); as tpl) {
                <ng-container [ngTemplateOutlet]="tpl" />
              } @else {
                <med-icon [name]="isVertical() ? 'chevron-down' : 'chevron-right'" variant="mini" class="size-4" />
              }
            </span>
          </button>
        }
      </div>

      <div class="mt-3 flex items-center justify-center gap-3">
        @if (showIndicators() && pageCount() > 1) {
          <ul class="flex items-center gap-1.5">
            @for (page of pageIndexes(); track page) {
              <li>
                <button
                  type="button"
                  [attr.aria-label]="goToLabel() + ' ' + (page + 1)"
                  [attr.aria-current]="page === currentPage() ? 'true' : null"
                  class="block size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500"
                  [class]="page === currentPage() ? 'bg-brand-500 dark:bg-brand-400' : 'bg-surface-300 dark:bg-surface-600'"
                  (click)="goToPage(page)"
                ></button>
              </li>
            }
          </ul>
        }
        @if (autoplayInterval() !== null) {
          <button type="button" [attr.aria-label]="paused() ? playLabel() : pauseLabel()" class="rounded-sm p-1 hover:bg-surface-100 dark:hover:bg-surface-800 focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500" (click)="toggleAutoplay()">
            <med-icon [name]="paused() ? 'play' : 'pause'" variant="mini" class="size-4" />
          </button>
        }
      </div>

      @if (footerTemplate(); as footer) {
        <div class="mt-3">
          <ng-container [ngTemplateOutlet]="footer" />
        </div>
      }

      <span class="sr-only" aria-live="polite">{{ liveAnnouncement() }}</span>
    </div>
  `,
})
export class CarouselComponent<T> {
  readonly value = input<readonly T[]>([]);
  readonly numVisible = input(1, { transform: numberAttribute });
  /** Default: same as `numVisible` — how many items prev/next advance by. */
  readonly numScroll = input<number | null>(null);
  readonly showIndicators = input(true, { transform: booleanAttribute });
  /** Independent of `showIndicators` — toggles the prev/next arrow buttons specifically. */
  readonly showNavigators = input(true, { transform: booleanAttribute });
  readonly circular = input(false, { transform: booleanAttribute });
  readonly orientation = input<CarouselOrientation>('horizontal');
  /** Explicit height for the clipping viewport in `orientation="vertical"` — ignored otherwise. */
  readonly verticalViewPortHeight = input('300px');
  /** Milliseconds between auto-advances. `null` (default) disables autoplay entirely — no toggle button renders either. */
  readonly autoplayInterval = input<number | null>(null);
  /** Per-breakpoint `numVisible`/`numScroll` overrides, narrowest viewport first or last — order doesn't matter, the smallest matching `breakpoint` always wins. `null` (default) never overrides the plain inputs. */
  readonly responsiveOptions = input<readonly CarouselResponsiveOption[] | null>(null);

  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Carousel');
  readonly previousLabel = input('Previous slide');
  readonly nextLabel = input('Next slide');
  readonly goToLabel = input('Go to page');
  readonly playLabel = input('Play');
  readonly pauseLabel = input('Pause');

  /** Current page index, a plain `number` — see class doc. */
  readonly pageChange = output<number>();

  protected readonly itemTemplate = contentChild.required('item', { read: TemplateRef });
  protected readonly headerTemplate = contentChild('header', { read: TemplateRef });
  protected readonly footerTemplate = contentChild('footer', { read: TemplateRef });
  protected readonly previousIconTemplate = contentChild('previousicon', { read: TemplateRef });
  protected readonly nextIconTemplate = contentChild('nexticon', { read: TemplateRef });

  protected readonly isVertical = computed(() => this.orientation() === 'vertical');

  private readonly firstIndex = signal(0);
  protected readonly paused = signal(false);
  /** `null` until `afterNextRender` runs (SSR, or before the first client paint) — every consumer of this falls back to the plain inputs in that state. */
  private readonly viewportWidth = signal<number | null>(null);

  /** The narrowest configured tier whose `breakpoint` still fits the current viewport, or `null` if none applies. */
  private readonly activeResponsiveOption = computed<CarouselResponsiveOption | null>(() => {
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
  private readonly effectiveNumScroll = computed(() => this.activeResponsiveOption()?.numScroll ?? this.numScroll() ?? this.effectiveNumVisible());
  protected readonly maxFirstIndex = computed(() => Math.max(0, this.value().length - this.effectiveNumVisible()));
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.maxFirstIndex() / this.effectiveNumScroll()) + 1));
  protected readonly currentPage = computed(() => Math.min(this.pageCount() - 1, Math.round(this.firstIndex() / this.effectiveNumScroll())));
  protected readonly pageIndexes = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i));

  protected readonly canPrev = computed(() => (this.circular() ? this.maxFirstIndex() > 0 : this.firstIndex() > 0));
  protected readonly canNext = computed(() => (this.circular() ? this.maxFirstIndex() > 0 : this.firstIndex() < this.maxFirstIndex()));

  protected readonly itemFlexBasis = computed(() => `0 0 ${100 / this.effectiveNumVisible()}%`);
  protected readonly trackClass = computed(
    () => `flex transition-transform duration-(--transition-duration-slow) ease-out ${this.isVertical() ? 'flex-col' : ''}`,
  );
  protected readonly trackTransform = computed(() => {
    const offset = (this.firstIndex() * 100) / this.effectiveNumVisible();
    return this.isVertical() ? `translateY(-${offset}%)` : `translateX(-${offset}%)`;
  });
  protected readonly prevButtonClass = computed(() =>
    this.isVertical()
      ? 'absolute inset-x-0 top-2 flex justify-center rounded-full focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500'
      : 'absolute inset-y-0 left-2 flex items-center rounded-full focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500',
  );
  protected readonly nextButtonClass = computed(() =>
    this.isVertical()
      ? 'absolute inset-x-0 bottom-2 flex justify-center rounded-full focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500'
      : 'absolute inset-y-0 right-2 flex items-center rounded-full focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500',
  );
  protected readonly liveAnnouncement = computed(() => `Page ${this.currentPage() + 1} of ${this.pageCount()}`);

  constructor() {
    effect((onCleanup) => {
      const interval = this.autoplayInterval();
      if (interval === null || this.paused()) {
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

  protected trackByFn(_item: T, index: number): number {
    return index;
  }

  protected prev(): void {
    const previousPage = this.currentPage();
    if (this.circular() && this.firstIndex() <= 0) {
      this.firstIndex.set(this.maxFirstIndex());
    } else {
      this.firstIndex.set(Math.max(0, this.firstIndex() - this.effectiveNumScroll()));
    }
    this.emitPageChangeIfNeeded(previousPage);
  }

  protected next(): void {
    const previousPage = this.currentPage();
    if (this.circular() && this.firstIndex() >= this.maxFirstIndex()) {
      this.firstIndex.set(0);
    } else {
      this.firstIndex.set(Math.min(this.maxFirstIndex(), this.firstIndex() + this.effectiveNumScroll()));
    }
    this.emitPageChangeIfNeeded(previousPage);
  }

  protected goToPage(page: number): void {
    const previousPage = this.currentPage();
    this.firstIndex.set(Math.min(this.maxFirstIndex(), page * this.effectiveNumScroll()));
    this.emitPageChangeIfNeeded(previousPage);
  }

  protected toggleAutoplay(): void {
    this.paused.update((value) => !value);
  }

  private advanceAutoplay(): void {
    const previousPage = this.currentPage();
    const max = this.maxFirstIndex();
    this.firstIndex.set(this.firstIndex() >= max ? 0 : Math.min(max, this.firstIndex() + this.effectiveNumScroll()));
    this.emitPageChangeIfNeeded(previousPage);
  }

  private emitPageChangeIfNeeded(previousPage: number): void {
    if (this.currentPage() !== previousPage) {
      this.pageChange.emit(this.currentPage());
    }
  }
}
