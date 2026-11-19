import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, WritableSignal, booleanAttribute, computed, contentChild, input, model, output, signal, viewChildren } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';

/**
 * PickList primitive (Tier 4): two lists (`source`/`target`, both
 * `model()`s) with button-driven transfer between them — click to select
 * within a list (multi-select, same toggle-in-array convention
 * `DataTable`'s row checkboxes already use), then Move/Move All in either
 * direction; double-clicking a single item transfers just that one
 * regardless of the current selection, a common real-world PickList
 * shortcut.
 *
 * **Reordering within a list + drag-and-drop, reopening a documented cut**
 *. Each list gets its own Move Up/Down/Top/Bottom button column —
 * identical mechanics to `OrderListComponent`'s (same selected-block
 * reposition, same `canMoveUp`/`canMoveDown` edge-disabling), just
 * parameterized over whichever list/selection pair the click came from
 * instead of hardcoded to one. Native HTML5 drag-and-drop is layered on
 * top, **never replacing** the buttons, same reasoning as OrderList: no
 * keyboard equivalent, inconsistent screen-reader support. It does two
 * different things depending on where a drag lands: dropped inside its
 * *own* list, it reorders (like OrderList); dropped in the *other* list,
 * it transfers — inserted at the drop position rather than always
 * appended at the end, a strictly more precise placement than the
 * Move/Move All buttons offer. Single `dragdrop` input toggles both
 * behaviors together (they share one gesture and one set of drag/drop
 * handlers; splitting them into two flags would let a consumer end up
 * with cross-list drag but no same-list drag, a combination nothing here
 * is actually structured to support cleanly).
 *
 * **Per-list filter, `itemDisabled`, `keepSelection`, granular transfer
 * events**.
 * **Filter**: `filterPredicate` is a plain `(item, query) => boolean` function (`T` is a
 * generic here, so there's no field to name), the same function-over-field-name
 * convention this library already uses for `DataViewComponent.sortComparator`.
 * `filterPredicate` unset (`null`, default) is the master off switch: no search box
 * renders at all regardless of `showSourceFilter`/`showTargetFilter`. **Move All only
 * ever moves the currently-*visible* (filtered) items**, not the whole underlying list.
 *
 * **`itemDisabled`**: one shared `(item: T) => boolean` predicate applies to both
 * lists, since an item's identity (and so whatever real-world condition makes it
 * "disabled") doesn't change just because it crossed from source to target. A
 * disabled item stays in the roving-tabindex sequence (keyboard users can still
 * navigate past it) but rejects click/Enter/Space/dblclick/drag and is excluded from
 * Move All: the same "enforced at the value layer, not the focus layer" split
 * `ListboxComponent`'s own `disabled` already documents.
 *
 * **`keepSelection`** (default `false`): when `true`, a transfer's moved items land
 * *selected* in their new list instead of unselected. The source side's own selection
 * is always cleared either way, since those items no longer live there.
 *
 * **Granular transfer events**: four distinct outputs
 * (`moveToTarget`/`moveAllToTarget`/`moveToSource`/`moveAllToSource`) rather than one
 * generic "moved" event, since a consumer reacting to a bulk "move all" often needs
 * different handling than a few selected items. Each emits the moved `readonly T[]`
 * directly (this library's bare-payload convention). The internal transfer methods are
 * `transferToTarget`/`transferToSource`. A double-click transfer emits the same
 * `moveToTarget`/`moveToSource` event as a button-driven "move selected" (both move a
 * specific, non-"all" set of items); only the actual "Move All" button emits the "All"
 * variant.
 */
