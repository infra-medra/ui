import { ChangeDetectionStrategy, Component, TemplateRef, computed, contentChild, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { mergeClasses } from '../utils/merge-classes';

/**
 * Timeline primitive: a vertical list of events, each a marker dot on a
 * connecting line plus consumer-supplied content
 * (`<med-timeline [value]="events"><ng-template #content let-event>...</ng-template></med-timeline>`)
 * — same single content-projection-template shape `PickList`/`OrderList`
 * already established for a data-driven list with arbitrary item markup.
 *
 * **Scope cut for v1**: always left-aligned (marker + connector on the
 * left, content on the right), no horizontal layout and no alternating
 * left/right alignment. Not a dead end: `value` is a plain array and the
 * marker/connector markup is internal, so an `align`/`layout` input can be
 * added later without breaking the current usage.
 *
 * **`#marker`** replaces the default dot for events that need something richer — an icon, a Badge,
 * an avatar — same `$implicit`-bound-to-the-event context the main `#content` template gets.
 * **`#opposite`** renders its own column *before* the marker/connector, useful for a timestamp or a
 * status label without cramming it into `#content` itself. The column only renders at all when
 * `opposite` is actually projected — with no `align`/`layout` dimension here yet (still v1-scoped,
 * see above), an always-reserved empty column would just be dead space for every consumer who has
 * no use for it.
 *
 * **Both `#marker`/`#opposite` are named template references now, and so
 * is the main content slot (`#content`)
 * — previously a bare unnamed `<ng-template>`.** Same reason Carousel's own
 * `#item` just went from unnamed to named: `contentChild.required(TemplateRef)`
 * always grabs the *first* `ng-template` it finds, so it can no longer
 * reliably resolve the content template once more than one `ng-template`
 * can be projected. Same named-`contentChild` idiom
 * `TableColumnComponent.editTemplate` already established, not a new
 * mechanism.
 *
 * Plain `<ul>`/`<li>` markup, no extra ARIA role: this is a non-interactive
 * display of content the browser and a screen reader already understand
 * as a list, the same reasoning `CardComponent` needs no special role for
 * a list of cards.
 */
export type TimelineLayout = 'vertical' | 'horizontal';
export type TimelineAlign = 'left' | 'right' | 'alternate' | 'top' | 'bottom';

@Component({
  selector: 'med-timeline',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: `
    <ul [class]="listClass()">
      @for (item of value(); track item; let last = $last; let odd = $odd) {
        <li [class]="itemClass(odd)">
          @if (oppositeTemplate(); as opposite) {
            <div class="min-w-0 flex-1 text-right">
              <ng-container [ngTemplateOutlet]="opposite" [ngTemplateOutletContext]="{ $implicit: item }" />
            </div>
          }
          <div [class]="separatorClass()">
            @if (markerTemplate(); as marker) {
              <ng-container [ngTemplateOutlet]="marker" [ngTemplateOutletContext]="{ $implicit: item }" />
            } @else {
              <span class="mt-1.5 size-3 shrink-0 rounded-full border-2 border-brand-500 bg-surface-0 dark:border-brand-400 dark:bg-surface-900"></span>
            }
            @if (!last) {
              <span [class]="connectorClass()"></span>
            }
          </div>
          <div [class]="contentClass()">
            <ng-container [ngTemplateOutlet]="contentTemplate()" [ngTemplateOutletContext]="{ $implicit: item }" />
          </div>
        </li>
      }
    </ul>
  `,
})
export class TimelineComponent<T> {
  readonly value = input<readonly T[]>([]);
  readonly layout = input<TimelineLayout>('vertical');
  readonly align = input<TimelineAlign>('left');
  readonly class = input('', { alias: 'class' });

  protected readonly contentTemplate = contentChild.required('content', { read: TemplateRef });
  protected readonly markerTemplate = contentChild('marker', { read: TemplateRef });
  protected readonly oppositeTemplate = contentChild('opposite', { read: TemplateRef });

  protected readonly hostClass = computed(() => mergeClasses('block', this.class()));
  protected readonly listClass = computed(() => (this.layout() === 'horizontal' ? 'flex flex-row items-stretch' : 'flex flex-col'));

  protected itemClass(odd: boolean): string {
    const horizontal = this.layout() === 'horizontal';
    const align = this.align();
    if (horizontal) {
      const reverse = align === 'bottom' || (align === 'alternate' && odd);
      return mergeClasses('relative flex flex-1 gap-3', reverse ? 'flex-col-reverse' : 'flex-col');
    }
    const reverse = align === 'right' || (align === 'alternate' && odd);
    return mergeClasses('relative flex gap-3', reverse ? 'flex-row-reverse' : 'flex-row');
  }

  protected separatorClass(): string {
    return this.layout() === 'horizontal' ? 'flex flex-row items-center' : 'flex flex-col items-center';
  }

  protected connectorClass(): string {
    return this.layout() === 'horizontal' ? 'h-px flex-1 bg-surface-200 dark:bg-surface-700' : 'w-px flex-1 bg-surface-200 dark:bg-surface-700';
  }

  protected contentClass(): string {
    return this.layout() === 'horizontal' ? 'min-w-0 flex-1 pr-6' : 'min-w-0 flex-1 pb-6';
  }
}
