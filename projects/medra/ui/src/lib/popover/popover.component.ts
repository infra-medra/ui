import { ChangeDetectionStrategy, Component, OnDestroy, TemplateRef, ViewContainerRef, booleanAttribute, inject, input, output, viewChild } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { OverlayService, OverlayTemplateHandle } from '../overlay/overlay.service';
import { mergeClasses } from '../utils/merge-classes';

/**
 * Applied via `panelClass` straight onto `.cdk-overlay-pane` (like Menu's
 * `MENU_PANEL_CLASS`, not Dialog/Drawer's own-element workaround) — none of
 * these are the `width`/`max-width`/`height`/`max-height` utilities that
 * collide with the CDK's unlayered structural CSS for that selector (see
 * dialog-shell.component.ts), so there's nothing here for that bug to win
 * against.
 */
const POPOVER_PANEL_CLASS = ['rounded-lg', 'border', 'border-surface-200', 'bg-surface-0', 'p-4', 'shadow-overlay-lg', 'dark:border-surface-700', 'dark:bg-surface-800'];

/**
 * Popover primitive (Tier 2): same declared-once, toggled-imperatively shape
 * as Menu — `<med-popover #pop>...content...</med-popover><button
 * (click)="pop.toggle($event.currentTarget)">` — but for arbitrary
 * consumer-authored content instead of Menu's fixed `items` data list.
 * Reuses the exact `TemplatePortal` technique Drawer introduced
 * (`OverlayService.openConnectedTemplate`, the connected-overlay sibling of
 * Drawer's `openGlobalTemplate`) — this component's own template is
 * entirely an `<ng-template>`, so `<med-popover>` itself renders nothing
 * (`host: { class: 'hidden' }`, same as Menu), and the projected
 * `ng-content` only actually mounts once the template is attached to the
 * overlay.
 *
 * Non-modal, same as Menu/Select/Tooltip: no backdrop, closes on Escape or
 * a click outside the panel (never a backdrop click, since there isn't
 * one) — `OverlayService`'s own defaults for a connected overlay already
 * give this for free. Unlike Menu (which drives its own roving-tabindex
 * keyboard model over a fixed item list), Popover's content is arbitrary,
 * so there's no item-level keyboard handling to own here — real focus
 * moves onto the pane itself on open (`overlayRef.overlayElement`, made
 * focusable via `tabIndex = -1`, and given `role="dialog"` — a general
 * non-modal panel, not an alert/confirm prompt, so plain `dialog` fits
 * better than `alertdialog` here), from which Tab reaches whatever
 * focusable content is projected, same as a screen reader landing inside
 * any other composite region. `ng-content` sits directly in the
 * `<ng-template>` with no wrapper element — nothing to style beyond the
 * pane itself, which already carries every visual (`POPOVER_PANEL_CLASS`).
 * Labeling the panel (`aria-label`) is the consumer's job via `ariaLabel`
 * — the projected content is arbitrary, so there's no fixed heading/message
 * this component could point an `aria-labelledby` at the way
 * `ConfirmPopupContentComponent` points one at its own fixed message.
 *
 * **Scope cut for v1**: unlike Dialog/Drawer, no built-in header or close
 * button
 * chrome (including calling `pop.close()` from its own close affordance,
 * if it wants one).
 *
 * **`class`, `dismissable`, `ariaLabelledBy`**, API
 *.
 *
 * **`class`** merges onto the fixed `POPOVER_PANEL_CLASS` via
 * `mergeClasses()` — the same escape-hatch mechanism every other
 * consumer-facing component in this library already exposes for
 * overriding/extending its own default classes, which this component
 * simply hadn't grown yet.
 *
 * **`dismissable`** (default `true`) maps onto `OverlayService`'s own `closeOnOutsideClick`. It
 * only ever touches `closeOnOutsideClick`, never `closeOnEscape`: Escape always closes the panel
 * regardless.
 *
 * **`ariaLabelledBy`** sets `aria-labelledby` on the pane, alongside the
 * existing `ariaLabel` (`aria-label`) — a consumer with a heading already
 * inside the projected content can point at that element's own id instead
 * of duplicating its text into a separate `ariaLabel` string.
 */
@Component({
  selector: 'med-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hidden' },
  template: `
    <ng-template #panelTemplate>
      <ng-content />
    </ng-template>
  `,
})
export class PopoverComponent implements OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly panelTemplate = viewChild.required('panelTemplate', { read: TemplateRef });

  readonly positions = input<ConnectedPosition[] | null>(null);
  /** Labels the panel for assistive tech (`aria-label` on the overlay pane). Default: `null` — unlabeled unless the consumer sets one. */
  readonly ariaLabel = input<string | null>(null);
  /** Alternative to `ariaLabel` — points `aria-labelledby` at an existing element's id instead. Default: `null`. */
  readonly ariaLabelledBy = input<string | null>(null);
  /** Closes on an outside click. Default: `true`. Escape always closes the panel regardless — see class doc. */
  readonly dismissable = input(true, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  readonly shown = output<void>();
  readonly hidden = output<void>();

  private handle: OverlayTemplateHandle<void> | null = null;

  get isOpen(): boolean {
    return this.handle !== null;
  }

  toggle(eventOrOrigin: Event | HTMLElement, target?: HTMLElement): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.show(eventOrOrigin, target);
    }
  }

  show(eventOrOrigin: Event | HTMLElement, target?: HTMLElement): void {
    const origin = this.resolveOrigin(eventOrOrigin, target);
    if (!origin) {
      return;
    }
    if (this.isOpen) {
      this.close();
    }
    this.open(origin);
  }

  hide(): void {
    this.close();
  }

  private resolveOrigin(eventOrOrigin: Event | HTMLElement, target?: HTMLElement): HTMLElement | null {
    if (target) {
      return target;
    }
    if (eventOrOrigin instanceof HTMLElement) {
      return eventOrOrigin;
    }
    return (eventOrOrigin.currentTarget ?? eventOrOrigin.target) as HTMLElement | null;
  }

  open(origin: HTMLElement): void {
    if (this.isOpen) {
      return;
    }

    const handle = this.overlayService.openConnectedTemplate<void>(origin, this.panelTemplate(), this.viewContainerRef, {
      // CDK applies `panelClass` via `classList.add()` per array entry — a
      // single space-containing string token (what `mergeClasses()` itself
      // returns) throws `InvalidCharacterError` there, so it's split back
      // into individual class tokens first.
      panelClass: mergeClasses(POPOVER_PANEL_CLASS, this.class())
        .split(' ')
        .filter((token) => token.length > 0),
      positions: this.positions() ?? undefined,
      closeOnOutsideClick: this.dismissable(),
    });
    this.handle = handle;
    const paneElement = handle.overlayRef.overlayElement;
    paneElement.tabIndex = -1;
    paneElement.setAttribute('role', 'dialog');
    if (this.ariaLabel()) {
      paneElement.setAttribute('aria-label', this.ariaLabel()!);
    }
    if (this.ariaLabelledBy()) {
      paneElement.setAttribute('aria-labelledby', this.ariaLabelledBy()!);
    }
    paneElement.focus();
    this.shown.emit();

    handle.closed$.subscribe(() => {
      this.handle = null;
      this.hidden.emit();
    });
  }

  close(): void {
    this.handle?.close();
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }
}
