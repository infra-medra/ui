import { ComponentRef, Injectable, Injector, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import {
  ConnectedPosition,
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, Portal, TemplatePortal } from '@angular/cdk/portal';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { Observable, Subject, filter } from 'rxjs';

/** Only consumed by `openGlobal` — `openConnected` is always anchored to its origin instead. */
export type GlobalOverlayPosition = 'center' | 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';

/**
 * Full-bleed edge, stretched along the other axis (e.g. `left` spans the
 * entire viewport height) — a different shape than `GlobalOverlayPosition`,
 * whose `top`/`bottom` are corner-anchored with a margin (Toast, Dialog),
 * not edge-to-edge. Only consumed by Drawer today; kept as its own type
 * instead of folding into `GlobalOverlayPosition` so the two never collide
 * in meaning for the same-named side.
 */
export type OverlayEdge = 'left' | 'right' | 'top' | 'bottom';

/**
 * Anchor for a connected overlay: either a real trigger element (Select,
 * Menu, Popover, ...) or a bare viewport point (ContextMenu, anchored to
 * the cursor at right-click time, not to any element). CDK's own
 * `flexibleConnectedTo()` already accepts either shape natively.
 */
export type ConnectedOverlayOrigin = HTMLElement | { nativeElement: HTMLElement } | { x: number; y: number };

function isElementRefLike(origin: ConnectedOverlayOrigin): origin is { nativeElement: HTMLElement } {
  return 'nativeElement' in origin;
}

/** Resolves to a real `HTMLElement` for an element-like origin, or the origin unchanged if it's already a bare point. */
function resolveConnectedOrigin(origin: ConnectedOverlayOrigin): HTMLElement | { x: number; y: number } {
  if (origin instanceof HTMLElement) {
    return origin;
  }
  return isElementRefLike(origin) ? origin.nativeElement : origin;
}

export interface OverlayOpenOptions {
  /** Class(es) applied to the overlay panel. Default: MedraUi's surface + shadow tokens. */
  panelClass?: string | string[];
  /** Default: `true` for `openGlobal`, `false` for `openConnected`. */
  hasBackdrop?: boolean;
  backdropClass?: string | string[];
  /** Close on backdrop click (only relevant when `hasBackdrop` is `true`). Default: `true`. */
  closeOnBackdropClick?: boolean;
  /** Close on clicking/tapping outside the panel (only relevant when `hasBackdrop` is `false`). Default: `!hasBackdrop`. */
  closeOnOutsideClick?: boolean;
  /** Close on pressing Escape. Default: `true`. */
  closeOnEscape?: boolean;
  /** Trap keyboard focus inside the overlay. Default: same resolved value as `hasBackdrop`. */
  trapFocus?: boolean;
  /**
   * Refocus whatever was focused before the overlay opened, once it closes.
   * Default: `true` — correct for overlays that actually take focus (Dialog,
   * Select, Menu, ...), where DOM focus visibly left the trigger and should
   * visibly return to it. Set `false` for overlays that open/close as a
   * side effect of something else (Tooltip on hover) without ever really
   * taking focus themselves: forcing focus back in that case can steal it
   * away from wherever the user has *since* legitimately moved to.
   */
  restoreFocus?: boolean;
  /** `openGlobal`/`openGlobalTemplate` only. Default: `'center'`. Ignored when `edge` is set. */
  position?: GlobalOverlayPosition;
  /** `openGlobal`/`openGlobalTemplate` only. Stretches the panel along one full viewport edge (Drawer) instead of corner-anchoring it — takes precedence over `position` when set. */
  edge?: OverlayEdge;
  injector?: Injector;
  /**
   * Called when `close()` runs (Escape, backdrop/outside click, or an
   * explicit call), before the overlay actually disposes — return a
   * `Promise` to delay the dispose (and the focus-restore/`closed$` emission
   * that follow it) until it resolves, e.g. to let an exit transition play
   * out first. Every overlay today closes immediately (returns `void`);
   * Drawer is the first consumer of the delayed path.
   */
  beforeClose?: () => Promise<void> | void;
}

export interface ConnectedOverlayOpenOptions extends OverlayOpenOptions {
  positions?: ConnectedPosition[];
  /**
   * Element to exclude from outside-click detection, when it differs from the
   * connected origin itself — needed for a point origin (ContextMenu), which has no
   * element of its own to compare against `.contains()`. Without this, the very
   * right-click that opens the panel also fires `auxclick` on the decorated element
   * right after `contextmenu` (Chromium dispatches both for the secondary button, in
   * that order) — one gesture, two of CDK's own outside-interaction signals — and
   * `outsidePointerEvents()` reads that trailing `auxclick` as a click outside the
   * panel it just opened, closing it again within the same gesture.
   */
  exclusionElement?: HTMLElement;
}

export interface OverlayHandle<T, TResult = unknown> {
  readonly overlayRef: OverlayRef;
  readonly componentRef: ComponentRef<T>;
  /** Emits the result (if any) when the overlay closes, then completes. */
  readonly closed$: Observable<TResult | undefined>;
  close(result?: TResult): void;
}

/** Same as `OverlayHandle`, minus `componentRef` — a `TemplatePortal` has no component instance to expose. */
export interface OverlayTemplateHandle<TResult = unknown> {
  readonly overlayRef: OverlayRef;
  readonly closed$: Observable<TResult | undefined>;
  close(result?: TResult): void;
}

const DEFAULT_PANEL_CLASS = ['rounded-lg', 'bg-surface-0', 'dark:bg-surface-800', 'shadow-overlay-lg'];
const DEFAULT_BACKDROP_CLASS = ['bg-surface-950/50', 'backdrop-blur-sm'];

/** Default positions for connected overlays: below the trigger, with a fallback above it. */
const DEFAULT_CONNECTED_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
];

