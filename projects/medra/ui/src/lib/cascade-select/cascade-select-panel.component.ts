import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, TemplateRef, computed, inject, input, output, signal, viewChild, viewChildren } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { IconComponent } from '../icon/icon.component';
import { MENU_PANEL_CLASS } from '../menu/menu-panel.component';
import { ConnectedOverlayOrigin, OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { selectOptionVariants } from '../select/select.styles';
import { CascadeSelectOption, CascadeSelectOptionContext } from './cascade-select.types';

let nextCascadePanelId = 0;

/** Same "cascade to the right, flip left if it doesn't fit" fallback list as TieredMenu's `SUBMENU_POSITIONS`. */
const SUBMENU_POSITIONS: ConnectedPosition[] = [
  { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 2 },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -2 },
];

/** Below `CascadeSelectComponent`'s `breakpoint` — opens stacked directly under the row instead of flying out to the side, see that component's class doc. */
const SUBMENU_POSITIONS_MOBILE: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 2 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -2 },
];

/**
 * Recursive submenu panel for CascadeSelect — structurally the same
 * cascading-overlay-chain `TieredMenuPanelComponent` already established
 * (one child handle per instance, closed automatically by `ngOnDestroy`
 * cascading down the chain, hover-intent delay before opening a submenu,
 * ArrowRight/Left submenu keyboard model), not a reuse of it: this one
 * resolves a *value* at the leaf (generic `T`, via `optionSelected`)
 * instead of running a `MenuItem.command()`, different enough in what an
 * "activation" means that sharing the component would mean threading two
 * unrelated result shapes through one class.
 *
 * `path` carries the accumulated ancestor labels down through each nested
 * level, so a leaf pick can report the full breadcrumb
 * (`{ value, path: ['USA', 'California', 'Los Angeles'] }`) back up to
 * `CascadeSelectComponent` in one shot — each level just appends its own
 * option's label before handing `path` to whichever child submenu it opens.
 */
