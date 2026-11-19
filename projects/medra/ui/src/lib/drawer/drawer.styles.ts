import { cva, type VariantProps } from 'class-variance-authority';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * The drawer box itself — deliberately NOT relying on `panelClass` for
 * sizing, same reasoning as `DialogShellComponent`: recent Angular CDK
 * versions inject their own unlayered `.cdk-overlay-pane` CSS that beats
 * any layered Tailwind utility targeting that selector. Styling our own
 * root element sidesteps the conflict (see dialog-shell.component.ts for
 * the full explanation).
 *
 * `left`/`right` get a fixed width and fill the pane's height (itself set
 * to 100% by `OverlayService`'s edge position strategy, via
 * `OverlayRef.updateSize()` — not by anything in this CVA); `top`/`bottom`
 * mirror that on the other axis, capped at 85vh like Dialog rather than
 * ever forced to full height (a short drawer would otherwise leave a large
 * empty gap below its content, the same reasoning already applied to
 * Dialog's own height).
 *
 * The slide-closed transform (e.g. `-translate-x-full` for `left`) is baked
 * into the position's own class string, applied once at initial render —
 * NOT a CVA `entered` variant re-read reactively from the template. Angular
 * CDK's `DomPortalOutlet.attachTemplatePortal()` calls `viewRef.detectChanges()`
 * directly on this portal's embedded view at attach time, a second, ambient-
 * tick-independent change-detection entry point; a template-bound signal
 * later flipped from a `requestAnimationFrame` callback (drawer.component.ts's
 * enter/exit transition) falls out of sync between that call and the next
 * ambient tick's `checkNoChanges()`, tripping NG0100 for real — reproduced
 * even outside tests, not merely a testing artifact. `drawer.component.ts`
 * instead toggles `ENTER_TRANSFORM_CLASS`/`EXIT_TRANSFORM_CLASS` via direct
 * `classList` manipulation on the portal's root element, sidestepping
 * Angular's binding/CD system for this one transient piece of state
 * entirely.
 */
export const drawerPanelVariants = cva(
  ['flex flex-col bg-surface-0 shadow-overlay-lg dark:bg-surface-800', 'transition-transform duration-(--transition-duration-base) ease-in-out'],
  {
    variants: {
      position: {
        left: 'h-full w-[85vw] sm:w-96 -translate-x-full',
        right: 'h-full w-[85vw] sm:w-96 translate-x-full',
        top: 'max-h-[85vh] w-full -translate-y-full',
        bottom: 'max-h-[85vh] w-full translate-y-full',
      },
    },
    defaultVariants: {
      position: 'left',
    },
  },
);

/**
 * `fullScreen` covers the whole viewport regardless of
 * `position`, so the enter/exit animation is a uniform one rather than a
 * directional slide once `fullScreen` is on, and this variant fades
 * (`transition-opacity`) instead of translating; sliding in from "the
 * left edge," say, would look like a mismatched leftover of `position`
 * once the panel already covers 100% of the viewport either way.
 *
 * `h-screen w-screen` (viewport units), not `h-full w-full`: the CDK edge
 * position strategy only stretches the pane itself along *one* axis
 * (`.height('100%')` for `left`/`right`, `.width('100%')` for `top`/
 * `bottom`, see `overlay.service.ts`'s `buildEdgePositionStrategy()`) —
 * the other axis is left shrink-to-fit. A parent-relative `%` on that
 * still-shrink-to-fit axis has no definite size to resolve against;
 * viewport units sidestep that entirely by not depending on the parent's
 * box at all.
 */
export const drawerFullScreenPanelClass = 'flex flex-col bg-surface-0 shadow-overlay-lg dark:bg-surface-800 transition-opacity duration-(--transition-duration-base) ease-in-out h-screen w-screen opacity-0';

export type DrawerPanelVariantProps = VariantProps<typeof drawerPanelVariants>;

/** Applied via direct `classList` manipulation once the panel should slide into view — see the class doc above for why not a CVA variant. */
export const ENTER_TRANSFORM_CLASS: Record<DrawerPosition, string> = {
  left: 'translate-x-0',
  right: 'translate-x-0',
  top: 'translate-y-0',
  bottom: 'translate-y-0',
};

/** The class each position starts with (baked into `drawerPanelVariants`) and restores on exit. */
export const EXIT_TRANSFORM_CLASS: Record<DrawerPosition, string> = {
  left: '-translate-x-full',
  right: 'translate-x-full',
  top: '-translate-y-full',
  bottom: 'translate-y-full',
};

/** `fullScreen`'s own enter/exit pair — opacity, not a translate, see `drawerFullScreenPanelClass`'s own doc. */
export const FULLSCREEN_ENTER_CLASS = 'opacity-100';
export const FULLSCREEN_EXIT_CLASS = 'opacity-0';
