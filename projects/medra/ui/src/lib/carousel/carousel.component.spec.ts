import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CarouselComponent } from './carousel.component';

const ITEMS = ['a', 'b', 'c', 'd', 'e'];

@Component({
  standalone: true,
  imports: [CarouselComponent],
  template: `
    <med-carousel [value]="items" [numVisible]="numVisible" [numScroll]="numScroll" [showIndicators]="showIndicators" [autoplayInterval]="autoplayInterval">
      <ng-template #item let-item>
        <span class="item">{{ item }}</span>
      </ng-template>
    </med-carousel>
  `,
})
class HostComponent {
  items = ITEMS;
  numVisible = 2;
  numScroll: number | null = null;
  showIndicators = true;
  autoplayInterval: number | null = null;
}

function itemTexts(fixture: { nativeElement: HTMLElement }): string[] {
  return Array.from(fixture.nativeElement.querySelectorAll('.item')).map((el) => el.textContent?.trim() ?? '');
}

function transformOf(fixture: { nativeElement: HTMLElement }): string {
  return (fixture.nativeElement.querySelector('.transition-transform') as HTMLElement).style.transform;
}

function prevButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement | null {
  return fixture.nativeElement.querySelector('[aria-label="Previous slide"]');
}

function nextButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement | null {
  return fixture.nativeElement.querySelector('[aria-label="Next slide"]');
}

function dots(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[aria-label^="Go to page"]'));
}

describe('CarouselComponent', () => {
  function create(configure?: (host: HostComponent) => void): ComponentFixture<HostComponent> {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('renders every item into the track (all items always in the DOM, sliding via transform)', () => {
    const fixture = create();
    expect(itemTexts(fixture)).toEqual(ITEMS);
  });

  it('starts at the first page: prev disabled, next enabled', () => {
    const fixture = create();
    expect(prevButton(fixture)).toBeNull();
    expect(nextButton(fixture)).not.toBeNull();
    expect(transformOf(fixture)).toBe('translateX(-0%)');
  });

  it('next() advances by numScroll (defaulting to numVisible) and updates the transform', () => {
    const fixture = create();
    nextButton(fixture)!.click();
    fixture.detectChanges();
    // numVisible=2, 5 items -> firstIndex 2 -> -100% (2/2 * 100)
    expect(transformOf(fixture)).toBe('translateX(-100%)');
  });

  it('clamps at the end so the last page always shows a full numVisible items (no trailing partial page)', () => {
    const fixture = create();
    const next = () => {
      nextButton(fixture)?.click();
      fixture.detectChanges();
    };
    next();
    next();
    next(); // would overshoot past index 3 (max = 5 - 2) without clamping
    expect(prevButton(fixture)).not.toBeNull();
    expect(nextButton(fixture)).toBeNull();
    // firstIndex clamped to 3 -> -150% (3/2 * 100)
    expect(transformOf(fixture)).toBe('translateX(-150%)');
  });

  it('prev() moves back by numScroll, clamped at 0', () => {
    const fixture = create();
    nextButton(fixture)!.click();
    fixture.detectChanges();
    prevButton(fixture)!.click();
    fixture.detectChanges();
    expect(transformOf(fixture)).toBe('translateX(-0%)');
    expect(prevButton(fixture)).toBeNull();
  });

  it('numScroll overrides the default (equal to numVisible) advance amount', () => {
    const fixture = create((host) => (host.numScroll = 1));
    nextButton(fixture)!.click();
    fixture.detectChanges();
    // numVisible=2 but numScroll=1 -> firstIndex 1 -> -50% (1/2 * 100)
    expect(transformOf(fixture)).toBe('translateX(-50%)');
  });

  it('renders one dot per page and highlights the current one via aria-current', () => {
    const fixture = create();
    // 5 items, numVisible=2, numScroll=2 -> maxFirstIndex=3 -> pageCount = ceil(3/2)+1 = 3
    expect(dots(fixture).length).toBe(3);
    expect(dots(fixture)[0].getAttribute('aria-current')).toBe('true');

    dots(fixture)[2].click();
    fixture.detectChanges();
    expect(dots(fixture)[2].getAttribute('aria-current')).toBe('true');
    expect(transformOf(fixture)).toBe('translateX(-150%)'); // page 2 -> firstIndex clamped to maxFirstIndex (3)
  });

  it('hides indicators when showIndicators is false', () => {
    const fixture = create((host) => (host.showIndicators = false));
    expect(dots(fixture).length).toBe(0);
  });

  it('hides indicators when there is only one page (everything fits in numVisible)', () => {
    const fixture = create((host) => (host.numVisible = 10));
    expect(dots(fixture).length).toBe(0);
    expect(prevButton(fixture)).toBeNull();
    expect(nextButton(fixture)).toBeNull();
  });

  it('no autoplay toggle button renders when autoplayInterval is null', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('[aria-label="Pause"], [aria-label="Play"]')).toBeNull();
  });

  it('autoplay advances on its own and wraps back to the first page at the end', () => {
    jest.useFakeTimers();
    try {
      const fixture = create((host) => (host.autoplayInterval = 1000));
      expect(transformOf(fixture)).toBe('translateX(-0%)');

      jest.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(transformOf(fixture)).toBe('translateX(-100%)');

      jest.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(transformOf(fixture)).toBe('translateX(-150%)'); // clamped to the last full page

      jest.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(transformOf(fixture)).toBe('translateX(-0%)'); // wraps back to the start
    } finally {
      jest.useRealTimers();
    }
  });

  it('clicking the pause/play toggle stops and resumes autoplay', () => {
    jest.useFakeTimers();
    try {
      const fixture = create((host) => (host.autoplayInterval = 1000));
      const toggle = () => fixture.nativeElement.querySelector('[aria-label="Pause"], [aria-label="Play"]') as HTMLButtonElement;

      expect(toggle().getAttribute('aria-label')).toBe('Pause');
      toggle().click();
      fixture.detectChanges();
      expect(toggle().getAttribute('aria-label')).toBe('Play');

      jest.advanceTimersByTime(5000);
      fixture.detectChanges();
      expect(transformOf(fixture)).toBe('translateX(-0%)'); // paused, no advance happened

      toggle().click();
      fixture.detectChanges();
      jest.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(transformOf(fixture)).toBe('translateX(-100%)'); // resumed
    } finally {
      jest.useRealTimers();
    }
  });

  it('announces the current page via a polite live region', () => {
    const fixture = create();
    const live = fixture.debugElement.query(By.css('[aria-live="polite"]')).nativeElement as HTMLElement;
    expect(live.textContent?.trim()).toBe('Page 1 of 3');

    nextButton(fixture)!.click();
    fixture.detectChanges();
    expect(live.textContent?.trim()).toBe('Page 2 of 3');
  });

  it('pageChange emits the new page index when navigation actually crosses a page boundary', () => {
    const fixture = create();
    const emitted: number[] = [];
    const carousel = fixture.debugElement.query(By.directive(CarouselComponent)).componentInstance as CarouselComponent<string>;
    carousel.pageChange.subscribe((page: number) => emitted.push(page));

    nextButton(fixture)!.click();
    fixture.detectChanges();
    expect(emitted).toEqual([1]);

    dots(fixture)[2].click();
    fixture.detectChanges();
    expect(emitted).toEqual([1, 2]);
  });

  it('pageChange does not emit for a clamped no-op navigation (already at an edge)', () => {
    const fixture = create();
    const carousel = fixture.debugElement.query(By.directive(CarouselComponent)).componentInstance as CarouselComponent<string>;
    const emitted: number[] = [];
    carousel.pageChange.subscribe((page: number) => emitted.push(page));

    prevButton(fixture); // null: already at the first page, nothing to click
    expect(prevButton(fixture)).toBeNull();
    expect(emitted).toEqual([]);
  });
});

