/** What `SplitterHost` needs to know about a panel, without depending on the concrete `SplitterPanelComponent` class (see `SplitterHost`'s own doc). */
export interface SplitterPanelLike {
  minSize(): number;
  flexBasis: { set(value: string): void };
}

/** What `SplitterHost` needs to know about a gutter, without depending on the concrete `SplitterGutterComponent` class. */
export interface SplitterGutterLike {
  valueNow: { set(value: number): void };
}

/**
 * Coordinator `SplitterGutterComponent` reaches up to via DI
 * (`inject(SplitterHost)`) to drive a resize (pointer drag or arrow-key
 * step) — the reverse direction of the plain signal push-down
 * `SplitterComponent` uses for each panel's `flexBasis` and each gutter's
 * `valueNow`/`orientation`. Same shape as `AccordionHost` (see its own doc
 * for why an abstract class, not the concrete component, avoids a circular
 * import between `splitter.component.ts` and `splitter-gutter.component.ts`).
 * Takes the gutter *instance* (not a pre-resolved index), same convention
 * `AccordionHost.requestToggle(tab)` uses — the host looks up the index
 * itself via its own `contentChildren()` query, which is the one place that
 * ordering is authoritative.
 *
 * The drag lifecycle is three calls (`startResize`/`continueResize`/
 * `endResize`), not one: pointer capture is set on the *gutter's own*
 * element (same "one element owns the whole drag" shape `SliderComponent`
 * already established for its track), so `pointermove`/`pointerup` keep
 * firing there regardless of where the cursor physically is — but the
 * percentage math and the two neighboring panels' state live on the parent,
 * not the gutter, so each event has to be forwarded up rather than handled
 * locally.
 */
export abstract class SplitterHost {
  abstract startResize(gutter: SplitterGutterLike, event: PointerEvent): void;
  abstract continueResize(gutter: SplitterGutterLike, event: PointerEvent): void;
  abstract endResize(gutter: SplitterGutterLike): void;
  abstract stepResize(gutter: SplitterGutterLike, deltaPercent: number): void;
  /** Double-click on a gutter: collapses/restores whichever adjacent panel declared `collapsible` (see `SplitterComponent`'s own doc. */
  abstract toggleCollapse(gutter: SplitterGutterLike): void;
}
