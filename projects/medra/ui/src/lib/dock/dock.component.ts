import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, computed, contentChild, input, signal, viewChildren } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { MenuItem } from '../menu/menu.types';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { mergeClasses } from '../utils/merge-classes';

/** Discrete magnify falloff by index-distance from the hovered item — center item largest, immediate neighbors smaller, then back to rest-scale. */
function scaleForDistance(distance: number): number {
  if (distance === 0) {
    return 1.5;
  }
  if (distance === 1) {
    return 1.25;
  }
  if (distance === 2) {
    return 1.1;
  }
  return 1;
}

/**
 * Dock primitive (Tier 4): a macOS-style row of icon launchers that
 * magnify near the pointer (`items`, reusing `MenuItem` — same
 * label/icon/command/disabled shape Menu/SplitButton/ContextMenu already
 * share, rather than a parallel `DockItem` type).
 *
 * **Magnification is index-distance-based, not pixel-distance/Gaussian**:
 * each button tracks its own `pointerenter` and reports its index as
 * "hovered" up to the shared `hoveredIndex` signal; every button then scales
 * off `|its index - hoveredIndex|` through a small discrete falloff table.
 * The classic macOS dock effect is computed from real cursor-to-icon pixel
 * distance for a continuous, physically-accurate wave — this is a simpler
 * approximation that needs no `getBoundingClientRect()` calls or pointermove
 * listener on the whole container, and reads just as "a dock" at normal
 * icon counts and spacing.
 *
 * Each item's hover-revealed label reuses `TooltipDirective`
 * (`medTooltip`) rather than a bespoke label popup — same accessible name
 * either way, one less thing this component has to implement itself.
 *
 * **Scope cut for v1**: horizontal orientation only (`position`: `'bottom'`
 * or `'top'`, matching whichever screen edge the dock sits against) — no
 * vertical (`'left'`/`'right'`) dock, which would need the magnify
 * transform axis and every layout class flipped; same kind of "cut a
 * second axis for v1" scope decision `SliderComponent` already made for its
 * own orientation.
 *
 * **The host itself is the dock pill** (no separate wrapper `<div>`):
 * Angular applies a consumer's *static* `class="..."` attribute to a
 * component's host natively, in addition to whatever the component does
 * with its own aliased `class` input — see `ScrollPanel`'s own doc for the
 * full reasoning, and why folding the visible box into the host is the fix.
 *
 * **`#item`** : a named `TemplateRef<{ $implicit: MenuItem }>` slot, replacing each item's entire
 * rendered content — not just the icon — when projected. Same named-`contentChild` idiom
 * `#previousicon`/`#nexticon`/`#removeicon` already use on Carousel/Chip this same wave, just with
 * a context this time (those two are `void`).
 */
@Component({
  selector: 'med-dock',
  standalone: true,
  imports: [IconComponent, TooltipDirective, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'listClass()', role: 'toolbar', '[attr.aria-label]': 'ariaLabel()', '(pointerleave)': 'onLeave()' },
  template: `
    @for (item of items(); track item; let i = $index) {
      <button
        #itemButton
        type="button"
        [class]="itemClass()"
        [style.transform]="'scale(' + scaleFor(i) + ')'"
        [disabled]="item.disabled ?? false"
        [tabIndex]="tabIndexFor(item, i)"
        [attr.aria-label]="item.label"
        [medTooltip]="item.label ?? ''"
        [tooltipDisabled]="!item.label"
        (pointerenter)="hoveredIndex.set(i)"
        (focus)="onFocus(i)"
        (blur)="onBlur()"
        (click)="onActivate(item)"
        (keydown)="onKeydown($event, i)"
      >
        @if (itemTemplate(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: item }" />
        } @else {
          <med-icon [name]="item.icon ?? ''" class="size-6" />
        }
      </button>
    }
  `,
})
export class DockComponent {
  readonly items = input<readonly MenuItem[]>([]);
  readonly position = input<'bottom' | 'top'>('bottom');
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Dock');
  readonly class = input('', { alias: 'class' });

  protected readonly itemTemplate = contentChild('item', { read: TemplateRef });

  protected readonly hoveredIndex = signal<number | null>(null);

  /** ARIA APG toolbar pattern: one tab stop for the whole `role="toolbar"`, Arrow keys roving-focus between items (Wave 2 fix — previously every button was independently tabbable). */
  private readonly rovingIndex = signal(0);

  private readonly itemButtons = viewChildren<ElementRef<HTMLButtonElement>>('itemButton');

  protected readonly listClass = computed(() =>
    mergeClasses(
      'inline-flex items-end gap-1 rounded-2xl border border-surface-200 bg-surface-0/80 p-2 shadow-overlay-lg backdrop-blur-sm dark:border-surface-700 dark:bg-surface-800/80',
      this.class(),
    ),
  );

  protected readonly itemClass = computed(() =>
    mergeClasses(
      'flex items-center justify-center rounded-xl p-2 text-surface-700 transition-transform duration-(--transition-duration-fast) ease-out dark:text-surface-200',
      'hover:bg-surface-100 dark:hover:bg-surface-700',
      'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400',
      'disabled:pointer-events-none disabled:opacity-(--opacity-disabled)',
      this.position() === 'bottom' ? 'origin-bottom' : 'origin-top',
    ),
  );

  protected scaleFor(index: number): number {
    const hovered = this.hoveredIndex();
    return hovered === null ? 1 : scaleForDistance(Math.abs(index - hovered));
  }

  protected onLeave(): void {
    this.hoveredIndex.set(null);
  }

  /** Focusing an item (Tab, or a roving-tabindex Arrow move) both magnifies it and makes it the toolbar's single tab stop. */
  protected onFocus(index: number): void {
    this.hoveredIndex.set(index);
    this.rovingIndex.set(index);
  }

  /** Same magnify-reset as pointer leave, but for keyboard focus moving off an item — keeps the two input modalities visually consistent (Wave 2 fix). */
  protected onBlur(): void {
    this.hoveredIndex.set(null);
  }

  protected onActivate(item: MenuItem): void {
    if (item.disabled) {
      return;
    }
    item.command?.();
  }

  /** ARIA APG toolbar roving tabindex: only the current roving item is in the Tab order (`0`); every other enabled item is `-1` and reachable via Arrow keys instead. */
  protected tabIndexFor(item: MenuItem, index: number): number {
    if (item.disabled) {
      return -1;
    }
    return this.effectiveRovingIndex() === index ? 0 : -1;
  }

  /** Falls back to the first enabled item if the last-focused one became disabled (e.g. `items` changed under the toolbar). */
  private effectiveRovingIndex(): number {
    const items = this.items();
    const current = this.rovingIndex();
    if (items[current] && !items[current].disabled) {
      return current;
    }
    const firstEnabled = items.findIndex((it) => !it.disabled);
    return firstEnabled === -1 ? 0 : firstEnabled;
  }

  protected onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const items = this.items();
    const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i !== -1);
    if (enabled.length === 0) {
      return;
    }

    const position = enabled.indexOf(currentIndex);
    let targetIndex: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = enabled[(position + 1 + enabled.length) % enabled.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
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
      this.itemButtons()[targetIndex]?.nativeElement.focus();
    }
  }
}
