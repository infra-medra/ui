import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/**
 * AvatarGroup primitive (Tier 3): a flex wrapper that overlaps projected
 * `med-avatar` children into a "stacked assignees" facepile —
 * `<med-avatar-group><med-avatar .../><med-avatar .../></med-avatar-group>`.
 *
 * A thin container (`class` on a flex container, no `max`/`+N` input) — a "+2 more" tile is a
 * regular avatar with `label="+2"` placed as the last projected child, not a built-in feature.
 *
 * **No forced ring/border separator between overlapping avatars**, unlike
 * the cutout ring `OverlayBadge` draws around its own `Badge`: that ring
 * only reads correctly when it shares the exact border-radius of the shape
 * it outlines. `AvatarComponent`'s visible box is an inner `<span>` sized by
 * its `shape` input, not its host — a ring drawn here on the host element
 * `ng-content` yields would clip to a border-radius this wrapper doesn't
 * control and can't safely assume (`circle` vs `square`), producing a
 * mismatched ring for `shape="square"` avatars. Same reasoning `InputGroup`
 * already documents for its own wrapper: no cross-component cascade tricks
 * onto projected content's internals. Overlap-only reads correctly for both
 * shapes; a caller wanting the separator ring can add it per-avatar with
 * `class="ring-2 ring-surface-0 dark:ring-surface-900"` on each `med-avatar`
 * (shown in the showcase demo).
 */
@Component({
  selector: 'med-avatar-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <div [class]="wrapperClass()">
      <ng-content />
    </div>
  `,
})
export class AvatarGroupComponent {
  readonly class = input('', { alias: 'class' });

  protected readonly wrapperClass = computed(() => mergeClasses('flex items-center [&>*+*]:-ml-2.5', this.class()));
}
