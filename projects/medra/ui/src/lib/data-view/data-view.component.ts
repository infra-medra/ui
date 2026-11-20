import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, computed, contentChild, effect, input, linkedSignal, model, numberAttribute, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { InputTextDirective } from '../input-text/input-text.directive';
import { PaginatorComponent, PaginatorPageEvent } from '../paginator/paginator.component';
import { mergeClasses } from '../utils/merge-classes';

/**
 * DataView primitive (Tier 3, first item): renders an arbitrary `T[]` in a
 * `'list'` or `'grid'` layout, with optional pagination (`<med-paginator>`
 * reused unchanged, same component MultiSelect/AutoComplete-adjacent list
 * screens would already page through) — item markup itself is entirely
 * consumer-templated via a single projected `<ng-template #item let-item>`
 * (`NgTemplateOutlet`), the first component in this lib to need per-item
 * template projection rather than a fixed `label`/`value` shape (Select's
 * `SelectOption<T>`).
 *
 * **`#item` is now a required named slot, not a bare unnamed `<ng-template>`
 ***: once `header`/`footer`/`empty`
 * templates were added as sibling projected `<ng-template>`s, an unnamed
 * `contentChild.required(TemplateRef)` for the item template became
 * ambiguous — it matches by type only, so it could just as easily resolve
 * to one of those other templates depending on projection order, silently
 * rendering the wrong content. Same fix already applied earlier this
 * session to `CarouselComponent`/`TimelineComponent` for the identical
 * class of bug: name every projected template explicitly once there's more
 * than one of them.
 *
 * **`sortComparator`, not a `sortField` string + `sortOrder` number**: `T` is fully generic here
 * (no known shape to name a field on), so a plain `(a: T, b: T) => number` comparator is the only
 * type-safe option — reversing order is just the consumer flipping their own comparator, no
 * separate order input needed. `null` (default) renders `value` in the order given.
 *
 * **No built-in sort-toggle or list/grid-switcher UI**: like FileUpload
 * ("not a real uploader") and Toast/Dialog ("don't know what a successful
 * save means"), this is a primitive that reacts to whatever `layout`/
 * `sortComparator` the consumer's own UI drives, not an opinion on what
 * that UI should look like.
 *
 * **`header`/`footer`/`empty` templates, `filterPredicate`, `loading`, `lazy`,
 * `rowsPerPageOptions`**.
 *
 * **No `list`/`grid` templates**: such templates would receive the *entire current page* as
 * `$implicit` (`T[]`, not `T`), meaning the consumer's template has to re-implement its own
 * `@for`/iteration inside them — a second, strictly more work, projection mechanism accomplishing
 * exactly what the existing per-item `itemTemplate` (unchanged since this component's own v1)
 * already does more simply. Skipped for the same "already resolved by an existing mechanism"
 * reasoning already documented for `ButtonDirective`'s dropped `badge` and `TagComponent`'s dropped
 * `iconTemplate`. `header`/`footer` (`{ $implicit: value }`, unstyled, consumer-owns-the-markup —
 * same `medCardHeader`/`medCardFooter` philosophy) and `empty` (a template alternative to the plain
 * `emptyLabel` string, same precedent `medCardTitle` established over `title`) are genuinely
 * additive, so those three are implemented, using this library's own named-`contentChild` idiom
 * (`TableColumnComponent.editTemplate`, and this session's `Carousel`/`Timeline`/`MeterGroup`).
 *
 * **`filterPredicate`
 * function-over-field-name relaxation `PickListComponent.filterPredicate`
 * just established for the identical generic-`T` reason. Renders a plain
 * search box above the list when set; filtering runs before sorting and
 * pagination, so `sortedItems()`/`pagedItems()` both already see the
 * narrowed set.
 *
 * **`loading`/`loadingIcon`** replace the list entirely with a spinner row
 * — same "loading state supersedes content, not layered on top of it"
 * shape `SelectPanelComponent`'s/`TreeSelectPanelComponent`'s own `loading`
 * already use.
 *
 * **`lazy`** reinterprets `value()` as "the current page only, already filtered/sorted server-side"
 * — same reinterpretation `DataTableComponent`'s own `lazy` already documents:
 * `sortComparator`/`filterPredicate` are skipped client-side (the server already applied them),
 * pagination no longer slices `value()` further, and the paginator's total comes from
 * `totalRecords` instead of `value().length`. `lazyLoad` emits `{ first, rows }` whenever the
 * requested page/page-size actually changes, including once on init (`lazyLoadOnInit`, default
 * `true`) so a consumer's very first fetch doesn't need a separate manual kick-off.
 *
 * **`rowsPerPageOptions`** forwards straight through to the already-capable
 * `<med-paginator>` (it grew this input independently of any consumer
 * actually wiring it through yet — neither this component nor
 * `DataTableComponent` did until now). **`showJumpToPageDropdown`/
 * "jump-to-page" deliberately NOT added here** — `PaginatorComponent`
 * itself doesn't have it yet (still open, tracked on that component's own
 * tier item); adding it to just this one consumer ahead of the shared
 * primitive would mean redoing the work once `PaginatorComponent` grows it
 * for real.
 */