@Component({
  selector: 'med-pick-list',
  standalone: true,
  imports: [NgTemplateOutlet, ButtonDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: `
    @if (showSourceControls()) {
    <div class="flex flex-row items-center justify-center gap-2 py-2 md:flex-col md:py-0">
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="reorderLabel(moveTopLabel(), sourceHeader())" [disabled]="!canMoveUp(source(), sourceSelection())" (click)="moveTopIn(source, sourceSelectionSignal)">
        <med-icon name="chevron-double-up" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="reorderLabel(moveUpLabel(), sourceHeader())" [disabled]="!canMoveUp(source(), sourceSelection())" (click)="moveUpIn(source, sourceSelectionSignal)">
        <med-icon name="chevron-up" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="reorderLabel(moveDownLabel(), sourceHeader())" [disabled]="!canMoveDown(source(), sourceSelection())" (click)="moveDownIn(source, sourceSelectionSignal)">
        <med-icon name="chevron-down" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="reorderLabel(moveBottomLabel(), sourceHeader())" [disabled]="!canMoveDown(source(), sourceSelection())" (click)="moveBottomIn(source, sourceSelectionSignal)">
        <med-icon name="chevron-double-down" variant="mini" class="size-4" />
      </button>
    </div>
    }

    <div [class]="listClass">
      <div class="border-b border-surface-200 px-3 py-2 text-sm font-medium text-surface-900 dark:border-surface-700 dark:text-surface-50">{{ sourceHeader() }}</div>
      @if (filterPredicate() && showSourceFilter()) {
        <input
          type="text"
          class="sticky top-0 z-10 w-full border-b border-surface-200 bg-surface-0 px-2 py-1.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:-ring-inset focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-50 dark:placeholder:text-surface-500"
          [placeholder]="sourceFilterPlaceholder()"
          [attr.aria-label]="sourceFilterPlaceholder()"
          [value]="sourceFilterText()"
          (input)="sourceFilterText.set($any($event.target).value)"
        />
      }
      <ul
        class="max-h-72 overflow-y-auto p-1"
        role="listbox"
        [attr.aria-label]="sourceHeader()"
        aria-multiselectable="true"
        (dragover)="onListDragOver($event, 'source', source().length)"
        (drop)="onDrop($event, 'source', source().length)"
      >
        @for (item of filteredSource(); track item; let i = $index) {
          <li
            #sourceOptionEl
            role="option"
            [attr.aria-selected]="isSelected(sourceSelection(), item)"
            [attr.aria-disabled]="itemDisabled()(item) ? 'true' : null"
            [tabIndex]="tabIndexFor(sourceActiveIndex(), i)"
            [class]="itemClass(isSelected(sourceSelection(), item), itemDisabled()(item), 'source', i)"
            [draggable]="dragdrop() && !itemDisabled()(item)"
            (click)="onOptionClick(sourceActiveIndex, sourceSelectionSignal, i, item)"
            (dblclick)="onItemDblClick(item, 'target')"
            (keydown)="onKeydown($event, sourceOptionRefs(), sourceActiveIndex, sourceSelectionSignal, filteredSource(), i, item)"
            (dragstart)="onDragStart($event, 'source', i)"
            (dragover)="onDragOver($event, 'source', i)"
            (dragleave)="onDragLeave('source', i)"
            (drop)="onDrop($event, 'source', i)"
            (dragend)="onDragEnd()"
          >
            <ng-container [ngTemplateOutlet]="itemTemplate()" [ngTemplateOutletContext]="{ $implicit: item }" />
          </li>
        } @empty {
          <li class="px-3 py-6 text-center text-sm text-surface-400 dark:text-surface-500">{{ emptyLabel() }}</li>
        }
      </ul>
    </div>

    <div class="flex flex-row items-center justify-center gap-2 py-2 md:flex-col md:py-0">
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="moveAllToTargetLabel()" [disabled]="filteredSource().length === 0" (click)="transferToTarget(filteredSource(), true)">
        <med-icon name="chevron-double-right" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="moveToTargetLabel()" [disabled]="sourceSelection().length === 0" (click)="transferToTarget(sourceSelection(), false)">
        <med-icon name="chevron-right" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="moveToSourceLabel()" [disabled]="targetSelection().length === 0" (click)="transferToSource(targetSelection(), false)">
        <med-icon name="chevron-left" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="moveAllToSourceLabel()" [disabled]="filteredTarget().length === 0" (click)="transferToSource(filteredTarget(), true)">
        <med-icon name="chevron-double-left" variant="mini" class="size-4" />
      </button>
    </div>

    <div [class]="listClass">
      <div class="border-b border-surface-200 px-3 py-2 text-sm font-medium text-surface-900 dark:border-surface-700 dark:text-surface-50">{{ targetHeader() }}</div>
      @if (filterPredicate() && showTargetFilter()) {
        <input
          type="text"
          class="sticky top-0 z-10 w-full border-b border-surface-200 bg-surface-0 px-2 py-1.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:-ring-inset focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-50 dark:placeholder:text-surface-500"
          [placeholder]="targetFilterPlaceholder()"
          [attr.aria-label]="targetFilterPlaceholder()"
          [value]="targetFilterText()"
          (input)="targetFilterText.set($any($event.target).value)"
        />
      }
      <ul
        class="max-h-72 overflow-y-auto p-1"
        role="listbox"
        [attr.aria-label]="targetHeader()"
        aria-multiselectable="true"
        (dragover)="onListDragOver($event, 'target', target().length)"
        (drop)="onDrop($event, 'target', target().length)"
      >
        @for (item of filteredTarget(); track item; let i = $index) {
          <li
            #targetOptionEl
            role="option"
            [attr.aria-selected]="isSelected(targetSelection(), item)"
            [attr.aria-disabled]="itemDisabled()(item) ? 'true' : null"
            [tabIndex]="tabIndexFor(targetActiveIndex(), i)"
            [class]="itemClass(isSelected(targetSelection(), item), itemDisabled()(item), 'target', i)"
            [draggable]="dragdrop() && !itemDisabled()(item)"
            (dragstart)="onDragStart($event, 'target', i)"
            (dragover)="onDragOver($event, 'target', i)"
            (dragleave)="onDragLeave('target', i)"
            (drop)="onDrop($event, 'target', i)"
            (dragend)="onDragEnd()"
            (click)="onOptionClick(targetActiveIndex, targetSelectionSignal, i, item)"
            (dblclick)="onItemDblClick(item, 'source')"
            (keydown)="onKeydown($event, targetOptionRefs(), targetActiveIndex, targetSelectionSignal, filteredTarget(), i, item)"
          >
            <ng-container [ngTemplateOutlet]="itemTemplate()" [ngTemplateOutletContext]="{ $implicit: item }" />
          </li>
        } @empty {
          <li class="px-3 py-6 text-center text-sm text-surface-400 dark:text-surface-500">{{ emptyLabel() }}</li>
        }
      </ul>
    </div>

    @if (showTargetControls()) {
    <div class="flex flex-row items-center justify-center gap-2 py-2 md:flex-col md:py-0">
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="reorderLabel(moveTopLabel(), targetHeader())" [disabled]="!canMoveUp(target(), targetSelection())" (click)="moveTopIn(target, targetSelectionSignal)">
        <med-icon name="chevron-double-up" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="reorderLabel(moveUpLabel(), targetHeader())" [disabled]="!canMoveUp(target(), targetSelection())" (click)="moveUpIn(target, targetSelectionSignal)">
        <med-icon name="chevron-up" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="reorderLabel(moveDownLabel(), targetHeader())" [disabled]="!canMoveDown(target(), targetSelection())" (click)="moveDownIn(target, targetSelectionSignal)">
        <med-icon name="chevron-down" variant="mini" class="size-4" />
      </button>
      <button medButton type="button" variant="outlined" severity="secondary" iconOnly class="size-8 p-1.5" [attr.aria-label]="reorderLabel(moveBottomLabel(), targetHeader())" [disabled]="!canMoveDown(target(), targetSelection())" (click)="moveBottomIn(target, targetSelectionSignal)">
        <med-icon name="chevron-double-down" variant="mini" class="size-4" />
      </button>
    </div>
    }
  `,
})
export class PickListComponent<T> {
  readonly source = model<readonly T[]>([]);
  readonly target = model<readonly T[]>([]);
  readonly sourceHeader = input('Available');
  readonly targetHeader = input('Selected');
  readonly emptyLabel = input('No items');
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly moveToTargetLabel = input('Move selected to target');
  readonly moveAllToTargetLabel = input('Move all to target');
  readonly moveToSourceLabel = input('Move selected to source');
  readonly moveAllToSourceLabel = input('Move all to source');
  /** Reused for both lists' reorder-button columns — see `reorderLabel()`, which appends the relevant list's own header to disambiguate the two copies on screen. */
  readonly moveUpLabel = input('Move up');
  readonly moveDownLabel = input('Move down');
  readonly moveTopLabel = input('Move to top');
  readonly moveBottomLabel = input('Move to bottom');
  /** Mouse/touch-only reordering-within-a-list and cross-list transfer, layered on top of the always-available button controls — see class doc. */
  readonly dragdrop = input(true, { transform: booleanAttribute });
  /** Master filter switch, `null` (default) = off — see class doc for why this is a predicate, not a field-name `filterBy`. */
  readonly filterPredicate = input<((item: T, query: string) => boolean) | null>(null);
  readonly showSourceFilter = input(true, { transform: booleanAttribute });
  readonly showTargetFilter = input(true, { transform: booleanAttribute });
  readonly sourceFilterPlaceholder = input('Search');
  readonly targetFilterPlaceholder = input('Search');
  /** Shared across both lists — see class doc. */
  readonly itemDisabled = input<(item: T) => boolean>(() => false);
  /** When `true`, a transfer's moved items land selected in their new list instead of unselected — see class doc. */
  readonly keepSelection = input(false, { transform: booleanAttribute });
  readonly stripedRows = input(false, { transform: booleanAttribute });
  readonly showSourceControls = input(true, { transform: booleanAttribute });
  readonly showTargetControls = input(true, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  readonly moveToTarget = output<readonly T[]>();
  readonly moveAllToTarget = output<readonly T[]>();
  readonly moveToSource = output<readonly T[]>();
  readonly moveAllToSource = output<readonly T[]>();

  protected readonly itemTemplate = contentChild.required(TemplateRef);

  protected readonly sourceFilterText = signal('');
  protected readonly targetFilterText = signal('');
  protected readonly filteredSource = computed(() => this.applyFilter(this.source(), this.sourceFilterText()));
  protected readonly filteredTarget = computed(() => this.applyFilter(this.target(), this.targetFilterText()));

  private applyFilter(list: readonly T[], query: string): readonly T[] {
    const predicate = this.filterPredicate();
    const trimmed = query.trim();
    return predicate && trimmed ? list.filter((item) => predicate(item, trimmed)) : list;
  }

  /** Translates a position in the currently-*displayed* (possibly filtered) list to its real position in the underlying `source()`/`target()` array — a no-op passthrough when no filter is active, since `applyFilter` returns the same array reference in that case. Out-of-range (the "end of list" drop sentinel) maps to the real list's own length. */
  private realIndexFromFiltered(listKey: 'source' | 'target', filteredIndex: number): number {
    const filtered = listKey === 'source' ? this.filteredSource() : this.filteredTarget();
    const real = listKey === 'source' ? this.source() : this.target();
    if (filtered === real) {
      return filteredIndex;
    }
    if (filteredIndex >= filtered.length) {
      return real.length;
    }
    return real.indexOf(filtered[filteredIndex]);
  }

  protected readonly sourceSelectionSignal = signal<readonly T[]>([]);
  protected readonly targetSelectionSignal = signal<readonly T[]>([]);
  protected readonly sourceSelection = this.sourceSelectionSignal.asReadonly();
  protected readonly targetSelection = this.targetSelectionSignal.asReadonly();

  protected readonly sourceOptionRefs = viewChildren<ElementRef<HTMLLIElement>>('sourceOptionEl');
  protected readonly targetOptionRefs = viewChildren<ElementRef<HTMLLIElement>>('targetOptionEl');
  /** Roving tabindex position per list (Wave 2 fix — role="listbox"/"option" previously had no keyboard path at all, selection/transfer were click-only). */
  protected readonly sourceActiveIndex = signal(0);
  protected readonly targetActiveIndex = signal(0);

  protected readonly hostClass = computed(() => mergeClasses('grid grid-cols-1 gap-2 md:grid-cols-[auto_1fr_auto_1fr_auto] md:items-stretch', this.class()));
  protected readonly listClass = 'overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700';

  private readonly draggedList = signal<'source' | 'target' | null>(null);
  private readonly draggedIndex = signal<number | null>(null);
  private readonly dragOverList = signal<'source' | 'target' | null>(null);
  private readonly dragOverIndex = signal<number | null>(null);

  protected isSelected(selection: readonly T[], item: T): boolean {
    return selection.includes(item);
  }

  protected itemClass(selected: boolean, disabled: boolean, listKey: 'source' | 'target', index: number): string {
    return mergeClasses(
      'select-none rounded-sm px-3 py-2 text-sm text-surface-900 transition-colors duration-(--transition-duration-base) dark:text-surface-50',
      disabled ? 'cursor-not-allowed opacity-(--opacity-disabled)' : 'cursor-pointer',
      selected && !disabled ? 'bg-brand-50 dark:bg-brand-500/10' : '',
      this.stripedRows() && index % 2 === 1 && !selected ? 'bg-surface-50 dark:bg-surface-800/40' : '',
      !disabled && !selected ? 'hover:bg-surface-50 dark:hover:bg-surface-800/50' : '',
      this.draggedList() === listKey && this.draggedIndex() === index ? 'opacity-50' : '',
      this.dragOverList() === listKey && this.dragOverIndex() === index && !(this.draggedList() === listKey && this.draggedIndex() === index)
        ? 'outline outline-2 outline-brand-500 -outline-offset-2'
        : '',
    );
  }

  protected reorderLabel(action: string, header: string): string {
    return `${action} — ${header}`;
  }

  protected toggleSelection(selectionSignal: WritableSignal<readonly T[]>, item: T): void {
    selectionSignal.update((current) => (current.includes(item) ? current.filter((i) => i !== item) : [...current, item]));
  }

  protected tabIndexFor(activeIndex: number, index: number): number {
    return index === activeIndex ? 0 : -1;
  }

  protected onOptionClick(activeIndexSignal: WritableSignal<number>, selectionSignal: WritableSignal<readonly T[]>, index: number, item: T): void {
    if (this.itemDisabled()(item)) {
      return;
    }
    activeIndexSignal.set(index);
    this.toggleSelection(selectionSignal, item);
  }

  /** A double-click transfer is equivalent to a button-driven "move selected" — same non-"all" `moveToTarget`/`moveToSource` event, see class doc. */
  protected onItemDblClick(item: T, destination: 'source' | 'target'): void {
    if (this.itemDisabled()(item)) {
      return;
    }
    if (destination === 'target') {
      this.transferToTarget([item], false);
    } else {
      this.transferToSource([item], false);
    }
  }

  /** Same roving-tabindex arrow-key/Home/End/Enter-Space model as `OrderListComponent`, applied independently to whichever list (source or target) the event came from. */
  protected onKeydown(
    event: KeyboardEvent,
    optionRefs: readonly ElementRef<HTMLLIElement>[],
    activeIndexSignal: WritableSignal<number>,
    selectionSignal: WritableSignal<readonly T[]>,
    list: readonly T[],
    index: number,
    item: T,
  ): void {
    const count = list.length;
    if (count === 0) {
      return;
    }
    const moveTo = (target: number) => {
      activeIndexSignal.set(target);
      optionRefs[target]?.nativeElement.focus();
    };
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveTo((index + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveTo((index - 1 + count) % count);
        break;
      case 'Home':
        event.preventDefault();
        moveTo(0);
        break;
      case 'End':
        event.preventDefault();
        moveTo(count - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.itemDisabled()(item)) {
          break;
        }
        activeIndexSignal.set(index);
        this.toggleSelection(selectionSignal, item);
        break;
    }
  }

  /** `isAll` selects which of the two granular events fires (`moveAllToTarget` vs `moveToTarget`) — see class doc. Disabled items are always excluded from the moved set. */
  protected transferToTarget(items: readonly T[], isAll: boolean): void {
    const moving = items.filter((item) => !this.itemDisabled()(item));
    if (moving.length === 0) {
      return;
    }
    const movingSet = new Set(moving);
    this.target.update((t) => [...t, ...moving]);
    this.source.update((s) => s.filter((item) => !movingSet.has(item)));
    this.sourceSelectionSignal.set([]);
    this.sourceActiveIndex.set(0);
    if (this.keepSelection()) {
      this.targetSelectionSignal.update((current) => [...current, ...moving]);
    }
    (isAll ? this.moveAllToTarget : this.moveToTarget).emit(moving);
  }

  protected transferToSource(items: readonly T[], isAll: boolean): void {
    const moving = items.filter((item) => !this.itemDisabled()(item));
    if (moving.length === 0) {
      return;
    }
    const movingSet = new Set(moving);
    this.source.update((s) => [...s, ...moving]);
    this.target.update((t) => t.filter((item) => !movingSet.has(item)));
    this.targetSelectionSignal.set([]);
    this.targetActiveIndex.set(0);
    if (this.keepSelection()) {
      this.sourceSelectionSignal.update((current) => [...current, ...moving]);
    }
    (isAll ? this.moveAllToSource : this.moveToSource).emit(moving);
  }

  /** Same edge-disabling logic as `OrderListComponent.canMoveUp`, parameterized over whichever list/selection pair called it. */
  protected canMoveUp(list: readonly T[], selection: readonly T[]): boolean {
    if (selection.length === 0) {
      return false;
    }
    return this.selectedIndices(list, selection)[0] > 0;
  }

  protected canMoveDown(list: readonly T[], selection: readonly T[]): boolean {
    if (selection.length === 0) {
      return false;
    }
    const indices = this.selectedIndices(list, selection);
    return indices[indices.length - 1] < list.length - 1;
  }

  /** Moves the current selection up as one contiguous block — identical mechanics to `OrderListComponent.moveUp`, generalized over source/target. */
  protected moveUpIn(listSignal: WritableSignal<readonly T[]>, selectionSignal: WritableSignal<readonly T[]>): void {
    const items = [...listSignal()];
    const selected = selectionSignal();
    for (let i = 1; i < items.length; i++) {
      if (selected.includes(items[i]) && !selected.includes(items[i - 1])) {
        [items[i - 1], items[i]] = [items[i], items[i - 1]];
      }
    }
    listSignal.set(items);
  }

  protected moveDownIn(listSignal: WritableSignal<readonly T[]>, selectionSignal: WritableSignal<readonly T[]>): void {
    const items = [...listSignal()];
    const selected = selectionSignal();
    for (let i = items.length - 2; i >= 0; i--) {
      if (selected.includes(items[i]) && !selected.includes(items[i + 1])) {
        [items[i], items[i + 1]] = [items[i + 1], items[i]];
      }
    }
    listSignal.set(items);
  }

  protected moveTopIn(listSignal: WritableSignal<readonly T[]>, selectionSignal: WritableSignal<readonly T[]>): void {
    const selected = selectionSignal();
    const moving = listSignal().filter((item) => selected.includes(item));
    const rest = listSignal().filter((item) => !selected.includes(item));
    listSignal.set([...moving, ...rest]);
  }

  protected moveBottomIn(listSignal: WritableSignal<readonly T[]>, selectionSignal: WritableSignal<readonly T[]>): void {
    const selected = selectionSignal();
    const moving = listSignal().filter((item) => selected.includes(item));
    const rest = listSignal().filter((item) => !selected.includes(item));
    listSignal.set([...rest, ...moving]);
  }

  private selectedIndices(list: readonly T[], selection: readonly T[]): number[] {
    return list.map((item, index) => (selection.includes(item) ? index : -1)).filter((index) => index >= 0);
  }

  protected onDragStart(event: DragEvent, listKey: 'source' | 'target', index: number): void {
    const list = listKey === 'source' ? this.filteredSource() : this.filteredTarget();
    if (!this.dragdrop() || this.itemDisabled()(list[index])) {
      event.preventDefault();
      return;
    }
    this.draggedList.set(listKey);
    this.draggedIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // Required by some browsers (notably Firefox) for a drag to start at
      // all — never read back, since source and target are always the same
      // document. See `OrderListComponent.onDragStart`, same reasoning.
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  protected onDragOver(event: DragEvent, listKey: 'source' | 'target', index: number): void {
    if (this.draggedList() === null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation(); // a specific row's own dragover wins over the <ul>'s "drop past the last row" fallback below
    this.dragOverList.set(listKey);
    this.dragOverIndex.set(index);
  }

  /** Fallback for dropping below the last row (or into an empty list) — same `[end of list]` index the "move all" transfer would append at. Only fires when no specific row's own `dragover` already claimed the event (see `stopPropagation()` above). */
  protected onListDragOver(event: DragEvent, listKey: 'source' | 'target', endIndex: number): void {
    this.onDragOver(event, listKey, endIndex);
  }

  protected onDragLeave(listKey: 'source' | 'target', index: number): void {
    if (this.dragOverList() === listKey && this.dragOverIndex() === index) {
      this.dragOverList.set(null);
      this.dragOverIndex.set(null);
    }
  }

  protected onDrop(event: DragEvent, listKey: 'source' | 'target', filteredIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    const fromList = this.draggedList();
    const fromFilteredIndex = this.draggedIndex();
    this.resetDragState();
    if (fromList === null || fromFilteredIndex === null) {
      return;
    }
    // `filteredIndex`/`fromFilteredIndex` are positions in the currently
    // *displayed* (possibly filtered) list — translated to real positions
    // in the underlying `source()`/`target()` array before any splicing,
    // since a filter can make those two index spaces disagree. A no-op
    // passthrough when no filter is active (`realIndexFromFiltered` returns
    // the same index unchanged), so this is exactly the pre-filter
    // behavior in the common case.
    const fromIndex = this.realIndexFromFiltered(fromList, fromFilteredIndex);
    const index = this.realIndexFromFiltered(listKey, filteredIndex);
    const dragged = (fromList === 'source' ? this.source() : this.target())[fromIndex];
    if (dragged === undefined || this.itemDisabled()(dragged)) {
      return;
    }

    const listSignal = listKey === 'source' ? this.source : this.target;
    if (fromList === listKey) {
      if (fromIndex === index) {
        return;
      }
      // Same convention as OrderListComponent.onDrop: insertion happens at
      // `index` *after* removal, not before — so a drop dispatched at the
      // dragged item's own pre-removal index lands right after whatever
      // shifted into that slot, not literally at (or before) it.
      const items = [...listSignal()];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(index, 0, moved);
      listSignal.set(items);
      return;
    }

    const originSignal = fromList === 'source' ? this.source : this.target;
    const originItems = [...originSignal()];
    const [moved] = originItems.splice(fromIndex, 1);
    originSignal.set(originItems);

    const destItems = [...listSignal()];
    destItems.splice(index, 0, moved);
    listSignal.set(destItems);

    const originSelectionSignal = fromList === 'source' ? this.sourceSelectionSignal : this.targetSelectionSignal;
    originSelectionSignal.update((selection) => selection.filter((item) => item !== moved));
    if (this.keepSelection()) {
      const destSelectionSignal = listKey === 'source' ? this.sourceSelectionSignal : this.targetSelectionSignal;
      destSelectionSignal.update((selection) => [...selection, moved]);
    }
    (listKey === 'target' ? this.moveToTarget : this.moveToSource).emit([moved]);
  }

  protected onDragEnd(): void {
    this.resetDragState();
  }

  private resetDragState(): void {
    this.draggedList.set(null);
    this.draggedIndex.set(null);
    this.dragOverList.set(null);
    this.dragOverIndex.set(null);
  }
}
