import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { MESSAGE_SEVERITY_ICON, MessageSeverity } from '../message/message.styles';
import { mergeClasses } from '../utils/merge-classes';

/** Text color per severity — reuses the same amber/etc. tone family `message.styles.ts` already established for the icon, just applied to the text here since there's no card background to contrast against. */
const TEXT_CLASS: Record<MessageSeverity, string> = {
  info: 'text-info-600 dark:text-info-400',
  success: 'text-success-600 dark:text-success-400',
  warn: 'text-warn-600 dark:text-warn-400',
  danger: 'text-danger-600 dark:text-danger-400',
};

/**
 * InlineMessage primitive (Tier 3): a compact icon + short text pairing
 * meant to sit directly next to a form field (a validation hint), unlike
 * `MessageComponent`'s bordered/padded card — no background, no border, no
 * close button, `inline-flex` instead of `block`. Reuses
 * `MESSAGE_SEVERITY_ICON` from `message.styles.ts` for the icon (same
 * severity → icon mapping Message/Toast already established) rather than a
 * second parallel map.
 */
@Component({
  selector: 'med-inline-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex', role: 'status', 'aria-live': 'polite' },
  imports: [IconComponent],
  template: `
    <span [class]="wrapperClass()">
      <med-icon [name]="iconName()" variant="mini" class="size-4 shrink-0" />
      <span class="truncate"><ng-content /></span>
    </span>
  `,
})
export class InlineMessageComponent {
  readonly severity = input<MessageSeverity>('info');
  readonly class = input('', { alias: 'class' });

  protected readonly iconName = computed(() => MESSAGE_SEVERITY_ICON[this.severity()]);
  protected readonly wrapperClass = computed(() => mergeClasses('inline-flex items-center gap-1.5 text-sm', TEXT_CLASS[this.severity()], this.class()));
}
