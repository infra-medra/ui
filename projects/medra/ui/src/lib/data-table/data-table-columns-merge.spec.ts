import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableColumnReorderEvent } from './data-table.types';

function create<T>(host: Type<T>): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [host] });
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture;
}

function headerCells(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead tr[data-med-header-row] th'));
}

function headerTexts(fixture: ComponentFixture<unknown>): string[] {
  return headerCells(fixture).map((th) => th.textContent!.trim());
}

function bodyRows(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr'));
}

function fire(target: HTMLElement, type: string): void {
  target.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
}

function dragHeader(fixture: ComponentFixture<unknown>, from: string, to: string): void {
  const cells = headerCells(fixture);
  const source = cells.find((th) => th.textContent!.trim() === from)!;
  const target = cells.find((th) => th.textContent!.trim() === to)!;
  fire(source, 'dragstart');
  fire(target, 'dragover');
  fire(target, 'drop');
  fire(source, 'dragend');
  fixture.detectChanges();
}

/* ------------------------------------------------------------------------------------------------ */
/* DAT-034.S12: Reordering columns across frozen boundaries                                         */
/* ------------------------------------------------------------------------------------------------ */

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      reorderableColumns
      [reorderAcrossFrozen]="reorderAcrossFrozen()"
      (colReorder)="onColReorder($event)"
      ariaLabel="Reorder across frozen"
    >
      <med-table-column field="f" header="F" width="100px" [(frozen)]="fFrozen" [(alignFrozen)]="fAlign" />
      <med-table-column field="a" header="A" width="80px" [(frozen)]="aFrozen" [(alignFrozen)]="aAlign" />
      <med-table-column field="b" header="B" width="90px" />
      <med-table-column field="r" header="R" width="120px" [(frozen)]="rFrozen" [(alignFrozen)]="rAlign" />
    </med-data-table>
  `,
})
class ReorderAcrossFrozenHostComponent {
  rows = signal([{ f: 'f1', a: 'a1', b: 'b1', r: 'r1' }]);
  reorderAcrossFrozen = signal(true);
  fFrozen = signal(true);
  fAlign = signal<'left' | 'right'>('left');
  aFrozen = signal(false);
  aAlign = signal<'left' | 'right'>('left');
  rFrozen = signal(true);
  rAlign = signal<'left' | 'right'>('right');
  reorders: TableColumnReorderEvent[] = [];

  onColReorder(event: TableColumnReorderEvent): void {
    this.reorders.push(event);
  }
}

describe('DataTableComponent reorderAcrossFrozen (DAT-034.S12)', () => {
  it('DAT-034.S12: dragging a free column onto a left-frozen column moves it, freezes it on the left, and recomputes offsets', () => {
    const fixture = create(ReorderAcrossFrozenHostComponent);
    const host = fixture.componentInstance;

    dragHeader(fixture, 'A', 'F');

    expect(headerTexts(fixture)).toEqual(['A', 'F', 'B', 'R']);
    expect(host.aFrozen()).toBe(true);
    expect(host.aAlign()).toBe('left');
    expect(host.reorders).toEqual([{ dragIndex: 1, dropIndex: 0, columns: ['a', 'f', 'b', 'r'] }]);

    const headers = headerCells(fixture);
    expect(headers[0].style.position).toBe('sticky');
    expect(headers[0].style.left).toBe('0px');
    expect(headers[1].style.position).toBe('sticky');
    expect(headers[1].style.left).toBe('80px');
    expect(headers[2].style.position).not.toBe('sticky');
    expect(headers[3].style.position).toBe('sticky');
    expect(headers[3].style.right).toBe('0px');
  });

  it('DAT-034.S12: dragging free column onto right-frozen adopts right alignment, and dragging frozen onto free unfreezes it', () => {
    const fixture = create(ReorderAcrossFrozenHostComponent);
    const host = fixture.componentInstance;

    dragHeader(fixture, 'A', 'R');
    expect(headerTexts(fixture)).toEqual(['F', 'B', 'R', 'A']);
    expect(host.aFrozen()).toBe(true);
    expect(host.aAlign()).toBe('right');
    const afterRight = headerCells(fixture);
    expect(afterRight[2].style.right).toBe('80px');
    expect(afterRight[3].style.right).toBe('0px');

    dragHeader(fixture, 'F', 'B');
    expect(headerTexts(fixture)).toEqual(['B', 'F', 'R', 'A']);
    expect(host.fFrozen()).toBe(false);
    expect(headerCells(fixture)[1].style.position).not.toBe('sticky');
  });

  it('DAT-034.S12: with reorderAcrossFrozen false, dragging across a frozen boundary does nothing', () => {
    const fixture = create(ReorderAcrossFrozenHostComponent);
    const host = fixture.componentInstance;
    host.reorderAcrossFrozen.set(false);
    fixture.detectChanges();

    dragHeader(fixture, 'A', 'F');

    expect(headerTexts(fixture)).toEqual(['F', 'A', 'B', 'R']);
    expect(host.aFrozen()).toBe(false);
    expect(host.reorders).toEqual([]);
  });
});

/* ------------------------------------------------------------------------------------------------ */
/* DAT-058.S1: Data table column cell merging                                                       */
/* ------------------------------------------------------------------------------------------------ */

interface MergeRow {
  id: string;
  region: string;
  status: string;
  item: string;
}

const MERGE_ROWS: MergeRow[] = [
  { id: '1', region: 'East', status: 'Open', item: 'Alpha' },
  { id: '2', region: 'East', status: 'Open', item: 'Beta' },
  { id: '3', region: 'East', status: 'Done', item: 'Gamma' },
  { id: '4', region: 'West', status: 'Done', item: 'Delta' },
  { id: '5', region: 'East', status: 'Open', item: 'Epsilon' },
];

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      dataKey="id"
      [paginator]="paginator()"
      [rows]="pageRows()"
      [first]="first()"
      [(expandedRowKeys)]="expandedRowKeys"
      ariaLabel="Column merge"
    >
      <med-table-column field="region" header="Region" [merge]="true" [frozen]="regionFrozen()" width="100px" />
      <med-table-column field="status" header="Status" [merge]="true" />
      <med-table-column field="item" header="Item" />
      <ng-template #rowexpansion let-row>
        <div class="merged-detail">Detail: {{ row.item }}</div>
      </ng-template>
    </med-data-table>
  `,
})
class MergeHostComponent {
  rows = signal<MergeRow[]>(MERGE_ROWS);
  paginator = signal(false);
  pageRows = signal(10);
  first = signal(0);
  regionFrozen = signal(false);
  expandedRowKeys = signal<Record<string, boolean>>({});
}