/**
 * Shared Overlay/Popover primitive (Trilha 2). Wraps the CDK Overlay with
 * MedraUi's visual/behavioral defaults (panel, backdrop, close on
 * Escape/backdrop/outside click, focus trap, focus restoration on close) so
 * overlay components (Dialog, Select, etc.) don't each reimplement this
 * mechanics on their own.
 */
@Injectable({ providedIn: 'root' })
export class OverlayService {
  private readonly overlay = inject(Overlay);
  private readonly focusTrapFactory = inject(FocusTrapFactory);

  /** Overlay centered on screen by default, with a backdrop (e.g. Dialog, ConfirmDialog). */
  openGlobal<T, TResult = unknown>(
    component: ComponentType<T>,
    options: OverlayOpenOptions = {},
  ): OverlayHandle<T, TResult> {
    const positionStrategy = this.buildPositionStrategy(options);
    const portal = new ComponentPortal(component, null, options.injector ?? null);
    const { overlayRef, attachResult, closed$, close } = this.openWithStrategy<TResult>(positionStrategy, portal, options, true);
    return { overlayRef, componentRef: attachResult as ComponentRef<T>, closed$, close };
  }

  /**
   * Same as `openGlobal`, but attaches a `TemplatePortal` (the caller's own
   * `TemplateRef`) instead of instantiating a `ComponentType` — for
   * components declared inline in a consumer's template (Drawer) rather
   * than opened imperatively with a dynamic component class (Dialog, Toast).
   */
  openGlobalTemplate<TResult = unknown>(
    templateRef: TemplateRef<unknown>,
    viewContainerRef: ViewContainerRef,
    options: OverlayOpenOptions = {},
  ): OverlayTemplateHandle<TResult> {
    const positionStrategy = this.buildPositionStrategy(options);
    const portal = new TemplatePortal(templateRef, viewContainerRef);
    const { overlayRef, closed$, close } = this.openWithStrategy<TResult>(positionStrategy, portal, options, true);
    return { overlayRef, closed$, close };
  }

  private buildPositionStrategy(options: OverlayOpenOptions): PositionStrategy {
    return options.edge ? this.buildEdgePositionStrategy(options.edge) : this.buildGlobalPositionStrategy(options.position ?? 'center');
  }

  /**
   * Moves an already-open global overlay to a new corner/edge, in place —
   * for a long-lived overlay whose position can change after it was
   * created (Toast's single persistent container), instead of tearing it
   * down and reopening it just to relocate it. `OverlayRef.updatePositionStrategy`
   * repositions on the next change detection cycle without detaching the
   * portal, so whatever is currently rendered inside stays mounted.
   */
  repositionGlobal(overlayRef: OverlayRef, position: GlobalOverlayPosition): void {
    overlayRef.updatePositionStrategy(this.buildGlobalPositionStrategy(position));
  }

