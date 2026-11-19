import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollTopComponent } from './scroll-top.component';

@Component({
  standalone: true,
  imports: [ScrollTopComponent],
  template: `
    <med-scroll-top [threshold]="100" target="window" [behavior]="'smooth'" />
  `,
})
class WindowScrollHostComponent {}

@Component({
  standalone: true,
  imports: [ScrollTopComponent],
  template: `
    <div data-testid="scroll-parent" style="height: 200px; overflow: auto;">
      <div style="height: 800px;">Content</div>
      <med-scroll-top [threshold]="150" target="parent" [behavior]="'auto'" />
    </div>
  `,
})
class ParentScrollHostComponent {}

describe('ScrollTopComponent (UI-012.S1)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows button above window threshold, hides below it, and scrolls window to top on click', () => {
    TestBed.configureTestingModule({
      imports: [WindowScrollHostComponent],
    });
    const fixture = TestBed.createComponent(WindowScrollHostComponent);
    fixture.detectChanges();

    const scrollToSpy = jest.fn();
    Object.defineProperty(window, 'scrollTo', {
      value: scrollToSpy,
      configurable: true,
      writable: true,
    });

    // Initially below threshold
    Object.defineProperty(window, 'scrollY', {
      value: 50,
      configurable: true,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();

    // Above threshold (100)
    Object.defineProperty(window, 'scrollY', {
      value: 200,
      configurable: true,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.getAttribute('aria-label')).toBeTruthy();

    button?.click();
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    // Back below threshold
    Object.defineProperty(window, 'scrollY', {
      value: 20,
      configurable: true,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('tracks parent element scrollTop and scrolls parent to top when target="parent"', () => {
    TestBed.configureTestingModule({
      imports: [ParentScrollHostComponent],
    });
    const fixture = TestBed.createComponent(ParentScrollHostComponent);
    fixture.detectChanges();

    const parent = fixture.nativeElement.querySelector('[data-testid="scroll-parent"]') as HTMLElement;
    const parentScrollTo = jest.fn();
    Object.defineProperty(parent, 'scrollTo', {
      value: parentScrollTo,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(parent, 'scrollTop', {
      value: 220,
      configurable: true,
      writable: true,
    });
    parent.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    button?.click();
    expect(parentScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('does not access window scroll or render button in SSR (M-04, M-06)', () => {
    TestBed.configureTestingModule({
      imports: [WindowScrollHostComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const fixture = TestBed.createComponent(WindowScrollHostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
