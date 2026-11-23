import { Component } from '@angular/core';
import { DataTableComponent, PaginatorPageEvent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly status: 'In stock' | 'Low stock' | 'Out of stock';
}

@Component({
  selector: 'app-data-table-paginator-options-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-paginator-options.demo.html',
})
export class DataTablePaginatorOptionsDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4, status: 'In stock' },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12, status: 'In stock' },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 0, status: 'Out of stock' },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2, status: 'Low stock' },
    { id: 5, name: 'Logic analyzer', category: 'Test equipment', quantity: 3, status: 'In stock' },
    { id: 6, name: 'Bench power supply', category: 'Workbench tools', quantity: 6, status: 'In stock' },
    { id: 7, name: 'Laser cutter', category: 'Fabrication', quantity: 1, status: 'Low stock' },
    { id: 8, name: 'Reflow oven', category: 'Fabrication', quantity: 0, status: 'Out of stock' },
    { id: 9, name: 'Hot air rework station', category: 'Workbench tools', quantity: 2, status: 'Low stock' },
    { id: 10, name: 'Digital calipers', category: 'Test equipment', quantity: 9, status: 'In stock' },
  ];

  protected first = 0;

  /** One-based number of the page the user last moved to, shown under the table. */
  protected lastPageNumber = 1;

  protected onPageChange(event: PaginatorPageEvent): void {
    this.lastPageNumber = event.page + 1;
  }
}