  private buildGlobalPositionStrategy(position: GlobalOverlayPosition): PositionStrategy {
    const builder = this.overlay.position().global();
    const margin = '1rem';
    switch (position) {
      case 'center':
        return builder.centerHorizontally().centerVertically();
      case 'top':
        return builder.centerHorizontally().top(margin);
      case 'top-right':
        return builder.right(margin).top(margin);
      case 'top-left':
        return builder.left(margin).top(margin);
      case 'bottom':
        return builder.centerHorizontally().bottom(margin);
      case 'bottom-right':
        return builder.right(margin).bottom(margin);
      case 'bottom-left':
        return builder.left(margin).bottom(margin);
    }
  }

  /**
   * NOT `.left('0').top('0').bottom('0')` — `GlobalPositionStrategy.top()`
   * and `.bottom()` each reset the other's offset internally (only one
   * `alignItems` value applies per axis), so calling both just leaves
   * whichever ran last. The offset methods only ever anchor the panel to
   * one edge via flexbox alignment; they never stretch it. Actually
   * stretching an axis edge-to-edge means sizing the pane itself along that
   * axis via `.height()`/`.width()` (backed by `OverlayRef.updateSize()`),
   * independent from which edge `.left()`/`.right()`/`.top()`/`.bottom()`
   * anchors the other axis to.
   */
  private buildEdgePositionStrategy(edge: OverlayEdge): PositionStrategy {
    const builder = this.overlay.position().global();
    switch (edge) {
      case 'left':
        return builder.left('0').height('100%');
      case 'right':
        return builder.right('0').height('100%');
      case 'top':
        return builder.top('0').width('100%');
      case 'bottom':
        return builder.bottom('0').width('100%');
    }
  }

  /** Overlay anchored to a trigger element (or a bare viewport point — ContextMenu), with no backdrop by default (e.g. Select, dropdown, tooltip). */
  openConnected<T, TResult = unknown>(
    origin: ConnectedOverlayOrigin,
    component: ComponentType<T>,
    options: ConnectedOverlayOpenOptions = {},
  ): OverlayHandle<T, TResult> {
    const resolvedOrigin = resolveConnectedOrigin(origin);
    const positionStrategy = this.buildConnectedPositionStrategy(resolvedOrigin, options);
    const portal = new ComponentPortal(component, null, options.injector ?? null);
    // Outside-click exclusion (see openWithStrategy): defaults to the origin itself when
    // it's a real element, but a caller with a point origin (ContextMenu) can supply its
    // own decorated element via `exclusionElement` instead — see that option's doc.
    const exclusionOrigin = options.exclusionElement ?? (resolvedOrigin instanceof HTMLElement ? resolvedOrigin : undefined);
    const { overlayRef, attachResult, closed$, close } = this.openWithStrategy<TResult>(
      positionStrategy,
      portal,
      options,
      false,
      exclusionOrigin,
    );
    return { overlayRef, componentRef: attachResult as ComponentRef<T>, closed$, close };
  }

  /**
   * Opens a CDK overlay anchored to a trigger element with automatic outside-click and Escape dismissal.
   * Alias matching the documented API in overlay.json and overlay-intro.txt.
   */
  openAnchored<T, TResult = unknown>(
    component: ComponentType<T>,
    origin: ConnectedOverlayOrigin,
    options: ConnectedOverlayOpenOptions = {},
  ): OverlayHandle<T, TResult> {
    return this.openConnected(origin, component, options);
  }

  /**
   * Same as `openConnected`, but attaches a `TemplatePortal` instead of
   * instantiating a `ComponentType` — for components with arbitrary,
   * consumer-authored content anchored to a trigger element (Popover)
   * rather than a fixed internal panel component (Select, Menu).
   */
  openConnectedTemplate<TResult = unknown>(
    origin: ConnectedOverlayOrigin,
    templateRef: TemplateRef<unknown>,
    viewContainerRef: ViewContainerRef,
    options: ConnectedOverlayOpenOptions = {},
  ): OverlayTemplateHandle<TResult> {
    const resolvedOrigin = resolveConnectedOrigin(origin);
    const positionStrategy = this.buildConnectedPositionStrategy(resolvedOrigin, options);
    const portal = new TemplatePortal(templateRef, viewContainerRef);
    const exclusionOrigin = resolvedOrigin instanceof HTMLElement ? resolvedOrigin : undefined;
    const { overlayRef, closed$, close } = this.openWithStrategy<TResult>(positionStrategy, portal, options, false, exclusionOrigin);
    return { overlayRef, closed$, close };
  }

