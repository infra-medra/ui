import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, TemplateRef, booleanAttribute, computed, contentChild, inject, input, output, signal, viewChild } from '@angular/core';
import { ButtonSeverity, ButtonSize, ButtonStyleVariant, buttonVariants } from '../button/button.styles';
import { IconComponent } from '../icon/icon.component';
import { MenuPanelComponent, openMenuPanel } from '../menu/menu-panel.component';
import { MenuItem } from '../menu/menu.types';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { RippleDirective } from '../ripple/ripple.directive';
import { mergeClasses } from '../utils/merge-classes';

let nextSplitButtonId = 0;

/**
 * SplitButton primitive (Tier 3): a primary action button fused to a
 * dropdown-toggle button, connected via the same border-collapsing trick
 * SelectButton already established (`rounded-*-none` + `-ml-px` +
 * `focus-visible:z-10`) instead of a second parallel "connected buttons"
 * system — both sides reuse `buttonVariants` (Button's own CVA) directly,
 * so any future Button restyle applies here for free, same reasoning
 * ToggleButton already documented for reusing it.
 *
 * The dropdown itself reuses `MenuPanelComponent`/`openMenuPanel()`
 * unchanged (Menu/Menubar/ContextMenu's shared internal panel +
 * bootstrapping helper) — open/close/outside-click/Esc/focus-return all
 * come for free, the exact same wiring `MenuComponent.open()` uses, just
 * triggered by this component's own toggle button instead of an external
 * imperative call.
 *
 * **No content projection for v1** — `label`/`icon` are plain `@Input()`s, the same "simple text +
 * optional icon" scope this lib's ToggleButton (`onLabel`/`onIcon`) already settled on, rather than
 * working out how arbitrary projected content would coexist with the two-button split layout.
 */
@Component({
  selector: 'med-split-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  imports: [IconComponent, RippleDirective, NgTemplateOutlet],
  template: `
    <div class="inline-flex">
      <button type="button" [disabled]="effectiveButtonDisabled()" [class]="primaryClass()" medRipple [medRippleDisabled]="effectiveButtonDisabled()" (click)="buttonClick.emit()">
        @if (contentTemplate(); as tpl) {
          <ng-container *ngTemplateOutlet="tpl" />
        } @else {
          @if (icon()) {
            <med-icon [name]="icon()!" variant="mini" class="size-4" />
          }
          {{ label() }}
        }
      </button>
      <button
        #toggleTrigger
        type="button"
        [disabled]="effectiveToggleDisabled()"
        [class]="toggleClass()"
        aria-haspopup="menu"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-label]="toggleLabel()"
        medRipple
        [medRippleDisabled]="effectiveToggleDisabled()"
        (click)="onToggleClick($event)"
      >
        <med-icon [name]="dropdownIcon()" variant="mini" class="size-4" />
      </button>
    </div>
  `,
})
export class SplitButtonComponent implements OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly panelElementId = `med-split-button-panel-${nextSplitButtonId++}`;

  readonly label = input('');
  readonly icon = input<string | null>(null);
  readonly items = input<readonly MenuItem[]>([]);
  readonly severity = input<ButtonSeverity>('primary');
  readonly variant = input<ButtonStyleVariant>('filled');
  readonly size = input<ButtonSize>('default');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Disables only the primary action button — the dropdown toggle stays usable (e.g. the main action is unavailable right now, but its alternatives still are). Independent of `disabled`, which disables both. */
  readonly buttonDisabled = input(false, { transform: booleanAttribute });
  /** Disables only the dropdown-toggle button — the primary action stays usable. Independent of `disabled`, which disables both. */
  readonly menuButtonDisabled = input(false, { transform: booleanAttribute });
  readonly toggleLabel = input('More options');
  /** Applies pill rounding to the outer edges of the split button. */
  readonly rounded = input(false, { transform: booleanAttribute });
  /** Icon name for the dropdown toggle button. */
  readonly dropdownIcon = input('chevron-down');
  /** Optional custom template projected into the primary action button (`<ng-template #content>`). */
  readonly contentTemplate = contentChild<TemplateRef<unknown>>('content');
  /** `disabled` (both) — the part shared by both buttons before their own independent `buttonDisabled`/`menuButtonDisabled` are applied. */
  private readonly effectiveDisabled = computed(() => this.disabled());
  protected readonly effectiveButtonDisabled = computed(() => this.effectiveDisabled() || this.buttonDisabled());
  protected readonly effectiveToggleDisabled = computed(() => this.effectiveDisabled() || this.menuButtonDisabled());

  readonly buttonClick = output<void>();
  readonly dropdownClick = output<MouseEvent>();
  readonly itemSelect = output<MenuItem>();

  private readonly toggleTriggerRef = viewChild<ElementRef<HTMLButtonElement>>('toggleTrigger');
  private handle: OverlayHandle<MenuPanelComponent, void> | null = null;

  /** Mirrors `handle !== null` as a signal — `aria-expanded` is template-bound and needs a reactive source, unlike Menu's plain `isOpen` getter (only ever read imperatively there). */
  protected readonly isOpen = signal(false);

  protected readonly primaryClass = computed(() =>
    mergeClasses(
      buttonVariants({ severity: this.severity(), variant: this.variant(), size: this.size() }),
      this.rounded() ? 'rounded-l-full rounded-r-none' : 'rounded-r-none',
    ),
  );
  protected readonly toggleClass = computed(() =>
    mergeClasses(
      buttonVariants({ severity: this.severity(), variant: this.variant(), size: this.size(), iconOnly: true }),
      this.rounded() ? 'rounded-r-full rounded-l-none -ml-px focus-visible:z-10' : 'rounded-l-none -ml-px focus-visible:z-10',
    ),
  );

  protected onToggleClick(event: MouseEvent): void {
    this.dropdownClick.emit(event);
    this.toggle();
  }

  protected toggle(): void {
    if (this.handle) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    if (this.handle || this.effectiveToggleDisabled()) {
      return;
    }
    const trigger = this.toggleTriggerRef();
    if (!trigger) {
      return;
    }

    const handle = openMenuPanel(this.overlayService, trigger.nativeElement, this.items(), this.panelElementId);
    this.handle = handle;
    this.isOpen.set(true);

    handle.componentRef.instance.itemActivated.subscribe((item: MenuItem) => {
      this.itemSelect.emit(item);
      handle.close();
    });
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());

    handle.closed$.subscribe(() => {
      this.handle = null;
      this.isOpen.set(false);
    });
  }

  private close(): void {
    this.handle?.close();
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }
}
