import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, booleanAttribute, computed, contentChild, input, model, signal, viewChildren } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';

/**
 * OrderList primitive (Tier 4): a single reorderable list — click to select
 * (multi-select, same toggle-in-array convention `PickList`'s lists already
 * use), then Move Up/Down/Top/Bottom to reposition the selection as one
 * contiguous block, preserving the selected items' relative order among
 * themselves.
 *
 * **`dragdrop` (default `true`)**: native HTML5 drag-and-drop reorders a single row at a time,
 * dropped at another row's position — a genuinely different gesture from
 * the button controls above (which move the *whole current selection* as
 * one contiguous block). **Deliberately layered on top of, never
 * replacing, the button/keyboard path**: native drag-and-drop has no
 * built-in keyboard equivalent and inconsistent screen-reader support
 * (the reason this was cut originally), so it stays a mouse/touch-only
 * enhancement — every reorder drag-and-drop can do was already fully
 * reachable via Move Up/Down/Top/Bottom before this, and still is with
 * `dragdrop="false"`. No `aria-grabbed`/`aria-dropeffect` (both dropped
 * from ARIA 1.1, no current AT support to speak of); no live-region
 * announcement of drag progress either, for the same reason Sortable-style
 * libraries generally skip it — a screen-reader user's accessible path
 * here is the buttons, not the drag gesture.
 *
 * **`selection`/`disabled`**: selection used to be an internal-only signal (`protected readonly
 * selection`, no way for a consumer to read or drive it) — now a real `model<readonly T[]>([])`,
 * `[(selection)]`-bindable. `disabled` (default `false`) turns off every interaction at once — the
 * four move buttons, click-to-select, the roving-tabindex keyboard path, and drag-and-drop — with
 * the standard `pointer-events-none opacity-(--opacity-disabled)` visual this library already uses
 * for a disabled interactive surface elsewhere (e.g. `ListboxComponent`).
 */
