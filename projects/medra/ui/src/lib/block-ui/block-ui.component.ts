import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, Renderer2, TemplateRef, afterRenderEffect, booleanAttribute, computed, contentChild, inject, input, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.component';
import { mergeClasses } from '../utils/merge-classes';

/**
 * BlockUI primitive (Tier 3): wraps arbitrary content
 * (`<med-block-ui [blocked]="saving()">...form...</med-block-ui>`) and
 * overlays a mask + spinner directly on top of it while `blocked` is
 * `true` — scoped to this component's own box, not a viewport-level
 * `OverlayService` overlay: it's meant to stay put over its own content as
 * that content scrolls, not escape into a top-level stacking context the
 * way Dialog/Drawer/Popover need to.
 *
 * The blocked content sits in its own wrapper `<div>` with `[attr.inert]`
 * toggled on/off, not a manual focus trap: the native `inert` attribute
 * already removes the whole subtree from focus, pointer interaction, and
 * assistive-tech exposure in one step, which is exactly "block interaction
 * with the content underneath" — the mask itself is a *sibling* of that
 * wrapper (not nested inside it), so `inert` never accidentally disables
 * the mask's own spinner/custom template.
 *
 * The mask's content defaults to a `ProgressSpinner`, or can be replaced
 * entirely with a projected `<ng-template>` (`NgTemplateOutlet`, same
 * single-optional-template convention `DataViewComponent` established,
 * just optional here since there's a sane default).
 *
 * **`target`** is a plain `HTMLElement` reference (a template reference variable on *any* element,
 * a component's or a bare `<div>`), so a consumer can block an external element by name without
 * that element having to implement any interface — which would ripple across every component that
 * might ever be a target.
 *
 * With `target` set, this component renders no wrapped content of its own (the `@if (!target())`
 * branch) — there's nothing to project, since the element being blocked lives elsewhere in the DOM,
 * already rendered by the consumer. Blocking instead re-parents the (already Angular-rendered) mask
 * element directly into `target` via `Renderer2.appendChild()` — the same class of "move an
 * already-rendered node without destroying its view" operation Angular CDK's own portal outlets
 * rely on, so the mask's own template bindings (the spinner, the projected template, `aria-label`)
 * keep working normally after the move. `target` needs `position: relative` for the mask's own
 * `absolute inset-0` to anchor against it — set only when `target` has no *inline* `position` style
 * of its own already (restored on unblock/destroy), so an intentionally-positioned target is never
 * silently clobbered. Checked against the inline style specifically, not a full
 * `getComputedStyle()` read (which also wouldn't catch a class-driven position, e.g. a Tailwind
 * `absolute` utility, but does dodge `getComputedStyle()`'s own unreliable defaults in
 * layout-engine-less test environments) — the common, intentional way a consumer would position an
 * element before handing it to `target`. Wired via `afterRenderEffect()` (a DOM-structure side
 * effect, not a pure signal computation — same reasoning `DrawerComponent`'s own
 * `afterRenderEffect()` already documents for its portal attach/detach).
 */
@Component({
  selector: 'med-block-ui',
  standalone: true,
  imports: [NgTemplateOutlet, ProgressSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: `
    @if (!target()) {
      <div [attr.inert]="blocked() ? '' : null">
        <ng-content />
      </div>
    }
    @if (blocked()) {
      <div #mask [class]="maskClass" role="status" aria-live="polite" [attr.aria-label]="blockedLabel()">
        @if (template(); as t) {
          <ng-container [ngTemplateOutlet]="t" />
        } @else {
          <med-progress-spinner />
        }
      </div>
    }
  `,
})
export class BlockUiComponent implements OnDestroy {
  private readonly renderer = inject(Renderer2);

  readonly blocked = input(false, { transform: booleanAttribute });
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly blockedLabel = input('Loading');
  readonly class = input('', { alias: 'class' });
  /** Blocks this external element instead of wrapped `<ng-content>` — see class doc's "target" section. */
  readonly target = input<HTMLElement | null>(null);

  protected readonly template = contentChild(TemplateRef);
  private readonly maskRef = viewChild<ElementRef<HTMLElement>>('mask');

  protected readonly hostClass = computed(() => mergeClasses('relative block', this.class()));
  protected readonly maskClass =
    'absolute inset-0 z-10 flex items-center justify-center bg-surface-0/70 backdrop-blur-[1px] dark:bg-surface-900/70';

  /** The target currently holding the re-parented mask, and the `position` value it had before this component set it to `relative` (`null` if it was already positioned and untouched). */
  private attachedTarget: HTMLElement | null = null;
  private previousTargetPosition: string | null = null;

  constructor() {
    afterRenderEffect(() => {
      const target = this.target();
      const maskEl = this.maskRef()?.nativeElement;

      if (target && this.blocked() && maskEl) {
        if (this.attachedTarget !== target) {
          this.detachFromTarget();
          this.attachedTarget = target;
          // Checks the target's own inline `position` only, not a
          // stylesheet-driven one (e.g. a Tailwind `absolute` class) —
          // narrower than a full `getComputedStyle()` read, but the
          // common, intentional way a consumer would position an element
          // they're handing to `target` in the first place, and avoids
          // `getComputedStyle()`'s own unreliable defaults in
          // layout-engine-less test environments.
          if (!target.style.position) {
            this.previousTargetPosition = target.style.position;
            target.style.position = 'relative';
          }
        }
        this.renderer.appendChild(target, maskEl);
      } else {
        this.detachFromTarget();
      }
    });
  }

  ngOnDestroy(): void {
    this.detachFromTarget();
  }

  private detachFromTarget(): void {
    if (this.attachedTarget && this.previousTargetPosition !== null) {
      this.attachedTarget.style.position = this.previousTargetPosition;
    }
    this.attachedTarget = null;
    this.previousTargetPosition = null;
  }
}
