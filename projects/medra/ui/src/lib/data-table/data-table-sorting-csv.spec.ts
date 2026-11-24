import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableLazyLoadEvent, TableSortMeta, TableSortMode } from './data-table.types';

interface ItemRow {
  a: string;
  b: number;
}

interface TaskRow {
  name: string;
  status: string;
  statusRank: number;
}

function create<T>(host: Type<T>): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [host] });
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture;
}

function headerCell(fixture: ComponentFixture<unknown>, label: string): HTMLElement {
  const cell = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead th')).find((th) => th.textContent!.trim().startsWith(label));
  expect(cell).toBeDefined();
  return cell!;
}

/* ------------------------------------------------------------------------------------------------ */
/* DAT-003.S2: Non-removable multi-column sort                                                      */
/* ------------------------------------------------------------------------------------------------ */

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      sortMode="multiple"
      [removableSort]="false"
      [(multiSortMeta)]="multiSortMeta"
      ariaLabel="Non-removable multi-sort"
    >
      <med-table-column field="a" header="A" sortable />
      <med-table-column field="b" header="B" sortable />
    </med-data-table>
  `,
})
class NonRemovableMultiSortHostComponent {
  rows = signal<ItemRow[]>([
    { a: 'Alpha', b: 1 },
    { a: 'Alpha', b: 2 },
    { a: 'Beta', b: 3 },
  ]);
  multiSortMeta: TableSortMeta[] = [
    { field: 'a', order: 'asc' },
    { field: 'b', order: 'desc' },
  ];
}

describe('DataTableComponent non-removable multi-column sort (DAT-003.S2)', () => {
  it('DAT-003.S2: Shift+clicking a descending column with removableSort="false" cycles it back to ascending instead of removing it', () => {
    const fixture = create(NonRemovableMultiSortHostComponent);
    const host = fixture.componentInstance;

    expect(host.multiSortMeta).toEqual([
      { field: 'a', order: 'asc' },
      { field: 'b', order: 'desc' },
    ]);

    headerCell(fixture, 'B').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    fixture.detectChanges();

    expect(host.multiSortMeta).toEqual([
      { field: 'a', order: 'asc' },
      { field: 'b', order: 'asc' },
    ]);
    const bodyValues = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr')).map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) => td.textContent!.trim()),
    );
    expect(bodyValues).toEqual([
      ['Alpha', '1'],
      ['Alpha', '2'],
      ['Beta', '3'],
    ]);
  });

  it('DAT-003.S1: Shift+clicking column B on a table sorted by column A sorts by A then B and shows priority badges', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table [value]="rows" sortMode="multiple" ariaLabel="Default multi sort">
          <med-table-column field="a" header="A" sortable />
          <med-table-column field="b" header="B" sortable />
        </med-data-table>
      `,
    })
    class DefaultMultiSortHostComponent {
      rows = [
        { a: 'Beta', b: 1 },
        { a: 'Alpha', b: 3 },
        { a: 'Alpha', b: 2 },
      ];
    }

    const fixture = create(DefaultMultiSortHostComponent);

    headerCell(fixture, 'A').click();
    fixture.detectChanges();

    headerCell(fixture, 'B').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    fixture.detectChanges();

    const bodyValues = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr')).map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) => td.textContent!.trim()),
    );
    expect(bodyValues).toEqual([
      ['Alpha', '2'],
      ['Alpha', '3'],
      ['Beta', '1'],
    ]);
    expect(headerCell(fixture, 'A').textContent).toContain('1');
    expect(headerCell(fixture, 'B').textContent).toContain('2');
  });

  it('DAT-003.S2: plain clicking a single active descending column with removableSort="false" cycles back to ascending', () => {
    const fixture = create(NonRemovableMultiSortHostComponent);
    const host = fixture.componentInstance;

    headerCell(fixture, 'A').click();
    fixture.detectChanges();
    expect(host.multiSortMeta).toEqual([{ field: 'a', order: 'asc' }]);

    headerCell(fixture, 'A').click();
    fixture.detectChanges();
    expect(host.multiSortMeta).toEqual([{ field: 'a', order: 'desc' }]);

    headerCell(fixture, 'A').click();
    fixture.detectChanges();
    expect(host.multiSortMeta).toEqual([{ field: 'a', order: 'asc' }]);
  });
});