describe('CarouselComponent (orientation, showNavigators, header/footer)', () => {
  @Component({
    standalone: true,
    imports: [CarouselComponent],
    template: `
      <med-carousel [value]="items" [numVisible]="2" orientation="vertical" verticalViewPortHeight="222px" [showNavigators]="showNavigators">
        <ng-template #header>
          <p class="header-marker">Header</p>
        </ng-template>
        <ng-template #item let-item>
          <span class="item">{{ item }}</span>
        </ng-template>
        <ng-template #footer>
          <p class="footer-marker">Footer</p>
        </ng-template>
      </med-carousel>
    `,
  })
  class VerticalHostComponent {
    items = ITEMS;
    showNavigators = true;
  }

  function create(configure?: (host: VerticalHostComponent) => void): ComponentFixture<VerticalHostComponent> {
    const fixture = TestBed.createComponent(VerticalHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the header and footer templates', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('.header-marker')?.textContent).toBe('Header');
    expect(fixture.nativeElement.querySelector('.footer-marker')?.textContent).toBe('Footer');
  });

  it('slides via translateY and applies verticalViewPortHeight to the clipping viewport', () => {
    const fixture = create();
    const viewport = fixture.nativeElement.querySelector('.overflow-hidden') as HTMLElement;
    expect(viewport.style.height).toBe('222px');

    nextButton(fixture)!.click();
    fixture.detectChanges();
    expect(transformOf(fixture)).toBe('translateY(-100%)');
  });

  it('showNavigators=false hides the prev/next buttons even when there are more pages', () => {
    const fixture = create((host) => (host.showNavigators = false));
    expect(prevButton(fixture)).toBeNull();
    expect(nextButton(fixture)).toBeNull();
    // Indicators are a separate toggle — still visible.
    expect(dots(fixture).length).toBeGreaterThan(0);
  });
});

