import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { OverlayService, OverlayTemplateHandle } from '../overlay/overlay.service';
import { mergeClasses } from '../utils/merge-classes';
import {
  DrawerPosition,
  ENTER_TRANSFORM_CLASS,
  EXIT_TRANSFORM_CLASS,
  FULLSCREEN_ENTER_CLASS,
  FULLSCREEN_EXIT_CLASS,
  drawerFullScreenPanelClass,
  drawerPanelVariants,
} from './drawer.styles';

let nextDrawerId = 0;

/**
 * Time the exit transition is given to play before the overlay actually
 * disposes (`OverlayService`'s `beforeClose` hook) — must stay in sync with
 * the `duration-(--transition-duration-base)` class on `drawerPanelVariants`
 * (currently `--transition-duration-base: 0.2s`, see tailwind-theme-medraui.css).
 * There's no way to read a CSS custom property's resolved value without an
 * extra `getComputedStyle()` round-trip on every close, which isn't worth it
 * for a value that changes about as often as the design tokens themselves.
 */
const EXIT_TRANSITION_MS = 200;

/**
 * Drawer primitive (Tier 2): unlike Dialog/Toast (imperative services that
 * instantiate an arbitrary consumer component), a drawer is normally
 * declared once, inline, where it's used —
 * `<med-drawer [(visible)]="open" position="left">...content...</med-drawer>`
 * — with its content authored directly in the surrounding template, not a
 * separate component class. To still route that content through the shared
 * `OverlayService` (backdrop, focus trap, Escape/backdrop-click, focus
 * restoration — roadmap/checklist-padrao-componente.md's "use the shared overlay
 * service" rule for overlay components), this component's own template is
 * ENTIRELY an `<ng-template>` — nothing renders at `<med-drawer>`'s own
 * declaration site (`host: { class: 'hidden' }`, same as Menu). Content
 * projected via `ng-content` inside that template only actually mounts once
 * the template is instantiated — which only happens when `visible` becomes
 * `true` and this component attaches it to the overlay as a `TemplatePortal`
 * (`OverlayService.openGlobalTemplate`, added specifically for this case).
 *
 * `position` drives which viewport edge the panel is stretched against —
 * `OverlayService`'s new `edge` option, a different shape than
 * `GlobalOverlayPosition` (Dialog/Toast's corner anchors): `left`/`right`
 * get a fixed width and fill the full viewport height; `top`/`bottom` get
 * full width, capped at 85vh like Dialog (never forced to full height —
 * see drawer.styles.ts).
 *
 * `modal` (default `true`) maps straight to `hasBackdrop`: a non-modal
 * drawer has no backdrop, doesn't trap focus (`OverlayService`'s own
 * `trapFocus` default is keyed off `hasBackdrop`), and closes on an outside
 * click instead of a backdrop click — same mechanism Select/Menu already
 * use for their own non-modal panels.
 *
 * Slide transition: one frame after the overlay attaches (double
 * `requestAnimationFrame` — a single one can still coincide with the
 * initial paint in some browsers, leaving nothing to transition from), the
 * panel's root element gets its exit-transform class swapped for the
 * entered one via plain `classList` calls — NOT a signal read back in the
 * template (see the long comment on `drawerPanelVariants` in
 * drawer.styles.ts for the real NG0100 that came out of trying that).
 * `beforeClose` reverses the swap and holds the actual overlay dispose for
 * `EXIT_TRANSITION_MS` so the slide-out has time to play before the panel
 * leaves the DOM — every other overlay in this library closes instantly;
 * Drawer is the first to need an exit animation.
 *
 * **`fullScreen`, `blockScroll`, `closeOnEscape`**, API
 *.
 *
 * **`fullScreen`** covers the whole viewport regardless of `position` —
 * see `drawerFullScreenPanelClass`'s own doc in `drawer.styles.ts` for why
 * it fades instead of sliding once the panel already fills the viewport
 * either way.
 *
 * **`closeOnEscape`** is a plain passthrough onto
 * `OverlayService.openGlobalTemplate()`'s own already-existing
 * `closeOnEscape` option — every overlay in this library already supports
 * it, Drawer just hadn't exposed it through its own inputs yet.
 *
 * **`blockScroll`** (default `false`) is
 * handled entirely locally, not via `OverlayService`: a *modal* drawer
 * (`modal` default `true`) already blocks page scroll today, for free —
 * `OverlayService`'s own scroll-strategy selection already uses CDK's
 * `block()` strategy for any global overlay with a backdrop, which every
 * modal Dialog/Drawer already is. `blockScroll`'s real, additive value is
 * for a *non-modal* drawer (`modal="false"`) that still wants to block
 * background scroll — a combination `OverlayService`'s own
 * backdrop-driven strategy selection has no way to express, since it
 * isn't independently configurable per call. Toggling `document.body`'s
 * `overflow: hidden` directly (restored on close) sidesteps needing to
 * extend the shared primitive for what's a Drawer-only need so far, the
 * same "handle it locally rather than grow `OverlayService` for one
 * consumer" reasoning already applied to this component's own exit
 * transition.
 *
 * **`#header`/`#footer`/`#headless`**: three named `TemplateRef<void>` slots. `#header` is
 * *additive* alongside the plain-string `header()` input (the template renders first, the string
 * title next to/after it) rather than one replacing the other, so a consumer can add an icon or
 * action button next to the title without losing the title itself. `#footer` renders in a new row
 * below the body, only when projected. `#headless` replaces the header row, body, *and* footer
 * entirely.
 */
