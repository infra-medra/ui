import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, booleanAttribute, computed, input, model, output, viewChild, viewChildren } from '@angular/core';
import { ButtonSeverity, buttonVariants } from '../button/button.styles';
import { IconComponent } from '../icon/icon.component';
import { MenuItem } from '../menu/menu.types';
import { RippleDirective } from '../ripple/ripple.directive';
import { mergeClasses } from '../utils/merge-classes';
import { DIRECTION_CLOSED_OFFSET_CLASS, DIRECTION_CONTAINER_CLASS, SpeedDialDirection } from './speed-dial.styles';

export type SpeedDialType = 'linear' | 'circle' | 'semi-circle' | 'quarter-circle';

/**
 * SpeedDial primitive (Tier 3): a circular main button that reveals a row
 * (or column) of smaller action buttons — `items` reuses the plain
 * `MenuItem` shape (label/icon/disabled/command), no nested `items`, since
 * every real SpeedDial reference is a flat action list, never a submenu
 * tree.
 *
 * Item buttons are always in the DOM (not `@if`-removed) and toggle
 * between two baked-in transform/opacity states, the same "class-toggle,
 * not enter/exit removal" technique `drawer.styles.ts` already uses for its
 * own slide — `pointer-events-none` and `tabIndex={-1}` while closed keep
 * them out of both the click and Tab order without needing them gone from
 * the DOM (which would forfeit the transition entirely).
 *
 * **Scope cut for v1**: only the four linear directions (`up`/`down`/
 * `left`/`right`)
 * real trigonometry to place each item along an arc, meaningfully more
 * work than a flex row/column for a component whose actual value (a
 * FAB that reveals related actions) doesn't depend on which of the two
 * layouts it uses. No outside-click auto-close either: the dial only
 * toggles on its own main button or an item pick, simpler than adding a
 * document-level listener for a widget that (unlike this lib's overlays)
 * isn't rendered through `OverlayService` at all — it's plain inline
 * content, so there's no shared "close on outside click" machinery to hook
 * into for free the way Select/Menu/Popover get it.
 */
@Component({
  selector: 'med-speed-dial',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  imports: [IconComponent, RippleDirective],
  template: `
    @if (open() && mask()) {
      <div class="fixed inset-0 z-40 bg-surface-950/50" (click)="closeFromMask()"></div>
    }
    <div class="relative z-50 inline-flex items-center gap-2" [class]="containerDirectionClass()" (keydown)="onKeydown($event)">
      <button
        #mainButton
        type="button"
        [class]="mainButtonClass()"
        medRipple
        [medRippleDisabled]="effectiveDisabled()"
        [attr.aria-label]="toggleLabel()"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
      >
        <med-icon [name]="activeIcon()" variant="mini" [class]="mainIconClass()" />
      </button>
      @for (item of items(); track $index; let i = $index) {
        <button
          #itemButton
          type="button"
          [disabled]="item.disabled"
          [tabIndex]="open() ? 0 : -1"
          [attr.aria-label]="item.label"
          [class]="itemButtonClass()"
          [style.transform]="itemTransform(i)"
          [style.transition-delay.ms]="i * transitionDelay()"
          medRipple
          [medRippleDisabled]="!!item.disabled"
          (click)="activate(item)"
        >
          @if (item.icon) {
            <med-icon [name]="item.icon" variant="mini" class="size-4" />
          }
        </button>
      }
    </div>
  `,
})
export class SpeedDialComponent {
  readonly items = input<readonly MenuItem[]>([]);
  readonly direction = input<SpeedDialDirection>('up');
  readonly severity = input<ButtonSeverity>('primary');
  readonly icon = input('plus');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** A dark backdrop behind the open dial, closing it on click — same "focus the interaction, dim the rest" affordance overlay components already use, even though the dial itself is plain inline content, not an `OverlayService` overlay. */
  readonly mask = input(false, { transform: booleanAttribute });
  /** Stagger, in ms, between each item's transition start (item `i` gets `i * transitionDelay`ms) — `0` (default) keeps every item animating in lockstep. */
  readonly transitionDelay = input(0);
  /** Layout geometry: `'linear'` (default) or radial (`'circle'`, `'semi-circle'`, `'quarter-circle'`). */
  readonly type = input<SpeedDialType>('linear');
  /** Radius in pixels for radial layouts (`circle`, `semi-circle`, `quarter-circle`). */
  readonly radius = input(80);
  /** Optional icon when closed (falls back to `icon`). */
  readonly showIcon = input<string | undefined>(undefined);
  /** Optional icon when open (falls back to `showIcon` / `icon`). */
  readonly hideIcon = input<string | undefined>(undefined);
  /** Two-way bound open state. */
  readonly visible = model(false);
  protected readonly effectiveDisabled = computed(() => this.disabled());

  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly toggleLabel = input('Toggle actions');

