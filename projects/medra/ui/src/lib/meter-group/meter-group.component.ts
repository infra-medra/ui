import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, computed, contentChild, input, numberAttribute } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonSeverity, SOLID_SEVERITY_BG } from '../button/button.styles';
import { IconComponent } from '../icon/icon.component';
import { PROGRESS_BAR_TRACK_SIZE_CLASS, ProgressBarSize } from '../progress-bar/progress-bar.styles';
import { mergeClasses } from '../utils/merge-classes';
import { MeterItem } from './meter-group.types';

/** Rotates through the palette by position for any item that doesn't set its own `severity`. */
const DEFAULT_SEVERITIES: readonly ButtonSeverity[] = ['primary', 'info', 'success', 'warn', 'help', 'danger', 'secondary', 'contrast'];

/** Track thickness in the cross axis — width in `orientation="vertical"`, height (the existing `PROGRESS_BAR_TRACK_SIZE_CLASS`) in `orientation="horizontal"`. */
const VERTICAL_TRACK_WIDTH_CLASS: Record<ProgressBarSize, string> = {
  sm: 'w-1.5',
  default: 'w-2.5',
  lg: 'w-4',
};

/**
 * MeterGroup primitive (Tier 3, last item — completes Tier 3). A single
 * segmented bar showing several related quantities at once (disk usage by
 * file type, budget spent by category, ...) as proportional-width
 * segments, each colored from `MeterItem.severity` — reuses
 * `SOLID_SEVERITY_BG` (Button's own severity palette) rather than a
 * free-form CSS color per item, same tokenized-color precedent every other
 * severity-driven component in this library (Tag, Badge, ProgressBar) already
 * follows.
 *
 * The bar itself is `aria-hidden="true"`: relative segment widths aren't
 * perceivable non-visually, and there's a real accessible source of truth
 * right below it — the legend list, plain text (`label` + `value` + `unit`
 * per item), same "the meaningful info lives in real text elsewhere, the
 * visual is decorative" precedent `SkeletonComponent` already established
 * for its own `aria-hidden`. `unit` defaults to `'%'` but is a plain string
 * (e.g. `' GB'`) — `value` isn't required to already *be* a percentage of
 * `max`, the disk-usage-by-category shape is a value in real units (GB)
 * against a real total (the disk size), not a pre-computed percentage.
 *
 * **Scope cut for v1**: segments aren't individually interactive
 * (no click/hover callout) — this is a static summary visualization, not a
 * chart component; can layer on later without an API break.
 *
 * **`class` sizes the whole component (host), not just the bar** — the
 * legend sits below it as a separate block, so a consumer width constraint
 * (e.g. `max-w-lg`) needs to apply to both, not just the bar alone. Also
 * sidesteps the same static-`class`-leaks-to-host issue `ScrollPanel`'s own
 * doc describes: routing `class` only to the bar while the host stayed
 * bare would have put the same width on both anyway, just inconsistently
 * (the legend, a separate sibling, would never have picked it up at all).
 *
 * **`min`/`orientation`/`labelPosition`/5 templates**, API . `min` (default `0`) shifts the percent
 * formula to `((value - min) / (max - min)) * 100` — this also introduces rounding to whole
 * percents, a minor precision change from the previous unrounded width for the `min=0` default
 * case. `orientation="vertical"` stacks segments top-to-bottom (height instead of width) and needs
 * an explicit `verticalHeight` (default `'12rem'`) — same reason Carousel's own
 * `verticalViewPortHeight` exists: a vertical track has no natural size to derive its length from,
 * which measures and freezes the *already-rendered horizontal* height in `ngAfterViewInit`, a
 * DOM-measurement trick this library avoids in favor of an explicit input (same call already made
 * for Carousel). `labelPosition` (`'start'|'end'`, default `'end'`, unchanged) moves the legend
 * before/after the bar instead of always after.
 *
 * **All 5 templates use this library's own named-`contentChild` idiom**
 * (`TableColumnComponent.editTemplate`, and now also Carousel's
 * `#item`/`#header`/`#footer` and Timeline's `#content`/`#marker`/
 * `#opposite`)
 * (`dataP`, `class`, pass-through style objects, ...) — this library has no
 * passthrough/`cx()` styling system to hand a template, so each context is
 * trimmed to what's actually usable here:
 * - `#label` replaces the whole legend list — `{ $implicit: value,
 *   totalPercent }`.
 * - `#meter` replaces one segment's own content — `{ $implicit: item,
 *   index, percent }` — still sized/positioned by this component (a
 *   `flex`-item div sharing the exact width/height math the default
 *   segment uses), same "wrapper owns geometry, projected content owns
 *   appearance" split Carousel's own `#item` slot already uses.
 * - `#start`/`#end` are extra unstyled slots immediately before/after the
 *   bar — `{ $implicit: value }` — same consumer-owns-the-markup
 *   philosophy `Card`'s `medCardHeader`/`medCardFooter` already uses.
 * - `#icon` overrides the per-item legend icon — `{ $implicit: item }` —
 *   an alternative to the existing `MeterItem.icon` string, same
 *   template-vs-string-prop precedent this session's `Card`
 *   (`medCardTitle` vs `title`) and `Tag` (`ng-content` vs `value`) already
 *   established; only consulted when the legend actually renders.
 */