@Component({
  selector: 'med-drawer',
  standalone: true,
  imports: [ButtonDirective, IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hidden' },
  template: `
    <ng-template #panelTemplate>
      <div [class]="panelClass()" role="dialog" [attr.aria-modal]="modal() ? 'true' : null" [attr.aria-labelledby]="header() ? headerId : null">
        @if (headlessTemplate(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" />
        } @else {
          @if (headerTemplate() || header() || closable()) {
            <div class="flex items-center justify-between gap-4 border-b border-surface-200 px-4 py-3 dark:border-surface-700">
              <div class="flex min-w-0 flex-1 items-center gap-2">
                @if (headerTemplate(); as tpl) {
                  <ng-container [ngTemplateOutlet]="tpl" />
                }
                @if (header()) {
                  <h2 [id]="headerId" class="min-w-0 flex-1 break-words text-lg font-semibold">{{ header() }}</h2>
                }
              </div>
              @if (closable()) {
                <button medButton type="button" variant="text" severity="secondary" iconOnly [attr.aria-label]="closeLabel()" (click)="visible.set(false)">
                  <med-icon name="x-mark" />
                </button>
              }
            </div>
          }
          <div class="flex-1 overflow-auto p-4">
            <ng-content />
          </div>
          @if (footerTemplate(); as tpl) {
            <div class="border-t border-surface-200 px-4 py-3 dark:border-surface-700">
              <ng-container [ngTemplateOutlet]="tpl" />
            </div>
          }
        }
      </div>
    </ng-template>
  `,
})
export class DrawerComponent implements OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly panelTemplate = viewChild.required('panelTemplate', { read: TemplateRef });
  protected readonly headerTemplate = contentChild('header', { read: TemplateRef });
  protected readonly footerTemplate = contentChild('footer', { read: TemplateRef });
  protected readonly headlessTemplate = contentChild('headless', { read: TemplateRef });

  readonly position = input<DrawerPosition>('left');
  readonly modal = input(true, { transform: booleanAttribute });
  readonly visible = model(false);
  readonly header = input<string | null>(null);
  readonly closable = input(true, { transform: booleanAttribute });
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly closeLabel = input('Close');
  readonly class = input('', { alias: 'class' });
  readonly fullScreen = input(false, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  /** See class doc's "blockScroll" section — handled locally, not via `OverlayService`. */
  readonly blockScroll = input(false, { transform: booleanAttribute });

  readonly shown = output<void>();
  readonly hidden = output<void>();

  protected readonly headerId = `med-drawer-header-${nextDrawerId++}`;

  protected readonly panelClass = computed(() =>
    mergeClasses(this.fullScreen() ? drawerFullScreenPanelClass : drawerPanelVariants({ position: this.position() }), this.class()),
  );

  private handle: OverlayTemplateHandle<void> | null = null;
  private panelEl: HTMLElement | null = null;

  constructor() {
    // `afterRenderEffect`, not a plain `effect()`: `open()`/`close()` create
    // and tear down a `TemplatePortal`'s embedded view via this component's
    // own `ViewContainerRef` — a DOM/view-structure side effect, which is
    // exactly what `afterRenderEffect` (unlike `effect()`, meant for pure
    // signal computations) exists for, running after change detection
    // instead of during it.
    afterRenderEffect(() => {
      if (this.visible()) {
        this.open();
      } else {
        this.handle?.close();
      }
    });
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }

  private previousBodyOverflow: string | null = null;

  private open(): void {
    if (this.handle) {
      return;
    }

    const handle = this.overlayService.openGlobalTemplate<void>(this.panelTemplate(), this.viewContainerRef, {
      edge: this.position(),
      hasBackdrop: this.modal(),
      panelClass: [],
      closeOnEscape: this.closeOnEscape(),
      beforeClose: () => this.playExitTransition(),
    });
    this.handle = handle;
    this.panelEl = handle.overlayRef.overlayElement.querySelector<HTMLElement>('[role="dialog"]');
    this.shown.emit();

    if (this.blockScroll()) {
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    requestAnimationFrame(() => requestAnimationFrame(() => this.setTransformEntered(true)));

    handle.closed$.subscribe(() => {
      this.handle = null;
      this.panelEl = null;
      this.visible.set(false);
      if (this.previousBodyOverflow !== null) {
        document.body.style.overflow = this.previousBodyOverflow;
        this.previousBodyOverflow = null;
      }
      this.hidden.emit();
    });
  }

  private playExitTransition(): Promise<void> {
    this.setTransformEntered(false);
    return new Promise((resolve) => setTimeout(resolve, EXIT_TRANSITION_MS));
  }

  private setTransformEntered(entered: boolean): void {
    if (this.fullScreen()) {
      this.panelEl?.classList.remove(entered ? FULLSCREEN_EXIT_CLASS : FULLSCREEN_ENTER_CLASS);
      this.panelEl?.classList.add(entered ? FULLSCREEN_ENTER_CLASS : FULLSCREEN_EXIT_CLASS);
      return;
    }
    const position = this.position();
    this.panelEl?.classList.remove(entered ? EXIT_TRANSFORM_CLASS[position] : ENTER_TRANSFORM_CLASS[position]);
    this.panelEl?.classList.add(entered ? ENTER_TRANSFORM_CLASS[position] : EXIT_TRANSFORM_CLASS[position]);
  }
}
