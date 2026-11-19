import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChildren, effect, input, model, output } from '@angular/core';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { StepsComponent } from '../steps/steps.component';
import { CONNECTOR_CLASS, StepState, stepCircleVariants } from '../steps/steps.styles';
import { StepPanelComponent } from './step-panel.component';

/**
 * Stepper primitive (Tier 3): a wizard — reuses `<med-steps>` unchanged for
 * its own header row instead of a second parallel step-indicator (same
 * "reuse the shared internal panel" precedent ContextMenu/SplitButton
 * already established for `MenuPanelComponent`), plus Next/Back buttons and
 * one content panel per step (`<med-step-panel label="...">`, same
 * declared-content-children shape `<med-tab>` already uses inside
 * `<med-tabs>`).
 *
 * **`linear` maps onto `StepsComponent`'s existing per-item `disabled`, not its all-or-nothing
 * `readonly`**: "linear" wizards still let you click back to an already-visited step's header, they
 * just block jumping *ahead* of the current one — `readonly` on `<med-steps>` would block both
 * directions, so instead `linear` disables only the header items with an index greater than
 * `activeIndex`, going through the exact mechanism `StepsComponent` already had for a per-step
 * `disabled` state (an individual author-supplied `StepPanelComponent.disabled` still composes with
 * this normally — either reason disables that one header item).
 *
 * **Next/Back don't skip a `disabled` panel automatically** — advancing by
 * one step is exactly that, a step; if a consumer disables a specific
 * panel, that only blocks *jumping to it via the header*, the same
 * "disabled narrows one interaction, not every path to that state"
 * scope already accepted for `StepsComponent` itself.
 *
 * **`orientation: 'vertical'`**. `StepsComponent` itself
 * stays horizontal-only by its own explicit design (see that file's doc)
 * — its roving-tabindex toolbar and rendering are built entirely around a
 * single horizontal `<ol class="flex items-center">`, and it's used
 * standalone elsewhere in this library as a plain progress indicator, not
 * just as Stepper's header. So `'vertical'` doesn't reuse `<med-steps>` at
 * all: it renders its own vertical step column directly, reusing only
 * `StepsComponent`'s already-shared styling primitives
 * (`stepCircleVariants`/`CONNECTOR_CLASS` from `steps.styles.ts`) for a
 * visually identical circle/connector look, rotated onto the vertical
 * axis.
 *
 * **No per-step nested content**: every `<med-step-panel>` is a sibling projected into one shared
 * `<ng-content>` region regardless of position (`StepPanelComponent`'s own `[hidden]="!active()"`
 * already narrows that shared region down to just the current step, which is what makes horizontal
 * mode work with a single content area below the header row). Nesting each step's content directly
 * under its own header would be a breaking API change to how every existing consumer authors
 * panels. Vertical mode instead keeps that same single shared content area, now positioned beside
 * the vertical step rail — a side-rail wizard layout (steps in a column on one side, one active
 * panel's content in a pane on the other), itself a common, legitimate vertical-stepper shape.
 *
 * **No roving-tabindex/Arrow-key toolbar for the vertical step column**
 * (unlike `StepsComponent`'s own horizontal one, Wave 2) — a documented
 * scope reduction for this pass: native Tab order plus click/Enter/Space
 * activation on each header button is still fully keyboard-operable, just
 * without Up/Down roving-focus wraparound. Horizontal mode is completely
 * unaffected (`<med-steps>` keeps its full roving-tabindex behavior
 * untouched).
 */
