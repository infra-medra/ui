import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly status: 'In stock' | 'Low stock' | 'Out of stock';
}

@Component({
  selector: 'app-data-table-sort-single-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-sort-single.demo.html',
})
export class DataTableSortSingleDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4, status: 'In stock' },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12, status: 'In stock' },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 0, status: 'Out of stock' },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2, status: 'Low stock' },
    { id: 5, name: 'Logic analyzer', category: 'Test equipment', quantity: 3, status: 'In stock' },
    { id: 6, name: 'Bench power supply', category: 'Workbench tools', quantity: 6, status: 'In stock' },
    { id: 7, name: 'Laser cutter', category: 'Fabrication', quantity: 1, status: 'Low stock' },
    { id: 8, name: 'Reflow oven', category: 'Fabrication', quantity: 0, status: 'Out of stock' },
  ];

  protected lastSort = 'none yet (the table starts sorted by quantity, descending)';

  protected onSort(event: { readonly field: string | null; readonly order: 'asc' | 'desc' | null }): void {
    this.lastSort = event.field ? `${event.field} ${event.order}` : 'cleared';
  }
}