  readonly itemSelect = output<MenuItem>();

  protected readonly open = this.visible;
  protected readonly isRadial = computed(() => this.type() !== 'linear');
  protected readonly activeIcon = computed(() =>
    this.open() ? (this.hideIcon() ?? this.showIcon() ?? this.icon()) : (this.showIcon() ?? this.icon()),
  );

  private readonly mainButtonRef = viewChild.required<ElementRef<HTMLButtonElement>>('mainButton');
  private readonly itemButtonRefs = viewChildren<ElementRef<HTMLButtonElement>>('itemButton');
  private wasOpen = false;

  constructor() {
    // Focus management (Wave 2 fix): opening had no focus handoff — the
    // item buttons became reachable (`tabIndex` flips from -1 to 0) but
    // nothing moved focus onto the first one, and closing (Escape or an
    // item pick) never returned it to the main button either.
    // `afterRenderEffect`, not a plain `effect()`, so the DOM has actually
    // caught up with `open()` before a `.focus()` call — same reasoning
    // `TerminalComponent`'s own scroll-into-view and `InplaceComponent`'s
    // own focus-management fix already document.
    afterRenderEffect(() => {
      const isOpen = this.open();
      if (isOpen === this.wasOpen) {
        return;
      }
      this.wasOpen = isOpen;
      if (isOpen) {
        this.focusItem(this.firstEnabledIndex());
      } else {
        this.mainButtonRef().nativeElement.focus();
      }
    });
  }

  protected readonly containerDirectionClass = computed(() =>
    this.isRadial() ? 'justify-center' : DIRECTION_CONTAINER_CLASS[this.direction()],
  );

  protected readonly mainButtonClass = computed(() =>
    mergeClasses(buttonVariants({ severity: this.severity(), variant: 'filled', size: 'lg', pill: true, iconOnly: true }), this.effectiveDisabled() ? 'pointer-events-none opacity-(--opacity-disabled)' : ''),
  );

  protected readonly mainIconClass = computed(() =>
    mergeClasses('size-5 transition-transform duration-(--transition-duration-base)', this.open() && !this.hideIcon() ? 'rotate-45' : ''),
  );

  /**
   * `disabled:opacity-0` alongside the plain `opacity-0`, not just the
   * latter alone: `buttonVariants`' own base already carries
   * `disabled:opacity-(--opacity-disabled)`, a `:disabled`-qualified rule
   * that beats a bare `opacity-0` on CSS specificity for an actually-disabled
   * item button — closed would otherwise still show a disabled item faintly
   * (its real dimmed-while-open look) instead of fully hidden. Matching the
   * same `disabled:` prefix puts both rules in the same tailwind-merge
   * conflict group, so the later one (this one) deterministically replaces
   * the base's instead of leaving two same-specificity rules for the
   * cascade to arbitrate.
   */
  protected readonly itemButtonClass = computed(() => {
    const base = buttonVariants({ severity: 'secondary', variant: 'filled', size: 'default', pill: true, iconOnly: true });
    const radialClass = this.isRadial() ? 'absolute' : '';
    const closedOffset = this.isRadial() ? '' : DIRECTION_CLOSED_OFFSET_CLASS[this.direction()];
    const visibility = this.open() ? 'scale-100 opacity-100' : `pointer-events-none scale-75 opacity-0 disabled:opacity-0 ${closedOffset}`;
    return mergeClasses(base, radialClass, 'shadow-overlay-md transition-all duration-(--transition-duration-base)', visibility);
  });

