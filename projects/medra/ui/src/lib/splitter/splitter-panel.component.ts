import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, numberAttribute, signal } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/**
 * One pane of a `<med-splitter>` group:
 * `<med-splitter><med-splitter-panel>A</med-splitter-panel><med-splitter-gutter/><med-splitter-panel>B</med-splitter-panel></med-splitter>`.
 * `flexBasis` is pushed in by the parent `SplitterComponent` (same
 * one-directional convention `AccordionComponent` uses for `AccordionTabComponent`'s
 * `expanded`/`panelId` — see that component's doc); **not meant to be set
 * directly by consumers**. `minSize`/`maxSize`/`collapsible` stay local (the
 * parent only needs to *read* them to clamp a drag/keyboard resize, or to
 * decide which panel a gutter double-click acts on).
 *
 * **`maxSize`/`collapsible`**: following this component's own existing `minSize` convention,
 * `maxSize` is the same kind of percentage clamp in the other direction, and `collapsible` opts a
 * panel into double-clicking its adjacent gutter to hide it entirely (to `0%`, intentionally *past*
 * `minSize` — the whole point of a dedicated collapse action, same as a sidebar's collapse toggle
 * in a real IDE) and restore it back to its pre-collapse size on a second double-click.
 */
@Component({
  selector: 'med-splitter-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'panelClass()', '[style.flex]': 'flexStyle()' },
  template: `<ng-content />`,
})
export class SplitterPanelComponent {
  /** Minimum size as a percentage of the splitter's main axis. */
  readonly minSize = input(5, { transform: numberAttribute });
  /** Maximum size as a percentage of the splitter's main axis. */
  readonly maxSize = input(100, { transform: numberAttribute });
  /** Opts this panel into collapsing to 0% (and restoring) via double-click on its adjacent gutter. */
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  /** Percentage flex-basis, e.g. `'40%'` — pushed in by `SplitterComponent`. */
  readonly flexBasis = signal('0%');

  protected readonly flexStyle = computed(() => `0 0 ${this.flexBasis()}`);
  protected readonly panelClass = computed(() => mergeClasses('overflow-auto', this.class()));
}
