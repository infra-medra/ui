import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

/**
 * Floating button that appears after scrolling past a threshold and scrolls the target back to top.
 */
@Component({
  selector: 'med-scroll-top',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <button
        type="button"
        [attr.aria-label]="ariaLabel()"
        [class]="buttonClass()"
        (click)="scrollToTop()"
      >
        @if (icon()) {
          <i [class]="icon()" aria-hidden="true"></i>
        } @else {
          <svg
            aria-hidden="true"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        }
      </button>
    }
  `,
})
export class ScrollTopComponent implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** Scroll container target: `'window'` or `'parent'`. */
  readonly target = input<'window' | 'parent'>('window');
  /** Vertical scroll offset in pixels required before showing the button. */
  readonly threshold = input<number>(400);
  /** Optional icon CSS class rendered inside the button. */
  readonly icon = input<string | undefined>(undefined);
  /** Native scroll behavior passed to `scrollTo`. */
  readonly behavior = input<ScrollBehavior>('smooth');
  /** Additional CSS classes appended to the button element. */
  readonly styleClass = input<string>('');
  /** Accessible label for the scroll-to-top button. */
  readonly ariaLabel = input<string>('Scroll to top');

  /** Whether the button is currently visible. */
  readonly visible = signal(false);

  protected readonly buttonClass = computed(() => {
    const positioning = this.target() === 'parent' ? 'sticky bottom-4 float-right mr-4' : 'fixed bottom-6 right-6';
    const base =
      'z-40 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-contrast shadow-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
    const custom = this.styleClass().trim();
    return custom ? `${positioning} ${base} ${custom}` : `${positioning} ${base}`;
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const scrollTarget: Window | HTMLElement | null =
      this.target() === 'parent'
        ? this.elementRef.nativeElement.parentElement
        : typeof window !== 'undefined'
          ? window
          : null;

    if (!scrollTarget) {
      return;
    }

    const onScroll = (): void => {
      const offset =
        this.target() === 'parent'
          ? (scrollTarget as HTMLElement).scrollTop
          : window.scrollY || document.documentElement?.scrollTop || 0;
      this.visible.set(offset > this.threshold());
    };

    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    this.destroyRef.onDestroy(() => {
      scrollTarget.removeEventListener('scroll', onScroll);
    });
  }

  /** Scrolls the configured target back to the top (`top: 0`). */
  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const options: ScrollToOptions = { top: 0, behavior: this.behavior() };

    if (this.target() === 'parent') {
      this.elementRef.nativeElement.parentElement?.scrollTo?.(options);
      return;
    }

    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(options);
    }
  }
}

export const ScrollTop = ScrollTopComponent;
