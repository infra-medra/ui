import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/**
 * Scrollable container primitive (Tier 3): a themed replacement for a plain
 * `overflow-auto` div, styled via CSS `scrollbar-*` properties (Firefox) plus
 * `::-webkit-scrollbar` pseudo-elements (Chrome/Safari/Edge) rather than a
 * synthetic scrollbar built from draggable divs — the real scrollbar still
 * drives real native scrolling (wheel, touch, keyboard, drag), so there's no
 * position/momentum sync to get wrong between a fake thumb and the actual
 * content offset. **Scope cut for v1**: no custom scrollbar thumb dragged via
 * pointer events layered over the native one
 * that duplicates behavior the browser already gives correctly for free, and
 * every extra layer is one more place to diverge from native touch/momentum
 * scrolling. Not a dead end: nothing here blocks adding it later.
 *
 * The viewport needs `tabindex="0"` to be reachable by keyboard at all — a
 * plain `overflow-auto` div with no focusable/interactive descendant is
 * otherwise unscrollable by keyboard, which fails WCAG 2.1.1. `ariaLabel` is
 * optional: only meaningful when the scrollable region itself needs an
 * accessible name (e.g. it isn't already introduced by a heading right
 * before it).
 *
 * **The host itself is the scrollable viewport** (`[class]` on `host`, no
 * separate wrapper `<div>`) rather than a bare host wrapping an inner
 * styled box: Angular applies a consumer's *static* `class="..."` attribute
 * to a component's host element natively, in addition to whatever the
 * component does with its own aliased `class` input — for a bare host
 * wrapping a *different* styled inner element, that meant the consumer's
 * classes (e.g. a `max-h-40`) landed on both, and the host's own box (used
 * for the component's footprint in the page's layout) ended up sized
 * independently of, and inconsistently with, the inner element it wrapped.
 * Folding the two into one element removes the second box entirely, so
 * there's nothing left for the leaked class to conflict with.
 *
 * **`scrollTop()` method**: sets the viewport's scroll offset, clamped to `[0, scrollHeight -
 * clientHeight]`. There is deliberately no `refresh()`: with a real native scrollbar there's no
 * thumb geometry that can go stale in the first place — the browser keeps it in sync with content
 * size and scroll position on every reflow, for free (this component already opted out of a
 * synthetic scrollbar, see "Scope cut for v1" above).
 */
@Component({
  selector: 'med-scroll-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'viewportClass()',
    tabindex: '0',
    role: 'region',
    '[attr.aria-label]': 'ariaLabel()',
  },
  template: `<ng-content />`,
})
export class ScrollPanelComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly ariaLabel = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  /** Scrolls the viewport to `value`, clamped to the valid scroll range. */
  scrollTop(value: number): void {
    const el = this.elementRef.nativeElement;
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTop = value > max ? max : value > 0 ? value : 0;
  }

  /** Re-validates the current scroll offset against the viewport bounds. */
  refresh(): void {
    const el = this.elementRef.nativeElement;
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    if (el.scrollTop > max) {
      el.scrollTop = max;
    }
  }

  protected readonly viewportClass = computed(() =>
    mergeClasses(
      'block max-h-full overflow-auto',
      '[scrollbar-width:thin] [scrollbar-color:var(--color-surface-300)_transparent] dark:[scrollbar-color:var(--color-surface-600)_transparent]',
      '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2',
      '[&::-webkit-scrollbar-track]:bg-transparent',
      '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-300 dark:[&::-webkit-scrollbar-thumb]:bg-surface-600',
      this.class(),
    ),
  );
}