@Component({
  selector: 'med-meter-group',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: `
    @if (labelPosition() === 'start') {
      <ng-container [ngTemplateOutlet]="legend" />
    }
    @if (startTemplate(); as start) {
      <ng-container [ngTemplateOutlet]="start" [ngTemplateOutletContext]="{ $implicit: value() }" />
    }
    <div [class]="trackClass()" [style.height]="isVertical() ? verticalHeight() : null" aria-hidden="true">
      @for (item of value(); track item.label; let i = $index) {
        @if (meterTemplate(); as meter) {
          <div [class]="isVertical() ? 'w-full' : 'h-full'" [style]="segmentSizeStyle(item)">
            <ng-container [ngTemplateOutlet]="meter" [ngTemplateOutletContext]="{ $implicit: item, index: i, percent: percentFor(item) }" />
          </div>
        } @else {
          <div [class]="defaultSegmentClass(item, i)" [style]="segmentSizeStyle(item)"></div>
        }
      }
    </div>
    @if (endTemplate(); as end) {
      <ng-container [ngTemplateOutlet]="end" [ngTemplateOutletContext]="{ $implicit: value() }" />
    }
    @if (labelPosition() === 'end') {
      <ng-container [ngTemplateOutlet]="legend" />
    }

    <ng-template #legend>
      @if (value().length > 0) {
        @if (labelTemplate(); as label) {
          <ng-container [ngTemplateOutlet]="label" [ngTemplateOutletContext]="{ $implicit: value(), totalPercent: totalPercent() }" />
        } @else {
          <ul [class]="showLegend() ? 'mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm' : 'sr-only'">
            @for (item of value(); track item.label; let i = $index) {
              <li class="flex items-center gap-1.5">
                @if (showLegend()) {
                  <span class="size-2.5 shrink-0 rounded-full" [class]="segmentClass(item, i)"></span>
                  @if (iconTemplate(); as icon) {
                    <ng-container [ngTemplateOutlet]="icon" [ngTemplateOutletContext]="{ $implicit: item }" />
                  } @else if (item.icon) {
                    <med-icon [name]="item.icon" variant="mini" class="size-3.5 shrink-0 text-surface-500 dark:text-surface-400" />
                  }
                }
                <span [class]="showLegend() ? 'text-surface-700 dark:text-surface-200' : ''">{{ item.label }}</span>
                <span [class]="showLegend() ? 'text-surface-500 dark:text-surface-400' : ''">{{ item.value }}{{ unit() }}</span>
              </li>
            }
          </ul>
        }
      }
    </ng-template>
  `,
})
export class MeterGroupComponent {
  readonly value = input<readonly MeterItem[]>([]);
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly size = input<ProgressBarSize>('default');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** Explicit track length for `orientation="vertical"` (any CSS length) — ignored otherwise. */
  readonly verticalHeight = input('12rem');
  readonly labelPosition = input<'start' | 'end'>('end');
  readonly showLegend = input(true, { transform: booleanAttribute });
  /** Suffix appended after each legend value, e.g. `' GB'`. Default `'%'`. */
  readonly unit = input('%');
  readonly class = input('', { alias: 'class' });

  protected readonly labelTemplate = contentChild('label', { read: TemplateRef });
  protected readonly meterTemplate = contentChild('meter', { read: TemplateRef });
  protected readonly startTemplate = contentChild('start', { read: TemplateRef });
  protected readonly endTemplate = contentChild('end', { read: TemplateRef });
  protected readonly iconTemplate = contentChild('icon', { read: TemplateRef });

  protected readonly isVertical = computed(() => this.orientation() === 'vertical');

  protected readonly hostClass = computed(() => mergeClasses('block', this.class()));

  protected readonly trackClass = computed(() =>
    mergeClasses(
      'flex overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700',
      this.isVertical() ? `flex-col ${VERTICAL_TRACK_WIDTH_CLASS[this.size()]}` : `w-full ${PROGRESS_BAR_TRACK_SIZE_CLASS[this.size()]}`,
    ),
  );

  protected readonly totalPercent = computed(() => {
    const total = this.value().reduce((sum, item) => sum + item.value, 0);
    return this.percent(total);
  });

  private percent(value: number): number {
    const min = this.min();
    const max = this.max();
    if (max === min) {
      return 100;
    }
    const pct = ((value - min) / (max - min)) * 100;
    return Math.round(Math.min(100, Math.max(0, pct)));
  }

  protected percentFor(item: MeterItem): number {
    return this.percent(item.value);
  }

  protected segmentSizeStyle(item: MeterItem): Record<string, string> {
    const percent = `${this.percentFor(item)}%`;
    return this.isVertical() ? { height: percent } : { width: percent };
  }

  protected segmentClass(item: MeterItem, index: number): string {
    return SOLID_SEVERITY_BG[item.severity ?? DEFAULT_SEVERITIES[index % DEFAULT_SEVERITIES.length]];
  }

  protected defaultSegmentClass(item: MeterItem, index: number): string {
    return mergeClasses(
      'transition-[width,height] duration-(--transition-duration-base)',
      this.isVertical() ? 'w-full' : 'h-full',
      this.segmentClass(item, index),
    );
  }
}