describe('CarouselComponent (previousicon/nexticon)', () => {
  @Component({
    standalone: true,
    imports: [CarouselComponent],
    template: `
      <med-carousel [value]="items" [numVisible]="2">
        <ng-template #item let-item>
          <span class="item">{{ item }}</span>
        </ng-template>
        @if (customIcons) {
          <ng-template #previousicon>
            <span class="prev-icon-marker">Prev</span>
          </ng-template>
          <ng-template #nexticon>
            <span class="next-icon-marker">Next</span>
          </ng-template>
        }
      </med-carousel>
    `,
  })
  class IconHostComponent {
    items = ITEMS;
    customIcons = true;
  }

  function create(configure?: (host: IconHostComponent) => void): ComponentFixture<IconHostComponent> {
    const fixture = TestBed.createComponent(IconHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the default chevron icons when no template is projected', () => {
    const fixture = create((host) => (host.customIcons = false));
    expect(fixture.nativeElement.querySelector('med-icon')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.prev-icon-marker')).toBeNull();
  });

  it('renders the projected #previousicon/#nexticon templates instead of the default chevrons', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('.prev-icon-marker')).toBeNull(); // prev button hidden — already at the first page
    expect(fixture.nativeElement.querySelector('.next-icon-marker')?.textContent).toBe('Next');
    expect(fixture.nativeElement.querySelector('button[aria-label="Next slide"] med-icon')).toBeNull();
  });
});

describe('CarouselComponent (responsiveOptions)', () => {
  const RESPONSIVE_OPTIONS = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 3 },
    { breakpoint: '768px', numVisible: 2, numScroll: 2 },
    { breakpoint: '480px', numVisible: 1, numScroll: 1 },
  ];

  @Component({
    standalone: true,
    imports: [CarouselComponent],
    template: `
      <med-carousel [value]="items" [numVisible]="numVisible" [responsiveOptions]="responsiveOptions">
        <ng-template #item let-item>
          <span class="item">{{ item }}</span>
        </ng-template>
      </med-carousel>
    `,
  })
  class ResponsiveHostComponent {
    items = ITEMS;
    numVisible = 4;
    responsiveOptions: typeof RESPONSIVE_OPTIONS | null = RESPONSIVE_OPTIONS;
  }

  function setViewportWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  }

  function itemFlexBasisPercent(fixture: { nativeElement: HTMLElement }): number {
    const style = (fixture.nativeElement.querySelector('.shrink-0') as HTMLElement).style.flex;
    return Number(style.split(' ')[2].replace('%', ''));
  }

  const originalInnerWidth = window.innerWidth;
  afterEach(() => setViewportWidth(originalInnerWidth));

  it('applies the narrowest tier whose breakpoint fits the current viewport', () => {
    setViewportWidth(700); // fits 768px and 1024px tiers, not 480px — narrowest fitting is 768px
    const fixture = TestBed.createComponent(ResponsiveHostComponent);
    fixture.detectChanges();
    expect(itemFlexBasisPercent(fixture)).toBeCloseTo(50); // numVisible: 2 -> 100/2
  });

  it('falls back to the plain numVisible when the viewport is wider than every configured breakpoint', () => {
    setViewportWidth(1400);
    const fixture = TestBed.createComponent(ResponsiveHostComponent);
    fixture.detectChanges();
    expect(itemFlexBasisPercent(fixture)).toBeCloseTo(25); // plain numVisible: 4 -> 100/4
  });

  it('reacts live to a window resize', () => {
    setViewportWidth(1400);
    const fixture = TestBed.createComponent(ResponsiveHostComponent);
    fixture.detectChanges();
    expect(itemFlexBasisPercent(fixture)).toBeCloseTo(25);

    setViewportWidth(300); // fits every tier, narrowest is 480px -> numVisible: 1
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(itemFlexBasisPercent(fixture)).toBeCloseTo(100);
  });

  it('ignores responsiveOptions entirely when null', () => {
    setViewportWidth(300);
    const fixture = TestBed.createComponent(ResponsiveHostComponent);
    fixture.componentInstance.responsiveOptions = null;
    fixture.detectChanges();
    expect(itemFlexBasisPercent(fixture)).toBeCloseTo(25); // plain numVisible: 4
  });

  // @scenario UI-008.S2
  describe('circular (Wave 2)', () => {
    @Component({
      standalone: true,
      imports: [CarouselComponent],
      template: `
        <med-carousel [value]="items" [numVisible]="1" [numScroll]="1" [circular]="true" (pageChange)="pages.push($event)">
          <ng-template #item let-val>{{ val }}</ng-template>
        </med-carousel>
      `,
    })
    class CircularHostComponent {
      items = ['A', 'B', 'C'];
      pages: number[] = [];
    }

    it('wraps from first page to last on prev and from last page to first on next', () => {
      const fixture = TestBed.createComponent(CircularHostComponent);
      fixture.detectChanges();

      const prevBtn = fixture.nativeElement.querySelector('button[aria-label="Previous slide"]') as HTMLButtonElement;
      const nextBtn = fixture.nativeElement.querySelector('button[aria-label="Next slide"]') as HTMLButtonElement;
      expect(prevBtn).not.toBeNull();
      expect(nextBtn).not.toBeNull();

      prevBtn.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.pages).toEqual([2]);

      nextBtn.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.pages).toEqual([2, 0]);
    });
  });
});
