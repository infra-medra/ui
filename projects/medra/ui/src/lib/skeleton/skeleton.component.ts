import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { SkeletonAnimation, SkeletonShape, skeletonVariants } from './skeleton.styles';

/**
 * Skeleton primitive (Tier 2): a loading placeholder shape. The host
 * element itself is the box — no wrapping markup, same convention as
 * Divider. Purely presentational: no state, no timer, no `role="status"`
 * of its own. `aria-hidden="true"` unconditionally: a screen reader has
 * nothing useful to announce about an empty placeholder box, and stacking
 * several of them (a common pattern — a list of skeleton rows while data
 * loads) would otherwise read as a wall of unlabeled elements. A consumer
 * that wants the "Loading" announcement itself already has
 * `ProgressSpinner` (`role="status"`) for that; wrapping a group of
 * skeletons in one is the consumer's call, not this component's.
 *
 * `width`/`height`/`borderRadius` are plain CSS length strings bound via
 * `[style]`, not Tailwind classes — these mirror real, per-instance content
 * dimensions (a skeleton for a 240px-wide thumbnail, an avatar-sized circle,
 * ...), which is what inline styles are for; forcing every possible value
 * through Tailwind's arbitrary-value class syntax would need one generated
 * utility per distinct size used anywhere in the app, for a value that was
 * never a reusable design-system choice to begin with. `size` overrides
 * both `width` and `height` at once — the common case for `shape="circle"`
 * (an avatar placeholder), where the two are always equal.
 */
@Component({
  selector: 'med-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'skeletonClass()',
    '[style.width]': 'widthStyle()',
    '[style.height]': 'heightStyle()',
    '[style.border-radius]': 'borderRadius()',
    'aria-hidden': 'true',
  },
  template: ``,
})
export class SkeletonComponent {
  readonly shape = input<SkeletonShape>('rectangle');
  readonly animation = input<SkeletonAnimation>('wave');
  readonly width = input('100%');
  readonly height = input('1rem');
  /** Overrides both `width` and `height` — mainly for `shape="circle"`, where the two are always equal. */
  readonly size = input<string | null>(null);
  readonly borderRadius = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  protected readonly widthStyle = computed(() => this.size() ?? this.width());
  protected readonly heightStyle = computed(() => this.size() ?? this.height());

  protected readonly skeletonClass = computed(() =>
    mergeClasses(skeletonVariants({ shape: this.shape(), animation: this.animation() }), this.class()),
  );
}
