import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, input } from '@angular/core';

/**
 * Internal overlay content for `[medTooltip]` (not part of the public API).
 * Plain text via interpolation or safe `TemplateRef` via `NgTemplateOutlet`
 * (never `innerHTML`, `M-03`).
 */
@Component({
  selector: 'med-tooltip-panel',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', role: 'tooltip', '[id]': 'panelId()' },
  template: `
    <div class="max-w-xs rounded-md bg-surface-900 px-2 py-1 text-xs text-surface-0 shadow-overlay-sm dark:bg-surface-700">
      @if (template(); as tpl) {
        <ng-container [ngTemplateOutlet]="tpl" />
      } @else {
        {{ text() }}
      }
    </div>
  `,
})
export class TooltipPanelComponent {
  readonly text = input<string | null>(null);
  readonly template = input<TemplateRef<unknown> | null>(null);
  readonly panelId = input.required<string>();
}
