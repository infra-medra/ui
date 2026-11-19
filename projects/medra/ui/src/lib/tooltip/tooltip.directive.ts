import { Directive, ElementRef, OnDestroy, TemplateRef, booleanAttribute, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { TooltipPanelComponent } from './tooltip-panel.component';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipEvent = 'hover' | 'focus' | 'both';

/** Primary side first, opposite side as the one fallback if it doesn't fit. */
const POSITIONS: Record<TooltipPosition, ConnectedPosition[]> = {
  top: [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
  ],
  bottom: [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
  ],
  left: [
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
  ],
  right: [
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
  ],
};

let nextTooltipId = 0;

/**
 * Tooltip primitive (Tier 1) as an attribute directive (`[medTooltip]="text"`)
 * on any host element, rather than a wrapping component — same reasoning as
 * Button/InputText: it shouldn't change the host's tag or semantics.
 *
 * Shown on `mouseenter`/`focus`, hidden on `mouseleave`/`blur` (not
 * `pointerenter`/`pointerleave`): a real hover has no touch equivalent.
 * Focus/blur are handled too specifically so the same content shown on
 * hover is also reachable via keyboard (WCAG 1.4.13).
 *
 * **Touch is a separate path, not an extension of hover.** Mobile browsers
 * synthesize a `mouseenter`+`click` for a tap on any element with hover/click
 * handlers — so `mouseenter` fires anyway on tap, without a matching
 * `mouseleave` ever following it (there's nothing to "leave" on a
 * touchscreen), which used to leave the tooltip stuck open, and stacking
 * with the next tapped trigger's own tooltip if the user tapped elsewhere
 * before it closed (looking like the wrong tooltip's text, since both were
 * simultaneously in the DOM). `pointerdown`'s real `pointerType` (unlike the
 * synthetic mouse events that follow it) reliably tells touch and mouse
 * apart, so a touch-originated show swaps to a tap-driven lifecycle instead:
 * closes on tapping the trigger again, or anywhere else
 * (`closeOnOutsideClick`, same mechanism Select/Menu use to dismiss), never
 * relying on `mouseleave`.
 *
 * Content is plain text only (`input<string>`), rendered via interpolation
 * in `TooltipPanelComponent` — never `innerHTML` — so there's no HTML/XSS
 * surface to sanitize.
 *
 * **`hideOnEscape`, `showOnEllipsis`, `life`**, API
 *.
 *
 * **`hideOnEscape`** (default `true`) closes an open tooltip on Escape —
 * a real WCAG 1.4.13 (Content on Hover or Focus) gap before this: hover/
 * focus-triggered content must be dismissable without moving the pointer
 * or losing focus, and Escape is the conventional way, the same
 * criterion this directive's own hover-vs-touch split already invokes.
 * Bound on `document`, not the host element —
 * own `documentEscapeListener` — and only while a tooltip is actually
 * open (`effect()`'s cleanup callback attaches/detaches it as `isOpen()`
 * flips, same wiring `ContextMenuDirective.global` already established
 * this same wave for an identical "reactive document-level listener"
 * need).
 *
 * **`showOnEllipsis`** (default `false`) only shows the tooltip when the trigger's own content is
 * actually truncated (`offsetWidth < scrollWidth || offsetHeight < scrollHeight`) — the common
 * "only explain a label if it's visibly cut off" pattern, checked once per show-trigger rather than
 * continuously (a truncated label isn't expected to un-truncate itself mid-hover without a resize,
 * which would already re-trigger `mouseenter`/`focus` naturally by moving the element).
 *
 * **`life`** auto-hides an open tooltip after that many ms, independent
 * of `mouseleave`/`blur` — started once the tooltip actually becomes
 * visible (after `showDelay` already elapsed), unset (`null`) by default,
 * meaning no auto-hide, unchanged from before this input existed.
 */
@Directive({
  selector: '[medTooltip]',
  standalone: true,
  host: {
    '(pointerdown)': 'onPointerDown($event)',
    '(mouseenter)': 'onHoverShow()',
    '(mouseleave)': 'onHoverHide()',
    '(focus)': 'onFocusShow()',
    '(blur)': 'onFocusHide()',
    '(click)': 'onClick()',
    '[attr.aria-describedby]': 'isOpen() ? panelId : null',
  },
})
export class TooltipDirective implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlayService = inject(OverlayService);

  readonly medTooltip = input<string | TemplateRef<unknown>>('');
  readonly tooltipPosition = input<TooltipPosition>('top');
  readonly tooltipEvent = input<TooltipEvent>('both');
  readonly tooltipDisabled = input(false, { transform: booleanAttribute });
  readonly showDelay = input(0, { transform: numberAttribute });
  readonly hideDelay = input(150, { transform: numberAttribute });
  readonly hideOnEscape = input(true, { transform: booleanAttribute });
  readonly showOnEllipsis = input(false, { transform: booleanAttribute });
  /** Auto-hides after this many ms once shown, independent of `mouseleave`/`blur`. Default `null`: no auto-hide, unchanged from before this input existed. */
  readonly life = input<number | null>(null);

  protected readonly panelId = `med-tooltip-${nextTooltipId++}`;
  protected readonly isOpen = signal(false);

  private handle: OverlayHandle<TooltipPanelComponent, void> | null = null;
  private showTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private hideTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private lifeTimeoutId: ReturnType<typeof setTimeout> | undefined;
  /** Set from the real `pointerdown` that started the current gesture — see the class doc. */
  private lastPointerWasTouch = false;
  /** Whether the *currently open* tooltip was opened via `lastPointerWasTouch` — checked on later events (e.g. `mouseleave`) where `lastPointerWasTouch` may already reflect a different, more recent pointer. */
  private openedViaTouch = false;

  constructor() {
    // See class doc's "hideOnEscape" section.
    effect((onCleanup) => {
      if (!this.isOpen() || !this.hideOnEscape()) {
        return;
      }
      const handler = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.hide();
        }
      };
      document.addEventListener('keydown', handler);
      onCleanup(() => document.removeEventListener('keydown', handler));
    });
  }

  protected onPointerDown(event: PointerEvent): void {
    this.lastPointerWasTouch = event.pointerType === 'touch';
  }

  protected onHoverShow(): void {
    if (this.tooltipEvent() === 'focus') {
      return;
    }
    this.onShowTrigger();
  }

  protected onHoverHide(): void {
    if (this.tooltipEvent() === 'focus') {
      return;
    }
    this.onHideTrigger();
  }

  protected onFocusShow(): void {
    if (this.tooltipEvent() === 'hover') {
      return;
    }
    this.onShowTrigger();
  }

  protected onFocusHide(): void {
    if (this.tooltipEvent() === 'hover') {
      return;
    }
    this.onHideTrigger();
  }

  protected onShowTrigger(): void {
    this.clearTimers();
    if (this.tooltipDisabled() || !this.medTooltip()) {
      return;
    }
    if (this.showOnEllipsis() && !this.hasEllipsis()) {
      return;
    }
    const touch = this.lastPointerWasTouch;
    this.showTimeoutId = setTimeout(() => this.show(touch), this.showDelay());
  }

  /** See class doc's "showOnEllipsis" section. */
  private hasEllipsis(): boolean {
    const el = this.elementRef.nativeElement;
    return el.offsetWidth < el.scrollWidth || el.offsetHeight < el.scrollHeight;
  }

  protected onHideTrigger(): void {
    this.clearTimers();
    if (this.openedViaTouch) {
      // No real `mouseleave` on a touchscreen — closing here anyway (from
      // the synthetic one some browsers still fire) would race the tap-driven
      // lifecycle below. `closeOnOutsideClick`/tapping the trigger again is
      // what actually closes a touch-opened tooltip.
      return;
    }
    this.hideTimeoutId = setTimeout(() => this.hide(), this.hideDelay());
  }

  /**
   * Tapping the trigger again toggles a touch-opened tooltip closed —
   * mirrors tapping any other open-on-tap overlay in this library (Select,
   * Menu, ...) a second time. Irrelevant for a real mouse click, which hover
   * already shows/hides correctly around.
   *
   * `clearTimers()` matters here: mobile browsers fire `mouseenter` on
   * *every* tap, even a repeat tap on an already-"hovered" element — so
   * `onShowTrigger()` (called just before this, same gesture) always queues
   * another `show()` first, relying on `show()`'s own `if (this.handle)
   * return` guard to no-op it while still open. Without cancelling that
   * queued call here, it would fire moments after `hide()` closes the
   * overlay below — by then `this.handle` is already `null` again — and
   * silently reopen the tooltip this tap was meant to close.
   */
  protected onClick(): void {
    if (this.openedViaTouch && this.isOpen()) {
      this.clearTimers();
      this.hide();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
    clearTimeout(this.lifeTimeoutId);
    this.handle?.close();
  }

  private show(touch: boolean): void {
    if (this.handle) {
      return;
    }
    this.isOpen.set(true);
    this.openedViaTouch = touch;

    const life = this.life();
    if (life !== null) {
      this.lifeTimeoutId = setTimeout(() => this.hide(), life);
    }

    const handle = this.overlayService.openConnected<TooltipPanelComponent, void>(this.elementRef.nativeElement, TooltipPanelComponent, {
      positions: POSITIONS[this.tooltipPosition()],
      hasBackdrop: false,
      closeOnOutsideClick: touch,
      trapFocus: false,
      // A tooltip opens on mere hover/focus of its trigger — DOM focus
      // never actually moves into it (`trapFocus: false`, nothing inside is
      // focusable). Restoring focus on close (`OverlayService`'s default,
      // meant for Dialog/Select/Menu where focus really did move) would
      // instead forcibly refocus whatever was focused back when *this*
      // tooltip opened — potentially stealing focus away from wherever the
      // user has since moved to, which real-world testing showed cascading
      // into a chain of tooltips re-triggering each other's focus/blur
      // handlers and getting stuck open.
      restoreFocus: false,
      panelClass: [],
    });
    this.handle = handle;
    const content = this.medTooltip();
    if (content instanceof TemplateRef) {
      handle.componentRef.setInput('template', content);
      handle.componentRef.setInput('text', null);
    } else {
      handle.componentRef.setInput('text', content);
      handle.componentRef.setInput('template', null);
    }
    handle.componentRef.setInput('panelId', this.panelId);

    handle.closed$.subscribe(() => {
      this.isOpen.set(false);
      this.handle = null;
    });
  }

  private hide(): void {
    clearTimeout(this.lifeTimeoutId);
    this.handle?.close();
  }

  private clearTimers(): void {
    clearTimeout(this.showTimeoutId);
    clearTimeout(this.hideTimeoutId);
  }
}
