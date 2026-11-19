import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GalleriaComponent } from './galleria.component';
import { GalleriaItem } from './galleria.types';

const ITEMS: GalleriaItem[] = [
  { src: '/a-full.jpg', thumbnailSrc: '/a-thumb.jpg', alt: 'A' },
  { src: '/b-full.jpg', thumbnailSrc: '/b-thumb.jpg', alt: 'B' },
  { src: '/c-full.jpg', alt: 'C' },
];

@Component({
  standalone: true,
  imports: [GalleriaComponent],
  // A static `class="..."` attribute, not `[class]="expr"` — see
  // GalleriaComponent's own doc for why that distinction is exactly what the
  // thumbnail-overlap regression below is guarding against.
  template: `<med-galleria [items]="items" [(activeIndex)]="activeIndex" [showThumbnails]="showThumbnails" [circular]="circular" class="h-64" />`,
})
class HostComponent {
  items: GalleriaItem[] = ITEMS;
  activeIndex = 0;
  showThumbnails = true;
  circular = false;
}

function mainImage(fixture: { nativeElement: HTMLElement }): HTMLImageElement {
  return fixture.nativeElement.querySelector('med-image img') as HTMLImageElement;
}

function thumbnails(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
}

function navButton(fixture: { nativeElement: HTMLElement }, label: string): HTMLButtonElement {
  return fixture.nativeElement.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('GalleriaComponent', () => {
  it('shows the active item as the main image', () => {
    const fixture = create();
    expect(mainImage(fixture).src).toContain('/a-full.jpg');
  });

  it('renders one thumbnail per item, using thumbnailSrc when provided and falling back to src otherwise', () => {
    const fixture = create();
    const imgs = thumbnails(fixture).map((b) => b.querySelector('img') as HTMLImageElement);
    expect(imgs[0].src).toContain('/a-thumb.jpg');
    expect(imgs[1].src).toContain('/b-thumb.jpg');
    expect(imgs[2].src).toContain('/c-full.jpg'); // no thumbnailSrc on item C
  });

  it('marks the active thumbnail with aria-selected', () => {
    const fixture = create((h) => (h.activeIndex = 1));
    const tabs = thumbnails(fixture);
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
  });

  it('clicking a thumbnail sets activeIndex', () => {
    const fixture = create();
    thumbnails(fixture)[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(2);
    expect(mainImage(fixture).src).toContain('/c-full.jpg');
  });

  it('circular=false (default): Next/Previous hide at the ends instead of wrapping', () => {
    const fixture = create((h) => (h.activeIndex = 2));
    expect(navButton(fixture, 'Next image')).toBeNull();
    expect(navButton(fixture, 'Previous image')).not.toBeNull();

    const fixtureAtStart = create((h) => (h.activeIndex = 0));
    expect(navButton(fixtureAtStart, 'Previous image')).toBeNull();
    expect(navButton(fixtureAtStart, 'Next image')).not.toBeNull();
  });

  it('circular=true: Next/Previous wrap around at the ends', () => {
    const fixture = create((h) => {
      h.activeIndex = 2;
      h.circular = true;
    });
    navButton(fixture, 'Next image').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(0);

    navButton(fixture, 'Previous image').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(2);
  });

  it('roving tabindex: only the active thumbnail is in the tab order', () => {
    const fixture = create((h) => (h.activeIndex = 1));
    const tabs = thumbnails(fixture);
    expect(tabs.map((t) => t.tabIndex)).toEqual([-1, 0, -1]);
  });

  it('ArrowRight/ArrowLeft move focus and switch the active image, wrapping at the ends', () => {
    const fixture = create((h) => (h.activeIndex = 2));
    const focusSpy = jest.spyOn(thumbnails(fixture)[0], 'focus');

    keydown(thumbnails(fixture)[2], 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(0);
    expect(focusSpy).toHaveBeenCalled();

    keydown(thumbnails(fixture)[0], 'ArrowLeft');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(2);
  });

  it('Home/End jump to the first/last thumbnail', () => {
    const fixture = create((h) => (h.activeIndex = 1));

    keydown(thumbnails(fixture)[1], 'End');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(2);

    keydown(thumbnails(fixture)[2], 'Home');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(0);
  });

  it('shows a placeholder icon instead of a broken thumbnail image after it fails to load', () => {
    const fixture = create();
    const firstThumbImg = thumbnails(fixture)[0].querySelector('img') as HTMLImageElement;

    firstThumbImg.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(thumbnails(fixture)[0].querySelector('img')).toBeNull();
    expect(thumbnails(fixture)[0].querySelector('med-icon')).not.toBeNull();
    // Unaffected sibling still renders its <img> normally.
    expect(thumbnails(fixture)[1].querySelector('img')).not.toBeNull();
  });

  it('hides thumbnails when showThumbnails is false', () => {
    const fixture = create((h) => (h.showThumbnails = false));
    expect(thumbnails(fixture)).toHaveLength(0);
  });

  it('hides prev/next nav when there is only one item', () => {
    const fixture = create((h) => (h.items = [ITEMS[0]]));
    expect(fixture.nativeElement.querySelector('button[aria-label="Next image"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('button[aria-label="Previous image"]')).toBeNull();
  });

  // Regression: a consumer `class="h-64"` used to size only the main-image div
  // while the host (what the page's own layout reserves space for) stayed
  // independently capped at the same height by the same leaked static class —
  // leaving no room for the thumbnail row, which then visibly overflowed past
  // the component's own footprint into whatever followed it on the page.
  it('the host itself carries the sizing class, with the main image and thumbnails both fitting inside it', () => {
    const fixture = create();
    const host = fixture.nativeElement.querySelector('med-galleria') as HTMLElement;
    expect(host.className).toContain('h-64');
    expect(host.className).toContain('flex-col');

    const mainBox = host.querySelector(':scope > div') as HTMLElement;
    expect(mainBox.className).toContain('flex-1');
    expect(mainBox.className).not.toContain('h-64'); // the fixed height belongs to the host, not the image box
  });
});

describe('GalleriaComponent (autoplay, numVisible, indicators, thumbnailsPosition)', () => {
  @Component({
    standalone: true,
    imports: [GalleriaComponent],
    template: `
      <med-galleria
        [items]="items"
        [(activeIndex)]="activeIndex"
        [autoPlay]="autoPlay"
        [transitionInterval]="transitionInterval"
        [numVisible]="numVisible"
        [showIndicators]="showIndicators"
        [thumbnailsPosition]="thumbnailsPosition"
        class="h-64"
      />
    `,
  })
  class ExtHostComponent {
    items: GalleriaItem[] = ITEMS;
    activeIndex = 0;
    autoPlay = false;
    transitionInterval = 1000;
    numVisible = 3;
    showIndicators = false;
    thumbnailsPosition: 'bottom' | 'top' | 'left' | 'right' = 'bottom';
  }

  function createExt(configure?: (h: ExtHostComponent) => void) {
    const fixture = TestBed.createComponent(ExtHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  describe('autoPlay', () => {
    it('no pause/play button renders when autoPlay is false', () => {
      const fixture = createExt();
      expect(fixture.nativeElement.querySelector('[aria-label="Pause"], [aria-label="Play"]')).toBeNull();
    });

    it('advances on its own and loops back to the first image at the end, regardless of circular', () => {
      jest.useFakeTimers();
      try {
        const fixture = createExt((h) => (h.autoPlay = true));
        expect(fixture.componentInstance.activeIndex).toBe(0);

        jest.advanceTimersByTime(1000);
        fixture.detectChanges();
        expect(fixture.componentInstance.activeIndex).toBe(1);

        jest.advanceTimersByTime(1000);
        fixture.detectChanges();
        expect(fixture.componentInstance.activeIndex).toBe(2);

        jest.advanceTimersByTime(1000);
        fixture.detectChanges();
        expect(fixture.componentInstance.activeIndex).toBe(0); // loops, not stuck at the last image
      } finally {
        jest.useRealTimers();
      }
    });

    it('the pause/play toggle stops and resumes autoplay', () => {
      jest.useFakeTimers();
      try {
        const fixture = createExt((h) => (h.autoPlay = true));
        const toggle = () => fixture.nativeElement.querySelector('[aria-label="Pause"], [aria-label="Play"]') as HTMLButtonElement;

        expect(toggle().getAttribute('aria-label')).toBe('Pause');
        toggle().click();
        fixture.detectChanges();
        expect(toggle().getAttribute('aria-label')).toBe('Play');

        jest.advanceTimersByTime(5000);
        fixture.detectChanges();
        expect(fixture.componentInstance.activeIndex).toBe(0); // paused, no advance happened
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('showIndicators', () => {
    it('renders no indicator dots by default', () => {
      const fixture = createExt();
      expect(fixture.nativeElement.querySelectorAll('[aria-label^="Go to image"]')).toHaveLength(0);
    });

    it('renders one dot per item, highlighting the active one, and clicking one navigates', () => {
      const fixture = createExt((h) => (h.showIndicators = true));
      const dots = Array.from(fixture.nativeElement.querySelectorAll('[aria-label^="Go to image"]')) as HTMLButtonElement[];
      expect(dots).toHaveLength(3);
      expect(dots[0].getAttribute('aria-current')).toBe('true');

      dots[2].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.activeIndex).toBe(2);
    });
  });

  describe('numVisible', () => {
    function thumbnailStrip(fixture: { nativeElement: HTMLElement }): HTMLElement {
      return fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    }

    it('sizes the horizontal thumbnail strip width from numVisible (56px thumb + 8px gap per item)', () => {
      const fixture = createExt((h) => (h.numVisible = 2));
      // 2 * 56 + 1 * 8 = 120px
      expect(thumbnailStrip(fixture).style.width).toBe('120px');
    });
  });

  describe('thumbnailsPosition', () => {
    function thumbnailStrip(fixture: { nativeElement: HTMLElement }): HTMLElement {
      return fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    }

    it('"bottom" (default): host is flex-col, thumbnail strip is horizontal, not reordered first', () => {
      const fixture = createExt();
      const host = fixture.nativeElement.querySelector('med-galleria') as HTMLElement;
      expect(host.className).toContain('flex-col');
      expect(thumbnailStrip(fixture).className).toContain('flex-row');
      expect(thumbnailStrip(fixture).className).not.toContain('order-first');
    });

    it('"top": thumbnail strip is reordered before the main image', () => {
      const fixture = createExt((h) => (h.thumbnailsPosition = 'top'));
      expect(thumbnailStrip(fixture).className).toContain('order-first');
    });

    it('"left"/"right": host becomes flex-row and the strip becomes a vertical column sized by verticalThumbnailViewportHeight', () => {
      const fixture = createExt((h) => (h.thumbnailsPosition = 'left'));
      const host = fixture.nativeElement.querySelector('med-galleria') as HTMLElement;
      expect(host.className).toContain('flex-row');
      expect(thumbnailStrip(fixture).className).toContain('flex-col');
      expect(thumbnailStrip(fixture).style.height).toBe('300px');
    });
  });

  // @scenario UI-008.S2
  describe('fullScreen and showItemNavigators (Wave 2)', () => {
    it('hides item navigator buttons when showItemNavigators is false', () => {
      const fixture = TestBed.createComponent(GalleriaComponent);
      fixture.componentRef.setInput('value', [
        { src: 'a.jpg', alt: 'A' },
        { src: 'b.jpg', alt: 'B' },
        { src: 'c.jpg', alt: 'C' },
      ]);
      fixture.componentRef.setInput('activeIndex', 1);
      fixture.componentRef.setInput('showItemNavigators', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button[aria-label="Previous"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('button[aria-label="Next"]')).toBeNull();
    });

    it('renders fullscreen overlay only when fullScreen and visible are true', () => {
      const fixture = TestBed.createComponent(GalleriaComponent);
      fixture.componentRef.setInput('value', [{ src: 'a.jpg', alt: 'A' }]);
      fixture.componentRef.setInput('fullScreen', true);
      fixture.componentRef.setInput('visible', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-galleria-fullscreen="true"]')).toBeNull();

      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      const overlay = fixture.nativeElement.querySelector('[data-galleria-fullscreen="true"]') as HTMLElement;
      expect(overlay).not.toBeNull();
      expect(overlay.className).toContain('fixed');
    });
  });
});
