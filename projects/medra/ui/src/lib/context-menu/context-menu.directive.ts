import { Directive, ElementRef, OnDestroy, booleanAttribute, effect, inject, input, numberAttribute, output } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { MENU_PANEL_CLASS } from '../menu/menu-panel.component';
import { MenuItem } from '../menu/menu.types';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { TieredMenuPanelComponent } from '../tiered-menu/tiered-menu-panel.component';
import { TieredMenuItem } from '../tiered-menu/tiered-menu.types';

let nextContextMenuId = 0;

/**
 * A context menu opens flush at the cursor, not offset below a trigger like
 * every other connected overlay's `DEFAULT_CONNECTED_POSITIONS` — no
 * `offsetY`, and no `start`/`end` split on the X axis either (the origin is
 * a zero-width point, so `start` and `end` would resolve to the identical
 * coordinate; `withPush(true)` already keeps the panel inside the viewport
 * horizontally regardless). Below-then-above is the only real fallback that
 * means anything for a point origin.
 */
const CONTEXT_MENU_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
];

/**
 * ContextMenu primitive (Tier 2), last of the Tier 2 batch: an attribute
 * directive (`[medContextMenu]="items"` on any host element), not a
 * separate declared component like Menu — right-click doesn't need a
 * template reference to toggle from, it's the browser's own `contextmenu`
 * event on whatever the consumer decorates (a table row, an image, a whole
 * panel). Originally reused `MenuPanelComponent`/`openMenuPanel()` (Menu/
 * Menubar's shared flat panel) unchanged; the only new piece needed back
 * then was teaching `OverlayService.openConnected()` to accept a bare
 * viewport point as its origin, not just an element
 * (`ConnectedOverlayOrigin`), since a context menu anchors to the cursor at
 * right-click time, never to the decorated element's own position.
 *
 * **Nested submenus (added 2026-09-08)**: `medContextMenu`
 * now accepts `TieredMenuItem[]` (a superset of `MenuItem[]` — every
 * existing flat consumer keeps working unchanged) and opens
 * `TieredMenuPanelComponent` — the same cascading-submenu panel
 * `TieredMenuComponent` already uses — instead of the flat
 * `MenuPanelComponent`. Deliberately **not** a change to
 * `MenuPanelComponent` itself: that component is still shared unchanged by
 * Menu and Menubar, and giving it cascading-submenu behavior neither of
 * those two need would risk both for this one consumer's benefit — same
 * "isolate the blast radius" reasoning `TieredMenuPanelComponent`'s own doc
 * comment already gives for staying its own component instead of a
 * modified `MenuPanelComponent`. Bootstrapping is otherwise identical to
 * `TieredMenuComponent.open()`: same `panelClass`, same `panelId`/`items`
 * inputs, same `itemActivated`/`closeRequested` subscriptions — only the
 * origin (a point or the host element, not always an `HTMLElement`) and
 * the custom `CONTEXT_MENU_POSITIONS`/`exclusionElement` differ, both
 * already supported by `OverlayService.openConnected()`.
 *
 * `event.preventDefault()` suppresses the browser's native context menu —
 * skipped entirely when `contextMenuDisabled` or `medContextMenu` is empty,
 * so the native menu still shows through in either case (nothing useful to
 * replace it with). Right-clicking again — on the same element or, since
 * the panel is a real overlay, anywhere else — always closes whatever
 * instance is already open and opens a fresh one at the new cursor
 * position: unlike Menu's toggle-on-click trigger, a context menu is never
 * "the same activation, meant to close itself" on a second right-click, it
 * is that same real-world gesture ("show me the context menu HERE") users
 * already expect from a native one.
 *
 * **`global`, `pressDelay`, typeahead**.
 *
 * **`global`** (default `false`) attaches the right-click listener to
 * `document` instead of this directive's own host element, so a
 * right-click *anywhere* opens this instance — the host element's own
 * `(contextmenu)` host binding becomes a no-op while `global` is on (it
 * would otherwise double-handle a right-click that lands on the host
 * element itself, since that event also bubbles up to `document`). Wired
 * via `effect()`'s cleanup callback rather than a one-time `DestroyRef`
 * hook, since — unlike `CarouselComponent`'s/`GalleriaComponent`'s own
 * `resize` listeners, attached once and never re-attached — `global` is a
 * plain reactive `input()` that could in principle change after this
 * directive is already active, and the listener needs to move between
 * `document` and "off" accordingly.
 *
 * **`pressDelay`** (default `500`) is
 * long-press support for touch: `touchstart` arms a timer that opens the
 * menu at the touch point if `pressDelay` ms pass before `touchend`/
 * `touchmove` (a real drag/scroll, not a long-press) cancels it first —
 * mobile has no `contextmenu` event of its own to hook, so this is a
 * second, independent trigger path onto the same `open()`.
 *
 * **Typeahead** lives on `TieredMenuPanelComponent` itself (the shared
 * panel this directive already opens), not here — see that file's own
 * doc, "Typeahead" section, for why it belongs there instead of being
 * duplicated per trigger (`TieredMenuComponent` gets it for free too).
 */