/* ------------------------------------------------------------------------------------------------ */
/* DAT-055.S6: Lazy load emits resolved sortBy and multiSortByMeta                                  */
/* ------------------------------------------------------------------------------------------------ */

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="tasks()"
      [lazy]="true"
      [totalRecords]="3"
      [sortMode]="sortMode()"
      (lazyLoad)="onLazyLoad($event)"
      ariaLabel="Lazy sortBy"
    >
      <med-table-column field="name" header="Name" sortable />
      <med-table-column field="status" header="Status" sortable sortBy="statusRank" />
    </med-data-table>
  `,
})
class LazySortByHostComponent {
  tasks = signal<TaskRow[]>([
    { name: 'Ship', status: 'Done', statusRank: 3 },
    { name: 'Fix', status: 'Open', statusRank: 1 },
    { name: 'Test', status: 'Blocked', statusRank: 2 },
  ]);
  sortMode = signal<TableSortMode>('single');
  lazyEvents: TableLazyLoadEvent[] = [];

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.lazyEvents.push(event);
  }
}

describe('DataTableComponent lazyLoad sortBy and multiSortByMeta (DAT-055.S6)', () => {
  it('DAT-055.S6: emits sortField as status and resolved sortBy as statusRank in single sort mode', () => {
    const fixture = create(LazySortByHostComponent);
    const host = fixture.componentInstance;

    headerCell(fixture, 'Status').click();
    fixture.detectChanges();

    const last = host.lazyEvents[host.lazyEvents.length - 1] as TableLazyLoadEvent & {
      sortBy?: string | null;
      multiSortByMeta?: readonly TableSortMeta[];
    };
    expect(last.sortField).toBe('status');
    expect(last.sortOrder).toBe('asc');
    expect(last.sortBy).toBe('statusRank');
    expect(last.multiSortByMeta).toEqual([]);
  });

  it('DAT-055.S6: emits multiSortMeta with field names and multiSortByMeta with resolved sortBy names in multiple sort mode', () => {
    const fixture = create(LazySortByHostComponent);
    const host = fixture.componentInstance;
    host.sortMode.set('multiple');
    fixture.detectChanges();

    headerCell(fixture, 'Status').click();
    fixture.detectChanges();
    headerCell(fixture, 'Name').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    fixture.detectChanges();

    const last = host.lazyEvents[host.lazyEvents.length - 1] as TableLazyLoadEvent & {
      sortBy?: string | null;
      multiSortByMeta?: readonly TableSortMeta[];
    };
    expect(last.multiSortMeta).toEqual([
      { field: 'status', order: 'asc' },
      { field: 'name', order: 'asc' },
    ]);
    expect(last.multiSortByMeta).toEqual([
      { field: 'statusRank', order: 'asc' },
      { field: 'name', order: 'asc' },
    ]);
  });
});

/* ------------------------------------------------------------------------------------------------ */
/* DAT-009.S3: Footer included in CSV export                                                        */
/* ------------------------------------------------------------------------------------------------ */

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="rows()" ariaLabel="CSV footer">
      <med-table-column field="label" header="Label" [footer]="labelFooter()" />
      <med-table-column field="amount" header="Amount" [footer]="amountFooter()" />
      <med-table-column field="secret" header="Secret" footer="HiddenFooter" [visible]="false" />
    </med-data-table>
  `,
})
class CsvFooterHostComponent {
  rows = signal([
    { label: 'Alpha', amount: 40, secret: 'x' },
    { label: 'Beta', amount: 60, secret: 'y' },
  ]);
  labelFooter = signal<string | null>('Total');
  amountFooter = signal<string | null>('100');
}

describe('DataTableComponent exportCSV with footer (DAT-009.S3)', () => {
  function exportedCsv(fixture: ComponentFixture<unknown>, options?: { selectionOnly?: boolean; includeFooter?: boolean }): string {
    let capturedCsv = '';
    const spy = jest.spyOn(globalThis, 'Blob' as never).mockImplementation(((parts: string[]) => {
      capturedCsv = parts[0];
      return {} as Blob;
    }) as never);
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const table = fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as {
      exportCSV: (opts?: { selectionOnly?: boolean; includeFooter?: boolean }) => void;
    };
    table.exportCSV(options);
    clickSpy.mockRestore();
    spy.mockRestore();
    return capturedCsv;
  }

  it('DAT-009.S3: exportCSV({ includeFooter: true }) appends the footer row of visible columns after the data rows', () => {
    const fixture = create(CsvFooterHostComponent);

    const csv = exportedCsv(fixture, { includeFooter: true });

    expect(csv).toBe('Label,Amount\nAlpha,40\nBeta,60\nTotal,100');
  });

  it('DAT-009.S3: exportCSV() without includeFooter omits the footer row, and includeFooter appends nothing when no visible column has footer text', () => {
    const fixture = create(CsvFooterHostComponent);

    expect(exportedCsv(fixture)).toBe('Label,Amount\nAlpha,40\nBeta,60');

    fixture.componentInstance.labelFooter.set(null);
    fixture.componentInstance.amountFooter.set(null);
    fixture.detectChanges();

    expect(exportedCsv(fixture, { includeFooter: true })).toBe('Label,Amount\nAlpha,40\nBeta,60');
  });
});
