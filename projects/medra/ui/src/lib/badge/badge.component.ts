import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { ButtonSeverity, FILLED_SEVERITY_CLASSES } from '../button/button.styles';

export type BadgeSize = 'sm' | 'default' | 'lg' | 'xl';

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'min-w-4 h-4 text-[0.625rem]',
  default: 'min-w-5 h-5 text-xs',
  lg: 'min-w-6 h-6 text-sm',
  xl: 'min-w-7 h-7 text-base',
};

const DOT_SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'size-1.5',
  default: 'size-2',
  lg: 'size-2.5',
  xl: 'size-3',
};

/**
 * Small circular status/count indicator (Tier 1) — standalone, not the
 * positioning wrapper for overlaying another element (that's the separate
 * OverlayBadge component, Tier 2). Reuses Button's filled severity colors,
 * same as Tag.
 *
 * **`badgeDisabled` hides the badge, it doesn't grey it out** : a plain visual "disabled" state
 * doesn't make sense for a non-interactive indicator, but conditionally hiding one inline
 * (`[badgeDisabled]="count === 0"`) is more ergonomic at the call site than wrapping the whole tag
 * in `@if`. Implemented here via the `hidden` attribute rather than an inline `display: none`
 * style, for the same reason any other conditional visibility toggle in this library uses it.
 */
@Component({
  selector: 'med-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex', '[attr.hidden]': "badgeDisabled() ? '' : null" },
  template: `
    <span [class]="badgeClass()">
      @if (dot()) {
        @if (ariaLabel()) {
          <span class="sr-only">{{ ariaLabel() }}</span>
        }
      } @else if (value() !== null) {
        {{ value() }}
      } @else {
        <ng-content />
      }
    </span>
  `,
})
export class BadgeComponent {
  readonly value = input<string | number | null>(null);
  readonly severity = input<ButtonSeverity>('primary');
  readonly size = input<BadgeSize>('default');
  /** No content, just a small colored dot (e.g. an "unread" indicator). */
  readonly dot = input(false, { transform: booleanAttribute });
  /**
   * Accessible label for `dot` mode, where the badge otherwise conveys
   * meaning by color alone (e.g. "unread") with nothing for assistive tech —
   * same opt-in `sr-only` pattern `OverlayBadge.badgeAriaLabel` already uses.
   * Ignored when `dot` is false, since projected content already provides
   * an accessible name in that case.
   */
  readonly ariaLabel = input<string | null>(null);
  /** Hides the badge entirely (`hidden` attribute) instead of a greyed-out visual state — see class doc. */
  readonly badgeDisabled = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  protected readonly badgeClass = computed(() =>
    mergeClasses(
      'inline-flex items-center justify-center rounded-full px-1 font-medium leading-none',
      this.dot() ? `p-0 ${DOT_SIZE_CLASS[this.size()]}` : SIZE_CLASS[this.size()],
      FILLED_SEVERITY_CLASSES[this.severity()],
      this.class(),
    ),
  );
}
