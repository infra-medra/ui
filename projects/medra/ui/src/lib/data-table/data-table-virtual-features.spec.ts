import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableRowReorderEvent, TableSortOrder } from './data-table.types';

interface FeatureRow {
  readonly id: number;
  readonly name: string;
  readonly team: string;
  readonly score: number;
}

const makeTeamRows = (): FeatureRow[] => [
  ...Array.from({ length: 20 }, (_, i) => ({ id: i, name: `Alpha ${i}`, team: 'Alpha', score: i })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: 20 + i, name: `Beta ${i}`, team: 'Beta', score: 20 + i })),
];

const makeReorderRows = (count: number): FeatureRow[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Row ${i}`,
    team: i < count / 2 ? 'Alpha' : 'Beta',
    score: i,
  }));

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      [virtualScroll]="true"
      [virtualScrollItemSize]="40"
      scrollHeight="160px"
      rowGroupMode="rowspan"
      groupRowsBy="team"
      dataKey="id"
      [(expandedRowKeys)]="expandedRowKeys"
      [lazy]="lazy()"
      [totalRecords]="totalRecords()"
    >
      <med-table-column field="team" header="Team">
        <ng-template let-row>{{ row.team }}</ng-template>
      </med-table-column>
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
      @if (withExpansion()) {
        <ng-template #rowexpansion let-row>
          <div class="expanded-detail">Detail: {{ row.name }}</div>
        </ng-template>
      }
    </med-data-table>
  `,
})
class VirtualRowSpanHostComponent {
  rows = signal<FeatureRow[]>(makeTeamRows());
  expandedRowKeys = signal<Record<string, boolean>>({});
  withExpansion = signal(false);
  lazy = signal(false);
  totalRecords = signal<number | null>(null);
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      [virtualScroll]="true"
      [reorderable]="true"
      [sortField]="sortField()"
      [sortOrder]="sortOrder()"
      [lazy]="lazy()"
      [totalRecords]="totalRecords()"
      (rowReorder)="reorders.push($event)"
    >
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
      <med-table-column field="score" header="Score" [sortable]="true">
        <ng-template let-row>{{ row.score }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class VirtualReorderHostComponent {
  rows = signal<FeatureRow[]>(makeReorderRows(50));
  sortField = signal<string | null>(null);
  sortOrder = signal<TableSortOrder>(null);
  lazy = signal(false);
  totalRecords = signal<number | null>(null);
  reorders: TableRowReorderEvent[] = [];
}

/** Verifies that rendered non-spacer body rows form a strict rectangle of `expectedCols` columns with no gaps or overflows. */
function expectRectangularGrid(rows: HTMLElement[], expectedCols: number): void {
  const carryOver: number[] = Array(expectedCols).fill(0);
  for (const tr of rows) {
    let colIdx = 0;
    const cells = Array.from(tr.querySelectorAll<HTMLTableCellElement>(':scope > td'));
    for (const td of cells) {
      while (colIdx < expectedCols && carryOver[colIdx] > 0) {
        carryOver[colIdx] -= 1;
        colIdx += 1;
      }
      expect(colIdx).toBeLessThan(expectedCols);
      const colspan = Math.max(1, td.colSpan || 1);
      const rowspan = Math.max(1, td.rowSpan || 1);
      expect(colIdx + colspan).toBeLessThanOrEqual(expectedCols);
      for (let c = 0; c < colspan; c++) {
        expect(carryOver[colIdx + c]).toBe(0);
        if (rowspan > 1) {
          carryOver[colIdx + c] = rowspan - 1;
        }
      }
      colIdx += colspan;
    }
    while (colIdx < expectedCols && carryOver[colIdx] > 0) {
      carryOver[colIdx] -= 1;
      colIdx += 1;
    }
    expect(colIdx).toBe(expectedCols);
  }
  expect(carryOver.every((rem) => rem === 0)).toBe(true);
}

describe('DataTableComponent virtualScroll rowspan and reorderable (DAT-062.S3, DAT-062.S4)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
  const viewport = (fixture: ComponentFixture<unknown>) => root(fixture).querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
  const bodyRows = (fixture: ComponentFixture<unknown>) =>
    Array.from(root(fixture).querySelectorAll<HTMLElement>('tbody tr:not([aria-hidden="true"])'));

  function scrollTo(fixture: ComponentFixture<unknown>, top: number): void {
    const vp = viewport(fixture);
    vp.scrollTop = top;
    vp.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  it('DAT-062.S3: slices rowspan to the rendered window at 200px and 600px while keeping every tr rectangular', () => {
    const fixture = TestBed.createComponent(VirtualRowSpanHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    scrollTo(fixture, 200);
    const rowsAt200 = bodyRows(fixture);
    const alphaRowsAt200 = rowsAt200.filter((tr) => tr.textContent?.includes('Alpha '));
    expect(alphaRowsAt200.length).toBeGreaterThan(0);
    const firstAlphaTeamCell200 = alphaRowsAt200[0].querySelector<HTMLTableCellElement>('td[data-med-field="team"]');
    expect(firstAlphaTeamCell200).not.toBeNull();
    expect(firstAlphaTeamCell200!.textContent?.trim()).toBe('Alpha');
    expect(firstAlphaTeamCell200!.getAttribute('rowspan')).toBe(String(alphaRowsAt200.length));
    for (const tr of alphaRowsAt200.slice(1)) {
      expect(tr.querySelector('td[data-med-field="team"]')).toBeNull();
    }
    expectRectangularGrid(rowsAt200, 2);

    // Scroll to 600px so the top of "Alpha" leaves the window and both "Alpha" and "Beta" appear in the window.
    scrollTo(fixture, 600);
    const rowsAt600 = bodyRows(fixture);
    const alphaRowsAt600 = rowsAt600.filter((tr) => tr.textContent?.includes('Alpha '));
    const betaRowsAt600 = rowsAt600.filter((tr) => tr.textContent?.includes('Beta '));
    expect(alphaRowsAt600.length).toBe(10);
    expect(betaRowsAt600.length).toBeGreaterThan(0);

    const firstAlphaCell600 = alphaRowsAt600[0].querySelector<HTMLTableCellElement>('td[data-med-field="team"]')!;
    expect(firstAlphaCell600).not.toBeNull();
    expect(firstAlphaCell600.textContent?.trim()).toBe('Alpha');
    expect(firstAlphaCell600.getAttribute('rowspan')).toBe(String(alphaRowsAt600.length));
    for (const tr of alphaRowsAt600.slice(1)) {
      expect(tr.querySelector('td[data-med-field="team"]')).toBeNull();
    }

    const firstBetaCell600 = betaRowsAt600[0].querySelector<HTMLTableCellElement>('td[data-med-field="team"]')!;
    expect(firstBetaCell600).not.toBeNull();
    expect(firstBetaCell600.textContent?.trim()).toBe('Beta');
    expect(firstBetaCell600.getAttribute('rowspan')).toBe(String(betaRowsAt600.length));
    for (const tr of betaRowsAt600.slice(1)) {
      expect(tr.querySelector('td[data-med-field="team"]')).toBeNull();
    }
    expectRectangularGrid(rowsAt600, 2);
  });

  it('DAT-062.S3: expanded #rowexpansion inside a virtual rowspan run counts toward the window rowspan and stays rectangular', () => {
    const fixture = TestBed.createComponent(VirtualRowSpanHostComponent);
    fixture.componentInstance.withExpansion.set(true);
    fixture.componentInstance.expandedRowKeys.set({ '10': true });
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    scrollTo(fixture, 600);
    const rows = bodyRows(fixture);
    const alphaDataRows = rows.filter((tr) => !tr.querySelector('.expanded-detail') && tr.textContent?.includes('Alpha '));
    expect(rows.some((tr) => tr.querySelector('.expanded-detail')?.textContent?.includes('Detail: Alpha 10'))).toBe(true);

    const firstAlphaCell = alphaDataRows[0].querySelector<HTMLTableCellElement>('td[data-med-field="team"]')!;
    expect(firstAlphaCell.getAttribute('rowspan')).toBe(String(alphaDataRows.length + 1));
    expectRectangularGrid(rows, 2);

    // F-01: scrolling to an offset where virtual window start lands on an expansion item keeps parent row rendered
    scrollTo(fixture, 640);
    const rowsAt640 = bodyRows(fixture);
    expect(rowsAt640.some((tr) => tr.querySelector('.expanded-detail')?.textContent?.includes('Detail: Alpha 10'))).toBe(true);
    expectRectangularGrid(rowsAt640, 2);
  });

  it('DAT-062.S4: pins dragged row 0 in DOM while scrolling and emits rowReorder relative to value() on drop onto row 15', () => {
    const fixture = TestBed.createComponent(VirtualReorderHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    expect(root(fixture).querySelectorAll('tbody med-icon[name="bars-3"]').length).toBeGreaterThan(0);
    const findRow = (name: string) => bodyRows(fixture).find((tr) => tr.querySelector('td[data-med-field="name"]')?.textContent?.trim() === name);

    const row0 = findRow('Row 0')!;
    expect(row0).toBeDefined();
    expect(row0.getAttribute('draggable')).toBe('true');

    row0.dispatchEvent(new Event('dragstart', { bubbles: true }));
    fixture.detectChanges();

    // Scroll so row 0 would leave the default 400px window (start=10) while row 15 enters view.
    scrollTo(fixture, 600);

    expect(findRow('Row 0')).toBeDefined();
    expect(findRow('Row 1')).toBeUndefined();
    const row15 = findRow('Row 15')!;
    expect(row15).toBeDefined();

    row15.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
    row15.dispatchEvent(new Event('drop', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.reorders).toEqual([{ dragIndex: 0, dropIndex: 15 }]);
    expect(findRow('Row 0')).toBeUndefined();
  });

  it('DAT-062.S4: unpins the dragged row on dragend without emitting rowReorder', () => {
    const fixture = TestBed.createComponent(VirtualReorderHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    const findRow = (name: string) => bodyRows(fixture).find((tr) => tr.querySelector('td[data-med-field="name"]')?.textContent?.trim() === name);
    const row0 = findRow('Row 0')!;
    row0.dispatchEvent(new Event('dragstart', { bubbles: true }));
    fixture.detectChanges();

    scrollTo(fixture, 600);
    const pinnedRow0 = findRow('Row 0')!;
    expect(pinnedRow0).toBeDefined();

    pinnedRow0.dispatchEvent(new Event('dragend', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.reorders).toEqual([]);
    expect(findRow('Row 0')).toBeUndefined();
  });

  it('DAT-062.S4: emits rowReorder indices relative to value() when the virtual table is sorted', () => {
    const fixture = TestBed.createComponent(VirtualReorderHostComponent);
    fixture.componentInstance.sortField.set('score');
    fixture.componentInstance.sortOrder.set('desc');
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    const findRow = (name: string) => bodyRows(fixture).find((tr) => tr.querySelector('td[data-med-field="name"]')?.textContent?.trim() === name);
    const firstDisplayed = findRow('Row 49')!;
    expect(firstDisplayed).toBeDefined();
    expect(firstDisplayed.getAttribute('draggable')).toBe('true');

    firstDisplayed.dispatchEvent(new Event('dragstart', { bubbles: true }));
    fixture.detectChanges();

    scrollTo(fixture, 600);
    expect(findRow('Row 49')).toBeDefined();
    const targetDisplayed = findRow('Row 34')!;
    expect(targetDisplayed).toBeDefined();

    targetDisplayed.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
    targetDisplayed.dispatchEvent(new Event('drop', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.reorders).toEqual([{ dragIndex: 49, dropIndex: 34 }]);
  });

  it('REQ DAT-062: lazy virtualScroll keeps rowspan and reorderable ignored', () => {
    const spanFixture = TestBed.createComponent(VirtualRowSpanHostComponent);
    spanFixture.componentInstance.lazy.set(true);
    spanFixture.componentInstance.totalRecords.set(30);
    spanFixture.detectChanges();
    expect(root(spanFixture).querySelectorAll('tbody td[rowspan]').length).toBe(0);

    const reorderFixture = TestBed.createComponent(VirtualReorderHostComponent);
    reorderFixture.componentInstance.lazy.set(true);
    reorderFixture.componentInstance.totalRecords.set(50);
    reorderFixture.detectChanges();
    expect(root(reorderFixture).querySelector('med-icon[name="bars-3"]')).toBeNull();
    expect(bodyRows(reorderFixture).some((tr) => tr.getAttribute('draggable') === 'true')).toBe(false);
  });
});
