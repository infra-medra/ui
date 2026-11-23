import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';

/**
 * Additional responsive stack cases (DAT-050 to DAT-052) that complement the locked cases in
 * `data-table.component.spec.ts`: explicit roles on the utility and full-width cells, the full-width
 * block of subheader and expansion rows, frozen rows inside a scrollable table, the edit template on
 * its own line, an empty `stackLabel`, and the unstacked first render.
 */

type MediaChangeListener = (event: { matches: boolean; media: string }) => void;

/** Controllable `window.matchMedia`: evaluates `(width < Npx)` against a width the test sets and fires `change` on resize. */
class ViewportMock {
  width = 1280;
  private readonly lists: { media: string; matches: boolean; listeners: Set<MediaChangeListener> }[] = [];

  install(): void {
    this.width = 1280;
    this.lists.length = 0;
    window.matchMedia = jest.fn((media: string) => {
      const entry = { media, matches: this.matches(media), listeners: new Set<MediaChangeListener>() };
      this.lists.push(entry);
      return {
        media,
        onchange: null,
        get matches() {
          return entry.matches;
        },
        addEventListener: (_type: string, listener: MediaChangeListener) => entry.listeners.add(listener),
        removeEventListener: (_type: string, listener: MediaChangeListener) => entry.listeners.delete(listener),
        addListener: (listener: MediaChangeListener) => entry.listeners.add(listener),
        removeListener: (listener: MediaChangeListener) => entry.listeners.delete(listener),
        dispatchEvent: () => true,
      } as unknown as MediaQueryList;
    }) as unknown as typeof window.matchMedia;
  }

  uninstall(): void {
    delete (window as { matchMedia?: unknown }).matchMedia;
    this.lists.length = 0;
  }

  resize(width: number): void {
    this.width = width;
    for (const entry of this.lists) {
      entry.matches = this.matches(entry.media);
      for (const listener of entry.listeners) {
        listener({ matches: entry.matches, media: entry.media });
      }
    }
  }

  private matches(media: string): boolean {
    const match = /\(width\s*<\s*(\d+(?:\.\d+)?)px\)/.exec(media);
    return match ? this.width < Number(match[1]) : false;
  }
}

interface Person {
  name: string;
  role: string;
  team: string;
}