  protected itemTransform(index: number): string | null {
    const mode = this.type();
    if (mode === 'linear') {
      return null;
    }
    if (!this.open()) {
      return 'translate(0px, 0px) scale(0.75)';
    }
    const count = this.items().length;
    if (count === 0) {
      return null;
    }

    const r = this.radius();
    const startAngleByDirection: Record<SpeedDialDirection, number> = {
      up: -Math.PI,
      down: 0,
      left: Math.PI / 2,
      right: -Math.PI / 2,
    };

    let angle: number;
    if (mode === 'circle') {
      angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    } else if (mode === 'semi-circle') {
      const step = count > 1 ? Math.PI / (count - 1) : 0;
      angle = startAngleByDirection[this.direction()] + step * index;
    } else {
      const step = count > 1 ? Math.PI / 2 / (count - 1) : 0;
      angle = startAngleByDirection[this.direction()] + step * index;
    }

    const x = Math.round(r * Math.cos(angle));
    const y = Math.round(r * Math.sin(angle));
    return `translate(${x}px, ${y}px)`;
  }

  protected toggle(): void {
    if (this.effectiveDisabled()) {
      return;
    }
    this.open.update((value) => !value);
  }

  protected closeFromMask(): void {
    this.open.set(false);
  }

  protected activate(item: MenuItem): void {
    if (item.disabled) {
      return;
    }
    item.command?.();
    this.itemSelect.emit(item);
    this.open.set(false);
  }

  /**
   * Escape-to-close and arrow-key navigation between item buttons (Wave 2
   * fix) — previously the dial had no keyboard interaction beyond native
   * Tab order once open. Mirrors the same wrapping, disabled-skipping
   * roving-focus model `SelectButtonComponent`/`TabsComponent` already use.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.open()) {
        event.preventDefault();
        this.open.set(false);
      }
      return;
    }
    if (!this.open()) {
      return;
    }

    const buttons = this.itemButtonRefs();
    const currentIndex = buttons.findIndex((ref) => ref.nativeElement === document.activeElement);
    if (currentIndex === -1) {
      return;
    }

    let targetIndex: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = this.nextEnabledIndex(currentIndex, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        targetIndex = this.nextEnabledIndex(currentIndex, -1);
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = this.firstEnabledIndex();
        break;
      case 'End':
        event.preventDefault();
        targetIndex = this.lastEnabledIndex();
        break;
    }

    if (targetIndex !== null) {
      this.focusItem(targetIndex);
    }
  }

  private focusItem(index: number): void {
    this.itemButtonRefs()[index]?.nativeElement.focus();
  }

  private enabledIndexes(): number[] {
    return this.items()
      .map((item, index) => (item.disabled ? -1 : index))
      .filter((index) => index !== -1);
  }

  private firstEnabledIndex(): number {
    return this.enabledIndexes()[0] ?? -1;
  }

  private lastEnabledIndex(): number {
    const enabled = this.enabledIndexes();
    return enabled[enabled.length - 1] ?? -1;
  }

  private nextEnabledIndex(fromIndex: number, step: 1 | -1): number | null {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return null;
    }
    const position = enabled.indexOf(fromIndex);
    const nextPosition = position === -1 ? (step === 1 ? 0 : enabled.length - 1) : (position + step + enabled.length) % enabled.length;
    return enabled[nextPosition];
  }
}
