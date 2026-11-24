import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableSortCompare } from './data-table.types';

interface VirtualItemRow {
  readonly id: number;
  readonly name: string;
  readonly team: string;
}

const makeRows = (count: number): VirtualItemRow[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Row ${i}`,
    team: i < count / 2 ? 'Alpha' : 'Beta',
  }));

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      #dt
      [value]="rows()"
      [virtualScroll]="true"
      [virtualScrollItemSize]="40"
      scrollHeight="200px"
      dataKey="id"
      [keyboardNavigation]="keyboardNavigation()"
      [lazy]="lazy()"
      [totalRecords]="totalRecords()"
      [(expandedRowKeys)]="expandedRowKeys"
      (rowExpand)="expandedEvents.push($event)"
      (rowCollapse)="collapsedEvents.push($event)"
    >
      <med-table-column field="expand" header="">
        <ng-template let-row let-rowIndex="rowIndex">
          <button
            type="button"
            class="expand-btn"
            [attr.data-row-id]="row.id"
            (click)="dt.toggleRowExpansion(row, rowIndex)"
          >
            Toggle
          </button>
        </ng-template>
      </med-table-column>
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
      <ng-template #rowexpansion let-row>
        <div class="expanded-detail">Detail: {{ row.name }}</div>
      </ng-template>
    </med-data-table>
  `,
})
class VirtualExpansionHostComponent {
  rows = signal<(VirtualItemRow | null)[]>(makeRows(50));
  keyboardNavigation = signal(false);
  lazy = signal(false);
  totalRecords = signal<number | null>(null);
  expandedRowKeys = signal<Record<string, boolean>>({});
  expandedEvents: VirtualItemRow[] = [];
  collapsedEvents: VirtualItemRow[] = [];
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      [virtualScroll]="true"
      dataKey="id"
      rowGroupMode="subheader"
      groupRowsBy="team"
      [expandableRowGroups]="true"
      [(expandedRowGroups)]="expandedRowGroups"
      [(expandedRowKeys)]="expandedRowKeys"
      [lazy]="lazy()"
      [totalRecords]="totalRecords()"
      (rowGroupCollapse)="groupCollapsed.push($event)"
      (rowGroupExpand)="groupExpanded.push($event)"
    >
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
      <med-table-column field="team" header="Team" [sortCompare]="teamSortCompare()">
        <ng-template let-row>{{ row.team }}</ng-template>
      </med-table-column>
      <ng-template #rowexpansion let-row>
        <div class="expanded-detail">Detail: {{ row.name }}</div>
      </ng-template>
    </med-data-table>
  `,
})
class VirtualSubheaderHostComponent {
  rows = signal<(VirtualItemRow | null)[]>([
    ...Array.from({ length: 20 }, (_, i) => ({ id: i + 20, name: `Beta ${i}`, team: 'Beta' })),
    ...Array.from({ length: 20 }, (_, i) => ({ id: i, name: `Alpha ${i}`, team: 'Alpha' })),
  ]);
  expandedRowGroups = signal<readonly string[]>([]);
  expandedRowKeys = signal<Record<string, boolean>>({});
  lazy = signal(false);
  totalRecords = signal<number | null>(null);
  teamSortCompare = signal<TableSortCompare<VirtualItemRow> | null>(null);
  groupCollapsed: string[] = [];
  groupExpanded: string[] = [];
}

describe('DataTableComponent virtualScroll expansion and subheader groups (DAT-062.S1, DAT-062.S2)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
  const viewport = (fixture: ComponentFixture<unknown>) => root(fixture).querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
  const bodyRows = (fixture: ComponentFixture<unknown>) =>
    Array.from(root(fixture).querySelectorAll<HTMLElement>('tbody tr:not([aria-hidden="true"])'));
  const spacerHeights = (fixture: ComponentFixture<unknown>) =>
    Array.from(root(fixture).querySelectorAll<HTMLElement>('tbody tr[aria-hidden="true"] td')).map(
      (td) => parseFloat(td.style.height) || 0,
    );
  const totalScrollableHeight = (fixture: ComponentFixture<unknown>, rowHeight = 40) => {
    const spacers = spacerHeights(fixture).reduce((sum, h) => sum + h, 0);
    const rows = bodyRows(fixture).reduce((sum, tr) => sum + (parseFloat(tr.style.height) || rowHeight), 0);
    return spacers + rows;
  };
  const subheaderRows = (fixture: ComponentFixture<unknown>) =>
    bodyRows(fixture).filter(
      (tr) => tr.querySelectorAll('td').length === 1 && tr.querySelector('td')!.hasAttribute('colspan') && !tr.querySelector('.expanded-detail'),
    );
  const dataRows = (fixture: ComponentFixture<unknown>) =>
    bodyRows(fixture).filter((tr) => !subheaderRows(fixture).includes(tr) && !tr.querySelector('.expanded-detail'));

  function scrollTo(fixture: ComponentFixture<unknown>, top: number): void {
    const vp = viewport(fixture);
    vp.scrollTop = top;
    vp.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  it('DAT-062.S1: expands row 0 beneath its data row, increases scrollable height and aria-rowcount, and survives scrolling away and back', () => {
    const fixture = TestBed.createComponent(VirtualExpansionHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    const table = root(fixture).querySelector('table')!;
    expect(table.getAttribute('aria-rowcount')).toBe('51');
    expect(totalScrollableHeight(fixture)).toBe(50 * 40);
    const initialRenderedCount = bodyRows(fixture).length;
    expect(initialRenderedCount).toBeLessThan(50);

    const expandRow0Btn = root(fixture).querySelector<HTMLButtonElement>('button.expand-btn[data-row-id="0"]')!;
    expandRow0Btn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.expandedEvents.map((r) => r.id)).toEqual([0]);
    expect(fixture.componentInstance.expandedRowKeys()).toEqual({ '0': true });
    expect(table.getAttribute('aria-rowcount')).toBe('52');
    expect(totalScrollableHeight(fixture)).toBe(51 * 40);

    const row0Tr = dataRows(fixture).find((tr) => tr.textContent?.includes('Row 0'))!;
    expect(row0Tr).toBeDefined();
    expect(row0Tr.getAttribute('aria-rowindex')).toBe('2');
    const expansionTr = row0Tr.nextElementSibling as HTMLElement | null;
    expect(expansionTr).not.toBeNull();
    expect(expansionTr!.querySelector('.expanded-detail')?.textContent).toContain('Detail: Row 0');
    expect(expansionTr!.getAttribute('aria-rowindex')).toBe('3');
    expect(bodyRows(fixture).length).toBeLessThan(51);

    scrollTo(fixture, 1200);
    expect(root(fixture).querySelector('.expanded-detail')).toBeNull();
    expect(dataRows(fixture).some((tr) => tr.textContent?.includes('Row 30'))).toBe(true);

    scrollTo(fixture, 0);
    const row0After = dataRows(fixture).find((tr) => tr.textContent?.includes('Row 0'))!;
    expect(row0After).toBeDefined();
    const expansionAfter = row0After.nextElementSibling as HTMLElement | null;
    expect(expansionAfter?.querySelector('.expanded-detail')?.textContent).toContain('Detail: Row 0');
    expect(fixture.componentInstance.expandedRowKeys()).toEqual({ '0': true });
  });

  it('DAT-062.S1: keyboard navigation skips expansion rows and reaches the last row via End', () => {
    const fixture = TestBed.createComponent(VirtualExpansionHostComponent);
    fixture.componentInstance.keyboardNavigation.set(true);
    fixture.componentInstance.expandedRowKeys.set({ '0': true });
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    expect(root(fixture).querySelector('.expanded-detail')).not.toBeNull();
    const row0Tr = dataRows(fixture).find((tr) => tr.textContent?.includes('Row 0'))!;
    row0Tr.focus();
    row0Tr.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const row1Tr = dataRows(fixture).find((tr) => tr.textContent?.includes('Row 1'))!;
    expect(document.activeElement).toBe(row1Tr);

    row1Tr.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    fixture.detectChanges();

    const row49Tr = dataRows(fixture).find((tr) => tr.textContent?.includes('Row 49'))!;
    expect(row49Tr).toBeDefined();
    expect(document.activeElement).toBe(row49Tr);
  });

  it('DAT-062.S2: renders subheaders sorted by groupRowsBy and collapsing Alpha hides Alpha rows while keeping Beta rows and emitting rowGroupCollapse', () => {
    const fixture = TestBed.createComponent(VirtualSubheaderHostComponent);
    // L-012: inverting comparator on the group column must not invert subheader group order.
    fixture.componentInstance.teamSortCompare.set((a, b) => b.team.localeCompare(a.team));
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    const table = root(fixture).querySelector('table')!;
    expect(table.getAttribute('aria-rowcount')).toBe('43'); // 1 header + 2 subheaders + 40 rows
    expect(totalScrollableHeight(fixture)).toBe(42 * 40);

    const initialSubheaders = subheaderRows(fixture);
    expect(initialSubheaders.length).toBeGreaterThanOrEqual(1);
    expect(initialSubheaders[0].textContent).toContain('Alpha');
    expect(dataRows(fixture).some((tr) => tr.textContent?.includes('Alpha 0'))).toBe(true);

    const alphaToggle = initialSubheaders[0].querySelector<HTMLButtonElement>('button[aria-expanded]')!;
    expect(alphaToggle.getAttribute('aria-expanded')).toBe('true');
    alphaToggle.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.groupCollapsed).toEqual(['Alpha']);
    expect(fixture.componentInstance.expandedRowGroups()).toEqual(['Alpha']);
    expect(table.getAttribute('aria-rowcount')).toBe('23'); // 1 header + 2 subheaders + 20 Beta rows
    expect(totalScrollableHeight(fixture)).toBe(22 * 40);

    const collapsedSubheaders = subheaderRows(fixture);
    expect(collapsedSubheaders.map((tr) => tr.textContent?.trim())).toEqual(['Alpha', 'Beta']);
    expect(collapsedSubheaders[0].querySelector('button[aria-expanded]')?.getAttribute('aria-expanded')).toBe('false');
    expect(dataRows(fixture).some((tr) => tr.textContent?.includes('Alpha '))).toBe(false);
    expect(dataRows(fixture).some((tr) => tr.textContent?.includes('Beta 0'))).toBe(true);

    collapsedSubheaders[0].querySelector<HTMLButtonElement>('button[aria-expanded]')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.groupExpanded).toEqual(['Alpha']);
    expect(fixture.componentInstance.expandedRowGroups()).toEqual([]);
    expect(table.getAttribute('aria-rowcount')).toBe('43');
    expect(dataRows(fixture).some((tr) => tr.textContent?.includes('Alpha 0'))).toBe(true);
  });

  it('DAT-062.S2: collapsing a group also hides expansion rows belonging to its rows', () => {
    const fixture = TestBed.createComponent(VirtualSubheaderHostComponent);
    fixture.componentInstance.expandedRowKeys.set({ '0': true });
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    expect(root(fixture).querySelector('.expanded-detail')?.textContent).toContain('Detail: Alpha 0');

    const alphaToggle = subheaderRows(fixture)[0].querySelector<HTMLButtonElement>('button[aria-expanded]')!;
    alphaToggle.click();
    fixture.detectChanges();

    expect(root(fixture).querySelector('.expanded-detail')).toBeNull();
  });

  it('REQ DAT-062: lazy virtualScroll keeps #rowexpansion and rowGroupMode ignored', () => {
    const expFixture = TestBed.createComponent(VirtualExpansionHostComponent);
    expFixture.componentInstance.lazy.set(true);
    expFixture.componentInstance.totalRecords.set(50);
    expFixture.componentInstance.expandedRowKeys.set({ '0': true });
    expFixture.detectChanges();
    expect(root(expFixture).querySelector('.expanded-detail')).toBeNull();

    const grpFixture = TestBed.createComponent(VirtualSubheaderHostComponent);
    grpFixture.componentInstance.lazy.set(true);
    grpFixture.componentInstance.totalRecords.set(40);
    grpFixture.detectChanges();
    expect(subheaderRows(grpFixture).length).toBe(0);
  });
});
