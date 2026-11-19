import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, computed, contentChild, input, numberAttribute } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonSeverity, SOLID_SEVERITY_BG } from '../button/button.styles';
import { mergeClasses } from '../utils/merge-classes';
import { PROGRESS_BAR_TRACK_SIZE_CLASS, ProgressBarMode, ProgressBarSize } from './progress-bar.styles';

/**
 * Linear progress indicator (Tier 1). `determinate` (default) shows a real
 * `value` (0-100, clamped); `indeterminate` sweeps a fixed-width segment
 * back and forth (`--animate-progress-indeterminate`, defined once in
 * `tailwind-theme-medraui.css` since any future component could reuse the
 * same sweep) for "in progress, duration unknown" cases (`aria-valuenow` is
 * correctly omitted in that mode, per the ARIA `progressbar` spec).
 *
 * `unit` : a plain string appended after the numeric value in the visible label (`{{ value }}{{
 * unit }}`), defaulting to `'%'`.
 *
 * **`#content`**: a named `TemplateRef<{ $implicit: number }>` slot (context: the raw numeric
 * value), replacing the value label entirely when projected. It stays gated by `showValue()` like
 * the text it replaces, since this component's existing convention is "the value label as a whole
 * is opt-in."
 */
@Component({
  selector: 'med-progress-bar',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div
      [class]="trackClass()"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="mode() === 'determinate' ? clampedValue() : null"
      [attr.aria-label]="ariaLabel()"
    >
      @if (mode() === 'determinate') {
        <div class="h-full rounded-full transition-[width] duration-(--transition-duration-base)" [class]="fillClass()" [style.width.%]="clampedValue()"></div>
      } @else {
        <div class="h-full w-1/3 rounded-full animate-progress-indeterminate" [class]="fillClass()"></div>
      }
    </div>
    @if (showValue() && mode() === 'determinate') {
      <span class="mt-1 block text-right text-xs text-surface-500 dark:text-surface-400">
        @if (contentTemplate(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: clampedValue() }" />
        } @else {
          {{ clampedValue() }}{{ unit() }}
        }
      </span>
    }
  `,
})
export class ProgressBarComponent {
  readonly value = input(0, { transform: numberAttribute });
  readonly severity = input<ButtonSeverity>('primary');
  readonly size = input<ProgressBarSize>('default');
  readonly mode = input<ProgressBarMode>('determinate');
  readonly showValue = input(false, { transform: booleanAttribute });
  readonly unit = input('%');

  protected readonly contentTemplate = contentChild('content', { read: TemplateRef });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". Matches ProgressSpinner's own default so neither leaves screen readers with no label. */
  readonly ariaLabel = input<string | null>('Progress');
  readonly class = input('', { alias: 'class' });

  protected readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));
  protected readonly trackClass = computed(() =>
    mergeClasses('w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700', PROGRESS_BAR_TRACK_SIZE_CLASS[this.size()], this.class()),
  );
  protected readonly fillClass = computed(() => SOLID_SEVERITY_BG[this.severity()]);
}