@Component({
  selector: 'med-data-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [NgTemplateOutlet, PaginatorComponent, InputTextDirective, IconComponent],
  template: `
    @if (filterPredicate()) {
      <input
        medInputText
        type="search"
        class="mb-3 max-w-64"
        [placeholder]="filterPlaceholder()"
        [attr.aria-label]="filterPlaceholder()"
        [value]="filterText()"
        (input)="filterText.set($any($event.target).value)"
      />
    }
    @if (headerTemplate(); as t) {
      <div class="mb-3">
        <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: value() }" />
      </div>
    }
    @if (loading()) {
      <div class="flex items-center justify-center gap-2 py-8 text-sm text-surface-400 dark:text-surface-500">
        <med-icon [name]="loadingIcon()" variant="mini" class="size-5 shrink-0 animate-spin" />
        <span>{{ loadingLabel() }}</span>
      </div>
    } @else {
      <div [class]="containerClass()">
        @for (item of pagedItems(); track trackByFn(item, $index)) {
          <ng-container [ngTemplateOutlet]="itemTemplate()" [ngTemplateOutletContext]="{ $implicit: item }" />
        } @empty {
          @if (emptyTemplate(); as t) {
            <ng-container [ngTemplateOutlet]="t" />
          } @else {
            <p class="col-span-full py-8 text-center text-sm text-surface-500 dark:text-surface-400">{{ emptyLabel() }}</p>
          }
        }
      </div>
    }
    @if (paginator() && effectiveTotalRecords() > 0) {
      <med-paginator
        class="mt-4 block"
        [totalRecords]="effectiveTotalRecords()"
        [(rows)]="pageSize"
        [rowsPerPageOptions]="rowsPerPageOptions()"
        [(first)]="first"
        (pageChange)="pageChange.emit($event)"
      />
    }
    @if (footerTemplate(); as t) {
      <div class="mt-3">
        <ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{ $implicit: value() }" />
      </div>
    }
  `,
})
export class DataViewComponent<T> {
  readonly value = input<readonly T[]>([]);
  readonly layout = input<'list' | 'grid'>('list');
  readonly paginator = input(false, { transform: booleanAttribute });
  readonly rows = input(10, { transform: numberAttribute });
  /** The page size in effect: follows `rows()`, and the paginator's "rows per page" select writes to it, so the visible slice and `lazyLoad` follow the user's choice. */
  protected readonly pageSize = linkedSignal(() => this.rows());
  readonly rowsPerPageOptions = input<readonly number[] | null>(null);
  readonly sortComparator = input<((a: T, b: T) => number) | null>(null);
  readonly filterPredicate = input<((item: T, query: string) => boolean) | null>(null);
  readonly filterPlaceholder = input('Search');
  readonly trackBy = input<(item: T, index: number) => unknown>((_item, index) => index);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingIcon = input('arrow-path');
  /** `value()` becomes "current page only, already filtered/sorted server-side" — see class doc. */
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly lazyLoadOnInit = input(true, { transform: booleanAttribute });
  /** Only read when `lazy` is on — the paginator's total otherwise comes from `value().length`. */
  readonly totalRecords = input(0, { transform: numberAttribute });
  /** Default: `'No results found'` — same wording Select's panel already uses for its own empty state. */
  readonly emptyLabel = input('No results found');
  readonly loadingLabel = input('Loading...');
  readonly class = input('', { alias: 'class' });

  readonly first = model(0);
  readonly pageChange = output<PaginatorPageEvent>();
  readonly lazyLoad = output<{ readonly first: number; readonly rows: number }>();

  protected readonly itemTemplate = contentChild.required('item', { read: TemplateRef });
  protected readonly headerTemplate = contentChild('header', { read: TemplateRef });
  protected readonly footerTemplate = contentChild('footer', { read: TemplateRef });
  protected readonly emptyTemplate = contentChild('empty', { read: TemplateRef });

  protected readonly filterText = model('');

  protected readonly filteredItems = computed(() => {
    const predicate = this.filterPredicate();
    const query = this.filterText().trim();
    if (this.lazy() || !predicate || !query) {
      return this.value();
    }
    return this.value().filter((item) => predicate(item, query));
  });

  protected readonly sortedItems = computed(() => {
    if (this.lazy()) {
      return this.filteredItems();
    }
    const comparator = this.sortComparator();
    return comparator ? [...this.filteredItems()].sort(comparator) : this.filteredItems();
  });

  protected readonly pagedItems = computed(() => {
    if (this.lazy() || !this.paginator()) {
      return this.sortedItems();
    }
    const first = this.first();
    return this.sortedItems().slice(first, first + this.pageSize());
  });

  protected readonly effectiveTotalRecords = computed(() => (this.lazy() ? this.totalRecords() : this.sortedItems().length));

  protected readonly containerClass = computed(() =>
    mergeClasses(this.layout() === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col divide-y divide-surface-200 dark:divide-surface-700', this.class()),
  );

  constructor() {
    let firstRun = true;
    effect(() => {
      const first = this.first();
      const rows = this.pageSize();
      if (!this.lazy()) {
        return;
      }
      if (firstRun) {
        firstRun = false;
        if (this.lazyLoadOnInit()) {
          this.lazyLoad.emit({ first, rows });
        }
        return;
      }
      this.lazyLoad.emit({ first, rows });
    });
  }

  protected trackByFn(item: T, index: number): unknown {
    return this.trackBy()(item, index);
  }
}