@Component({
  selector: 'med-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [StepsComponent, ButtonDirective, IconComponent],
  template: `
    <div [class]="orientation() === 'vertical' ? 'flex gap-6' : ''">
      @if (orientation() === 'vertical') {
        <nav [attr.aria-label]="ariaLabel()">
          <ol class="flex flex-col">
            @for (item of stepItems(); track item.label + '-' + $index; let i = $index; let last = $last) {
              <li class="relative pb-6 last:pb-0">
                @if (!last) {
                  <span class="absolute top-8 left-4 -ml-px h-full w-0.5" [class]="connectorClass(i)"></span>
                }
                @if (!item.disabled) {
                  <button
                    type="button"
                    class="relative flex items-center gap-3"
                    [attr.aria-current]="i === activeIndex() ? 'step' : null"
                    (click)="activeIndex.set(i)"
                  >
                    <span [class]="circleClass(i)">
                      @if (stateOf(i) === 'completed') {
                        <med-icon name="check" variant="mini" class="size-4" />
                      } @else {
                        {{ i + 1 }}
                      }
                    </span>
                    <span [class]="verticalLabelClass(i)">{{ item.label }}</span>
                  </button>
                } @else {
                  <span class="relative flex items-center gap-3 opacity-(--opacity-disabled)" [attr.aria-current]="i === activeIndex() ? 'step' : null">
                    <span [class]="circleClass(i)">
                      @if (stateOf(i) === 'completed') {
                        <med-icon name="check" variant="mini" class="size-4" />
                      } @else {
                        {{ i + 1 }}
                      }
                    </span>
                    <span [class]="verticalLabelClass(i)">{{ item.label }}</span>
                  </span>
                }
              </li>
            }
          </ol>
        </nav>
      } @else {
        <med-steps [items]="stepItems()" [(activeIndex)]="activeIndex" [ariaLabel]="ariaLabel()" />
      }
      <div [class]="orientation() === 'vertical' ? 'min-w-0 flex-1' : 'mt-4'">
        <ng-content />
      </div>
    </div>
    @if (showNavigation()) {
      <div class="mt-4 flex justify-between">
        <button medButton type="button" variant="outlined" severity="secondary" [disabled]="!canGoBack()" (click)="back()">{{ backLabel() }}</button>
        <button medButton type="button" (click)="next()">{{ isLastStep() ? completeLabel() : nextLabel() }}</button>
      </div>
    }
  `,
})
export class StepperComponent {
  readonly activeIndex = model(0);
  readonly linear = input(false, { transform: booleanAttribute });
  readonly showNavigation = input(true, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Stepper');
  readonly backLabel = input('Back');
  readonly nextLabel = input('Next');
  readonly completeLabel = input('Finish');

  /** Emitted instead of advancing when Next is clicked on the last step. */
  readonly completed = output<void>();

  protected readonly panels = contentChildren(StepPanelComponent);

  protected readonly stepItems = computed(() =>
    this.panels().map((panel, i) => ({
      label: panel.label(),
      disabled: panel.disabled() || (this.linear() && i > this.activeIndex()),
    })),
  );

  protected readonly isLastStep = computed(() => this.activeIndex() === this.panels().length - 1);
  protected readonly canGoBack = computed(() => this.activeIndex() > 0);

  /** Vertical mode's own step column — reuses `StepsComponent`'s shared styling primitives directly rather than `<med-steps>` itself, see class doc. */
  protected stateOf(index: number): StepState {
    const active = this.activeIndex();
    return index < active ? 'completed' : index === active ? 'active' : 'upcoming';
  }

  protected circleClass(index: number): string {
    return stepCircleVariants({ state: this.stateOf(index) });
  }

  protected connectorClass(index: number): string {
    return CONNECTOR_CLASS[index < this.activeIndex() ? 'complete' : 'incomplete'];
  }

  protected verticalLabelClass(index: number): string {
    return index === this.activeIndex() ? 'text-sm font-medium text-surface-900 dark:text-surface-50' : 'text-sm text-surface-500 dark:text-surface-400';
  }

  constructor() {
    effect(() => {
      const panels = this.panels();
      const active = this.activeIndex();
      panels.forEach((panel, i) => panel.active.set(i === active));
    });
  }

  protected back(): void {
    if (this.canGoBack()) {
      this.activeIndex.update((i) => i - 1);
    }
  }

  protected next(): void {
    if (this.isLastStep()) {
      this.completed.emit();
      return;
    }
    this.activeIndex.update((i) => i + 1);
  }
}
