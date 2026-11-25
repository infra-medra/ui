import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { buttonGroupVariants } from './button-group.styles';

/**
 * Container component that visually connects adjacent `button[medButton]` and
 * `a[medButton]` children into a single horizontal group with `role="group"`,
 * collapsed inner borders, square inner corners, and elevated hover/focus
 * stacking.
 */
@Component({
  selector: 'med-button-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[class]': 'hostClass()',
  },
  template: `<ng-content />`,
})
export class ButtonGroupComponent {
  /** Additional CSS classes merged onto the group host element. */
  readonly class = input('', { alias: 'class' });

  protected readonly hostClass = computed(() => mergeClasses(buttonGroupVariants(), this.class()));
}