@Component({
  selector: 'med-cascade-select-panel',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `w-full`, not just `block` (unlike TieredMenuPanel/PanelMenu's own
  // submenus, which are meant to hug content): the *top-level* panel's
  // overlay pane gets `minWidth` set to the trigger's width (see
  // CascadeSelectComponent.open()), and `.cdk-overlay-pane` is a
  // `display: flex` row container (main-axis width, not stretched by
  // default) — without `w-full` here, a plain `block` child shrink-wraps to
  // its own content (`<ul>`'s `min-w-48`) instead of filling that reserved
  // width, leaving blank space along the pane's right edge. Nested submenu
  // panels are unaffected: their own overlay pane never gets an explicit
  // width, so the percentage here resolves against an indefinite main size
  // and falls back to content-based sizing, same as plain `auto` would.
  host: { class: 'block w-full' },
  template: `
    @if (headerTemplate(); as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" />
    }
    <ul
      #list
      role="listbox"
      tabindex="-1"
      class="min-w-48 py-1 focus:outline-none"
      [attr.aria-activedescendant]="activeItemId()"
      (keydown)="onKeydown($event)"
    >
      @for (option of options(); track $index; let i = $index) {
        <li
          #itemEl
          [id]="itemId(i)"
          role="option"
          [attr.aria-disabled]="option.disabled ? 'true' : null"
          [attr.aria-haspopup]="hasChildren(option) ? 'listbox' : null"
          [attr.aria-expanded]="hasChildren(option) ? openIndex() === i : null"
          [class]="rowClass(option, i)"
          (pointerdown)="onOptionPointerDown($event, option, i)"
          (pointerenter)="onOptionPointerEnter(i, option)"
          (pointerleave)="onOptionPointerLeave()"
        >
          @if (optionTemplate(); as tpl) {
            <span class="flex-1 truncate">
              <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="optionContext(option)" />
            </span>
          } @else {
            <span class="flex-1 truncate">{{ option.label }}</span>
          }
          @if (hasChildren(option)) {
            @if (groupIconTemplate(); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl" />
            } @else {
              <med-icon name="chevron-right" variant="mini" class="size-3.5 shrink-0" />
            }
          }
        </li>
      }
    </ul>
    @if (footerTemplate(); as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" />
    }
  `,
})
export class CascadeSelectPanelComponent<T> implements AfterViewInit, OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly instanceId = nextCascadePanelId++;

  readonly panelId = input.required<string>();
  readonly options = input<readonly CascadeSelectOption<T>[]>([]);
  readonly path = input<readonly string[]>([]);
  /** Snapshot of `CascadeSelectComponent`'s breakpoint check, forwarded down through every nested level it opens — see that component's class doc. */
  readonly mobile = input(false);

  /** Element the overlay host of every level is moved to (`appendTo` of `CascadeSelectComponent`); `null` keeps the overlay container of the CDK. */
  readonly appendTarget = input<HTMLElement | null>(null);

  /** Template for each row, from the `#option` reference of `CascadeSelectComponent`; forwarded to every submenu. */
  readonly optionTemplate = input<TemplateRef<CascadeSelectOptionContext<T>> | undefined>(undefined);
  /** Template for the icon of rows with children, from `#groupIcon`; forwarded to every submenu. */
  readonly groupIconTemplate = input<TemplateRef<void> | undefined>(undefined);
  /** Template shown above the first-level list, from `#header`; not forwarded to submenus. */
  readonly headerTemplate = input<TemplateRef<void> | undefined>(undefined);
  /** Template shown below the first-level list, from `#footer`; not forwarded to submenus. */
  readonly footerTemplate = input<TemplateRef<void> | undefined>(undefined);

  readonly optionSelected = output<{ value: T; path: readonly string[] }>();
  /** Emits when a node with children opens its submenu; levels below forward theirs, like `optionSelected`. */
  readonly groupOpened = output<{ value: T | undefined; path: readonly string[] }>();
  readonly closeRequested = output<void>();
  readonly collapseRequested = output<void>();

  protected readonly activeIndex = signal(-1);
  protected readonly openIndex = signal<number | null>(null);

  private readonly listRef = viewChild.required<ElementRef<HTMLUListElement>>('list');
  private readonly itemRefs = viewChildren<ElementRef<HTMLLIElement>>('itemEl');
  private handle: OverlayHandle<CascadeSelectPanelComponent<T>, void> | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly activeItemId = computed(() => {
    const index = this.activeIndex();
    return index >= 0 ? this.itemId(index) : null;
  });

  ngAfterViewInit(): void {
    this.activeIndex.set(this.firstEnabledIndex());
    this.listRef().nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.clearHoverTimer();
    this.closeSubmenu();
  }

  protected hasChildren(option: CascadeSelectOption<T>): boolean {
    return !!option.children && option.children.length > 0;
  }

  protected optionContext(option: CascadeSelectOption<T>): CascadeSelectOptionContext<T> {
    return { $implicit: option, path: this.path(), hasChildren: this.hasChildren(option) };
  }

  protected itemId(index: number): string {
    return `${this.panelId()}-item-${index}`;
  }

  protected rowClass(option: CascadeSelectOption<T>, index: number): string {
    return selectOptionVariants({ active: index === this.activeIndex(), disabled: !!option.disabled });
  }

  protected onOptionPointerDown(event: Event, option: CascadeSelectOption<T>, index: number): void {
    event.preventDefault();
    if (option.disabled) {
      return;
    }
    this.activeIndex.set(index);
    if (this.hasChildren(option)) {
      this.openSubmenuAt(index);
    } else {
      this.select(option);
    }
  }

  protected onOptionPointerEnter(index: number, option: CascadeSelectOption<T>): void {
    if (option.disabled) {
      return;
    }
    this.activeIndex.set(index);
    this.clearHoverTimer();
    if (this.hasChildren(option)) {
      this.hoverTimer = setTimeout(() => this.openSubmenuAt(index), 150);
    } else {
      this.closeSubmenu();
    }
  }

  protected onOptionPointerLeave(): void {
    this.clearHoverTimer();
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex());
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.lastEnabledIndex());
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.openActiveSubmenu();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.collapseRequested.emit();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateCurrent();
        break;
      case 'Tab':
        this.closeRequested.emit();
        break;
    }
  }

  private activateCurrent(): void {
    const option = this.options()[this.activeIndex()];
    if (!option || option.disabled) {
      return;
    }
    if (this.hasChildren(option)) {
      this.openActiveSubmenu();
    } else {
      this.select(option);
    }
  }

  private select(option: CascadeSelectOption<T>): void {
    this.optionSelected.emit({ value: option.value as T, path: [...this.path(), option.label] });
  }

  private openActiveSubmenu(): void {
    const index = this.activeIndex();
    const option = this.options()[index];
    if (option && this.hasChildren(option)) {
      this.openSubmenuAt(index);
    }
  }

  private openSubmenuAt(index: number): void {
    if (this.openIndex() === index) {
      return;
    }
    this.closeSubmenu();
    const option = this.options()[index];
    const origin = this.itemRefs()[index];
    if (!option || !origin) {
      return;
    }

    const mobile = this.mobile();
    const handle = this.overlayService.openConnected<CascadeSelectPanelComponent<T>, void>(origin as ConnectedOverlayOrigin, CascadeSelectPanelComponent, {
      panelClass: MENU_PANEL_CLASS,
      positions: mobile ? SUBMENU_POSITIONS_MOBILE : SUBMENU_POSITIONS,
      restoreFocus: false,
    });
    if (mobile) {
      // Full-width and stacked, not shrink-wrapped to the (usually narrower) submenu content — see class doc.
      handle.overlayRef.overlayElement.style.width = `${this.listRef().nativeElement.offsetWidth}px`;
    }
    const target = this.appendTarget();
    if (target) {
      target.appendChild(handle.overlayRef.hostElement);
      handle.componentRef.setInput('appendTarget', target);
    }
    handle.componentRef.setInput('panelId', `${this.panelId()}-sub-${index}`);
    handle.componentRef.setInput('options', option.children);
    handle.componentRef.setInput('path', [...this.path(), option.label]);
    handle.componentRef.setInput('mobile', mobile);
    handle.componentRef.setInput('optionTemplate', this.optionTemplate());
    handle.componentRef.setInput('groupIconTemplate', this.groupIconTemplate());
    this.handle = handle;
    this.openIndex.set(index);
    this.groupOpened.emit({ value: option.value, path: [...this.path(), option.label] });

    handle.componentRef.instance.optionSelected.subscribe((selected) => this.optionSelected.emit(selected));
    handle.componentRef.instance.groupOpened.subscribe((opened) => this.groupOpened.emit(opened));
    handle.componentRef.instance.closeRequested.subscribe(() => this.closeRequested.emit());
    handle.componentRef.instance.collapseRequested.subscribe(() => {
      this.closeSubmenu();
      this.listRef().nativeElement.focus();
    });

    handle.closed$.subscribe(() => {
      if (this.handle === handle) {
        this.handle = null;
        this.openIndex.set(null);
      }
    });
  }

  private closeSubmenu(): void {
    this.handle?.close();
  }

  private clearHoverTimer(): void {
    if (this.hoverTimer !== null) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  private firstEnabledIndex(): number {
    return this.enabledIndexes()[0] ?? -1;
  }

  private lastEnabledIndex(): number {
    const enabled = this.enabledIndexes();
    return enabled[enabled.length - 1] ?? -1;
  }

  private enabledIndexes(): number[] {
    return this.options()
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index !== -1);
  }

  private moveActive(step: 1 | -1): void {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) {
      return;
    }
    const currentPosition = enabled.indexOf(this.activeIndex());
    const nextPosition = currentPosition === -1 ? (step === 1 ? 0 : enabled.length - 1) : (currentPosition + step + enabled.length) % enabled.length;
    this.activeIndex.set(enabled[nextPosition]);
  }
}
