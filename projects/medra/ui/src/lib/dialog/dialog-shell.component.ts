import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewContainerRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';
import { DIALOG_REF, DIALOG_SHELL_OPTIONS } from './dialog.tokens';

let nextHeaderId = 0;

const MIN_WIDTH_PX = 280;
const MIN_HEIGHT_PX = 160;

/**
 * Internal shell: draws the header (title + close button) and hosts the
 * consumer's own content component, created imperatively into `contentHost`.
 * Not part of the public API — consumers only ever see `DialogService`.
 *
 * **`draggable`/`resizable`/`maximizable`**: all three move/resize *this*
 * element directly via plain pointer events and inline styles — no CDK
 * drag-drop module, no extra dependency, since this a single always-visible
 * drag surface (the header) and a single resize handle (the corner grip),
 * not a general-purpose sortable/droppable system. Same `setPointerCapture`
 * + template-bound `(pointermove)`/`(pointerup)`/`(pointercancel)` pattern
 * Slider's own track dragging already established (`slider.component.ts`)
 * — captured on the element that received `pointerdown` itself, so drag/
 * resize tracking keeps working even once the pointer moves outside that
 * element's bounds, with no `document`-level listener to add/remove by
 * hand. A drag moves the shell via `transform: translate(dx, dy)`, layered
 * on top of whatever centering/corner position `OverlayService`'s
 * `GlobalPositionStrategy` already applies to the CDK pane around it — the
 * shell itself never leaves normal flex-item flow, so nothing needs to
 * switch to `position: fixed` by hand. A resize sets an explicit inline
 * `width`/`height`, which — being inline — already wins over the
 * `sm:min-w-*`/`sm:max-w-*` utility classes on the host without needing
 * `!important` or a specificity fight. Maximizing suppresses (not clears)
 * any drag offset — `transformStyle()` returns `null` while `maximized()`
 * is `true` regardless of the stored offset — and sets width/height to
 * fill the viewport with a small margin, overriding both the plain size
 * classes and any manual resize; restoring un-suppresses the old offset,
 * so the dialog reappears wherever it was dragged to before maximizing,
 * same "restore returns to where you left it" behavior most window
 * managers have. None of the three persist across dialogs — each
 * `DialogService.open()` call creates a fresh shell instance, so state
 * always starts clean.
 *
 * The close button carries a `data-dialog-close` marker attribute — a stable hook `ConfirmDialogContentComponent` can query across
 * the component boundary for its own `defaultFocus: 'close'`, since the
 * close button lives here in the shell, not in the dynamically-created
 * content component itself. See that file's own doc.
 *
 * **`breakpoints`** — see `DialogService`'s own doc for
 * the full rationale. A plain `[style.width]` binding can't express a
 * media query at all, so this injects a small scoped `<style>` element
 * instead (client-only, inside `afterNextRender()`), one `@media
 * (max-width: ...)` rule per breakpoint, targeting this one shell
 * instance's own `data-dialog-id` attribute — unique per `DialogService.open()`
 * call (reuses the same counter as `headerId`), so two simultaneously-open
 * dialogs with different `breakpoints` never collide. Removed on destroy.
 */
