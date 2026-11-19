import { ChangeDetectionStrategy, Component, booleanAttribute, input, signal } from '@angular/core';

/**
 * One panel of a `<med-stepper>` group: `<med-stepper><med-step-panel
 * label="...">content</med-step-panel></med-stepper>`. Same
 * one-directional data flow as `TabComponent`/`TabsComponent` — visibility
 * is pushed in by the parent `StepperComponent` (via its
 * `contentChildren(StepPanelComponent)` query calling `.set()` on `active`
 * below), not looked up by this component itself. **Not meant to be set
 * directly by consumers.**
 *
 * `aria-label` comes straight from the panel's own `label` (the same text
 * shown in the `<med-steps>` header above it) rather than an
 * `aria-labelledby` pointing back at that header button — `StepsComponent`
 * doesn't expose per-item ids to link against (it wasn't designed to be a
 * tab-panel-style ARIA pair), and a self-contained `aria-label` needs no
 * cross-component id wiring to get the same result.
 */
@Component({
  selector: 'med-step-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[hidden]': '!active()',
    '[attr.aria-label]': 'label()',
  },
  template: '<ng-content />',
})
export class StepPanelComponent {
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly active = signal(false);
}
