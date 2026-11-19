import { Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

const RIPPLE_DURATION_MS = 450;
const RIPPLE_CONTAINER_CLASSES = ['absolute', 'inset-0', 'overflow-hidden', 'rounded-[inherit]', 'pointer-events-none'];
const RIPPLE_CIRCLE_CLASSES = ['absolute', 'rounded-full', 'bg-current', 'opacity-25'];

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/**
 * "Ripple" visual feedback directive (wave effect from the click/tap point),
 * a shared primitive used by action components (Button, etc.). Creates its
 * own clipped absolute container instead of relying on the host's
 * `overflow`, so it doesn't interfere with box-shadow/focus rings the host
 * may already draw outside its own bounds.
 */
@Directive({
  selector: '[medRipple]',
  standalone: true,
  host: {
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class RippleDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private container: HTMLElement | null = null;

  readonly medRippleDisabled = input(false);

  protected onPointerDown(event: PointerEvent): void {
    const host = this.elementRef.nativeElement;
    if (this.medRippleDisabled() || (host as HTMLButtonElement).disabled || prefersReducedMotion()) {
      return;
    }

    const rect = host.getBoundingClientRect();
    const diameter = Math.hypot(rect.width, rect.height) * 2;
    const radius = diameter / 2;
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;

    const circle = document.createElement('span');
    circle.className = RIPPLE_CIRCLE_CLASSES.join(' ');
    circle.style.width = `${diameter}px`;
    circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    this.getContainer().appendChild(circle);

    const animation = circle.animate(
      [
        { transform: 'scale(0)', opacity: 0.35 },
        { transform: 'scale(1)', opacity: 0 },
      ],
      { duration: RIPPLE_DURATION_MS, easing: 'ease-out' },
    );
    animation.finished.then(() => circle.remove()).catch(() => circle.remove());
  }

  private getContainer(): HTMLElement {
    if (this.container) {
      return this.container;
    }

    const host = this.elementRef.nativeElement;
    const position = getComputedStyle(host).position;
    if (position === 'static' || position === '') {
      host.style.position = 'relative';
    }

    const container = document.createElement('span');
    container.className = RIPPLE_CONTAINER_CLASSES.join(' ');
    container.setAttribute('aria-hidden', 'true');
    host.insertBefore(container, host.firstChild);
    this.container = container;
    return container;
  }

  ngOnDestroy(): void {
    this.container?.remove();
    this.container = null;
  }
}
