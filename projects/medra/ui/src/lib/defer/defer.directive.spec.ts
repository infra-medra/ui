import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DeferDirective } from './defer.directive';

@Component({
  standalone: true,
  imports: [DeferDirective],
  template: `
    <div data-testid="defer-wrapper">
      <ng-template medDefer (onLoad)="loadCount = loadCount + 1">
        <span data-testid="deferred-content">Loaded lazily</span>
      </ng-template>
    </div>
  `,
})
class DeferHostComponent {
  loadCount = 0;
}

describe('DeferDirective (UI-012.S6)', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  afterEach(() => {
    if (originalIntersectionObserver) {
      globalThis.IntersectionObserver = originalIntersectionObserver;
    } else {
      delete (globalThis as Record<string, unknown>)['IntersectionObserver'];
    }
    jest.restoreAllMocks();
  });

  it('defers rendering until intersection and emits onLoad once (M-04)', () => {
    let observerCallback: IntersectionObserverCallback | null = null;
    const observeMock = jest.fn();
    const disconnectMock = jest.fn();

    class MockIntersectionObserver {
      constructor(cb: IntersectionObserverCallback) {
        observerCallback = cb;
      }
      observe = observeMock;
      unobserve = jest.fn();
      disconnect = disconnectMock;
      takeRecords = jest.fn(() => []);
      root = null;
      rootMargin = '0px';
      thresholds = [0];
    }

    (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;

    TestBed.configureTestingModule({
      imports: [DeferHostComponent],
    });
    const fixture = TestBed.createComponent(DeferHostComponent);
    fixture.detectChanges();

    // Not rendered before intersection
    expect(fixture.nativeElement.querySelector('[data-testid="deferred-content"]')).toBeNull();
    expect(fixture.componentInstance.loadCount).toBe(0);
    expect(observeMock).toHaveBeenCalledTimes(1);

    // Trigger intersection twice; should render and emit only once
    observerCallback!(
      [{ isIntersecting: true } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    observerCallback!(
      [{ isIntersecting: true } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('[data-testid="deferred-content"]') as HTMLElement | null;
    expect(content?.textContent).toContain('Loaded lazily');
    expect(fixture.componentInstance.loadCount).toBe(1);
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('renders immediately as a safe fallback in browser when IntersectionObserver is unavailable (M-04)', () => {
    delete (globalThis as Record<string, unknown>)['IntersectionObserver'];

    TestBed.configureTestingModule({
      imports: [DeferHostComponent],
    });
    const fixture = TestBed.createComponent(DeferHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="deferred-content"]')).not.toBeNull();
    expect(fixture.componentInstance.loadCount).toBe(1);
  });

  it('does not render deferred template prematurely in SSR (M-04)', () => {
    TestBed.configureTestingModule({
      imports: [DeferHostComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const fixture = TestBed.createComponent(DeferHostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();

    expect(fixture.nativeElement.querySelector('[data-testid="deferred-content"]')).toBeNull();
    expect(fixture.componentInstance.loadCount).toBe(0);
  });
});