  private buildConnectedPositionStrategy(
    resolvedOrigin: HTMLElement | { x: number; y: number },
    options: ConnectedOverlayOpenOptions,
  ): PositionStrategy {
    return this.overlay
      .position()
      .flexibleConnectedTo(resolvedOrigin)
      .withPositions(options.positions ?? DEFAULT_CONNECTED_POSITIONS)
      .withFlexibleDimensions(false)
      .withPush(true)
      // Default viewport margin for `.withPush()` is 0 — a pushed panel can
      // end up perfectly flush against the screen edge (seen on DatePicker's
      // multi-month panel on a narrow phone). A small margin keeps every
      // connected overlay (Select, DatePicker, Menu, Tooltip, ...) a bit of
      // breathing room from the edge instead.
      .withViewportMargin(8);
  }

  private openWithStrategy<TResult>(
    positionStrategy: PositionStrategy,
    portal: Portal<unknown>,
    options: OverlayOpenOptions,
    isGlobal: boolean,
    origin?: HTMLElement,
  ): { overlayRef: OverlayRef; attachResult: unknown; closed$: Observable<TResult | undefined>; close: (result?: TResult) => void } {
    const hasBackdrop = options.hasBackdrop ?? isGlobal;
    // Keyed off `hasBackdrop` (is this actually modal), not `isGlobal` (is
    // it positioned relative to the viewport instead of a trigger element)
    // — those aren't the same thing. Toast is global (corner-positioned)
    // but explicitly non-modal; it used to get the same `block()` strategy
    // as Dialog, locking page scroll entirely. Since Toast's container is
    // created once and never disposed, that lock — meant to be released on
    // close — never released: the very first toast shown in a session
    // permanently broke scrolling on the page behind it. `noop()` is the
    // right default for a global, non-modal overlay: nothing to follow
    // (unlike a connected overlay's `reposition()`) and nothing to block.
    const scrollStrategy = !isGlobal
      ? this.overlay.scrollStrategies.reposition()
      : hasBackdrop
        ? this.overlay.scrollStrategies.block()
        : this.overlay.scrollStrategies.noop();
    const config = new OverlayConfig({
      positionStrategy,
      scrollStrategy,
      hasBackdrop,
      backdropClass: hasBackdrop ? (options.backdropClass ?? DEFAULT_BACKDROP_CLASS) : undefined,
      panelClass: options.panelClass ?? DEFAULT_PANEL_CLASS,
    });

    const overlayRef = this.overlay.create(config);
    const attachResult = overlayRef.attach(portal);

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const trapFocus = options.trapFocus ?? hasBackdrop;
    const focusTrap = trapFocus ? this.focusTrapFactory.create(overlayRef.overlayElement) : null;
    focusTrap?.focusInitialElementWhenReady();

    const closed$ = new Subject<TResult | undefined>();
    let closed = false;
    let closing = false;
    const close = (result?: TResult) => {
      if (closed || closing) {
        return;
      }
      closing = true;
      const dispose = () => {
        closed = true;
        focusTrap?.destroy();
        overlayRef.dispose();
        if (options.restoreFocus ?? true) {
          previouslyFocused?.focus();
        }
        closed$.next(result);
        closed$.complete();
      };
      const delay = options.beforeClose?.();
      if (delay instanceof Promise) {
        delay.then(dispose);
      } else {
        dispose();
      }
    };

    if (options.closeOnEscape ?? true) {
      overlayRef
        .keydownEvents()
        .pipe(filter((event) => event.key === 'Escape'))
        .subscribe(() => close());
    }
    if (hasBackdrop && (options.closeOnBackdropClick ?? true)) {
      overlayRef.backdropClick().subscribe(() => close());
    }
    if (!hasBackdrop && (options.closeOnOutsideClick ?? true)) {
      // Excluding `origin` (the trigger) matters: outsidePointerEvents()
      // fires on pointerdown, before the trigger's own click event — so
      // without this filter, clicking an open trigger a second time to
      // close it would auto-close here first, then the trigger's own click
      // handler (still to come, in the same gesture) sees a closed overlay
      // and reopens it. The trigger's own handler already decides what a
      // click on it means; this only ever suppresses "outside" clicks that
      // are actually on the origin itself.
      overlayRef
        .outsidePointerEvents()
        .pipe(filter((event) => !origin || !origin.contains(event.target as Node | null)))
        .subscribe(() => close());
    }

    return { overlayRef, attachResult, closed$: closed$.asObservable(), close };
  }
}