describe('DataTableComponent column cell merging (DAT-058.S1)', () => {
  it('DAT-058.S1: merges consecutive equal cells across multiple columns without groupRowsBy and preserves row order', () => {
    const fixture = create(MergeHostComponent);
    const rows = bodyRows(fixture);

    expect(rows).toHaveLength(5);
    expect(rows.map((tr) => tr.querySelectorAll('td').length)).toEqual([3, 1, 2, 2, 3]);

    const row0Cells = Array.from(rows[0].querySelectorAll('td'));
    expect(row0Cells[0].textContent!.trim()).toBe('East');
    expect(row0Cells[0].getAttribute('rowspan')).toBe('3');
    expect(row0Cells[1].textContent!.trim()).toBe('Open');
    expect(row0Cells[1].getAttribute('rowspan')).toBe('2');
    expect(row0Cells[2].textContent!.trim()).toBe('Alpha');

    expect(Array.from(rows[1].querySelectorAll('td')).map((td) => td.textContent!.trim())).toEqual(['Beta']);

    const row2Cells = Array.from(rows[2].querySelectorAll('td'));
    expect(row2Cells[0].textContent!.trim()).toBe('Done');
    expect(row2Cells[0].getAttribute('rowspan')).toBe('2');
    expect(row2Cells[1].textContent!.trim()).toBe('Gamma');

    const row3Cells = Array.from(rows[3].querySelectorAll('td'));
    expect(row3Cells[0].textContent!.trim()).toBe('West');
    expect(row3Cells[0].getAttribute('rowspan')).toBeNull();
    expect(row3Cells[1].textContent!.trim()).toBe('Delta');

    const row4Cells = Array.from(rows[4].querySelectorAll('td'));
    expect(row4Cells.map((td) => td.textContent!.trim())).toEqual(['East', 'Open', 'Epsilon']);
  });

  it('DAT-058.S1: keeps rows rectangular across page boundaries', () => {
    const fixture = create(MergeHostComponent);
    const host = fixture.componentInstance;
    host.paginator.set(true);
    host.pageRows.set(2);
    host.first.set(2);
    fixture.detectChanges();

    const rows = bodyRows(fixture);
    expect(rows).toHaveLength(2);
    expect(rows.map((tr) => tr.querySelectorAll('td').length)).toEqual([3, 2]);
    expect(rows[0].querySelectorAll('td')[0].getAttribute('rowspan')).toBeNull();
    expect(rows[0].querySelectorAll('td')[1].getAttribute('rowspan')).toBe('2');
  });

  it('DAT-058.S1: extends rowspan over expanded #rowexpansion rows and omits covered cells on the expansion row', () => {
    const fixture = create(MergeHostComponent);
    fixture.componentInstance.expandedRowKeys.set({ '1': true });
    fixture.detectChanges();

    const rows = bodyRows(fixture);
    expect(rows).toHaveLength(6);

    const row0Cells = Array.from(rows[0].querySelectorAll('td'));
    expect(row0Cells[0].getAttribute('rowspan')).toBe('4');
    expect(row0Cells[1].getAttribute('rowspan')).toBe('3');

    const expansionRow = rows[1];
    expect(expansionRow.querySelector('.merged-detail')?.textContent?.trim()).toBe('Detail: Alpha');
    expect(Array.from(expansionRow.querySelectorAll('td')).reduce((sum, td) => sum + Number(td.getAttribute('colspan') ?? 1), 0)).toBe(1);
  });

  it('DAT-058.S1: frozen columns with merge true do not merge cells', () => {
    const fixture = create(MergeHostComponent);
    fixture.componentInstance.regionFrozen.set(true);
    fixture.detectChanges();

    const rows = bodyRows(fixture);
    expect(rows.map((tr) => tr.querySelectorAll('td').length)).toEqual([3, 2, 3, 2, 3]);
    expect(rows[0].querySelectorAll('td')[0].getAttribute('rowspan')).toBeNull();
    expect(rows[0].querySelectorAll('td')[1].getAttribute('rowspan')).toBe('2');
  });
});

