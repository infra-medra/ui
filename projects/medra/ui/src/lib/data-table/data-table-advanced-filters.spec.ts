import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { IconComponent } from '../icon/icon.component';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { DataTableComponent } from './data-table.component';
import { MAX_COLUMN_FILTER_LENGTH, StoredColumnDescriptor, parseStoredColumnFilters } from './data-table-state';
import { TableColumnComponent } from './table-column.component';
import { TableColumnFilter, TableColumnFilters, TableFilterMatchMode } from './data-table.types';

interface FilterItem {
  name: string;
  category: string;
  price: number;
  released: Date;
}

const ADVANCED_ITEMS: FilterItem[] = [
  { name: 'Alpha', category: 'A', price: 10, released: new Date(2026, 0, 1) },
  { name: 'Beta', category: 'B', price: 25, released: new Date(2026, 0, 15) },
  { name: 'Alpha Beta', category: 'A', price: 50, released: new Date(2026, 1, 1) },
  { name: 'Gamma', category: 'C', price: 100, released: new Date(2026, 2, 1) },
];

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="items"
      [(columnFilters)]="columnFilters"
      [addRuleLabel]="addRuleLabel"
      [matchAllLabel]="matchAllLabel"
      [matchAnyLabel]="matchAnyLabel"
      [removeRuleLabel]="removeRuleLabel"
      ariaLabel="Advanced filter items"
    >
      <med-table-column field="name" header="Name" columnFilter />
      <med-table-column field="category" header="Category" columnFilter [filterMatchMode]="categoryMode" />
      <med-table-column field="price" header="Price" columnFilter filterType="numeric" [filterMatchMode]="priceMode" />
      <med-table-column field="released" header="Released" columnFilter filterType="date" [filterMatchMode]="dateMode" />
    </med-data-table>
  `,
})
class AdvancedFilterHostComponent {
  items = ADVANCED_ITEMS;
  columnFilters = signal<TableColumnFilters>({});
  categoryMode: TableFilterMatchMode = 'in' as TableFilterMatchMode;
  priceMode: TableFilterMatchMode = 'between' as TableFilterMatchMode;
  dateMode: TableFilterMatchMode = 'between' as TableFilterMatchMode;
  addRuleLabel = 'Add Rule';
  matchAllLabel = 'Match All';
  matchAnyLabel = 'Match Any';
  removeRuleLabel = 'Remove Rule';
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="items" stateKey="dt-advanced-filters-state" [(columnFilters)]="columnFilters" ariaLabel="Persisted advanced filters">
      <med-table-column field="name" header="Name" columnFilter />
      <med-table-column field="price" header="Price" columnFilter filterType="numeric" />
      <med-table-column field="released" header="Released" columnFilter filterType="date" />
    </med-data-table>
  `,
})
class AdvancedFilterStateHostComponent {
  items = ADVANCED_ITEMS;
  columnFilters = signal<TableColumnFilters>({});
}

function bodyRows(fixture: ComponentFixture<unknown>): HTMLTableRowElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
}

function rowNames(fixture: ComponentFixture<unknown>): string[] {
  return bodyRows(fixture).map((tr) => tr.querySelector('td')?.textContent?.trim() ?? '');
}

function funnelButton(fixture: ComponentFixture<unknown>, header: string): HTMLButtonElement {
  return fixture.nativeElement.querySelector(`thead th button[aria-label="Filter ${header}"]`) as HTMLButtonElement;
}

function funnelIcon(fixture: ComponentFixture<unknown>, header: string): IconComponent {
  const button = fixture.debugElement.query(By.css(`thead th button[aria-label="Filter ${header}"]`));
  return button.query(By.directive(IconComponent)).componentInstance as IconComponent;
}

function openMenu(fixture: ComponentFixture<unknown>, header: string): void {
  funnelButton(fixture, header).click();
  fixture.detectChanges();
}

function menu(): HTMLElement | null {
  return document.querySelector('.cdk-overlay-pane[role="dialog"]');
}

