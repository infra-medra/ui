import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnimateOnScrollDirective } from './animate-on-scroll.directive';

@Component({
  standalone: true,
  imports: [AnimateOnScrollDirective],
  template: `
    <div
      medAnimateOnScroll
      [enterClass]="enterClass()"
      [leaveClass]="leaveClass()"
      [once]="once()"
      data-testid="aos-target"
    >
      Animated content
    </div>
  `,
})
class AnimateOnScrollHostComponent {
  readonly enterClass = signal('animate-fadein');
  readonly leaveClass = signal('animate-fadeout');
  readonly once = signal(false);
}

describe('AnimateOnScrollDirective (UI-012.S5)', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  afterEach(() => {
    if (originalIntersectionObserver) {
      globalThis.IntersectionObserver = originalIntersectionObserver;
    } else {
      delete (globalThis as Record<string, unknown>)['IntersectionObserver'];
    }
    jest.restoreAllMocks();
  });

  it('applies enterClass on intersect and leaveClass on exit, disconnecting when once=true (M-06)', () => {
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
      thresholds = [0.5];
    }

    (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;

    TestBed.configureTestingModule({
      imports: [AnimateOnScrollHostComponent],
    });
    const fixture = TestBed.createComponent(AnimateOnScrollHostComponent);
    fixture.detectChanges();

    const target = fixture.nativeElement.querySelector('[data-testid="aos-target"]') as HTMLElement;
    expect(observeMock).toHaveBeenCalledWith(target);
    expect(observerCallback).not.toBeNull();

    // Enter viewport
    observerCallback!(
      [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(target.classList.contains('animate-fadein')).toBe(true);
    expect(target.classList.contains('animate-fadeout')).toBe(false);

    // Leave viewport
    observerCallback!(
      [{ isIntersecting: false, target } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(target.classList.contains('animate-fadein')).toBe(false);
    expect(target.classList.contains('animate-fadeout')).toBe(true);

    // When once=true, disconnect after entering
    fixture.componentInstance.once.set(true);
    fixture.detectChanges();
    observerCallback!(
      [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('falls back safely when IntersectionObserver is unavailable in browser (M-04)', () => {
    delete (globalThis as Record<string, unknown>)['IntersectionObserver'];

    TestBed.configureTestingModule({
      imports: [AnimateOnScrollHostComponent],
    });
    const fixture = TestBed.createComponent(AnimateOnScrollHostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();

    const target = fixture.nativeElement.querySelector('[data-testid="aos-target"]') as HTMLElement;
    expect(target.classList.contains('animate-fadein')).toBe(true);
  });

  it('is a safe no-op in SSR (M-04)', () => {
    TestBed.configureTestingModule({
      imports: [AnimateOnScrollHostComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const fixture = TestBed.createComponent(AnimateOnScrollHostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();

    const target = fixture.nativeElement.querySelector('[data-testid="aos-target"]') as HTMLElement;
    expect(target.classList.contains('animate-fadein')).toBe(false);
  });
});
