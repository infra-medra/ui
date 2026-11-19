import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { BadgeComponent, BadgeSize } from '../badge/badge.component';
import { ButtonSeverity } from '../button/button.styles';
import { mergeClasses } from '../utils/merge-classes';
import { OverlayBadgePosition } from './overlay-badge.types';

const POSITION_CLASS: Record<OverlayBadgePosition, string> = {
  'top-right': 'absolute -top-1.5 -right-1.5',
  'top-left': 'absolute -top-1.5 -left-1.5',
  'bottom-right': 'absolute -bottom-1.5 -right-1.5',
  'bottom-left': 'absolute -bottom-1.5 -left-1.5',
};

/**
 * OverlayBadge primitive (Tier 3, last item — completes Tier 3): the
 * positioning wrapper that overlays a small `Badge` on a corner of
 * whatever it wraps (`<med-overlay-badge value="5"><med-icon
 * name="bell" /></med-overlay-badge>`) — separate from `BadgeComponent`
 * itself (a standalone circular indicator, no positioning opinion), same
 * split `BadgeComponent`'s own doc already calls out.
 *
 * `value` is plain data (a count, a status), not UI text this library owns
 * — so unlike every other user-facing string in this codebase, there's no
 * English default to give it, and no built-in accessible announcement of
 * it either: the visible digit is `aria-hidden` on the badge, and an
 * optional `badgeAriaLabel` (e.g. `"5 unread notifications"`) renders as a
 * `sr-only` span alongside it. Left unset, the badge is purely decorative
 * from an assistive-tech point of view — correct for a badge whose meaning
 * is already carried by surrounding context (e.g. right next to a "Cart"
 * label), wrong for a bare icon; the consumer is in the best position to
 * know which case they're in.
 *
 * `size` defaults to `'sm'` here, not `Badge`'s own `'default'`: an overlay
 * badge sits on top of whatever it wraps, which is usually icon-scale
 * content (24-40px) — at Badge's standalone default height (20px) a
 * multi-character value like `"99+"` widens into a pill that visually
 * swallows a small icon almost entirely, leaving barely a sliver of it
 * visible. `size="default"`/`"lg"` are still available for larger wrapped
 * content (e.g. a big avatar).
 *
 * The separating ring around the badge is thinner in `dot` mode
 * (`ring-1`) than for a value/count badge (`ring-2`): a dot at `sm` size is
 * only 6px across, so a 2px ring — proportioned for the 16px+ value
 * badge — reads as a blob swallowing the dot rather than a thin outline.
 */
@Component({
  selector: 'med-overlay-badge',
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative inline-flex' },
  template: `
    <ng-content />
    @if (!hidden()) {
      <med-badge [severity]="severity()" [size]="size()" [dot]="dot()" [class]="badgeClass()">
        @if (!dot()) {
          <span aria-hidden="true">{{ value() }}</span>
        }
        @if (badgeAriaLabel()) {
          <span class="sr-only">{{ badgeAriaLabel() }}</span>
        }
      </med-badge>
    }
  `,
})
export class OverlayBadgeComponent {
  readonly value = input<string | number | null>(null);
  readonly severity = input<ButtonSeverity>('danger');
  readonly size = input<BadgeSize>('sm');
  readonly dot = input(false, { transform: booleanAttribute });
  readonly position = input<OverlayBadgePosition>('top-right');
  /** Hides the badge entirely (e.g. a notification count of 0) while still rendering the wrapped content. */
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly badgeAriaLabel = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  protected readonly badgeClass = computed(() =>
    mergeClasses(POSITION_CLASS[this.position()], this.dot() ? 'ring-1 ring-surface-0 dark:ring-surface-900' : 'ring-2 ring-surface-0 dark:ring-surface-900', this.class()),
  );
}
