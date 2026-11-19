import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ButtonSeverity, SOLID_SEVERITY_TEXT } from '../button/button.styles';
import { mergeClasses } from '../utils/merge-classes';
import { PROGRESS_SPINNER_SIZE_CLASS, ProgressSpinnerSize } from './progress-spinner.styles';

/**
 * Indeterminate spinner (Tier 1) — always "duration unknown" (there's no
 * `determinate`/`value` mode, unlike ProgressBar; a spinner with a numeric
 * value would just be ProgressBar's job). A partial ring (`stroke-dasharray`)
 * rotated via Tailwind's built-in `animate-spin`; both circles use
 * `stroke-current` so `SOLID_SEVERITY_TEXT`'s `text-*` color drives the
 * stroke through `currentColor`, same trick as any icon.
 */
@Component({
  selector: 'med-progress-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <svg [class]="spinnerClass()" viewBox="0 0 50 50" role="status" [attr.aria-label]="ariaLabel()">
      <circle class="stroke-current opacity-20" cx="25" cy="25" r="20" fill="none" [attr.stroke-width]="strokeWidth()" />
      <circle class="stroke-current" cx="25" cy="25" r="20" fill="none" [attr.stroke-width]="strokeWidth()" stroke-linecap="round" stroke-dasharray="85 40" />
    </svg>
  `,
})
export class ProgressSpinnerComponent {
  readonly severity = input<ButtonSeverity>('primary');
  readonly size = input<ProgressSpinnerSize>('default');
  readonly strokeWidth = input<string>('5');
  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Loading');
  readonly class = input('', { alias: 'class' });

  protected readonly spinnerClass = computed(() =>
    mergeClasses('animate-spin', PROGRESS_SPINNER_SIZE_CLASS[this.size()], SOLID_SEVERITY_TEXT[this.severity()], this.class()),
  );
}
