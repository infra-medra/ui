import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableColumnComponent } from '../data-table/table-column.component';
import { TreeTableComponent } from './tree-table.component';
import { TreeTableNode } from './tree-table.types';

interface Employee {
  name: string;
  role: string;
  size?: string;
}

const NODES: TreeTableNode<Employee>[] = [
  {
    data: { name: 'Alice', role: 'CEO' },
    children: [
      { data: { name: 'Bob', role: 'CTO' }, children: [{ data: { name: 'Carol', role: 'Engineer' } }] },
      { data: { name: 'Dave', role: 'CFO' } },
    ],
  },
  { data: { name: 'Erin', role: 'Advisor' } },
];

@Component({
  standalone: true,
  imports: [TreeTableComponent, TableColumnComponent],
  template: `
    <med-tree-table [value]="value" ariaLabel="Org" [columnResizable]="columnResizable" [virtualScroll]="virtualScroll">
      <med-table-column field="name" header="Name" />
      <med-table-column field="role" header="Role" />
    </med-tree-table>
  `,
})
class HostComponent {
  value: TreeTableNode<Employee>[] = NODES;
  columnResizable = false;
  virtualScroll = false;
}

function bodyRows(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
}

function rowText(row: HTMLElement): string[] {
  return Array.from(row.querySelectorAll('td')).map((td) => td.textContent?.trim().replace(/\s+/g, ' ') ?? '');
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('TreeTableComponent', () => {
  it('flattens the tree into one row per node, in document order, expanded by default', () => {
    const fixture = create();
    const names = bodyRows(fixture).map((row) => rowText(row)[0]);
    expect(names).toEqual(['Alice', 'Bob', 'Carol', 'Dave', 'Erin']);
  });

  it('the expand/collapse toggle reflects aria-expanded and swaps its aria-label (Wave 2 fix — the ARIA already existed in source but had zero spec assertions)', () => {
    const fixture = create();
    const toggle = bodyRows(fixture)[0].querySelector('button') as HTMLButtonElement; // Alice, has children
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Collapse');

    toggle.click();
    fixture.detectChanges();

    const toggleAfter = bodyRows(fixture)[0].querySelector('button') as HTMLButtonElement;
    expect(toggleAfter.getAttribute('aria-expanded')).toBe('false');
    expect(toggleAfter.getAttribute('aria-label')).toBe('Expand');
  });

  it('a leaf row (no children) has no expand/collapse toggle button', () => {
    const fixture = create();
    const erinRow = bodyRows(fixture).find((row) => rowText(row)[0] === 'Erin') as HTMLElement;
    expect(erinRow.querySelector('button')).toBeNull();
  });

  it('the table carries the configured ariaLabel', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('table')?.getAttribute('aria-label')).toBe('Org');
  });

  it('renders every column value from the row\'s own data', () => {
    const fixture = create();
    expect(rowText(bodyRows(fixture)[1])).toEqual(['Bob', 'CTO']);
  });

  it('collapsing a node hides its descendants but keeps the node itself as a row', () => {
    const fixture = create();
    const bobToggle = bodyRows(fixture)[1].querySelector('button') as HTMLButtonElement;
    bobToggle.click();
    fixture.detectChanges();

    const names = bodyRows(fixture).map((row) => rowText(row)[0]);
    expect(names).toEqual(['Alice', 'Bob', 'Dave', 'Erin']);
  });

  it('re-expanding shows descendants again (toggle state is not lost)', () => {
    const fixture = create();
    const bobToggle = () => bodyRows(fixture)[1].querySelector('button') as HTMLButtonElement;
    bobToggle().click();
    fixture.detectChanges();
    bobToggle().click();
    fixture.detectChanges();

    expect(bodyRows(fixture).map((row) => rowText(row)[0])).toEqual(['Alice', 'Bob', 'Carol', 'Dave', 'Erin']);
  });

  it('a leaf row has no expand/collapse button', () => {
    const fixture = create();
    const carolRow = bodyRows(fixture)[2];
    expect(carolRow.querySelector('button')).toBeNull();
  });

  it('a deeper row indents further than its parent', () => {
    const fixture = create();
    const bobIndent = (bodyRows(fixture)[1].querySelector('td span[style]') as HTMLElement).style.paddingLeft;
    const carolIndent = (bodyRows(fixture)[2].querySelector('td span[style]') as HTMLElement).style.paddingLeft;
    expect(parseFloat(carolIndent)).toBeGreaterThan(parseFloat(bobIndent));
  });

  it('shows the empty label and spans all columns when there is nothing to show', () => {
    const fixture = create((h) => (h.value = []));
    const rows = bodyRows(fixture);
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('No results found');
    expect(rows[0].querySelector('td')!.getAttribute('colspan')).toBe('2');
  });

  describe('row-level treegrid keyboard model (Wave 2 fix — rows previously had no aria-level/keyboard navigation at all)', () => {
    it('every row carries aria-level, aria-posinset, and aria-setsize', () => {
      const fixture = create();
      const rows = bodyRows(fixture);
      // Alice, Bob, Carol, Dave, Erin
      expect(rows.map((r) => r.getAttribute('aria-level'))).toEqual(['1', '2', '3', '2', '1']);
      expect(rows.map((r) => r.getAttribute('aria-posinset'))).toEqual(['1', '1', '1', '2', '2']);
      expect(rows.map((r) => r.getAttribute('aria-setsize'))).toEqual(['2', '2', '1', '2', '2']);
    });

    it('a row with children reflects its expanded state via aria-expanded on the row itself, not just the toggle button', () => {
      const fixture = create();
      const aliceRow = bodyRows(fixture)[0];
      expect(aliceRow.getAttribute('aria-expanded')).toBe('true');

      const erinRow = bodyRows(fixture)[4];
      expect(erinRow.getAttribute('aria-expanded')).toBeNull(); // leaf row, no expand state
    });

    it('roving tabindex: only the first row is in the Tab order initially', () => {
      const fixture = create();
      expect(bodyRows(fixture).map((r) => r.tabIndex)).toEqual([0, -1, -1, -1, -1]);
    });

    it('ArrowDown/ArrowUp move the roving tab stop and focus by one visible row', () => {
      const fixture = create();
      const rows = bodyRows(fixture);
      rows[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(bodyRows(fixture)[1]);
      expect(bodyRows(fixture).map((r) => r.tabIndex)).toEqual([-1, 0, -1, -1, -1]);

      bodyRows(fixture)[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(bodyRows(fixture)[0]);
    });

    it('Home/End jump to the first/last visible row', () => {
      const fixture = create();
      const rows = bodyRows(fixture);
      rows[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(bodyRows(fixture)[4]);

      bodyRows(fixture)[4].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(bodyRows(fixture)[0]);
    });

    it('ArrowRight on a collapsed parent expands it without moving focus; on an expanded parent it steps into the first child', () => {
      const fixture = create();
      const bobToggle = () => bodyRows(fixture)[1].querySelector('button') as HTMLButtonElement;
      bobToggle().click(); // collapse Bob
      fixture.detectChanges();

      const bobRow = () => bodyRows(fixture)[1];
      bobRow().focus();
      bobRow().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      fixture.detectChanges();
      expect(bobToggle().getAttribute('aria-expanded')).toBe('true'); // re-expanded
      expect(document.activeElement).toBe(bobRow()); // focus stays put on expand

      bobRow().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(bodyRows(fixture)[2]); // steps into Carol
    });

    it('ArrowLeft on an expanded parent row collapses it, hiding its descendants', () => {
      const fixture = create();
      const rows = bodyRows(fixture);

      rows[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); // Alice, expanded parent
      fixture.detectChanges();
      const names = bodyRows(fixture).map((row) => rowText(row)[0]);
      expect(names).toEqual(['Alice', 'Erin']);
    });

    it('ArrowLeft on a leaf row moves focus up to its parent row', () => {
      const fixture = create();
      const carolRow = () => bodyRows(fixture)[2]; // leaf, depth 2, parent is Bob (index 1)
      carolRow().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(bodyRows(fixture)[1]); // Bob
    });
  });

  describe('columnResizable', () => {
    /** jsdom has no PointerEvent constructor — same plain-Event-cast pattern already used by slider.component.spec.ts/ripple.directive.spec.ts. */
    function pointer(type: string, clientX: number, pointerId = 1): PointerEvent {
      return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX, pointerId }) as PointerEvent;
    }

    function resizeHandle(fixture: { nativeElement: HTMLElement }, columnIndex: number): HTMLElement {
      return fixture.nativeElement.querySelectorAll('th')[columnIndex].querySelector('span[aria-hidden="true"]') as HTMLElement;
    }

    it('renders no resize handle by default', () => {
      const fixture = create();
      expect(fixture.nativeElement.querySelector('th span[aria-hidden="true"]')).toBeNull();
    });

    it('columnResizable renders a drag handle on each <th>', () => {
      const fixture = create((h) => (h.columnResizable = true));
      expect(fixture.nativeElement.querySelectorAll('th span[aria-hidden="true"]')).toHaveLength(2);
    });

    it('dragging a handle updates that column\'s <th> width, not the other column\'s', () => {
      const fixture = create((h) => (h.columnResizable = true));
      const handle = resizeHandle(fixture, 0);

      handle.dispatchEvent(pointer('pointerdown', 100));
      handle.dispatchEvent(pointer('pointermove', 180)); // +80px from a 0px starting rect (jsdom has no real layout)
      handle.dispatchEvent(pointer('pointerup', 180));
      fixture.detectChanges();

      const nameTh = fixture.nativeElement.querySelectorAll('th')[0] as HTMLElement;
      const roleTh = fixture.nativeElement.querySelectorAll('th')[1] as HTMLElement;
      expect(nameTh.style.width).toBe('80px');
      expect(roleTh.style.width).toBe('');
    });

    it('never resizes narrower than the minimum width', () => {
      const fixture = create((h) => (h.columnResizable = true));
      const handle = resizeHandle(fixture, 0);

      handle.dispatchEvent(pointer('pointerdown', 100));
      handle.dispatchEvent(pointer('pointermove', -500)); // huge drag toward the left
      fixture.detectChanges();

      const nameTh = fixture.nativeElement.querySelectorAll('th')[0] as HTMLElement;
      expect(nameTh.style.width).toBe('60px'); // MIN_COLUMN_WIDTH_PX
    });

    it('pointermove without a preceding pointerdown is a no-op', () => {
      const fixture = create((h) => (h.columnResizable = true));
      resizeHandle(fixture, 0).dispatchEvent(pointer('pointermove', 300));
      fixture.detectChanges();
      expect((fixture.nativeElement.querySelectorAll('th')[0] as HTMLElement).style.width).toBe('');
    });
  });

  describe('virtualScroll', () => {
    function viewport(fixture: { nativeElement: HTMLElement }): HTMLElement | null {
      return fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport');
    }

    it('renders a cdk-virtual-scroll-viewport instead of a real <table>', () => {
      const fixture = create((h) => (h.virtualScroll = true));
      expect(viewport(fixture)).not.toBeNull();
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    it('the header row still shows every column, outside the viewport', () => {
      const fixture = create((h) => (h.virtualScroll = true));
      expect(fixture.nativeElement.querySelector('[role="columnheader"]')?.textContent?.trim()).toBe('Name');
      expect(fixture.nativeElement.querySelectorAll('[role="columnheader"]')).toHaveLength(2);
    });

    it('does not throw flattening a large tree', () => {
      const bigTree: TreeTableNode<Employee>[] = Array.from({ length: 2000 }, (_, i) => ({ data: { name: `Employee ${i}`, role: 'Staff' } }));
      expect(() =>
        create((h) => {
          h.virtualScroll = true;
          h.value = bigTree;
        }),
      ).not.toThrow();
    });
  });
});

describe('TreeTableComponent (editMode="cell")', () => {
  @Component({
    standalone: true,
    imports: [TreeTableComponent, TableColumnComponent],
    template: `
      <med-tree-table [value]="value" ariaLabel="Org" editMode="cell" (editComplete)="onEditComplete($event)" (editCancel)="onEditCancel($event)">
        <med-table-column field="name" header="Name" editable>
          <ng-template let-row>{{ row.name }}</ng-template>
          <ng-template #editTemplate let-row let-onSave="onSave" let-onCancel="onCancel">
            <input class="edit-input" [value]="row.name" (blur)="onSave($any($event.target).value)" (keydown.escape)="onCancel()" />
          </ng-template>
        </med-table-column>
        <med-table-column field="role" header="Role" />
      </med-tree-table>
    `,
  })
  class EditHostComponent {
    value: TreeTableNode<Employee>[] = NODES;
    onEditComplete = jest.fn();
    onEditCancel = jest.fn();
  }

  function createEditable() {
    const fixture = TestBed.createComponent(EditHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('a plain click does not enter edit mode', () => {
    const fixture = createEditable();
    const firstCell = fixture.nativeElement.querySelectorAll('tbody td')[0] as HTMLElement;
    firstCell.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.edit-input')).toBeNull();
  });

  it('double-clicking an editable cell swaps in the edit template', () => {
    const fixture = createEditable();
    const firstCell = fixture.nativeElement.querySelectorAll('tbody td')[0] as HTMLElement;
    firstCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.edit-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('Alice');
  });

  it('double-clicking a non-editable column does nothing', () => {
    const fixture = createEditable();
    const roleCell = fixture.nativeElement.querySelectorAll('tbody td')[1] as HTMLElement;
    roleCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.edit-input')).toBeNull();
  });

  it('onSave emits editComplete with the node/field/value and exits edit mode', () => {
    const fixture = createEditable();
    const firstCell = fixture.nativeElement.querySelectorAll('tbody td')[0] as HTMLElement;
    firstCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.edit-input') as HTMLInputElement;
    input.value = 'Alicia';
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.componentInstance.onEditComplete).toHaveBeenCalledWith({ node: NODES[0], field: 'name', value: 'Alicia' });
    expect(fixture.nativeElement.querySelector('.edit-input')).toBeNull();
  });

  it('onCancel emits editCancel with the node/field and exits edit mode without a value', () => {
    const fixture = createEditable();
    const firstCell = fixture.nativeElement.querySelectorAll('tbody td')[0] as HTMLElement;
    firstCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.edit-input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onEditCancel).toHaveBeenCalledWith({ node: NODES[0], field: 'name' });
    expect(fixture.nativeElement.querySelector('.edit-input')).toBeNull();
  });

  it('the expand/collapse toggle still renders on the editable first column', () => {
    const fixture = createEditable();
    expect(fixture.nativeElement.querySelector('tbody button[aria-expanded]')).not.toBeNull();
  });
});

describe('TreeTableComponent (frozen columns)', () => {
  @Component({
    standalone: true,
    imports: [TreeTableComponent, TableColumnComponent],
    template: `
      <med-tree-table [value]="value" ariaLabel="Org" [virtualScroll]="virtualScroll">
        <med-table-column field="name" header="Name" width="150px" frozen />
        <med-table-column field="role" header="Role" width="120px" />
        <med-table-column field="role2" header="Role 2" width="120px" alignFrozen="right" frozen />
      </med-tree-table>
    `,
  })
  class FrozenHostComponent {
    value: TreeTableNode<Employee>[] = NODES;
    virtualScroll = false;
  }

  function createFrozen(configure?: (h: FrozenHostComponent) => void) {
    const fixture = TestBed.createComponent(FrozenHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('a left-frozen first column gets position: sticky with left: 0px', () => {
    const fixture = createFrozen();
    const th = fixture.nativeElement.querySelector('thead th') as HTMLElement;
    expect(th.style.position).toBe('sticky');
    expect(th.style.left).toBe('0px');
  });

  it('a right-frozen last column gets position: sticky with right: 0px', () => {
    const fixture = createFrozen();
    const ths = fixture.nativeElement.querySelectorAll('thead th');
    const lastTh = ths[ths.length - 1] as HTMLElement;
    expect(lastTh.style.position).toBe('sticky');
    expect(lastTh.style.right).toBe('0px');
  });

  it('a non-frozen column in between gets no sticky positioning', () => {
    const fixture = createFrozen();
    const ths = fixture.nativeElement.querySelectorAll('thead th');
    const middleTh = ths[1] as HTMLElement;
    expect(middleTh.style.position).toBe('');
  });

  it('body cells mirror the same sticky offsets as the header', () => {
    const fixture = createFrozen();
    const firstRowCells = fixture.nativeElement.querySelectorAll('tbody tr')[0].querySelectorAll('td');
    expect((firstRowCells[0] as HTMLElement).style.left).toBe('0px');
    expect((firstRowCells[2] as HTMLElement).style.right).toBe('0px');
  });

  it('applies the same sticky offsets in virtualScroll (CSS Grid) mode', () => {
    const fixture = createFrozen((h) => (h.virtualScroll = true));
    const headerCells = fixture.nativeElement.querySelectorAll('[role="columnheader"]');
    expect((headerCells[0] as HTMLElement).style.left).toBe('0px');
    expect((headerCells[2] as HTMLElement).style.right).toBe('0px');
  });

  it('forces table-fixed even without columnResizable — an auto-layout table could shrink a column below its declared width and desync the sticky offsets from it', () => {
    const fixture = createFrozen();
    expect(fixture.nativeElement.querySelector('table')!.className).toContain('table-fixed');
  });

  it('does not force table-fixed when no column is frozen', () => {
    @Component({
      standalone: true,
      imports: [TreeTableComponent, TableColumnComponent],
      template: `
        <med-tree-table [value]="value" ariaLabel="Org">
          <med-table-column field="name" header="Name" />
        </med-tree-table>
      `,
    })
    class NoFrozenHost {
      value: TreeTableNode<Employee>[] = NODES;
    }
    const fixture = TestBed.createComponent(NoFrozenHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')!.className).not.toContain('table-fixed');
  });
});

// @scenario UI-008.S1
describe('TreeTableComponent Wave 2 (selectionMode, sortMode, paginator)', () => {
  @Component({
    standalone: true,
    imports: [TreeTableComponent, TableColumnComponent],
    template: `
      <med-tree-table
        [value]="nodes"
        [selectionMode]="selectionMode"
        [(selection)]="selection"
        [sortMode]="sortMode"
        [(sortField)]="sortField"
        [(sortOrder)]="sortOrder"
        [paginator]="paginator"
        [rows]="rows"
        [(first)]="first"
      >
        <med-table-column field="name" header="Name" [sortable]="true" />
      </med-tree-table>
    `,
  })
  class Wave2TreeTableHostComponent {
    nodes: TreeTableNode<Employee>[] = [
      { data: { name: 'Zara', role: 'Lead', size: '10' } },
      { data: { name: 'Alice', role: 'Dev', size: '5' } },
      { data: { name: 'Bob', role: 'QA', size: '8' } },
    ];
    selectionMode: 'single' | 'multiple' | null = 'single';
    selection: TreeTableNode<Employee> | readonly TreeTableNode<Employee>[] | null = null;
    sortMode: 'single' | 'multiple' = 'single';
    sortField: string | null = null;
    sortOrder: 'asc' | 'desc' | null = null;
    paginator = true;
    rows = 2;
    first = 0;
  }

  it('supports single row selection, column sorting and paginator slicing', () => {
    const fixture = TestBed.createComponent(Wave2TreeTableHostComponent);
    fixture.detectChanges();

    // Paginator slices 3 nodes to 2 rows on first page
    const rowsPage1 = Array.from(fixture.nativeElement.querySelectorAll('tbody tr')) as HTMLElement[];
    expect(rowsPage1).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('med-paginator')).not.toBeNull();

    // Selecting a row updates [(selection)]
    rowsPage1[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toBe(fixture.componentInstance.nodes[0]);

    // Clicking sortable header sorts ascending
    const header = fixture.nativeElement.querySelector('thead th') as HTMLElement;
    header.click();
    fixture.detectChanges();

    const sortedRows = Array.from(fixture.nativeElement.querySelectorAll('tbody tr')) as HTMLElement[];
    expect(sortedRows[0].textContent).toContain('Alice');
    expect(sortedRows[1].textContent).toContain('Bob');
  });
});