/* ------------------------------------------------------------------------------------------------ */
/* DAT-059.S1: Utility header and footer templates                                                  */
/* ------------------------------------------------------------------------------------------------ */

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      reorderable
      selectionMode="multiple"
      editMode="row"
      dataKey="id"
      ariaLabel="Utility templates"
    >
      <ng-template #reorderHeader><span class="u-reorder-hdr">Move</span></ng-template>
      <ng-template #reorderFooter><span class="u-reorder-ftr">R-End</span></ng-template>
      <ng-template #selectionHeader><span class="u-sel-hdr">Pick</span></ng-template>
      <ng-template #selectionFooter><span class="u-sel-ftr">S-End</span></ng-template>
      <ng-template #rowActionsHeader><span class="u-act-hdr">Actions</span></ng-template>
      <ng-template #rowActionsFooter><span class="u-act-ftr">A-End</span></ng-template>

      <med-table-column field="name" header="Name" />
    </med-data-table>
  `,
})
class UtilityTemplatesHostComponent {
  rows = signal([{ id: '1', name: 'Row 1' }]);
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="rows()" selectionMode="multiple" dataKey="id" ariaLabel="Single utility footer">
      <ng-template #selectionFooter><span class="only-sel-ftr">Selected total</span></ng-template>
      <med-table-column field="name" header="Name" />
    </med-data-table>
  `,
})
class SingleUtilityFooterHostComponent {
  rows = signal([{ id: '1', name: 'Row 1' }]);
}

describe('DataTableComponent utility column templates (DAT-059.S1)', () => {
  it('DAT-059.S1: renders custom #reorderHeader, #reorderFooter, #selectionHeader, #selectionFooter, #rowActionsHeader, and #rowActionsFooter templates', () => {
    const fixture = create(UtilityTemplatesHostComponent);
    const root = fixture.nativeElement as HTMLElement;

    const headers = headerCells(fixture);
    expect(headers).toHaveLength(4);
    expect(headers[0].querySelector('.u-reorder-hdr')?.textContent?.trim()).toBe('Move');
    expect(headers[1].querySelector('.u-sel-hdr')?.textContent?.trim()).toBe('Pick');
    expect(headers[1].querySelector('input[type="checkbox"]')).toBeNull();
    expect(headers[3].querySelector('.u-act-hdr')?.textContent?.trim()).toBe('Actions');

    const footRow = root.querySelector('tfoot tr[data-med-column-footer]') as HTMLElement | null;
    expect(footRow).not.toBeNull();
    const footCells = Array.from(footRow!.children) as HTMLElement[];
    expect(footCells).toHaveLength(4);
    expect(footCells[0].querySelector('.u-reorder-ftr')?.textContent?.trim()).toBe('R-End');
    expect(footCells[1].querySelector('.u-sel-ftr')?.textContent?.trim()).toBe('S-End');
    expect(footCells[3].querySelector('.u-act-ftr')?.textContent?.trim()).toBe('A-End');
  });

  it('DAT-059.S1: a single utility footer template triggers tfoot rendering even with no data column footer', () => {
    const fixture = create(SingleUtilityFooterHostComponent);
    const root = fixture.nativeElement as HTMLElement;

    const footRow = root.querySelector('tfoot tr[data-med-column-footer]') as HTMLElement | null;
    expect(footRow).not.toBeNull();
    expect(footRow!.querySelector('.only-sel-ftr')?.textContent?.trim()).toBe('Selected total');
  });
});
