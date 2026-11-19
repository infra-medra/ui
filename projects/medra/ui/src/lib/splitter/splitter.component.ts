import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, computed, contentChildren, effect, inject, input, model, output } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { SplitterGutterComponent } from './splitter-gutter.component';
import { SplitterPanelComponent } from './splitter-panel.component';
import { SplitterGutterLike, SplitterHost } from './splitter.tokens';
import { SplitterOrientation } from './splitter.types';

export type SplitterStateStorage = 'session' | 'local';

export interface SplitterResizeStartEvent {
  readonly originalEvent: PointerEvent;
  readonly sizes: readonly number[];
}

export interface SplitterResizeEndEvent {
  readonly sizes: readonly number[];
}

interface DragState {
  readonly gutterIndex: number;
  readonly startPointerPos: number;
  readonly startSizes: readonly number[];
  readonly containerSize: number;
}

/** Keyboard step size, in percentage points, per Arrow key press. */
const KEYBOARD_STEP = 1;

/**
 * Splitter primitive (Tier 3, last item — completes Tier 3). Resizable
 * panes, content-projected: `<med-splitter><med-splitter-panel>A</med-splitter-panel>
 * <med-splitter-gutter/><med-splitter-panel>B</med-splitter-panel></med-splitter>`.
 *
 * **Gutters are explicit, consumer-authored elements, not auto-inserted
 * between panels** —, this
 * library's Panel/Tab/AccordionTab precedent is always "children declared
 * directly in the consumer's template", and there's no way to splice a
 * generated element *between* projected `<ng-content>` children without
 * DOM-manipulation tricks. The consumer is trusted to alternate panel/
 * gutter/panel correctly, same trust boundary Tabs/Accordion already place
 * on their own content-child ordering.
 *
 * `sizes` (percentages per panel, summing to ~100) is a `model()` — set it
 * for a custom initial split (`[sizes]="[30, 70]"`), or leave it `null` for
 * an equal split; either way it stays in sync as the consumer's own
 * two-way-bound state once the user drags a gutter, the same "read the
 * current layout back out" contract `AccordionComponent`'s `activeIndex`
 * already established.
 *
 * The host itself is the flex container (`flex-row`/`flex-col` per
 * `orientation`) — **the consumer must size it** (e.g. `class="h-96"`),
 * same contract `ScrollPanel` already places on its own container: there's
 * no sane default height/width for an arbitrary pane layout to fall back to.
 *
 * **Scope cut for v1**: no nested/recursive splitters, no drag-to-resize
 * persistence to storage — both layer on top of `sizes` being a plain
 * `readonly number[]` without an API change.
 *
 * **`maxSize`/`collapsible`** live on `SplitterPanelComponent` itself — see its own doc.
 * Collapsing/restoring goes through `toggleCollapse()` here (not the gutter) for the same reason
 * `startResize`/`continueResize`/ `endResize` do: the percentage math and both neighboring panels'
 * state live on the parent, the gutter only forwards the raw interaction.
 */
@Component({
  selector: 'med-splitter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  providers: [{ provide: SplitterHost, useExisting: SplitterComponent }],
  template: `<ng-content />`,
})
export class SplitterComponent implements SplitterHost {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  readonly orientation = input<SplitterOrientation>('horizontal');
  readonly sizes = model<readonly number[] | null>(null);
  readonly stateKey = input<string | null>(null);
  readonly stateStorage = input<SplitterStateStorage>('session');
  readonly class = input('', { alias: 'class' });

  readonly resizeStart = output<SplitterResizeStartEvent>();
  readonly resizeEnd = output<SplitterResizeEndEvent>();

  protected readonly panels = contentChildren(SplitterPanelComponent);
  protected readonly gutters = contentChildren(SplitterGutterComponent);

  private dragState: DragState | null = null;
  /** Pre-collapse size of a collapsed panel, keyed by panel index — restored on the next double-click. */
  private readonly collapsedSizes = new Map<number, number>();
  private restoredKey: string | null = null;

  protected readonly hostClass = computed(() =>
    mergeClasses('flex overflow-hidden', this.orientation() === 'horizontal' ? 'flex-row' : 'flex-col', this.class()),
  );

  /** Falls back to an equal split whenever `sizes()` is unset or its length doesn't match the current panel count. */
  private readonly resolvedSizes = computed<readonly number[]>(() => {
    const panels = this.panels();
    const explicit = this.sizes();
    if (explicit && explicit.length === panels.length) {
      return explicit;
    }
    return panels.map(() => (panels.length === 0 ? 0 : 100 / panels.length));
  });

  constructor() {
    effect(() => {
      const key = this.stateKey();
      const panels = this.panels();
      if (!key || panels.length === 0 || this.restoredKey === key) {
        return;
      }
      this.restoredKey = key;
      const saved = this.readStoredSizes(key);
      if (saved && saved.length === panels.length) {
        this.sizes.set(saved);
      }
    });
    effect(() => {
      const sizes = this.resolvedSizes();
      this.panels().forEach((panel, i) => panel.flexBasis.set(`${sizes[i] ?? 0}%`));
    });
    effect(() => {
      const sizes = this.resolvedSizes();
      const orientation = this.orientation();
      this.gutters().forEach((gutter, i) => {
        gutter.orientation.set(orientation);
        gutter.valueNow.set(sizes[i] ?? 0);
      });
    });
  }

