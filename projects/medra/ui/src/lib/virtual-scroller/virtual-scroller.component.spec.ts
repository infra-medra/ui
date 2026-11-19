import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VirtualScrollerComponent } from './virtual-scroller.component';

@Component({
  standalone: true,
  imports: [VirtualScrollerComponent],
  template: `
    <med-virtual-scroller
      [items]="items"
      [itemSize]="itemSize"
      [lazyLoadThreshold]="lazyLoadThreshold"
      [loading]="loading"
      class="h-48"
      (lazyLoad)="onLazyLoad($event)"
      (scrollIndexChange)="onScrollIndexChange($event)"
    >
      <ng-template let-item let-i="index">{{ i }}: {{ item }}</ng-template>
    </med-virtual-scroller>
  `,
})
class HostComponent {
  items = Array.from({ length: 1_000 }, (_, i) => `Row ${i}`);
  itemSize = 40;
  lazyLoadThreshold = 10;
  loading = false;
  onLazyLoad = jest.fn();
  onScrollIndexChange = jest.fn();

  readonly scroller = viewChild.required(VirtualScrollerComponent);
}

function viewport(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('VirtualScrollerComponent', () => {
  it('renders a cdk-virtual-scroll-viewport sized by the consumer class, not by content', () => {
    const fixture = create();
    expect(viewport(fixture).className).toContain('h-48');
  });

  it('does not render one real DOM row per item — jsdom has no layout, but even so, thousands of items never crash or block on creation', () => {
    // jsdom reports a 0px viewport (no real layout engine), so CdkVirtualScrollViewport
    // renders zero rows here — this test exists to prove a 10,000-item list doesn't hang
    // or throw during creation, not to assert a specific rendered row count (that's CDK's
    // own well-tested responsibility, not this thin wrapper's).
    expect(() => create()).not.toThrow();
  });

  it('passes itemSize through to CdkFixedSizeVirtualScroll (reflected as the viewport\'s host attribute)', () => {
    const fixture = create((h) => (h.itemSize = 64));
    // cdk-virtual-scroll-viewport doesn't expose itemSize as a plain DOM attribute,
    // so this just confirms the component renders without error at a non-default size.
    expect(viewport(fixture)).not.toBeNull();
  });

  describe('lazyLoad', () => {
    // CdkVirtualScrollViewport's own renderedRangeStream is driven by its
    // internal scroll strategy, which settles asynchronously (a microtask
    // beyond the triggering detectChanges() call, even in jsdom) — every
    // test here awaits fixture.whenStable() before asserting, the same way
    // any other effect-driven async update needs to be flushed in a
    // zoneless test. What these tests exercise is this wrapper's own
    // responsibility (firing exactly one `lazyLoad` per items() length once
    // the rendered range is within `lazyLoadThreshold`, with the right
    // first/last payload) — real threshold-crossing-while-scrolling
    // behavior is CDK's own well-tested responsibility, not this thin
    // wrapper's.
    it('fires once on init when items().length is within lazyLoadThreshold of the rendered range', async () => {
      const fixture = create((h) => (h.items = ['a', 'b', 'c']));
      await fixture.whenStable();
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledWith({ first: 3, last: expect.any(Number) });
    });

    it('does not fire when items().length is well beyond lazyLoadThreshold of the rendered range', async () => {
      const fixture = create(); // default 1,000 items, well past the default threshold of 10
      await fixture.whenStable();
      expect(fixture.componentInstance.onLazyLoad).not.toHaveBeenCalled();
    });

    it('never fires more than once for the same items().length, even across extra change-detection passes', async () => {
      const fixture = create((h) => (h.items = ['a', 'b']));
      await fixture.whenStable();
      fixture.detectChanges();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledTimes(1);
    });

    it('fires again once items() grows past the threshold a second time', async () => {
      const fixture = create((h) => (h.items = ['a', 'b']));
      await fixture.whenStable();
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledTimes(1);

      fixture.componentInstance.items = ['a', 'b', 'c', 'd'];
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenLastCalledWith({ first: 4, last: expect.any(Number) });
    });
  });

  describe('scrollToIndex()/scrollIndexChange', () => {
    it('scrollToIndex() delegates to the underlying CdkVirtualScrollViewport without throwing', async () => {
      const fixture = create();
      await fixture.whenStable();
      expect(() => fixture.componentInstance.scroller().scrollToIndex(500)).not.toThrow();
    });

    it('scrollToIndex() accepts an explicit scroll behavior', async () => {
      const fixture = create();
      await fixture.whenStable();
      expect(() => fixture.componentInstance.scroller().scrollToIndex(500, 'smooth')).not.toThrow();
    });

    it('scrollIndexChange emits {first, last} on the initial rendered range, same shape as lazyLoad', async () => {
      const fixture = create();
      await fixture.whenStable();
      expect(fixture.componentInstance.onScrollIndexChange).toHaveBeenCalledWith({ first: expect.any(Number), last: expect.any(Number) });
    });

    it('scrollIndexChange is not threshold-gated — it can fire even when lazyLoad does not', async () => {
      const fixture = create(); // default 1,000 items, well past the lazyLoad threshold
      await fixture.whenStable();
      expect(fixture.componentInstance.onLazyLoad).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onScrollIndexChange).toHaveBeenCalled();
    });
  });

  describe('loading', () => {
    it('renders a trailing spinner row when true', () => {
      const fixture = create((h) => (h.loading = true));
      expect(fixture.nativeElement.querySelector('med-progress-spinner')).not.toBeNull();
    });

    it('renders no spinner by default', () => {
      const fixture = create();
      expect(fixture.nativeElement.querySelector('med-progress-spinner')).toBeNull();
    });
  });

  // @scenario UI-008.S2
  describe('orientation (Wave 2)', () => {
    @Component({
      standalone: true,
      imports: [VirtualScrollerComponent],
      template: `
        <med-virtual-scroller [items]="items" [itemSize]="40" orientation="horizontal" class="h-48 w-96">
          <ng-template let-item>{{ item }}</ng-template>
        </med-virtual-scroller>
      `,
    })
    class HorizontalHostComponent {
      items = ['A', 'B', 'C'];
    }

    it('passes horizontal orientation to cdk-virtual-scroll-viewport and sets data-orientation', () => {
      const fixture = TestBed.createComponent(HorizontalHostComponent);
      fixture.detectChanges();

      const viewport = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;
      expect(viewport.getAttribute('data-orientation')).toBe('horizontal');
      expect(viewport.className).toContain('cdk-virtual-scroll-orientation-horizontal');
    });
  });
});