function menuButton(label: string): HTMLButtonElement | undefined {
  return Array.from(menu()!.querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
}

describe('DataTable advanced column filters (DAT-038.S9, between/in UI, stateKey bounds)', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function createHost(setup?: (host: AdvancedFilterHostComponent) => void): ComponentFixture<AdvancedFilterHostComponent> {
    const fixture = TestBed.createComponent(AdvancedFilterHostComponent);
    setup?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  describe('DAT-038.S9 multiple rules with AND and OR operators', () => {
    it('DAT-038.S9 filters rows by a TableColumnFilterGroup with operator "and" and "or" via columnFilters model', () => {
      const fixture = createHost((h) =>
        h.columnFilters.set({
          name: {
            operator: 'and',
            rules: [
              { matchMode: 'contains', value: 'alpha' },
              { matchMode: 'contains', value: 'beta' },
            ],
          },
        } as unknown as TableColumnFilters),
      );

      expect(rowNames(fixture)).toEqual(['Alpha Beta']);
      expect(funnelIcon(fixture, 'Name').variant()).toBe('solid');

      fixture.componentInstance.columnFilters.set({
        name: {
          operator: 'or',
          rules: [
            { matchMode: 'contains', value: 'alpha' },
            { matchMode: 'contains', value: 'beta' },
          ],
        },
      } as unknown as TableColumnFilters);
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Alpha', 'Beta', 'Alpha Beta']);
    });

    it('DAT-038.S9 ignores empty rules inside an "or" group so Gamma is not shown', () => {
      const fixture = createHost((h) =>
        h.columnFilters.set({
          name: {
            operator: 'or',
            rules: [
              { matchMode: 'contains', value: 'alpha' },
              { matchMode: 'contains', value: '' },
            ],
          },
        } as unknown as TableColumnFilters),
      );

      expect(rowNames(fixture)).toEqual(['Alpha', 'Alpha Beta']);
    });

    it('DAT-038.S9 adding two rules in the filter menu with AND then switching to OR updates rows and columnFilters', () => {
      const fixture = createHost();
      openMenu(fixture, 'Name');

      const addBtn = menuButton('Add Rule');
      expect(addBtn).toBeDefined();

      const firstInput = menu()!.querySelector('input[type="text"]') as HTMLInputElement;
      firstInput.value = 'alpha';
      firstInput.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      addBtn!.click();
      fixture.detectChanges();

      const inputs = Array.from(menu()!.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
      expect(inputs).toHaveLength(2);
      inputs[1].value = 'beta';
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      // Default operator is 'and' (Match All).
      const matchAllBtn = menuButton('Match All');
      const matchAnyBtn = menuButton('Match Any');
      expect(matchAllBtn).toBeDefined();
      expect(matchAnyBtn).toBeDefined();

      menuButton('Apply')!.click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Alpha Beta']);
      expect(fixture.componentInstance.columnFilters()['name']).toEqual({
        operator: 'and',
        rules: [
          { matchMode: 'contains', value: 'alpha' },
          { matchMode: 'contains', value: 'beta' },
        ],
      });

      // Re-open, switch operator to 'or' (Match Any), and apply.
      openMenu(fixture, 'Name');
      menuButton('Match Any')!.click();
      fixture.detectChanges();
      menuButton('Apply')!.click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Alpha', 'Beta', 'Alpha Beta']);
      expect(fixture.componentInstance.columnFilters()['name']).toEqual({
        operator: 'or',
        rules: [
          { matchMode: 'contains', value: 'alpha' },
          { matchMode: 'contains', value: 'beta' },
        ],
      });
    });

    it('DAT-038.S9 supports removing an added rule and custom addRule/matchAll/matchAny labels', () => {
      const fixture = createHost((h) => {
        h.addRuleLabel = 'Add Condition';
        h.matchAllLabel = 'All';
        h.matchAnyLabel = 'Any';
        h.removeRuleLabel = 'Delete Condition';
      });
      openMenu(fixture, 'Name');
      menuButton('Add Condition')!.click();
      fixture.detectChanges();

      expect(menuButton('All')).toBeDefined();
      expect(menuButton('Any')).toBeDefined();
      const removeButtons = menu()!.querySelectorAll('button[aria-label="Delete Condition"]');
      expect(removeButtons.length).toBe(2);

      (removeButtons[1] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(menu()!.querySelectorAll('input[type="text"]').length).toBe(1);
    });
  });

  describe('between and in menu UI controls', () => {
    it('DAT-039.S2 renders Min and Max numeric inputs for between mode and applies inclusive and partial bounds', () => {
      const fixture = createHost();
      openMenu(fixture, 'Price');

      const numInputs = Array.from(menu()!.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
      expect(numInputs).toHaveLength(2);

      numInputs[0].value = '15';
      numInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      numInputs[1].value = '50';
      numInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      menuButton('Apply')!.click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Beta', 'Alpha Beta']);
      expect(fixture.componentInstance.columnFilters()['price']).toEqual({
        matchMode: 'between',
        value: [15, 50],
      });

      // Partial bound: clear Max.
      openMenu(fixture, 'Price');
      const reopened = Array.from(menu()!.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
      reopened[1].value = '';
      reopened[1].dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
      menuButton('Apply')!.click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Beta', 'Alpha Beta', 'Gamma']);
      expect(fixture.componentInstance.columnFilters()['price']).toEqual({
        matchMode: 'between',
        value: [15, null],
      });
    });

    it('DAT-039.S2 renders two DatePicker controls for date between mode and applies range', () => {
      const fixture = createHost();
      openMenu(fixture, 'Released');

      const pickers = fixture.debugElement.queryAll(By.directive(DatePickerComponent));
      expect(pickers).toHaveLength(2);

      const startDate = new Date(2026, 0, 10);
      const endDate = new Date(2026, 0, 20);
      const inputs = Array.from(menu()!.querySelectorAll('med-date-picker input')) as HTMLInputElement[];
      inputs[0].value = '01/10/2026';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[0].dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      inputs[1].value = '01/20/2026';
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[1].dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      fixture.detectChanges();

      menuButton('Apply')!.click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Beta']);
      const saved = fixture.componentInstance.columnFilters()['released'] as TableColumnFilter;
      expect(saved.matchMode).toBe('between');
      expect(Array.isArray(saved.value)).toBe(true);
      const range = saved.value as readonly (Date | null)[];
      expect(range[0]).toEqual(startDate);
      expect(range[1]).toEqual(endDate);
    });

    it('DAT-039.S3 renders MultiSelect populated with distinct column values for in mode and filters rows', () => {
      const fixture = createHost();
      openMenu(fixture, 'Category');

      const multiDebug = fixture.debugElement.query(By.directive(MultiSelectComponent));
      expect(multiDebug).not.toBeNull();
      const multi = multiDebug.componentInstance as MultiSelectComponent<string>;
      const optionValues = (multi.options() as readonly { label: string; value: string }[]).map((o) => o.value);
      expect(optionValues).toEqual(['A', 'B', 'C']);

      // Drive MultiSelect panel via keyboard (jsdom does not lay out virtual-scroll options).
      const trigger = multiDebug.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
      trigger.click();
      fixture.detectChanges();
      const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
      expect(listbox).not.toBeNull();
      listbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); // 'A'
      fixture.detectChanges();
      listbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      listbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      listbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); // 'C'
      fixture.detectChanges();
      trigger.click();
      fixture.detectChanges();

      menuButton('Apply')!.click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Alpha', 'Alpha Beta', 'Gamma']);
      expect(fixture.componentInstance.columnFilters()['category']).toEqual({
        matchMode: 'in',
        value: ['A', 'C'],
      });
    });
  });

  describe('DAT-038 bounded stateKey restore for filter groups, between, and in', () => {
    const COLUMNS: readonly StoredColumnDescriptor[] = [
      { field: 'name', filterType: 'text' },
      { field: 'price', filterType: 'numeric' },
      { field: 'released', filterType: 'date' },
    ];

    const STATE_KEY = 'dt-advanced-filters-state';
    beforeEach(() => sessionStorage.clear());
    afterEach(() => sessionStorage.clear());

    it('DAT-038 restores valid filter groups, between, and in rules from parseStoredColumnFilters', () => {
      const parsed = parseStoredColumnFilters(
        {
          name: {
            operator: 'or',
            rules: [
              { matchMode: 'contains', value: 'alpha' },
              { matchMode: 'in', value: ['Alpha', 'Beta'] },
            ],
          },
          price: { matchMode: 'between', value: [10, null] },
          released: { matchMode: 'between', value: ['2026-01-10T00:00:00.000Z', '2026-01-20T00:00:00.000Z'] },
        },
        COLUMNS,
      );

      expect(parsed['name']).toEqual({
        operator: 'or',
        rules: [
          { matchMode: 'contains', value: 'alpha' },
          { matchMode: 'in', value: ['Alpha', 'Beta'] },
        ],
      });
      expect(parsed['price']).toEqual({ matchMode: 'between', value: [10, null] });
      expect(parsed['released']).toEqual({
        matchMode: 'between',
        value: [new Date('2026-01-10T00:00:00.000Z'), new Date('2026-01-20T00:00:00.000Z')],
      });
    });

    it('DAT-038 (L-014) bounds rule count to 20 per column, in array to 200 items, string items to MAX_COLUMN_FILTER_LENGTH, and drops non-finite/invalid bounds', () => {
      const manyRules = Array.from({ length: 30 }, (_, i) => ({ matchMode: 'contains', value: `r${i}` }));
      const manyIn = Array.from({ length: 250 }, (_, i) => `v${i}`);
      const tooLong = 'x'.repeat(MAX_COLUMN_FILTER_LENGTH + 1);

      const parsed = parseStoredColumnFilters(
        {
          name: {
            operator: 'and',
            rules: [
              ...manyRules,
            ],
          },
          price: {
            operator: 'or',
            rules: [
              { matchMode: 'between', value: [Infinity, 50] },
              { matchMode: 'between', value: [10, 50] },
              { matchMode: 'in', value: [10, NaN, 'bad', 25] },
            ],
          },
          released: {
            operator: 'and',
            rules: [
              { matchMode: 'between', value: ['not-a-date', '2026-01-20'] },
              { matchMode: 'in', value: ['2026-01-01', 'invalid-date'] },
            ],
          },
        },
        COLUMNS,
      );

      const nameGroup = parsed['name'] as unknown as { operator: string; rules: readonly TableColumnFilter[] };
      expect(nameGroup.rules).toHaveLength(20);

      const inParsed = parseStoredColumnFilters(
        {
          name: { matchMode: 'in', value: [tooLong, ...manyIn] },
        },
        COLUMNS,
      );
      const inRule = inParsed['name'] as TableColumnFilter;
      const inVals = inRule.value as readonly string[];
      expect(inVals.length).toBeLessThanOrEqual(200);
      expect(inVals).not.toContain(tooLong);

      const priceGroup = parsed['price'] as unknown as { operator: string; rules: readonly TableColumnFilter[] };
      expect(priceGroup.rules).toEqual([
        { matchMode: 'between', value: [10, 50] },
        { matchMode: 'in', value: [10, 25] },
      ]);

      const releasedGroup = parsed['released'] as unknown as { operator: string; rules: readonly TableColumnFilter[] };
      expect(releasedGroup.rules).toEqual([
        { matchMode: 'in', value: [new Date('2026-01-01')] },
      ]);

      // Invalid operator drops the group.
      const badOp = parseStoredColumnFilters(
        { name: { operator: 'xor', rules: [{ matchMode: 'contains', value: 'a' }] } },
        COLUMNS,
      );
      expect(badOp['name']).toBeUndefined();
    });

    it('DAT-038 roundtrips multi-rule group through stateKey persistence', () => {
      const first = TestBed.createComponent(AdvancedFilterStateHostComponent);
      first.detectChanges();
      first.detectChanges();
      first.componentInstance.columnFilters.set({
        name: {
          operator: 'or',
          rules: [
            { matchMode: 'equals', value: 'Alpha' },
            { matchMode: 'equals', value: 'Gamma' },
          ],
        },
      } as unknown as TableColumnFilters);
      first.detectChanges();
      expect(rowNames(first)).toEqual(['Alpha', 'Gamma']);
      first.destroy();

      const second = TestBed.createComponent(AdvancedFilterStateHostComponent);
      second.detectChanges();
      second.detectChanges();
      expect(rowNames(second)).toEqual(['Alpha', 'Gamma']);
      expect(second.componentInstance.columnFilters()).toEqual({
        name: {
          operator: 'or',
          rules: [
            { matchMode: 'equals', value: 'Alpha' },
            { matchMode: 'equals', value: 'Gamma' },
          ],
        },
      });
    });

    // S-03: verify security remediation
    it('bounds raw element inspection for in-mode arrays containing many invalid entries', () => {
      const hugeInvalid = Array.from({ length: 500 }, (_, i) => (i < 250 ? null : 'Alpha'));
      const parsed = parseStoredColumnFilters(
        { name: { matchMode: 'in', value: hugeInvalid } },
        COLUMNS,
      );
      expect(parsed['name']).toEqual({ matchMode: 'in', value: [] });
    });

    // F-02: verify remediation
    it('populates DatePicker draft control when programmatic columnFilters uses ISO date string', () => {
      const fixture = TestBed.createComponent(AdvancedFilterHostComponent);
      fixture.detectChanges();
      fixture.componentInstance.columnFilters.set({
        released: { matchMode: 'dateIs', value: '2026-01-15' },
      });
      fixture.detectChanges();

      const funnel = fixture.nativeElement.querySelector('thead th button[aria-label="Filter Released"]') as HTMLButtonElement;
      funnel.click();
      fixture.detectChanges();

      const dt = fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as {
        filterDraft: () => { rules: readonly { dateControl: { value: Date | null } }[] } | null;
      };
      const draftDate = dt.filterDraft()?.rules[0]?.dateControl.value;
      expect(draftDate).toBeInstanceOf(Date);
      expect(draftDate?.getFullYear()).toBe(2026);
      expect(draftDate?.getMonth()).toBe(0);
      expect(draftDate?.getDate()).toBe(15);
    });
  });
});
