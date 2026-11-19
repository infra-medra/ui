import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, computed, contentChild, effect, input, numberAttribute, output, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.component';
import { mergeClasses } from '../utils/merge-classes';

/**
 * VirtualScroller primitive (Tier 4): a thin, themed wrapper around
 * Angular CDK's own `CdkVirtualScrollViewport`/`CdkFixedSizeVirtualScroll`
 * — not a from-scratch reimplementation. This library rewrites component
 * *logic* from scratch to avoid copying the original's source (see
 * roadmap/checklist-padrao-componente.md), but that policy has never meant
 * reinventing Angular's own first-party primitives it already depends on:
 * `SelectPanelComponent` already virtualizes its (potentially thousands-of-
 * rows) option list the exact same way, and `OverlayService` wraps CDK
 * Overlay rather than reimplementing overlay positioning/focus-trapping —
 * virtual scrolling is the same kind of well-solved, high-bug-risk problem
 * (buffer management, scroll-anchor preservation) not worth re-deriving.
 *
 * Item markup is a single required projected `<ng-template let-item
 * let-index="index">`, same one-template convention `DataViewComponent`
 * already established for per-item content.
 *
 * `itemSize` has to be a fixed pixel number, not a CSS value —
 * `CdkFixedSizeVirtualScroll` needs to compute total scroll height
 * (`itemSize * items.length`) without ever measuring a real rendered row,
 * since only a handful of rows actually exist in the DOM at once.
 *
 * **The consumer must give the viewport an explicit height** (e.g.
 * `class="h-96"`) — `cdk-virtual-scroll-viewport` uses `contain: strict`
 * internally, so it never derives a height from its own (virtualized)
 * content the way a normal element would; same "consumer sizes the
 * container" contract `ScrollPanel`/`Splitter` already place on themselves.
 *
 * **`lazyLoad`, reopening a documented gap**. Scoped deliberately to the *infinite-scroll* flavor of
 * lazy loading
 * `totalRecords` separate from `items().length` and renders skeleton
 * placeholders for indices not yet fetched at all — a materially bigger
 * feature: per-row loading state, a second "virtual total" distinct from
 * the real array length, and a placeholder row template). Here, `items()`
 * is still simply "everything currently loaded", same as before; `lazyLoad`
 * just emits `{ first, last }` — `first` is the next not-yet-loaded index,
 * `last` a same-sized-chunk hint (`first` + the viewport's own current
 * rendered-range span) — once the rendered range comes within
 * `lazyLoadThreshold` rows of the end of `items()`, so a consumer can
 * fetch and append the next page *before* the user actually scrolls into
 * a blank area. Only fires once per `items()` length (tracked via
 * `lastRequestedFirst`) — scrolling back and forth within an
 * already-requested-but-not-yet-arrived zone doesn't re-emit. `loading`
 * is purely presentational: renders a trailing `ProgressSpinnerComponent`
 * row after the last real item, the common "spinner at the bottom while
 * the next page loads" affordance — it doesn't gate `lazyLoad` itself
 * (that's the consumer's own job, e.g. not fetching again while a
 * previous fetch is still in flight).
 *
 * **`scrollToIndex()`/`scrollIndexChange`**: `scrollToIndex()` is a direct passthrough to
 * `CdkVirtualScrollViewport.scrollToIndex()`, no reimplementation needed. `scrollIndexChange`
 * reuses the same `renderedRangeStream` subscription `lazyLoad` already sets up, emitting `{ first,
 * last }` (matching this library's `lazyLoad` event's own field names) on every range change rather
 * than only once per `lazyLoadThreshold` crossing.
 */
@Component({
  selector: 'med-virtual-scroller',
  standalone: true,
  imports: [NgTemplateOutlet, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, ProgressSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <cdk-virtual-scroll-viewport
      [itemSize]="itemSize()"
      [orientation]="orientation() === 'horizontal' ? 'horizontal' : 'vertical'"
      [attr.data-orientation]="orientation()"
      [class]="viewportClass()"
    >
      <div *cdkVirtualFor="let item of items(); trackBy: trackBy(); let i = index" [style.height.px]="orientation() === 'horizontal' ? null : itemSize()" [style.width.px]="orientation() === 'horizontal' ? itemSize() : null">
        <ng-container [ngTemplateOutlet]="itemTemplate()" [ngTemplateOutletContext]="{ $implicit: item, index: i }" />
      </div>
      @if (loading()) {
        <div class="flex items-center justify-center" [style.height.px]="itemSize()">
          <med-progress-spinner size="sm" />
        </div>
      }
    </cdk-virtual-scroll-viewport>
  `,
})
export class VirtualScrollerComponent<T> {
  readonly items = input<readonly T[]>([]);
  /** Fixed row height, in pixels. Default `40`. */
  readonly itemSize = input(40, { transform: numberAttribute });
  readonly orientation = input<'vertical' | 'horizontal' | 'both'>('vertical');
  readonly trackBy = input<(index: number, item: T) => unknown>((index) => index);
  /** How many rows before the end of `items()` to fire `lazyLoad` — lets a consumer start fetching before the user actually scrolls into a blank area. */
  readonly lazyLoadThreshold = input(10, { transform: numberAttribute });
  /** Purely presentational — renders a trailing spinner row, see class doc. Doesn't gate `lazyLoad` itself. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  readonly lazyLoad = output<{ readonly first: number; readonly last: number }>();
  /** Emits `{ first, last }`, the newly-rendered range, every time it changes — not threshold-gated like `lazyLoad`. */
  readonly scrollIndexChange = output<{ readonly first: number; readonly last: number }>();

  protected readonly itemTemplate = contentChild.required(TemplateRef);
  private readonly viewport = viewChild(CdkVirtualScrollViewport);

  protected readonly viewportClass = computed(() => mergeClasses('h-full w-full', this.class()));

  private lastRequestedFirst = -1;

  constructor() {
    effect((onCleanup) => {
      const vp = this.viewport();
      if (!vp) {
        return;
      }
      const subscription = vp.renderedRangeStream.subscribe((range) => {
        this.scrollIndexChange.emit({ first: range.start, last: range.end });
        this.maybeEmitLazyLoad(range);
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /** Direct passthrough to `CdkVirtualScrollViewport.scrollToIndex()`. */
  scrollToIndex(index: number, behavior: ScrollBehavior = 'auto'): void {
    this.viewport()?.scrollToIndex(index, behavior);
  }

  private maybeEmitLazyLoad(range: { start: number; end: number }): void {
    const total = this.items().length;
    if (range.end < total - this.lazyLoadThreshold()) {
      return;
    }
    if (this.lastRequestedFirst === total) {
      return;
    }
    this.lastRequestedFirst = total;
    const chunkSize = Math.max(1, range.end - range.start);
    this.lazyLoad.emit({ first: total, last: total + chunkSize });
  }
}