@Component({
  selector: 'med-order-list',
  standalone: true,
  imports: [NgTemplateOutlet, ButtonDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: `
    <div class="flex flex-row items-center justify-center gap-2 md:flex-col md:justify-start">
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="moveTopLabel()" [disabled]="!canMoveUp() || disabled()" (click)="moveTop()">
        <med-icon name="chevron-double-up" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="moveUpLabel()" [disabled]="!canMoveUp() || disabled()" (click)="moveUp()">
        <med-icon name="chevron-up" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="moveDownLabel()" [disabled]="!canMoveDown() || disabled()" (click)="moveDown()">
        <med-icon name="chevron-down" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="moveBottomLabel()" [disabled]="!canMoveDown() || disabled()" (click)="moveBottom()">
        <med-icon name="chevron-double-down" variant="mini" class="size-4" />
      </button>
    </div>

    <div [class]="listWrapperClass()">
      @if (header()) {
        <div class="border-b border-surface-200 px-3 py-2 text-sm font-medium text-surface-900 dark:border-surface-700 dark:text-surface-50">{{ header() }}</div>
      }
      @if (filterBy()) {
        <div class="border-b border-surface-200 p-2 dark:border-surface-700">
          <input
            type="search"
            class="w-full rounded-md border border-surface-300 bg-surface-0 px-2.5 py-1.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-50"
            [placeholder]="filterPlaceholder()"
            [attr.aria-label]="filterPlaceholder()"
            [value]="filterText()"
            (input)="filterText.set($any($event.target).value)"
          />
        </div>
      }
      <ul class="max-h-72 overflow-y-auto p-1" role="listbox" [attr.aria-label]="header()" aria-multiselectable="true" [attr.aria-disabled]="disabled() ? 'true' : null">
        @for (item of filteredValue(); track item; let i = $index) {
          <li
            #optionEl
            role="option"
            [attr.aria-selected]="isSelected(item)"
            [tabIndex]="disabled() ? -1 : tabIndexFor(i)"
            [class]="itemClass(isSelected(item), i)"
            [draggable]="dragdrop() && !disabled()"
            (click)="onOptionClick(i, item)"
            (keydown)="onKeydown($event, i, item)"
            (dragstart)="onDragStart($event, i)"
            (dragover)="onDragOver($event, i)"
            (dragleave)="onDragLeave(i)"
            (drop)="onDrop($event, i)"
            (dragend)="onDragEnd()"
          >
            <ng-container [ngTemplateOutlet]="itemTemplate()" [ngTemplateOutletContext]="{ $implicit: item }" />
          </li>
        } @empty {
          <li class="px-3 py-6 text-center text-sm text-surface-400 dark:text-surface-500">{{ emptyLabel() }}</li>
        }
      </ul>
    </div>
  `,
})
export class OrderListComponent<T> {
  readonly value = model<readonly T[]>([]);
  readonly header = input('');
  readonly emptyLabel = input('No items');
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly moveTopLabel = input('Move to top');
  readonly moveUpLabel = input('Move up');
  readonly moveDownLabel = input('Move down');
  readonly moveBottomLabel = input('Move to bottom');
  /** Mouse/touch-only reordering, layered on top of the always-available button controls — see class doc. */
  readonly dragdrop = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly filterBy = input<string | null>(null);
  readonly filterPlaceholder = input('Search');
  readonly stripedRows = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  protected readonly filterText = signal('');

  protected readonly filteredValue = computed(() => {
    const field = this.filterBy();
    const query = this.filterText().trim().toLowerCase();
    const items = this.value();
    if (!field || !query) {
      return items;
    }
    return items.filter((item) => {
      const raw = item && typeof item === 'object' ? (item as Record<string, unknown>)[field] : item;
      return String(raw ?? '').toLowerCase().includes(query);
    });
  });

  /** Public, `[(selection)]`-bindable — see class doc. */
  readonly selection = model<readonly T[]>([]);

  protected readonly itemTemplate = contentChild.required(TemplateRef);

  private readonly optionRefs = viewChildren<ElementRef<HTMLLIElement>>('optionEl');
  /** Roving tabindex position (Wave 2 fix — role="listbox"/"option" previously had no keyboard path at all, selection was click-only). */
  private readonly activeIndex = signal(0);

  private readonly draggedIndex = signal<number | null>(null);
  private readonly dragOverIndex = signal<number | null>(null);

  protected readonly hostClass = computed(() => mergeClasses('flex flex-row gap-2 md:items-start', this.class()));
  protected readonly listWrapperClass = computed(() =>
    mergeClasses(
      'overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700',
      this.disabled() ? 'pointer-events-none opacity-(--opacity-disabled)' : '',
    ),
  );

  protected readonly canMoveUp = computed(() => {
    const selection = this.selection();
    if (selection.length === 0) {
      return false;
    }
    const indices = this.selectedIndices();
    return indices[0] > 0;
  });

  protected readonly canMoveDown = computed(() => {
    const selection = this.selection();
    if (selection.length === 0) {
      return false;
    }
    const indices = this.selectedIndices();
    return indices[indices.length - 1] < this.value().length - 1;
  });

  protected isSelected(item: T): boolean {
    return this.selection().includes(item);
  }

  protected itemClass(selected: boolean, index: number): string {
    return mergeClasses(
      'cursor-pointer select-none rounded-sm px-3 py-2 text-sm text-surface-900 transition-colors duration-(--transition-duration-base) dark:text-surface-50',
      this.stripedRows() && index % 2 === 1 && !selected ? 'bg-surface-50 dark:bg-surface-800/40' : '',
      selected ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50',
      this.draggedIndex() === index ? 'opacity-50' : '',
      this.dragOverIndex() === index && this.draggedIndex() !== index ? 'outline outline-2 outline-brand-500 -outline-offset-2' : '',
    );
  }

  protected toggleSelection(item: T): void {
    this.selection.update((current) => (current.includes(item) ? current.filter((i) => i !== item) : [...current, item]));
  }

  protected onOptionClick(index: number, item: T): void {
    if (this.disabled()) {
      return;
    }
    this.activeIndex.set(index);
    this.toggleSelection(item);
  }

  protected tabIndexFor(index: number): number {
    return index === this.activeIndex() ? 0 : -1;
  }

  /** ArrowUp/ArrowDown move the roving-tabindex focus (wrapping, same model as `TabsComponent`/`SelectButtonComponent`); Home/End jump to the ends; Enter/Space toggles selection. */
  protected onKeydown(event: KeyboardEvent, index: number, item: T): void {
    const count = this.value().length;
    if (count === 0 || this.disabled()) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive((index + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive((index - 1 + count) % count);
        break;
      case 'Home':
        event.preventDefault();
        this.moveActive(0);
        break;
      case 'End':
        event.preventDefault();
        this.moveActive(count - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activeIndex.set(index);
        this.toggleSelection(item);
        break;
    }
  }

  private moveActive(index: number): void {
    this.activeIndex.set(index);
    this.optionRefs()[index]?.nativeElement.focus();
  }

  protected onDragStart(event: DragEvent, index: number): void {
    if (!this.dragdrop() || this.disabled()) {
      event.preventDefault();
      return;
    }
    this.draggedIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // Required by some browsers (notably Firefox) for a drag to actually
      // start at all — the value itself is never read back: reordering
      // uses `draggedIndex()` directly, since source and target are always
      // the same document, not a cross-window/cross-app drag.
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  protected onDragOver(event: DragEvent, index: number): void {
    if (this.draggedIndex() === null) {
      return;
    }
    // Dropping is disallowed by default — preventDefault() here is what
    // opts this element in as a valid drop target at all.
    event.preventDefault();
    this.dragOverIndex.set(index);
  }

  protected onDragLeave(index: number): void {
    if (this.dragOverIndex() === index) {
      this.dragOverIndex.set(null);
    }
  }

  protected onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    const from = this.draggedIndex();
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
    if (from === null || from === index) {
      return;
    }
    const items = [...this.value()];
    const [moved] = items.splice(from, 1);
    items.splice(index, 0, moved);
    this.value.set(items);
  }

  protected onDragEnd(): void {
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }

  protected moveUp(): void {
    const items = [...this.value()];
    const selected = this.selection();
    for (let i = 1; i < items.length; i++) {
      if (selected.includes(items[i]) && !selected.includes(items[i - 1])) {
        [items[i - 1], items[i]] = [items[i], items[i - 1]];
      }
    }
    this.value.set(items);
  }

  protected moveDown(): void {
    const items = [...this.value()];
    const selected = this.selection();
    for (let i = items.length - 2; i >= 0; i--) {
      if (selected.includes(items[i]) && !selected.includes(items[i + 1])) {
        [items[i], items[i + 1]] = [items[i + 1], items[i]];
      }
    }
    this.value.set(items);
  }

  protected moveTop(): void {
    const selected = this.selection();
    const moving = this.value().filter((item) => selected.includes(item));
    const rest = this.value().filter((item) => !selected.includes(item));
    this.value.set([...moving, ...rest]);
  }

  protected moveBottom(): void {
    const selected = this.selection();
    const moving = this.value().filter((item) => selected.includes(item));
    const rest = this.value().filter((item) => !selected.includes(item));
    this.value.set([...rest, ...moving]);
  }

  private selectedIndices(): number[] {
    const selected = this.selection();
    return this.value()
      .map((item, index) => (selected.includes(item) ? index : -1))
      .filter((index) => index >= 0);
  }
}
