import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

/**
 * Applies CSS animation classes via `Renderer2` when the host element enters or leaves the viewport.
 */
@Directive({
  selector: '[medAnimateOnScroll]',
  standalone: true,
})
export class AnimateOnScrollDirective implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** Space-separated CSS classes applied when the element enters the viewport. */
  readonly enterClass = input<string>('');
  /** Space-separated CSS classes applied when the element leaves the viewport. */
  readonly leaveClass = input<string>('');
  /** `IntersectionObserver` rootMargin option. */
  readonly rootMargin = input<string>('0px');
  /** `IntersectionObserver` threshold option. */
  readonly threshold = input<number | number[]>(0.5);
  /** When true, disconnects the observer after the first intersection. */
  readonly once = input(false, { transform: booleanAttribute });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.toggleClasses(this.enterClass(), '');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.toggleClasses(this.enterClass(), this.leaveClass());
            if (this.once()) {
              observer.disconnect();
            }
          } else {
            this.toggleClasses(this.leaveClass(), this.enterClass());
          }
        }
      },
      {
        rootMargin: this.rootMargin(),
        threshold: this.threshold(),
      },
    );

    observer.observe(this.elementRef.nativeElement);
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
    });
  }

  private toggleClasses(add: string, remove: string): void {
    const host = this.elementRef.nativeElement;

    for (const token of remove.split(/\s+/)) {
      if (token) {
        this.renderer.removeClass(host, token);
      }
    }

    for (const token of add.split(/\s+/)) {
      if (token) {
        this.renderer.addClass(host, token);
      }
    }
  }
}

export const AnimateOnScroll = AnimateOnScrollDirective;