@Component({
  selector: 'med-dialog-shell',
  standalone: true,
  imports: [IconComponent, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /*
   * All of the dialog box's own sizing and visuals (width, max-height,
   * rounded corners, background, shadow) live here, on our own element —
   * deliberately NOT on `panelClass` (which targets `.cdk-overlay-pane`,
   * see dialog.service.ts). Recent Angular CDK versions inject their own
   * structural CSS for `.cdk-overlay-pane` (max-width/max-height) via a
   * runtime-injected, UNLAYERED stylesheet — and per the CSS Cascade Layers
   * spec, an unlayered rule beats a layered one regardless of specificity
   * or source order. Since every Tailwind utility lives inside
   * `@layer utilities`, no `panelClass` utility can ever out-cascade that
   * CDK rule for the properties it sets (concretely: `sm:max-w-lg` on the
   * pane was silently overridden by CDK's own `max-width: 100%`, so a long
   * title's content-driven width blew the whole dialog off the right edge
   * of the viewport at desktop sizes — the actual bug this comment chain is
   * explaining). Styling our own `med-dialog-shell` element instead sidesteps
   * the conflict entirely, since CDK has no rule targeting *this* selector.
   * Toast's container already followed this exact pattern (see
   * toast-container.component.ts) — Dialog was the inconsistent one.
   *
   * Mobile: near-full-width with a small margin, height follows content
   * (capped, scrolls past 85vh). Desktop (`sm:` and up): centered, capped
   * width. Explicitly not full-screen — that left a large empty gap below
   * short dialogs (e.g. a simple confirm) when height was forced to 100%.
   */
  host: {
    class:
      'relative flex w-[calc(100vw-2rem)] max-h-[85vh] flex-col rounded-lg bg-surface-0 shadow-overlay-lg dark:bg-surface-800 sm:w-auto sm:min-w-[24rem] sm:max-w-lg',
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-labelledby]': 'options.header ? headerId : null',
    '[attr.data-dialog-id]': 'dialogId',
    '[attr.data-maximized]': 'maximized() ? "true" : null',
    '[style.transform]': 'transformStyle()',
    '[style.width.px]': 'sizeStyle()?.width ?? null',
    '[style.height.px]': 'sizeStyle()?.height ?? null',
    '[style.maxWidth]': 'maximized() ? "none" : null',
    '[style.maxHeight]': 'maximized() ? "none" : null',
  },
  template: `
    @if (showHeaderBar) {
      <div
        #dragHandle
        class="flex items-center justify-between gap-4 border-b border-surface-200 px-4 py-3 dark:border-surface-700"
        [class.cursor-move]="draggable && !maximized()"
        (pointerdown)="onDragStart($event)"
        (pointermove)="onDragMove($event)"
        (pointerup)="onDragEnd()"
        (pointercancel)="onDragEnd()"
      >
        <!--
          min-w-0 is load-bearing: a flex item's default min-width: auto
          keeps it from shrinking below its content's intrinsic width, so
          without it a long unbroken title (a filename, URL, etc. with no
          spaces to wrap at) pushed the whole header row -- and with it the
          dialog panel itself -- past its own max-width, off the right edge
          of the viewport, taking the close button with it. break-words
          lets that same unbroken text wrap mid-word instead of overflowing.
        -->
        <h2 [id]="headerId" class="min-w-0 flex-1 break-words text-lg font-semibold">{{ options.header }}</h2>
        <div class="flex shrink-0 items-center gap-1">
          @if (maximizable) {
            <button
              medButton
              type="button"
              variant="text"
              severity="secondary"
              iconOnly
              [attr.aria-label]="maximized() ? restoreLabel : maximizeLabel"
              (click)="toggleMaximize()"
            >
              <med-icon [name]="maximized() ? 'arrows-pointing-in' : 'arrows-pointing-out'" />
            </button>
          }
          @if (closable) {
            <button
              medButton
              type="button"
              variant="text"
              severity="secondary"
              iconOnly
              data-dialog-close
              [attr.aria-label]="closeLabel"
              (click)="dialogRef.close()"
            >
              <med-icon name="x-mark" />
            </button>
          }
        </div>
      </div>
    } @else if (closable) {
      <!--
        No header text, no maximize button, not draggable: a full bordered
        bar just to hold one lone close button read as awkward, empty
        chrome (a real UX issue a user flagged live — the "Log out"
        ConfirmDialog demo, header-less by design). Floating the button in
        the corner instead keeps it just as reachable/clickable without
        drawing a whole extra bar around nothing.
      -->
      <button
        medButton
        type="button"
        variant="text"
        severity="secondary"
        iconOnly
        data-dialog-close
        class="absolute top-2 right-2 z-10"
        [attr.aria-label]="closeLabel"
        (click)="dialogRef.close()"
      >
        <med-icon name="x-mark" />
      </button>
    }
    <div class="flex-1 overflow-auto p-4" [class.pr-10]="!showHeaderBar && closable">
      <!--
        ViewContainerRef.createComponent() inserts as a SIBLING of this
        anchor, not a child of it — the wrapping div above (not this
        ng-container itself) is what actually needs the padding/overflow.
      -->
      <ng-container #contentHost />
    </div>
    @if (resizable && !maximized()) {
      <div
        class="absolute right-0 bottom-0 size-4 cursor-nwse-resize touch-none"
        aria-hidden="true"
        (pointerdown)="onResizeStart($event)"
        (pointermove)="onResizeMove($event)"
        (pointerup)="onResizeEnd()"
        (pointercancel)="onResizeEnd()"
      >
        <med-icon name="arrows-up-down" variant="mini" class="pointer-events-none size-3 rotate-45 text-surface-400 dark:text-surface-500" />
      </div>
    }
  `,
})
export class DialogShellComponent implements AfterViewInit {
  protected readonly dialogRef = inject(DIALOG_REF);
  protected readonly options = inject(DIALOG_SHELL_OPTIONS);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly instanceIndex = nextHeaderId++;
  protected readonly headerId = `med-dialog-header-${this.instanceIndex}`;
  protected readonly dialogId = `med-dialog-${this.instanceIndex}`;
  protected readonly closable = this.options.closable ?? true;
  protected readonly closeLabel = this.options.closeLabel ?? 'Close';
  protected readonly draggable = this.options.draggable ?? false;
  protected readonly resizable = this.options.resizable ?? false;
  protected readonly maximizable = this.options.maximizable ?? false;
  protected readonly maximizeLabel = this.options.maximizeLabel ?? 'Maximize';
  protected readonly restoreLabel = this.options.restoreLabel ?? 'Restore';
  /** The full bordered header bar renders only when there's something that actually needs a full-width row — a title, a maximize control, or a drag handle. A bare `closable` with none of those gets a floating corner button instead, see the template's own comment. */
  protected readonly showHeaderBar = !!this.options.header || this.maximizable || this.draggable;