@Directive({
  selector: '[medContextMenu]',
  exportAs: 'medContextMenu',
  standalone: true,
  host: {
    '(contextmenu)': 'onContextMenu($event)',
    '(keydown)': 'onKeydown($event)',
    '(touchstart)': 'onTouchStart($event)',
    '(touchend)': 'onTouchEnd()',
    '(touchmove)': 'onTouchEnd()',
  },
})
export class ContextMenuDirective implements OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly panelElementId = `med-context-menu-panel-${nextContextMenuId++}`;

  readonly medContextMenu = input<readonly TieredMenuItem[]>([]);
  readonly contextMenuDisabled = input(false, { transform: booleanAttribute });
  readonly global = input(false, { transform: booleanAttribute });
  readonly pressDelay = input(500, { transform: numberAttribute });
  readonly itemSelect = output<MenuItem>();

  private handle: OverlayHandle<TieredMenuPanelComponent, void> | null = null;
  private pressTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect((onCleanup) => {
      if (!this.global()) {
        return;
      }
      const handler = (event: MouseEvent) => this.handleContextMenu(event);
      document.addEventListener('contextmenu', handler);
      onCleanup(() => document.removeEventListener('contextmenu', handler));
    });
  }

  protected onContextMenu(event: MouseEvent): void {
    if (this.global()) {
      return; // handled by the document-level listener instead, see class doc
    }
    this.handleContextMenu(event);
  }

  private handleContextMenu(event: MouseEvent): void {
    this.open({ x: event.clientX, y: event.clientY }, CONTEXT_MENU_POSITIONS, () => event.preventDefault());
  }

  protected onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    this.pressTimer = setTimeout(() => {
      this.pressTimer = null;
      this.open({ x: touch.clientX, y: touch.clientY }, CONTEXT_MENU_POSITIONS, () => {});
    }, this.pressDelay());
  }

  protected onTouchEnd(): void {
    if (this.pressTimer !== null) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  /**
   * Keyboard-accessible open path (Wave 2 fix): previously this directive
   * only ever opened from the native `contextmenu` mouse/touch event, with
   * no `(keydown)` fallback — a real gap for a keyboard-only user on a host
   * element the directive doesn't require to even be focusable (a table
   * row, an image, per the directive's own doc comment). `ContextMenu`
   * (the dedicated key some keyboards have) and Shift+F10 are the two
   * conventional triggers real OSes/browsers already treat as "open the
   * context menu for whatever's focused" — anchored to the host element's
   * own position here (no cursor coordinates exist for a keyboard trigger),
   * unlike the point-anchored mouse path above.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) {
      return;
    }
    this.open(this.elementRef.nativeElement, undefined, () => event.preventDefault());
  }

  /** Opens the context menu programmatically at a pointer event, viewport point, or anchor element. */
  show(origin: MouseEvent | { x: number; y: number } | HTMLElement, preventDefault?: () => void): void {
    if (origin instanceof MouseEvent) {
      const exclusion =
        origin.currentTarget instanceof HTMLElement
          ? origin.currentTarget
          : origin.target instanceof HTMLElement
            ? origin.target
            : this.elementRef.nativeElement;
      this.open({ x: origin.clientX, y: origin.clientY }, CONTEXT_MENU_POSITIONS, preventDefault ?? (() => origin.preventDefault()), exclusion);
      return;
    }
    if (origin instanceof HTMLElement) {
      this.open(origin, undefined, preventDefault ?? (() => {}), origin);
      return;
    }
    this.open(origin, CONTEXT_MENU_POSITIONS, preventDefault ?? (() => {}));
  }

  private open(
    origin: { x: number; y: number } | HTMLElement,
    positions: ConnectedPosition[] | undefined,
    preventDefault: () => void,
    exclusionElement: HTMLElement = this.elementRef.nativeElement,
  ): void {
    const items = this.medContextMenu();
    if (this.contextMenuDisabled() || items.length === 0) {
      return;
    }
    preventDefault();
    this.handle?.close();

    const handle = this.overlayService.openConnected<TieredMenuPanelComponent, void>(origin, TieredMenuPanelComponent, {
      panelClass: MENU_PANEL_CLASS,
      positions,
      exclusionElement,
    });
    handle.componentRef.setInput('panelId', this.panelElementId);
    handle.componentRef.setInput('items', items);
    this.handle = handle;

    handle.componentRef.instance.itemActivated.subscribe((item: MenuItem) => {
      this.itemSelect.emit(item);
      handle.close();
    });
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());

    handle.closed$.subscribe(() => {
      this.handle = null;
    });
  }

  close(): void {
    this.handle?.close();
  }

  ngOnDestroy(): void {
    this.onTouchEnd();
    this.handle?.close();
  }
}
