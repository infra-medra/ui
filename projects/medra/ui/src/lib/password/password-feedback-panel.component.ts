import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PasswordStrength } from './password-strength';
import { strengthSegmentVariants } from './password.styles';

const SEGMENT_THRESHOLD: Record<PasswordStrength, number> = { none: 0, weak: 1, medium: 2, strong: 3 };

/**
 * Internal overlay content for `PasswordComponent`'s `feedback` mode (not
 * part of the public API). Purely informational — nothing inside is
 * interactive or focusable, matching how it's opened (see
 * `password.component.ts`: shown on focus without moving DOM focus into
 * it, same non-focus-stealing pattern as `TooltipPanelComponent`).
 */
@Component({
  selector: 'med-password-feedback-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-56 p-3', role: 'status', '[id]': 'panelId()' },
  template: `
    <div class="flex gap-1">
      @for (segment of [1, 2, 3]; track segment) {
        <span [class]="segmentClass(segment)"></span>
      }
    </div>
    <p class="mt-2 text-xs text-surface-600 dark:text-surface-300">{{ label() }}</p>
  `,
})
export class PasswordFeedbackPanelComponent {
  readonly strength = input.required<PasswordStrength>();
  readonly promptLabel = input('Please enter a password');
  readonly weakLabel = input('Weak');
  readonly mediumLabel = input('Medium');
  readonly strongLabel = input('Strong');
  readonly panelId = input.required<string>();

  protected readonly label = computed(() => {
    switch (this.strength()) {
      case 'none':
        return this.promptLabel();
      case 'weak':
        return this.weakLabel();
      case 'medium':
        return this.mediumLabel();
      case 'strong':
        return this.strongLabel();
    }
  });

  protected segmentClass(segment: number): string {
    const active = segment <= SEGMENT_THRESHOLD[this.strength()];
    const strength = this.strength();
    return strengthSegmentVariants(active && strength !== 'none' ? { active: true, strength } : { active: false });
  }
}
