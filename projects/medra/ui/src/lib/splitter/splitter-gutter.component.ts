import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { SplitterHost } from './splitter.tokens';
import { SplitterOrientation } from './splitter.types';

/**
 * The draggable/keyboard-operable handle between two adjacent
 * `<med-splitter-panel>`s. `orientation`/`valueNow` are pushed in by the
 * parent `SplitterComponent` (same one-directional convention as
 * `AccordionTabComponent`'s `expanded` — see that component's doc); resize
 * requests go back up through `SplitterHost` instead (see its own doc for
 * the drag lifecycle and why pointer capture lives here rather than on the
 * parent).
 *
 * WAI-ARIA APG "Window Splitter" pattern: `role="separator"` with
 * `aria-valuenow`/`aria-valuemin`/`aria-valuemax` reporting the size (as a
 * percentage) of the panel *before* this gutter, and Arrow keys nudging it
 * — not a `role="slider"`, which implies a value the *separator itself*
 * represents rather than a boundary between two other things.
 *
 * Double-click collapses/restores whichever adjacent panel opted in via `collapsible`).
 */
@Component({
  selector: 'med-splitter-gutter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-valuenow]': 'Math.round(valueNow())',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[class]': 'gutterClass()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
    '(keydown)': 'onKeydown($event)',
    '(dblclick)': 'onDoubleClick()',
  },
  template: ``,
})
export class SplitterGutterComponent {
  private readonly host = inject(SplitterHost);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly disabled = input(false, { transform: booleanAttribute });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Resize');
  readonly class = input('', { alias: 'class' });

  /** Pushed in by `SplitterComponent`. */
  readonly orientation = signal<SplitterOrientation>('horizontal');
  readonly valueNow = signal(0);

  protected readonly Math = Math;

  protected readonly gutterClass = computed(() =>
    mergeClasses(
      'shrink-0 touch-none bg-surface-200 transition-colors duration-(--transition-duration-base) hover:bg-brand-300 dark:bg-surface-700 dark:hover:bg-brand-600',
      'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-inset focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400',
      this.orientation() === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
      this.disabled() ? 'pointer-events-none opacity-(--opacity-disabled)' : '',
      this.class(),
    ),
  );

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    this.elementRef.nativeElement.setPointerCapture(event.pointerId);
    this.host.startResize(this, event);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.disabled()) {
      return;
    }
    this.host.continueResize(this, event);
  }

  protected onPointerUp(_event: PointerEvent): void {
    this.host.endResize(this);
  }

  protected onDoubleClick(): void {
    if (this.disabled()) {
      return;
    }
    this.host.toggleCollapse(this);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    const horizontal = this.orientation() === 'horizontal';
    let delta = 0;
    switch (event.key) {
      case 'ArrowRight':
        delta = horizontal ? 1 : 0;
        break;
      case 'ArrowLeft':
        delta = horizontal ? -1 : 0;
        break;
      case 'ArrowDown':
        delta = horizontal ? 0 : 1;
        break;
      case 'ArrowUp':
        delta = horizontal ? 0 : -1;
        break;
      default:
        return;
    }
    if (delta === 0) {
      return;
    }
    event.preventDefault();
    this.host.stepResize(this, delta);
  }
}
