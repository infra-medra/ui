import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, input, model, signal, viewChildren } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { CONNECTOR_CLASS, StepState, stepCircleVariants } from './steps.styles';
import { StepItem } from './steps.types';

/**
 * Steps primitive (Tier 3): a horizontal progress/nav indicator — numbered
 * circles connected by a line, each labeled, `activeIndex` a `model()` for
 * `[(activeIndex)]` (same two-way-bindable convention Tabs already uses).
 *
 * **Roving-tabindex toolbar (Wave 2 fix — 2026-08-19):** every enabled step
 * used to be its own individually-tabbable button in plain document Tab
 * order (reasoned then as "more like independent breadcrumb links than a
 * composite control"). The Wave 2 audit flagged the total absence of
 * Arrow-key navigation against the ARIA APG expectation for a set of
 * focusable stops sharing a `role="toolbar"` container, so this now follows
 * the same roving-tabindex pattern `Dock`/`SelectButton` already use: one
 * step is the single Tab stop at a time, ArrowLeft/Right move the roving
 * stop between enabled steps with wraparound (Steps is horizontal-only, no
 * `orientation` input, so no ArrowUp/Down), Home/End jump to the first/last
 * enabled step, and a `disabled` step (rendered as a plain `<span>`, never a
 * `<button>`) is skipped automatically since it never enters the enabled
 * index list. Arrow keys only move focus, same as Dock — they don't
 * auto-activate a step the way a radiogroup's Arrow keys do; clicking (or
 * Enter/Space activating the focused button) is still what navigates
 * `activeIndex` there.
 *
 * `readonly` (default `false`) turns every step into a plain non-interactive
 * indicator — for read-only progress display (a shipping-status tracker) as
 * opposed to free navigation between already-known steps. Stepper reuses
 * this component unchanged for its own header row (`readonly` there tracks
 * its own `linear` input) rather than a second parallel step-indicator.
 */
@Component({
  selector: 'med-steps',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [IconComponent],
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ol [class]="listClass()" [attr.role]="readonly() ? null : 'toolbar'" [attr.aria-label]="readonly() ? null : ariaLabel()">
        @for (item of items(); track item.label + '-' + $index; let i = $index; let last = $last) {
          <li class="flex flex-1 items-center" [class.flex-none]="last">
            @if (!readonly() && !item.disabled) {
              <button
                #stepButton
                type="button"
                class="flex items-center gap-2"
                [attr.aria-current]="i === activeIndex() ? 'step' : null"
                [tabIndex]="tabIndexFor(i)"
                (click)="activeIndex.set(i)"
                (focus)="onFocus(i)"
                (keydown)="onKeydown($event, i)"
              >
                <span [class]="circleClass(i)">
                  @if (stateOf(i) === 'completed') {
                    <med-icon name="check" variant="mini" class="size-4" />
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
                <span [class]="labelClass(i)">{{ item.label }}</span>
              </button>
            } @else {
              <span [class]="readonlyItemClass(item.disabled)" [attr.aria-current]="i === activeIndex() ? 'step' : null">
                <span [class]="circleClass(i)">
                  @if (stateOf(i) === 'completed') {
                    <med-icon name="check" variant="mini" class="size-4" />
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
                <span [class]="labelClass(i)">{{ item.label }}</span>
              </span>
            }
            @if (!last) {
              <span class="mx-3 h-0.5 flex-1" [class]="connectorClass(i)"></span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class StepsComponent {
  readonly items = input<readonly StepItem[]>([]);
  readonly activeIndex = model(0);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('Progress');
  readonly class = input('', { alias: 'class' });

  /** ARIA APG toolbar pattern: one tab stop for the whole `role="toolbar"`, Arrow keys roving-focus between enabled steps (Wave 2 fix — previously every enabled step was independently tabbable). */
  private readonly rovingIndex = signal(0);

  private readonly stepButtons = viewChildren<ElementRef<HTMLButtonElement>>('stepButton');

  protected readonly listClass = computed(() => mergeClasses('flex items-center', this.class()));

  private enabledIndexes(): number[] {
    return this.items()
      .map((item, i) => (item.disabled ? -1 : i))
      .filter((i) => i !== -1);
  }

  /** Falls back to the active step (if enabled) or the first enabled step, e.g. after `items` changes under the toolbar. */
  private effectiveRovingIndex(): number {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return 0;
    }
    const current = this.rovingIndex();
    if (enabled.includes(current)) {
      return current;
    }
    const active = this.activeIndex();
    return enabled.includes(active) ? active : enabled[0];
  }

  /** Roving tabindex: only the current roving step is in the Tab order (`0`); every other enabled step is `-1` and reachable via Arrow keys instead. */
  protected tabIndexFor(index: number): number {
    return this.effectiveRovingIndex() === index ? 0 : -1;
  }

  /** Focusing a step (Tab, or a roving-tabindex Arrow move) makes it the toolbar's single tab stop. */
  protected onFocus(index: number): void {
    this.rovingIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return;
    }

    const position = enabled.indexOf(currentIndex);
    let targetIndex: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        targetIndex = enabled[(position + 1 + enabled.length) % enabled.length];
        break;
      case 'ArrowLeft':
        event.preventDefault();
        targetIndex = enabled[(position - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = enabled[0];
        break;
      case 'End':
        event.preventDefault();
        targetIndex = enabled[enabled.length - 1];
        break;
    }

    if (targetIndex !== null) {
      this.rovingIndex.set(targetIndex);
      const buttonPosition = enabled.indexOf(targetIndex);
      this.stepButtons()[buttonPosition]?.nativeElement.focus();
    }
  }

  protected stateOf(index: number): StepState {
    const active = this.activeIndex();
    return index < active ? 'completed' : index === active ? 'active' : 'upcoming';
  }

  protected circleClass(index: number): string {
    return stepCircleVariants({ state: this.stateOf(index) });
  }

  protected labelClass(index: number): string {
    return index === this.activeIndex() ? 'text-sm font-medium text-surface-900 dark:text-surface-50' : 'text-sm text-surface-500 dark:text-surface-400';
  }

  protected connectorClass(index: number): string {
    return CONNECTOR_CLASS[index < this.activeIndex() ? 'complete' : 'incomplete'];
  }

  protected readonlyItemClass(disabled: boolean | undefined): string {
    return mergeClasses('flex items-center gap-2', disabled ? 'opacity-(--opacity-disabled)' : '');
  }
}