const PEOPLE: Person[] = [
  { name: 'Ada', role: 'Engineer', team: 'Analytical' },
  { name: 'Grace', role: 'Admiral', team: 'Analytical' },
  { name: 'Alan', role: 'Engineer', team: 'Logic' },
];

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="people"
      responsiveLayout="stack"
      [selectionMode]="selectionMode"
      [(selection)]="selection"
      [editMode]="editMode"
      [reorderable]="reorderable"
      [rowGroupMode]="rowGroupMode"
      [groupRowsBy]="groupRowsBy"
      [scrollable]="scrollable"
      [scrollHeight]="scrollHeight"
      [frozenValue]="frozenValue"
      [loading]="loading"
      loadingMode="skeleton"
      [dataKey]="dataKey"
      [(expandedRowKeys)]="expandedRowKeys"
      ariaLabel="People"
    >
      <med-table-column field="name" header="Name" [frozen]="nameFrozen" [stackLabel]="nameLabel" [editable]="true">
        <ng-template let-row>{{ row.name }}</ng-template>
        <ng-template #editTemplate let-row let-onSave="onSave">
          <input class="edit-input" [value]="row.name" (keydown.enter)="onSave($any($event.target).value)" />
        </ng-template>
      </med-table-column>
      <med-table-column field="role" header="Role">
        <ng-template let-row>{{ row.role }}</ng-template>
      </med-table-column>
      @if (showTeam) {
        <med-table-column field="team" header="Team">
          <ng-template let-row>{{ row.team }}</ng-template>
        </med-table-column>
      }
      @if (showExpansion) {
        <ng-template #rowexpansion let-row><div class="expanded-detail">Detail: {{ row.name }}</div></ng-template>
      }
    </med-data-table>
  `,
})
class StackFeaturesHostComponent {
  people: Person[] = PEOPLE;
  selectionMode: 'multiple' | 'radio' | null = null;
  selection: Person[] | Person | null = [];
  editMode: 'row' | null = null;
  reorderable = false;
  rowGroupMode: 'subheader' | null = null;
  groupRowsBy: string | null = null;
  scrollable = false;
  scrollHeight: string | null = null;
  frozenValue: Person[] | null = null;
  loading = false;
  dataKey: string | null = null;
  expandedRowKeys: Record<string, boolean> = {};
  nameFrozen = false;
  nameLabel: string | null = null;
  showTeam = false;
  showExpansion = false;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="people" responsiveLayout="stack" ariaLabel="People">
      <ng-template #headerGroup>
        <tr class="group-plain">
          <th colspan="2">People</th>
          @if (showExtra()) {
            <th class="group-extra">Extra</th>
          }
        </tr>
        <tr class="group-own-roles" role="row">
          <th role="columnheader">Name and role</th>
          <td>Details</td>
        </tr>
      </ng-template>
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
      <med-table-column field="role" header="Role">
        <ng-template let-row>{{ row.role }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class StackHeaderGroupHostComponent {
  people: Person[] = PEOPLE;
  readonly showExtra = signal(false);
}

function createTable(configure?: (host: StackFeaturesHostComponent) => void): ComponentFixture<StackFeaturesHostComponent> {
  const fixture = TestBed.createComponent(StackFeaturesHostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

function bodyRows(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('tbody tr'));
}

function cells(row: HTMLElement): HTMLElement[] {
  return Array.from(row.querySelectorAll<HTMLElement>(':scope > td'));
}

/** A stack label is the `aria-hidden` element that is a direct child of a body cell. */
function label(cell: HTMLElement): HTMLElement | null {
  return cell.querySelector<HTMLElement>(':scope > [aria-hidden="true"]');
}

/** A cell's value without its stack label. */
function cellValue(cell: HTMLElement): string {
  const clone = cell.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
  return clone.textContent?.trim() ?? '';
}

/**
 * Asserts every clause of DAT-051.S1 on the whole table: the `table` role, `rowgroup` on each row group, `row` on every header and
 * body row, `columnheader` on every header cell and `cell` on every body cell, utility and full-width cells included.
 */
function expectStackRoles(root: HTMLElement): void {
  const table = root.querySelector('table')!;
  expect(table.getAttribute('role')).toBe('table');
  table.querySelectorAll('thead, tbody').forEach((group) => expect(group.getAttribute('role')).toBe('rowgroup'));
  const rows = Array.from(table.querySelectorAll('tr'));
  expect(rows.length).toBeGreaterThan(1);
  expect(rows.map((row) => row.getAttribute('role'))).toEqual(rows.map(() => 'row'));
  const headerCells = Array.from(table.querySelectorAll('thead tr[data-med-header-row] > th'));
  expect(headerCells.map((th) => th.getAttribute('role'))).toEqual(headerCells.map(() => 'columnheader'));
  const bodyCells = Array.from(table.querySelectorAll('tbody td'));
  expect(bodyCells.length).toBeGreaterThan(0);
  expect(bodyCells.map((td) => td.getAttribute('role'))).toEqual(bodyCells.map(() => 'cell'));
}

describe('DataTableComponent responsive stack, utility cells and full-width rows (DAT-050 to DAT-052)', () => {
  const viewport = new ViewportMock();

  beforeEach(() => viewport.install());
  afterEach(() => viewport.uninstall());

  describe('roles on utility and full-width cells (DAT-051)', () => {
    it('DAT-051.S1: a stacked two-column, one-row table with selectionMode="multiple" and editMode="row" gives every row, header cell and body cell an explicit role', () => {
      viewport.resize(800);
      const fixture = createTable((host) => {
        host.people = [PEOPLE[0]];
        host.selectionMode = 'multiple';
        host.editMode = 'row';
      });
      const root = fixture.nativeElement as HTMLElement;
      const headerCells = Array.from(root.querySelectorAll<HTMLElement>('thead tr[data-med-header-row] > th'));

      // Selection header, Name, Role and the row actions header.
      expect(headerCells).toHaveLength(4);
      expect(headerCells.at(-1)?.textContent?.trim()).toBe('Row actions');
      expect(cells(bodyRows(root)[0])).toHaveLength(4);
      expectStackRoles(root);
    });

    it('DAT-051.S1: a stacked two-column, one-row table with selectionMode="radio" gives the radio header and cell explicit roles', () => {
      viewport.resize(800);
      const fixture = createTable((host) => {
        host.people = [PEOPLE[0]];
        host.selectionMode = 'radio';
        host.selection = null;
      });
      const root = fixture.nativeElement as HTMLElement;

      expect(root.querySelectorAll('tbody input[type="radio"]')).toHaveLength(1);
      expectStackRoles(root);
    });

    it('DAT-051.S1: a stacked two-column, one-row table gives its subheader, expansion and empty cells explicit roles', () => {
      viewport.resize(800);
      const grouped = createTable((host) => {
        host.people = [PEOPLE[0]];
        host.rowGroupMode = 'subheader';
        host.groupRowsBy = 'team';
        host.showExpansion = true;
        host.dataKey = 'name';
        host.expandedRowKeys = { Ada: true };
      });
      const groupedRoot = grouped.nativeElement as HTMLElement;
      expect(groupedRoot.querySelector('.expanded-detail')).not.toBeNull();
      expect(groupedRoot.querySelectorAll('tbody td[colspan]').length).toBeGreaterThanOrEqual(2);
      expectStackRoles(groupedRoot);

      const empty = createTable((host) => {
        host.people = [];
      });
      const emptyRoot = empty.nativeElement as HTMLElement;
      expect(emptyRoot.querySelectorAll('tbody td[colspan]')).toHaveLength(1);
      expectStackRoles(emptyRoot);
    });

    it('DAT-051: skeleton rows carry the row and cell roles while stacked', () => {
      viewport.resize(800);
      const fixture = createTable((host) => {
        host.selectionMode = 'multiple';
        host.editMode = 'row';
        host.loading = true;
      });
      const root = fixture.nativeElement as HTMLElement;

      expect(root.querySelectorAll('tbody med-skeleton').length).toBeGreaterThan(0);
      expectStackRoles(root);
    });

    it('DAT-051: utility and full-width cells carry no role when the table is not stacked', () => {
      viewport.resize(1200);
      const fixture = createTable((host) => {
        host.selectionMode = 'multiple';
        host.editMode = 'row';
        host.rowGroupMode = 'subheader';
        host.groupRowsBy = 'team';
      });
      const root = fixture.nativeElement as HTMLElement;

      expect(root.querySelectorAll('[role]:not(input):not(button)').length).toBe(0);
    });
  });

  describe('other features while stacked (DAT-052)', () => {
    it('DAT-052.S2: in a scrollable table a frozen column and frozen rows are not sticky, keep their normal order and are labelled', () => {
      // Frozen rows are only sticky when the body scrolls inside the table, so `scrollable` is on for the assertion to be able to fail.
      const configure = (host: StackFeaturesHostComponent) => {
        host.scrollable = true;
        host.scrollHeight = '300px';
        host.nameFrozen = true;
        host.frozenValue = [{ name: 'Total', role: 'All', team: '-' }];
      };
      viewport.resize(1200);
      const unstacked = createTable(configure);
      const unstackedRoot = unstacked.nativeElement as HTMLElement;
      expect(unstackedRoot.querySelectorAll('tbody.sticky')).toHaveLength(1);
      expect(unstackedRoot.querySelectorAll('td.sticky').length).toBeGreaterThan(0);

      viewport.resize(800);
      const fixture = createTable(configure);
      const root = fixture.nativeElement as HTMLElement;
      const rows = bodyRows(root);
      const sticky = Array.from(root.querySelectorAll<HTMLElement>('*')).filter(
        (element) => element.classList.contains('sticky') || element.style.position === 'sticky',
      );

      expect(sticky).toEqual([]);
      expect(rows.map((row) => cellValue(cells(row)[0]))).toEqual(['Total', 'Ada', 'Grace', 'Alan']);
      for (const row of rows) {
        expect(cells(row).map((cell) => label(cell)?.textContent?.trim())).toEqual(['Name', 'Role']);
      }
    });

    it('DAT-052.S4: checking and expanding a row selects it with an unlabelled checkbox cell, shows no reorder handle, and renders the expansion as a full-width block under the row', () => {
      viewport.resize(800);
      const fixture = createTable((host) => {
        host.selectionMode = 'multiple';
        host.reorderable = true;
        host.showExpansion = true;
        host.dataKey = 'name';
      });
      const root = fixture.nativeElement as HTMLElement;
      const checkbox = root.querySelector<HTMLInputElement>('tbody tr input[type="checkbox"]')!;
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      fixture.componentInstance.expandedRowKeys = { Ada: true };
      fixture.detectChanges();

      const firstRow = bodyRows(root)[0];
      expect(fixture.componentInstance.selection).toEqual([PEOPLE[0]]);
      expect(firstRow.getAttribute('aria-selected')).toBe('true');
      const checkboxCell = cells(firstRow)[0];
      expect(checkboxCell.querySelector('input[type="checkbox"]')).not.toBeNull();
      expect(label(checkboxCell)).toBeNull();
      expect(root.querySelectorAll('tbody med-icon[name="bars-3"]')).toHaveLength(0);

      const expansionRow = firstRow.nextElementSibling as HTMLElement;
      const expansionCell = root.querySelector('.expanded-detail')!.closest('td') as HTMLElement;
      expect(expansionRow.contains(expansionCell)).toBe(true);
      expect(expansionRow.classList.contains('block')).toBe(true);
      expect(expansionCell.classList.contains('block')).toBe(true);

      viewport.resize(1200);
      fixture.detectChanges();
      const wideExpansionCell = root.querySelector('.expanded-detail')!.closest('td') as HTMLElement;
      expect(wideExpansionCell.classList.contains('block')).toBe(false);
      expect(wideExpansionCell.closest('tr')?.classList.contains('block')).toBe(false);
    });

    it('DAT-052.S5: a subheader row and its cell are full-width blocks while stacked, and table cells again when unstacked', () => {
      viewport.resize(800);
      const fixture = createTable((host) => {
        host.showTeam = true;
        host.rowGroupMode = 'subheader';
        host.groupRowsBy = 'team';
      });
      const root = fixture.nativeElement as HTMLElement;
      const groupCells = (): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>('tbody td[colspan]'));

      expect(groupCells().map((cell) => cell.textContent?.trim())).toEqual(['Analytical', 'Logic']);
      for (const cell of groupCells()) {
        expect(cell.classList.contains('block')).toBe(true);
        expect(cell.closest('tr')?.classList.contains('block')).toBe(true);
      }

      viewport.resize(1200);
      fixture.detectChanges();
      for (const cell of groupCells()) {
        expect(cell.classList.contains('block')).toBe(false);
        expect(cell.closest('tr')?.classList.contains('block')).toBe(false);
      }
    });

    it('DAT-052.S7: the edit template sits under the label on its own line, and the actions cell shows its buttons with no label', () => {
      viewport.resize(800);
      const fixture = createTable((host) => {
        host.editMode = 'row';
      });
      const root = fixture.nativeElement as HTMLElement;
      const idleLabel = label(cells(bodyRows(root)[0])[0])!;
      expect(idleLabel.classList.contains('inline-block')).toBe(true);

      root.querySelector<HTMLButtonElement>('tbody button[aria-label="Edit row"]')!.click();
      fixture.detectChanges();

      const firstRow = bodyRows(root)[0];
      const nameCell = cells(firstRow)[0];
      const editLabel = label(nameCell)!;
      const input = nameCell.querySelector('.edit-input')!;
      expect(editLabel.textContent?.trim()).toBe('Name');
      // A `block` label fills its line, so the edit template that follows it starts on the next line.
      expect(editLabel.classList.contains('block')).toBe(true);
      expect(editLabel.classList.contains('inline-block')).toBe(false);
      expect(editLabel.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

      const actionsCell = cells(firstRow).at(-1)!;
      expect(Array.from(actionsCell.querySelectorAll('button')).map((button) => button.getAttribute('aria-label'))).toEqual(['Save row', 'Cancel editing']);
      expect(label(actionsCell)).toBeNull();
    });
  });

  describe('labels and first render (DAT-050)', () => {
    it('DAT-050: an empty stackLabel suppresses the label of a column that has a header', () => {
      viewport.resize(800);
      const fixture = createTable((host) => {
        host.nameLabel = '';
      });
      const firstRow = bodyRows(fixture.nativeElement as HTMLElement)[0];

      expect(label(cells(firstRow)[0])).toBeNull();
      expect(label(cells(firstRow)[1])?.textContent?.trim()).toBe('Role');
    });

    it('DAT-050: the first render is unstacked, so hydration sees the server markup, and the table stacks after it', () => {
      viewport.resize(800);
      const fixture = TestBed.createComponent(StackFeaturesHostComponent);
      const root = fixture.nativeElement as HTMLElement;
      // A view-level check renders the template without running the after-render hooks of the application tick.
      fixture.componentRef.changeDetectorRef.detectChanges();
      expect(root.querySelector('table')?.getAttribute('role')).toBeNull();
      expect(root.querySelectorAll('tbody td > [aria-hidden="true"]')).toHaveLength(0);

      fixture.detectChanges();
      expect(root.querySelector('table')?.getAttribute('role')).toBe('table');
      expect(root.querySelectorAll('tbody td > [aria-hidden="true"]').length).toBeGreaterThan(0);
    });
  });

  describe('consumer header group rows (DAT-051)', () => {
    it('DAT-051: while stacked the #headerGroup rows and cells get explicit row, columnheader and cell roles, removed again when unstacked', () => {
      viewport.resize(800);
      const fixture = TestBed.createComponent(StackHeaderGroupHostComponent);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const plain = root.querySelector<HTMLElement>('thead tr.group-plain')!;
      const ownRoles = root.querySelector<HTMLElement>('thead tr.group-own-roles')!;
      const plainHeader = plain.querySelector<HTMLElement>('th')!;
      const ownHeader = ownRoles.querySelector<HTMLElement>('th')!;
      const ownCell = ownRoles.querySelector<HTMLElement>('td')!;

      expect(root.querySelector('table')?.getAttribute('role')).toBe('table');
      expect(plain.classList.contains('sr-only')).toBe(true);
      expect(plain.getAttribute('role')).toBe('row');
      expect(plainHeader.getAttribute('role')).toBe('columnheader');
      expect(ownRoles.getAttribute('role')).toBe('row');
      expect(ownHeader.getAttribute('role')).toBe('columnheader');
      expect(ownCell.getAttribute('role')).toBe('cell');
      expectStackRoles(root);
      const groupRows = Array.from(root.querySelectorAll('thead tr:not([data-med-header-row])'));
      expect(groupRows).toHaveLength(2);
      groupRows.forEach((row) => {
        expect(row.getAttribute('role')).toBe('row');
        Array.from(row.children).forEach((cell) => expect(cell.getAttribute('role')).toBe(cell.tagName === 'TH' ? 'columnheader' : 'cell'));
      });

      viewport.resize(1280);
      fixture.detectChanges();

      expect(root.querySelector('table')?.getAttribute('role')).toBeNull();
      expect(plain.classList.contains('sr-only')).toBe(false);
      expect(plain.getAttribute('role')).toBeNull();
      expect(plainHeader.getAttribute('role')).toBeNull();
      expect(ownCell.getAttribute('role')).toBeNull();
      // Roles the application wrote itself are kept.
      expect(ownRoles.getAttribute('role')).toBe('row');
      expect(ownHeader.getAttribute('role')).toBe('columnheader');
    });

    it('DAT-051: a #headerGroup cell added while stacked gets its role, and loses it when the table unstacks', () => {
      viewport.resize(800);
      const fixture = TestBed.createComponent(StackHeaderGroupHostComponent);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const plain = root.querySelector<HTMLElement>('thead tr.group-plain')!;
      expect(plain.getAttribute('role')).toBe('row');
      expect(root.querySelector('thead th.group-extra')).toBeNull();

      fixture.componentInstance.showExtra.set(true);
      fixture.detectChanges();
      const extra = root.querySelector<HTMLElement>('thead th.group-extra')!;
      expect(extra).not.toBeNull();
      expect(extra.getAttribute('role')).toBe('columnheader');

      viewport.resize(1280);
      fixture.detectChanges();
      expect(plain.getAttribute('role')).toBeNull();
      expect(extra.getAttribute('role')).toBeNull();
    });
  });
});
