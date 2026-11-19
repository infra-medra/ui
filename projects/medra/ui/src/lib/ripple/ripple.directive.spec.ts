import { Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RippleDirective } from './ripple.directive';

@Component({
  standalone: true,
  imports: [RippleDirective],
  template: `<button #host type="button" medRipple [medRippleDisabled]="disabled" style="width: 100px; height: 40px;">
    action
  </button>`,
})
class HostComponent {
  readonly host = viewChild.required<ElementRef<HTMLButtonElement>>('host');
  disabled = false;
}

function firePointerDown(el: HTMLElement, coords: { clientX: number; clientY: number } = { clientX: 10, clientY: 10 }) {
  const event = Object.assign(new Event('pointerdown', { bubbles: true }), coords);
  el.dispatchEvent(event as PointerEvent);
}

describe('RippleDirective', () => {
  let animateSpy: jest.Mock;

  beforeEach(() => {
    // jsdom does not implement the Web Animations API (Element.prototype.animate does not exist).
    animateSpy = jest.fn().mockReturnValue({ finished: Promise.resolve() });
    HTMLElement.prototype.animate = animateSpy as unknown as HTMLElement['animate'];
  });

  afterEach(() => {
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
    jest.restoreAllMocks();
  });

  function createHost(disabled = false) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.disabled = disabled;
    fixture.detectChanges();
    return { fixture, button: fixture.componentInstance.host().nativeElement };
  }

  it('creates a ripple container and circle on pointerdown', () => {
    const { button } = createHost();

    firePointerDown(button);

    const container = button.querySelector(':scope > span');
    expect(container).not.toBeNull();
    expect(container?.querySelector('span')).not.toBeNull();
    expect(animateSpy).toHaveBeenCalledTimes(1);
  });

  it('sets position:relative on the host if it is static', () => {
    const { button } = createHost();
    expect(button.style.position).toBe('');

    firePointerDown(button);

    expect(button.style.position).toBe('relative');
  });

  it('does not trigger the ripple when medRippleDisabled is true', () => {
    const { button } = createHost(true);

    firePointerDown(button);

    expect(animateSpy).not.toHaveBeenCalled();
  });

  it('does not trigger the ripple when the native button is disabled', () => {
    const { button } = createHost();
    button.disabled = true;

    firePointerDown(button);

    expect(animateSpy).not.toHaveBeenCalled();
  });

  it('does not trigger the ripple when prefers-reduced-motion is active', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { button } = createHost();

    firePointerDown(button);

    expect(animateSpy).not.toHaveBeenCalled();
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('removes the ripple span once the animation finishes', async () => {
    const { button } = createHost();

    firePointerDown(button);
    await Promise.resolve();
    await Promise.resolve();

    expect(button.querySelector('span')?.querySelector('span')).toBeNull();
  });
});
