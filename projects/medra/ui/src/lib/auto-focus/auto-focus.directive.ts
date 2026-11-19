import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Automatically moves focus to the host element (or its first focusable descendant) on mount in browser environments.
 */
@Directive({
  selector: '[medAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  /** Enables or disables automatic focus on view initialization. */
  readonly medAutoFocus = input(true, { transform: booleanAttribute });

  ngAfterViewInit(): void {
    if (!this.medAutoFocus() || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.elementRef.nativeElement;
    if (this.isDirectlyFocusable(host)) {
      host.focus();
      return;
    }

    const descendant = host.querySelector(FOCUSABLE_SELECTOR) as HTMLElement | null;
    descendant?.focus();
  }

  private isDirectlyFocusable(element: HTMLElement): boolean {
    if (element.hasAttribute('disabled')) {
      return false;
    }

    const tag = element.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON') {
      return true;
    }

    if (tag === 'A' && element.hasAttribute('href')) {
      return true;
    }

    const tabIndexAttr = element.getAttribute('tabindex');
    return tabIndexAttr !== null && tabIndexAttr !== '-1';
  }
}

export const AutoFocus = AutoFocusDirective;