  startResize(gutter: SplitterGutterLike, event: PointerEvent): void {
    const gutterIndex = this.gutters().indexOf(gutter as SplitterGutterComponent);
    if (gutterIndex === -1) {
      return;
    }
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const containerSize = this.orientation() === 'horizontal' ? rect.width : rect.height;
    if (containerSize === 0) {
      return;
    }
    const startSizes = this.resolvedSizes();
    this.dragState = {
      gutterIndex,
      startPointerPos: this.pointerPosition(event),
      startSizes,
      containerSize,
    };
    this.resizeStart.emit({ originalEvent: event, sizes: startSizes });
  }

  continueResize(gutter: SplitterGutterLike, event: PointerEvent): void {
    const drag = this.dragState;
    if (!drag || this.gutters()[drag.gutterIndex] !== gutter) {
      return;
    }
    const deltaPx = this.pointerPosition(event) - drag.startPointerPos;
    const deltaPercent = (deltaPx / drag.containerSize) * 100;
    this.applyDelta(drag.gutterIndex, drag.startSizes, deltaPercent);
  }

  endResize(_gutter: SplitterGutterLike): void {
    const wasDragging = this.dragState !== null;
    this.dragState = null;
    if (wasDragging) {
      const sizes = this.resolvedSizes();
      this.persistSizes(sizes);
      this.resizeEnd.emit({ sizes });
    }
  }

  stepResize(gutter: SplitterGutterLike, deltaPercent: number): void {
    const gutterIndex = this.gutters().indexOf(gutter as SplitterGutterComponent);
    if (gutterIndex === -1) {
      return;
    }
    this.applyDelta(gutterIndex, this.resolvedSizes(), deltaPercent * KEYBOARD_STEP);
  }

  /** Moves `deltaPercent` from the panel after the gutter to the panel before it (or back, if negative), clamped so neither crosses its own `minSize`/`maxSize`. */
  private applyDelta(gutterIndex: number, baseSizes: readonly number[], deltaPercent: number): void {
    const panels = this.panels();
    const before = baseSizes[gutterIndex];
    const after = baseSizes[gutterIndex + 1];
    if (before === undefined || after === undefined) {
      return;
    }
    const beforeMin = panels[gutterIndex]?.minSize() ?? 0;
    const beforeMax = panels[gutterIndex]?.maxSize() ?? 100;
    const afterMin = panels[gutterIndex + 1]?.minSize() ?? 0;
    const afterMax = panels[gutterIndex + 1]?.maxSize() ?? 100;
    const deltaLowerBound = Math.max(beforeMin - before, after - afterMax);
    const deltaUpperBound = Math.min(after - afterMin, beforeMax - before);
    const clampedDelta = Math.max(deltaLowerBound, Math.min(deltaUpperBound, deltaPercent));
    if (clampedDelta === 0) {
      return;
    }
    this.sizes.set(baseSizes.map((size, i) => (i === gutterIndex ? size + clampedDelta : i === gutterIndex + 1 ? size - clampedDelta : size)));
  }

  toggleCollapse(gutter: SplitterGutterLike): void {
    const gutterIndex = this.gutters().indexOf(gutter as SplitterGutterComponent);
    if (gutterIndex === -1) {
      return;
    }
    const panels = this.panels();
    if (panels[gutterIndex]?.collapsible()) {
      this.togglePanelCollapse(gutterIndex, gutterIndex + 1);
    } else if (panels[gutterIndex + 1]?.collapsible()) {
      this.togglePanelCollapse(gutterIndex + 1, gutterIndex);
    }
  }

  /** Collapses `panelIndex` to 0%, giving its space to `neighborIndex` — or, if already collapsed, restores it (taking the space back from `neighborIndex`, down to its own `minSize`). */
  private togglePanelCollapse(panelIndex: number, neighborIndex: number): void {
    const sizes = this.resolvedSizes();
    const panels = this.panels();
    const currentSize = sizes[panelIndex] ?? 0;

    if (currentSize > 0) {
      this.collapsedSizes.set(panelIndex, currentSize);
      this.sizes.set(sizes.map((size, i) => (i === panelIndex ? 0 : i === neighborIndex ? size + currentSize : size)));
      return;
    }

    const restoreSize = this.collapsedSizes.get(panelIndex) ?? panels[panelIndex]?.minSize() ?? 0;
    this.collapsedSizes.delete(panelIndex);
    const neighborMin = panels[neighborIndex]?.minSize() ?? 0;
    const takeable = Math.max(0, Math.min(restoreSize, (sizes[neighborIndex] ?? 0) - neighborMin));
    this.sizes.set(sizes.map((size, i) => (i === panelIndex ? takeable : i === neighborIndex ? size - takeable : size)));
  }

  private pointerPosition(event: PointerEvent): number {
    return this.orientation() === 'horizontal' ? event.clientX : event.clientY;
  }

  private getStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      return this.stateStorage() === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  private readStoredSizes(key: string): readonly number[] | null {
    const storage = this.getStorage();
    if (!storage) {
      return null;
    }
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number' && Number.isFinite(n))) {
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }

  private persistSizes(sizes: readonly number[]): void {
    const key = this.stateKey();
    const storage = key ? this.getStorage() : null;
    if (!key || !storage) {
      return;
    }
    try {
      storage.setItem(key, JSON.stringify(sizes));
    } catch {
      // Ignore quota / security errors in restricted storage environments.
    }
  }
}
