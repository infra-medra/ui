import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { selectOptionVariants } from '../select/select.styles';
import { MenuRouterLinkDirective } from '../menu/menu-router-link.directive';
import { visibleItems } from '../menu/menu-visibility';
import { MenuItem } from '../menu/menu.types';
import { MegaMenuColumn } from './mega-menu.types';

/**
 * Internal overlay content for MegaMenu (not part of the public API —
 * consumers only ever see `<med-mega-menu>`). Laid out as columns side by
 * side rather than `MenuPanelComponent`'s single flat `<ul>` — a genuinely
 * 2D keyboard model (`activeColumn`/`activeRow`, not one flat
 * `activeIndex`) is what makes that layout actually navigable: ArrowUp/Down
 * move within the current column, ArrowLeft/Right hop to the same row (or
 * as close to it as that column allows) in the neighboring column. Every
 * column is a plain flat `items` list — no further nesting inside a column
 * (that's what TieredMenu is for), so unlike that component this one never
 * opens more of itself.
 */
@Component({
  selector: 'med-mega-menu-panel',
  standalone: true,
  imports: [IconComponent, MenuRouterLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      #panel
      role="menu"
      tabindex="-1"
      class="flex gap-6 p-4 focus:outline-none"
      [attr.aria-activedescendant]="activeItemId()"
      (keydown)="onKeydown($event)"
    >
      @for (column of shownColumns(); track $index; let ci = $index) {
        <div class="min-w-40">
          @if (column.header) {
            <div [id]="headerId(ci)" class="mb-1 px-2 text-xs font-semibold text-surface-500 uppercase dark:text-surface-400">{{ column.header }}</div>
          }
          <ul role="group" [attr.aria-labelledby]="column.header ? headerId(ci) : null">
            @for (item of column.items; track $index; let ri = $index) {
              <li
                [id]="itemId(ci, ri)"
                role="menuitem"
                [attr.aria-disabled]="item.disabled ? 'true' : null"
                [class]="rowClass(item, ci, ri)"
                (pointerdown)="onItemPointerDown($event, item, ci, ri)"
                (pointerenter)="onItemPointerEnter(ci, ri, item)"
              >
                @if (item.icon) {
                  <med-icon [name]="item.icon" variant="mini" class="size-4 shrink-0" />
                }
                @if (item.routerLink !== undefined) {
                  <a [medMenuRouterLink]="item" [target]="item.target ?? null" class="min-w-0 flex-1 truncate" (click)="onLinkClick(item)">{{ item.label }}</a>
                } @else if (item.url) {
                  <a [href]="item.url" [target]="item.target ?? null" class="min-w-0 flex-1 truncate">{{ item.label }}</a>
                } @else {
                  <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                }
                @if (item.badge) {
                  <span class="ml-auto shrink-0 rounded-full bg-surface-100 px-1.5 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">{{ item.badge }}</span>
                }
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class MegaMenuPanelComponent implements AfterViewInit {
  readonly panelId = input.required<string>();
  readonly columns = input<readonly MegaMenuColumn[]>([]);

  /** `columns()` without `visible: false` items; a column left with no visible item is dropped, header included. Every column/row index below refers to this list. */
  protected readonly shownColumns = computed(() =>
    this.columns()
      .map((column) => ({ ...column, items: visibleItems(column.items) }))
      .filter((column) => column.items.length > 0),
  );

  readonly itemActivated = output<MenuItem>();
  readonly closeRequested = output<void>();

  protected readonly activeColumn = signal(0);
  protected readonly activeRow = signal(-1);

  private readonly panelRef = viewChild.required<ElementRef<HTMLDivElement>>('panel');

  protected readonly activeItemId = computed(() => {
    const row = this.activeRow();
    return row >= 0 ? this.itemId(this.activeColumn(), row) : null;
  });

  ngAfterViewInit(): void {
    const firstColumn = this.firstColumnWithEnabledItem();
    this.activeColumn.set(firstColumn);
    this.activeRow.set(this.firstEnabledRow(firstColumn));
    this.panelRef().nativeElement.focus();
  }

  protected itemId(column: number, row: number): string {
    return `${this.panelId()}-c${column}-r${row}`;
  }

  /** Associates a column's `role="group"` list with its own visible header text, so a screen reader announces the category when entering that column — the header text alone had no ARIA relationship to its list before. */
  protected headerId(column: number): string {
    return `${this.panelId()}-c${column}-header`;
  }

  protected rowClass(item: MenuItem, column: number, row: number): string {
    return selectOptionVariants({ active: column === this.activeColumn() && row === this.activeRow(), disabled: !!item.disabled });
  }

  protected onItemPointerDown(event: Event, item: MenuItem, column: number, row: number): void {
    // A `routerLink` item activates on the `<a>`'s own click (see `onLinkClick`): activating on pointerdown would close the panel — and remove the `<a>` — before the click that navigates ever happens.
    if (item.routerLink !== undefined && !item.disabled) {
      return;
    }
    event.preventDefault();
    if (item.disabled) {
      return;
    }
    this.activeColumn.set(column);
    this.activeRow.set(row);
    this.activate(item);
  }

  protected onItemPointerEnter(column: number, row: number, item: MenuItem): void {
    if (item.disabled) {
      return;
    }
    this.activeColumn.set(column);
    this.activeRow.set(row);
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveRow(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveRow(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.moveColumn(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveColumn(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeRow.set(this.firstEnabledRow(this.activeColumn()));
        break;
      case 'End':
        event.preventDefault();
        this.activeRow.set(this.lastEnabledRow(this.activeColumn()));
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
    const item = this.shownColumns()[this.activeColumn()]?.items[this.activeRow()];
    if (item && !item.disabled) {
      if (item.routerLink !== undefined) {
        // Focus stays on the panel (aria-activedescendant), so Enter must click the item's own `<a>` to navigate through the same path as a mouse click.
        this.panelRef().nativeElement.querySelector<HTMLAnchorElement>(`[id="${this.itemId(this.activeColumn(), this.activeRow())}"] a`)?.click();
      } else {
        this.activate(item);
      }
    }
  }

  protected onLinkClick(item: MenuItem): void {
    if (!item.disabled) {
      this.activate(item);
    }
  }

  private activate(item: MenuItem): void {
    item.command?.();
    this.itemActivated.emit(item);
  }

  private enabledRows(column: number): number[] {
    return (this.shownColumns()[column]?.items ?? []).map((item, index) => (item.disabled ? -1 : index)).filter((index) => index !== -1);
  }

  private firstEnabledRow(column: number): number {
    return this.enabledRows(column)[0] ?? -1;
  }

  private lastEnabledRow(column: number): number {
    const rows = this.enabledRows(column);
    return rows[rows.length - 1] ?? -1;
  }

  private firstColumnWithEnabledItem(): number {
    const columns = this.shownColumns();
    for (let i = 0; i < columns.length; i++) {
      if (this.enabledRows(i).length > 0) {
        return i;
      }
    }
    return 0;
  }

  private moveRow(step: 1 | -1): void {
    const rows = this.enabledRows(this.activeColumn());
    if (rows.length === 0) {
      return;
    }
    const position = rows.indexOf(this.activeRow());
    const next = position === -1 ? (step === 1 ? 0 : rows.length - 1) : (position + step + rows.length) % rows.length;
    this.activeRow.set(rows[next]);
  }

  private moveColumn(step: 1 | -1): void {
    const columnCount = this.shownColumns().length;
    if (columnCount === 0) {
      return;
    }
    let column = this.activeColumn();
    for (let i = 0; i < columnCount; i++) {
      column = (column + step + columnCount) % columnCount;
      const rows = this.enabledRows(column);
      if (rows.length > 0) {
        this.activeColumn.set(column);
        // Land as close as possible to the row we came from, clamped to this column's own range.
        const target = Math.min(this.activeRow() === -1 ? 0 : this.activeRow(), rows[rows.length - 1]);
        this.activeRow.set(rows.find((r) => r >= target) ?? rows[rows.length - 1]);
        return;
      }
    }
  }
}