  protected readonly maximized = signal(false);
  private readonly dragOffset = signal<{ x: number; y: number } | null>(null);
  private readonly customSize = signal<{ width: number; height: number } | null>(null);

  constructor() {
    const breakpoints = this.options.breakpoints;
    if (!breakpoints) {
      return;
    }
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const style = document.createElement('style');
      // `:not([data-maximized="true"])` keeps this rule from applying while maximized — without it,
      // a breakpoint's `width` would fight the maximized (full-viewport) width `sizeStyle()` sets
      // inline whenever both apply at once.
      style.textContent = Object.entries(breakpoints)
        .map(([breakpoint, width]) => `@media (max-width: ${breakpoint}) { [data-dialog-id="${this.dialogId}"]:not([data-maximized="true"]) { width: ${width} !important; } }`)
        .join('\n');
      document.head.appendChild(style);
      destroyRef.onDestroy(() => style.remove());
    });
  }

  /** Set only while an active drag/resize is in progress (between pointerdown and pointerup/cancel) — `null` otherwise, same "active or not" role `SliderComponent.activeThumb` plays for its own pointer drag. */
  private dragStart: { pointerX: number; pointerY: number; offsetX: number; offsetY: number } | null = null;
  private resizeStart: { pointerX: number; pointerY: number; width: number; height: number } | null = null;

  protected readonly transformStyle = computed(() => {
    if (this.maximized()) {
      return null;
    }
    const offset = this.dragOffset();
    return offset ? `translate(${offset.x}px, ${offset.y}px)` : null;
  });

  protected readonly sizeStyle = computed(() => {
    if (this.maximized()) {
      return { width: window.innerWidth - 32, height: window.innerHeight - 32 };
    }
    return this.customSize();
  });

  private readonly dragHandleRef = viewChild<ElementRef<HTMLElement>>('dragHandle');

  protected onDragStart(event: PointerEvent): void {
    if (!this.draggable || this.maximized() || (event.target as HTMLElement).closest('button')) {
      return;
    }
    event.preventDefault();
    this.dragHandleRef()!.nativeElement.setPointerCapture(event.pointerId);
    const offset = this.dragOffset() ?? { x: 0, y: 0 };
    this.dragStart = { pointerX: event.clientX, pointerY: event.clientY, offsetX: offset.x, offsetY: offset.y };
  }

  protected onDragMove(event: PointerEvent): void {
    if (!this.dragStart) {
      return;
    }
    this.dragOffset.set({
      x: this.dragStart.offsetX + (event.clientX - this.dragStart.pointerX),
      y: this.dragStart.offsetY + (event.clientY - this.dragStart.pointerY),
    });
  }

  protected onDragEnd(): void {
    this.dragStart = null;
  }

  protected onResizeStart(event: PointerEvent): void {
    if (!this.resizable || this.maximized()) {
      return;
    }
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.resizeStart = { pointerX: event.clientX, pointerY: event.clientY, width: rect.width, height: rect.height };
  }

  protected onResizeMove(event: PointerEvent): void {
    if (!this.resizeStart) {
      return;
    }
    this.customSize.set({
      width: Math.max(MIN_WIDTH_PX, this.resizeStart.width + (event.clientX - this.resizeStart.pointerX)),
      height: Math.max(MIN_HEIGHT_PX, this.resizeStart.height + (event.clientY - this.resizeStart.pointerY)),
    });
  }

  protected onResizeEnd(): void {
    this.resizeStart = null;
  }

  protected toggleMaximize(): void {
    this.maximized.update((value) => !value);
  }

  private readonly contentHost = viewChild.required('contentHost', { read: ViewContainerRef });

  ngAfterViewInit(): void {
    this.contentHost().createComponent(this.options.component, { injector: this.options.contentInjector });
  }
}
